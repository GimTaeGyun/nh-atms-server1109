/**
 * 책 스크린샷 도우미 — 가짜 백엔드(mock-api.mjs) + 프론트 개발 서버(vite) + 브라우저(Playwright)를 묶는다.
 *
 * 쓰는 순서(다른 스크립트에서):
 *
 *   import { ensureApp, startMock, startVite, launch, login, openScreen, settle, shot, IDS } from './lib.mjs';
 *   const appDir = ensureApp();                              // 프론트 사본 준비(없으면 복사 + npm ci)
 *   const mock = await startMock({ port: 8080 });            // 가짜 백엔드
 *   const vite = await startVite({ appDir, port: 3100, apiTarget: mock.url });
 *   const { browser, page } = await launch({ baseURL: vite.url });
 *   await login(page, { id: IDS.full });                     // 실제 로그인 화면을 거친다
 *   const screen = await openScreen(page, '/sample/notice'); // 화면 제목이 보일 때까지 기다린다
 *   await screen.locator('.search-panel button[type="submit"]').click();
 *   await shot(page, 'my-shot');                             // → react-book/img/shots/my-shot.png
 *   await browser.close(); await vite.stop(); await mock.stop();
 *
 * 포트가 겹칠 수 있으면(다른 작업이 8080·3100 을 쓰는 중) startAll() 한 줄로 빈 포트를 골라 띄운다:
 *   const app = await startAll();  const { browser, page } = await launch({ baseURL: app.vite.url });  …  await app.stop();
 *
 * 로그인 개인번호: IDS.full 99000101(관리자, 버튼 전부) · IDS.write 99000202(조회·등록·수정) · IDS.readonly 99000303(조회 전용). 비밀번호는 아무 글자나.
 * 주의: antd 버튼은 아이콘 이름이 접근성 이름에 섞이므로 getByRole('button', { name: '삭제', exact: true }) 가 안 맞는다.
 *       → scope.locator('button', { hasText: '삭제' }) 처럼 글자로 찾는다. 숨은 탭(다른 화면)과 섞이지 않게 openScreen 이 돌려준 영역 안에서 찾는다.
 *
 * Playwright 는 전역에 설치된 것을 쓴다(require('playwright')). package.json 에 넣지 않는다.
 */
import { createRequire } from 'node:module';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMockServer, USERS } from './mock-api.mjs';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));

/** react-book 폴더 */
export const ROOT = path.resolve(HERE, '..', '..');
/** 스크린샷이 쌓이는 곳 */
export const SHOTS_DIR = path.join(ROOT, 'img', 'shots');
/** 원본 프론트(읽기만 한다 — 여기서는 npm 을 돌리지 않는다) */
export const SOURCE_APP_DIR = path.resolve(ROOT, '..', 'nh-atms-common-main', 'Frontend', 'nh-atms-web');
/** 프론트 사본(여기서 npm ci · npm run dev). BOOK_APP_DIR 환경변수로 바꿀 수 있다 */
export const DEFAULT_APP_DIR =
  process.env.BOOK_APP_DIR || '/tmp/claude-0/-home-user-nh-atms-server1109/7f220428-e458-5cdd-8132-e401e68182ff/scratchpad/book/app';

/** 로그인 개인번호(가짜 백엔드 mock-api.mjs 의 USERS) — 비밀번호는 아무 글자나 */
export const IDS = { full: '99000101', write: '99000202', readonly: '99000303' };
export { USERS };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ 프론트 사본 */
const SKIP = new Set(['node_modules', 'dist', 'dist-demo', 'test-results', 'playwright-report', '.vite']);

/** 원본에서 바뀐 파일만 사본으로 옮긴다(안 바뀐 파일은 건드리지 않아 떠 있는 개발 서버가 새로고침되지 않는다) */
const syncDir = (from, to) => {
  let changed = 0;
  fs.mkdirSync(to, { recursive: true });
  for (const ent of fs.readdirSync(from, { withFileTypes: true })) {
    if (SKIP.has(ent.name)) continue;
    const a = path.join(from, ent.name);
    const b = path.join(to, ent.name);
    if (ent.isDirectory()) changed += syncDir(a, b);
    else if (ent.isFile()) {
      const src = fs.readFileSync(a);
      if (fs.existsSync(b) && fs.statSync(b).isFile() && src.equals(fs.readFileSync(b))) continue;
      fs.writeFileSync(b, src);
      changed += 1;
    }
  }
  return changed;
};

/**
 * 프론트 사본을 준비한다: 원본에서 바뀐 파일을 옮기고, node_modules 가 없거나 package-lock.json 이 바뀌었으면 `npm ci`.
 * 원본 폴더에서는 아무것도 설치·수정하지 않는다.
 */
export function ensureApp({ appDir = DEFAULT_APP_DIR, sourceDir = SOURCE_APP_DIR, quiet = false } = {}) {
  const lock = path.join(appDir, 'package-lock.json');
  const before = fs.existsSync(lock) ? fs.readFileSync(lock, 'utf8') : null;
  const changed = syncDir(sourceDir, appDir);
  const lockChanged = before !== fs.readFileSync(lock, 'utf8');
  const hasModules = fs.existsSync(path.join(appDir, 'node_modules', '.bin', 'vite'));
  if (!quiet && changed) console.log(`[shots] 프론트 사본 갱신: ${changed}개 파일 → ${appDir}`);
  if (!hasModules || lockChanged) {
    if (!quiet) console.log('[shots] npm ci (프론트 사본) …');
    execFileSync('npm', ['ci', '--no-audit', '--no-fund'], { cwd: appDir, stdio: quiet ? 'ignore' : 'inherit' });
  }
  return appDir;
}

/* ------------------------------------------------------------------ 포트 */
/** 그 포트가 비어 있나 */
export const isPortFree = (port) =>
  new Promise((resolve) => {
    const s = net.createServer();
    s.once('error', () => resolve(false));
    s.once('listening', () => s.close(() => resolve(true)));
    s.listen(port);
  });

/** preferred 부터 올라가며 빈 포트를 찾는다 */
export async function freePort(preferred) {
  for (let p = preferred; p < preferred + 200; p++) if (await isPortFree(p)) return p;
  throw new Error(`빈 포트를 찾지 못했습니다(${preferred}~)`);
}

/* ------------------------------------------------------------------ 가짜 백엔드 */
/**
 * 가짜 백엔드를 이 프로세스 안에서 띄운다.
 * 돌려주는 값: { url, port, unknown(모르는 주소 기록), requests(요청 기록), reset()(자료 초기화), clearLogs(), stop() }
 */
export async function startMock({ port = 8080, quiet = true, delayMs } = {}) {
  const mock = createMockServer({ port, quiet, delayMs });
  await mock.listen();
  mock.stop = () => mock.close();
  return mock;
}

/* ------------------------------------------------------------------ 프론트 개발 서버 */
const liveChildren = new Set();
const killGroup = (child, signal) => {
  try {
    process.kill(-child.pid, signal);
  } catch {
    /* 이미 끝남 */
  }
};
process.on('exit', () => {
  for (const c of liveChildren) killGroup(c, 'SIGKILL');
});

/**
 * 프론트 사본에서 `npm run dev` 를 띄우고 응답할 때까지 기다린다.
 *  - apiTarget: /api 프록시 대상(vite.config.ts 가 읽는 DEV_PROXY_TARGET 을 환경변수로 넘긴다)
 *  - 돌려주는 값: { url, port, lines(개발 서버 출력), stop() } — stop 은 자식 프로세스 묶음 전체를 끝낸다
 */
export async function startVite({ appDir = DEFAULT_APP_DIR, port = 3100, apiTarget = 'http://127.0.0.1:8080', quiet = true, timeout = 120_000 } = {}) {
  if (!(await isPortFree(port))) throw new Error(`포트 ${port} 가 이미 쓰이고 있습니다. 다른 port 를 주세요.`);
  const lines = [];
  const child = spawn('npm', ['run', 'dev', '--', '--port', String(port), '--strictPort'], {
    cwd: appDir,
    detached: true, // 새 프로세스 묶음 → stop 에서 npm·vite·esbuild 를 한꺼번에 끝낸다
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, DEV_PROXY_TARGET: apiTarget, FORCE_COLOR: '0', NO_COLOR: '1', BROWSER: 'none' },
  });
  liveChildren.add(child);
  const onData = (buf) => {
    for (const line of String(buf).split('\n')) {
      if (!line.trim()) continue;
      lines.push(line);
      if (!quiet) console.log(`[vite] ${line}`);
    }
  };
  child.stdout.on('data', onData);
  child.stderr.on('data', onData);
  let exited = false;
  child.once('exit', () => {
    exited = true;
    liveChildren.delete(child);
  });

  const stop = () =>
    new Promise((resolve) => {
      if (exited) return resolve();
      const force = setTimeout(() => killGroup(child, 'SIGKILL'), 3000);
      child.once('exit', () => {
        clearTimeout(force);
        resolve();
      });
      killGroup(child, 'SIGTERM');
    });

  const url = `http://localhost:${port}`;
  const started = Date.now();
  for (;;) {
    if (exited) throw new Error(`개발 서버가 시작하다 끝났습니다:\n${lines.join('\n')}`);
    if (Date.now() - started > timeout) {
      await stop();
      throw new Error(`개발 서버가 ${timeout / 1000}초 안에 응답하지 않았습니다:\n${lines.join('\n')}`);
    }
    try {
      const res = await fetch(`${url}/`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) break;
    } catch {
      /* 아직 안 떴음 */
    }
    await sleep(250);
  }
  // 첫 요청 때 vite 가 의존성 묶음(node_modules/.vite)을 만든다 — 브라우저를 열기 전에 미리 시킨다
  await fetch(`${url}/src/main.tsx`, { signal: AbortSignal.timeout(90_000) }).then((r) => r.text()).catch(() => undefined);
  return { url, port, child, lines, stop };
}

/**
 * 한 번에 준비: 프론트 사본(ensureApp) + 가짜 백엔드 + 개발 서버. 포트가 쓰이고 있으면 그 다음 빈 포트를 쓴다.
 * 주의: 기본(sync: true)은 원본에서 바뀐 파일을 사본에 덮어쓴다. 사본을 고쳐 둔 실험이면 startAll({ appDir, sync: false }).
 * 돌려주는 값: { appDir, mock, vite, stop() } — 주소는 mock.url · vite.url
 *
 *   const app = await startAll();
 *   const { browser, page } = await launch({ baseURL: app.vite.url });
 *   …
 *   await browser.close(); await app.stop();
 */
export async function startAll({ appDir = DEFAULT_APP_DIR, mockPort = 8080, vitePort = 3100, quiet = true, delayMs, sync = true } = {}) {
  // sync: false 면 원본을 사본에 다시 옮기지 않는다 — 사본을 고쳐 가며 실험할 때(예: 14장 단계 상태) 반드시 false
  if (sync) ensureApp({ appDir, quiet });
  const mock = await startMock({ port: await freePort(mockPort), quiet, delayMs });
  let vite;
  try {
    vite = await startVite({ appDir, port: await freePort(vitePort), apiTarget: mock.url, quiet });
  } catch (e) {
    await mock.stop();
    throw e;
  }
  const stop = async () => {
    await vite.stop().catch(() => undefined);
    await mock.stop().catch(() => undefined);
  };
  return { appDir, mock, vite, stop };
}

/* ------------------------------------------------------------------ 브라우저 */
const NET = new WeakMap();
/** 진행 중인 요청을 센다(settle 이 "네트워크가 조용한가"를 볼 때 쓴다). 웹소켓(HMR)은 세지 않는다 */
const track = (page) => {
  let st = NET.get(page);
  if (st) return st;
  st = { pending: new Set(), last: Date.now() };
  page.on('request', (r) => {
    const t = r.resourceType();
    if (t === 'websocket' || t === 'eventsource') return;
    st.pending.add(r);
    st.last = Date.now();
  });
  const done = (r) => {
    if (st.pending.delete(r)) st.last = Date.now();
  };
  page.on('requestfinished', done);
  page.on('requestfailed', done);
  page.on('framenavigated', () => {
    st.pending.clear();
    st.last = Date.now();
  });
  NET.set(page, st);
  return st;
};

/**
 * 브라우저를 연다. 한국어·서울 시간대, 기본 1280×800, 배율 2(PNG 는 2560×1600).
 * 돌려주는 값: { browser, context, page, consoleErrors } — consoleErrors 에 콘솔 오류·경고와 처리 안 된 예외가 쌓인다.
 */
export async function launch({ width = 1280, height = 800, scale = 2, baseURL = 'http://localhost:3100', headless = true } = {}) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale, locale: 'ko-KR', timezoneId: 'Asia/Seoul', baseURL });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') consoleErrors.push({ type: m.type(), text: m.text(), at: page.url() });
  });
  page.on('pageerror', (e) => consoleErrors.push({ type: 'pageerror', text: String(e?.message ?? e), at: page.url() }));
  track(page);
  return { browser, context, page, consoleErrors };
}

/**
 * 화면이 "가만히 있을 때"까지 기다린다: ① 요청이 150ms 동안 없음 ② 글꼴 다 받음 ③ 로딩 표시(스핀·스켈레톤·버튼 로딩) 없음
 * ④ 끝이 있는 애니메이션(모달·토스트·드롭다운이 나타나는 움직임)이 모두 끝남 ⑤ 조금 더(min ms) + 화면 두 번 그리기.
 */
export async function settle(page, { min = 120, timeout = 10_000 } = {}) {
  const st = track(page);
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    if (st.pending.size === 0 && Date.now() - st.last >= 150) break;
    await page.waitForTimeout(40);
  }
  await page.evaluate(() => document.fonts.ready.then(() => true)).catch(() => undefined);
  await page
    .waitForFunction(
      () => {
        const shown = (el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        };
        return !Array.from(document.querySelectorAll('.ant-spin-spinning, .ant-skeleton-active, .ant-btn-loading')).some(shown);
      },
      null,
      { timeout: 5000 },
    )
    .catch(() => undefined);
  await page
    .waitForFunction(
      () =>
        document.getAnimations().every((a) => {
          const t = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
          return a.playState !== 'running' || (t && t.iterations === Infinity);
        }),
      null,
      { timeout: 4000 },
    )
    .catch(() => undefined);
  await page.waitForTimeout(min);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(true))))).catch(() => undefined);
}

/** 떠 있는 알림(antd message)이 사라질 때까지 기다린다(기본 3초 뒤 저절로 사라진다) */
export async function clearToasts(page, { timeout = 8000 } = {}) {
  await page.waitForFunction(() => document.querySelectorAll('.ant-message-notice').length === 0, null, { timeout }).catch(() => undefined);
}

/** 마우스를 오른쪽 위 구석으로 치운다(버튼 위에 남아 있으면 hover 색·툴팁이 찍힌다) */
export async function parkMouse(page) {
  const vp = page.viewportSize() ?? { width: 1280, height: 800 };
  await page.mouse.move(vp.width - 1, 1);
}

/**
 * 실제 로그인 화면(/login)에서 개인번호·비밀번호를 치고 [로그인]을 누른다.
 *  - id: IDS.full(관리자) | IDS.write(조회·등록·수정) | IDS.readonly(조회 전용)
 *  - keepToast: true 면 "로그인되었습니다." 알림이 떠 있는 채로 돌아온다(기본은 사라질 때까지 기다림)
 *  - expectFail: true 면 실패(오류 알림)를 기다리고 로그인 화면에 머문다
 */
export async function login(page, { id = IDS.full, password = 'mock-pass', keepToast = false, expectFail = false } = {}) {
  await page.goto('/login');
  await page.locator('.login-page').waitFor({ state: 'visible', timeout: 30_000 });
  await page.locator('[data-testid="crypto-status"]').waitFor({ state: 'visible', timeout: 15_000 }); // 공개키를 받은 뒤
  await page.locator('#perNo').fill(id);
  await page.locator('#password').fill(password);
  await page.locator('.login-page button[type="submit"]').click();
  if (expectFail) {
    await page.locator('.ant-message-error').first().waitFor({ state: 'visible', timeout: 10_000 });
    await settle(page);
    return;
  }
  await page.locator('.app-shell').waitFor({ state: 'visible', timeout: 15_000 });
  await page.locator('.app-content-inner[data-screen="home"] .page-title h1').waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForFunction(() => document.querySelector('.header-user b')?.textContent !== '-', null, { timeout: 10_000 });
  await settle(page);
  if (!keepToast) {
    await clearToasts(page);
    await settle(page);
  }
}

/** 헤더의 [로그아웃]을 누르고 로그인 화면이 뜰 때까지 기다린다 */
export async function logout(page, { keepToast = false } = {}) {
  await page.locator('[data-testid="logout"]').click();
  await page.locator('.login-page').waitFor({ state: 'visible', timeout: 15_000 });
  await settle(page);
  if (!keepToast) {
    await clearToasts(page);
    await settle(page);
  }
}

/** '/sample/mcn-info' → 'sample.mcnInfo', '/home' → 'home' (프론트 registry.parseScreenPath 와 같은 규칙) */
export const pathToScreenKey = (p) => {
  const parts = p.replace(/^\/+|\/+$/g, '').split('/');
  if (parts.length === 1) return parts[0];
  return `${parts[0]}.${parts[1].replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())}`;
};

/**
 * 화면을 연다. 앱 안에 있으면 새로고침 없이 주소만 바꾸고(다른 탭의 조회 결과가 그대로 남는다), 아니면 주소로 들어간다.
 * 그 화면의 제목(h1)이 보이고 조용해질 때까지 기다린 뒤, 그 화면 영역(.app-content-inner[data-screen=…])을 돌려준다.
 *  - reload: true 면 항상 주소로 새로 들어간다(화면 상태가 초기화된다)
 */
export async function openScreen(page, routePath, { reload = false } = {}) {
  const key = pathToScreenKey(routePath);
  const inShell = (await page.locator('.app-shell').count()) > 0;
  if (!inShell || reload) await page.goto(routePath);
  else {
    await page.evaluate((to) => {
      window.history.pushState({}, '', to);
      window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
    }, routePath);
  }
  const screen = page.locator(`.app-content-inner[data-screen="${key}"]`);
  await screen.locator('.page-title h1').first().waitFor({ state: 'visible', timeout: 20_000 });
  await page.locator('.open-tab.on').waitFor({ state: 'visible', timeout: 10_000 });
  await settle(page);
  return screen;
}

/** PNG 파일의 가로·세로(px) */
export const pngSize = (file) => {
  const fd = fs.openSync(file, 'r');
  const buf = Buffer.alloc(24);
  fs.readSync(fd, buf, 0, 24, 0);
  fs.closeSync(fd);
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
};

const toLocator = (page, l) => (typeof l === 'string' ? page.locator(l).first() : l);

/** 여러 요소를 한꺼번에 감싸는 네모(뷰포트 기준 CSS px)에 여백을 더한다 */
export async function boxOf(page, locators, padding = 8) {
  const list = (Array.isArray(locators) ? locators : [locators]).map((l) => toLocator(page, l));
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  for (const loc of list) {
    await loc.scrollIntoViewIfNeeded().catch(() => undefined);
    const b = await loc.boundingBox();
    if (!b) throw new Error('잘라 찍을 요소가 화면에 없습니다');
    x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y); x2 = Math.max(x2, b.x + b.width); y2 = Math.max(y2, b.y + b.height);
  }
  const vp = page.viewportSize() ?? { width: 1280, height: 800 };
  if (y2 > vp.height + 1 || x2 > vp.width + 1 || y1 < -1 || x1 < -1) {
    console.warn(`[shots] 잘라 찍을 영역(${Math.round(x1)},${Math.round(y1)}~${Math.round(x2)},${Math.round(y2)})이 창(${vp.width}×${vp.height}) 밖으로 나가 잘립니다 — shot(…, { tall: true }) 를 쓰세요`);
  }
  const x = Math.max(0, Math.floor(x1 - padding));
  const y = Math.max(0, Math.floor(y1 - padding));
  return { x, y, width: Math.min(vp.width, Math.ceil(x2 + padding)) - x, height: Math.min(vp.height, Math.ceil(y2 + padding)) - y };
}

/**
 * 스크린샷을 react-book/img/shots/<name>.png 로 저장한다. 찍기 전에 마우스를 치우고 settle 한다.
 *  - (옵션 없음) 창 전체(뷰포트)
 *  - locator: 요소(선택자 문자열·Locator·그 배열) 하나 또는 여럿을 감싸는 영역만. padding(기본 8px) 여백
 *  - clip: { x, y, width, height } 직접 지정(CSS px)
 *  - tall: true 면 본문(.app-content)이 스크롤 없이 다 보이도록 창 높이를 잠깐 늘려서 찍는다
 *  - fullPage: 문서 전체(로그인 화면처럼 앱 셸 밖 화면용)
 *  - keepMouse: true 면 마우스를 치우지 않는다(hover 로 뜬 것·플라이아웃을 찍을 때)
 * 돌려주는 값: { name, file, width, height }
 */
export async function shot(page, name, { locator, clip, padding = 8, tall = false, fullPage = false, keepMouse = false, wait = true, dir = SHOTS_DIR } = {}) {
  if (!keepMouse) await parkMouse(page);
  if (wait) await settle(page);
  const file = path.join(dir, `${name}.png`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const base = { path: file, animations: 'disabled', caret: 'hide', scale: 'device' };
  const vp = page.viewportSize();
  let restore = null;
  if (tall && vp) {
    const extra = await page.evaluate(() => {
      const el = document.querySelector('.app-content');
      return el ? Math.max(0, el.scrollHeight - el.clientHeight) : 0;
    });
    if (extra > 0) {
      await page.setViewportSize({ width: vp.width, height: vp.height + extra + 2 });
      restore = vp;
      await settle(page);
    }
  }
  try {
    if (locator) await page.screenshot({ ...base, clip: await boxOf(page, locator, padding) });
    else if (clip) await page.screenshot({ ...base, clip });
    else await page.screenshot({ ...base, fullPage });
  } finally {
    if (restore) {
      await page.setViewportSize(restore);
      await settle(page);
    }
  }
  return { name, file, ...pngSize(file) };
}
