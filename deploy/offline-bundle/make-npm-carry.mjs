#!/usr/bin/env node
// =====================================================================
// 폐쇄망 반입용 npm 캐시 만들기 (인터넷 PC 에서 1번 실행)  — 2026-11-09
//
//   두 화면 프로젝트의 package-lock.json 으로 캐시를 만든다.
//     - nh-atms-common-main/Frontend/nh-atms-web  (새 앱 — vitest·msw·playwright 등)
//     - NH-ATMS/Frontend/nh-atms-web              (node-forge 1.4.0 · @types/node-forge 1.3.14 포함)
//   그리고 Windows·Linux 64비트용 실행 파일 패키지(esbuild·rollup)를 둘 다 넣는다.
//     → 팀 PC(Windows)와 Jenkins(Linux 컨테이너) 양쪽에서 npm ci --offline 이 된다.
//
//   사용 (Windows): make-npm-carry.bat 더블클릭, 또는
//       node deploy\offline-bundle\make-npm-carry.mjs [결과 폴더]
//   결과 폴더 기본값: Windows D:\npm-carry-build, 그 밖에는 ./npm-carry-build
//   결과물: <결과 폴더>\npm-carry.zip (안에 _cacache\...) + npm-carry.zip.sha256.txt
//
//   반입 후 합치는 방법: docs/REQUIRED_FILES.md 3-5 (팀 PC robocopy, ws01 podman unshare cp)
//   필요: Node 22.13 이상, 인터넷(https://registry.npmjs.org/), Windows 10 이상(tar 내장)
// =====================================================================
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REGISTRY = 'https://registry.npmjs.org/';
const isWin = process.platform === 'win32';
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const out = path.resolve(process.argv[2] || (isWin ? 'D:\\npm-carry-build' : 'npm-carry-build'));
const cache = path.join(out, 'cache');

const PROJECTS = [
  { name: 'nh-atms-common-main', dir: path.join(repoRoot, 'nh-atms-common-main', 'Frontend', 'nh-atms-web') },
  { name: 'NH-ATMS', dir: path.join(repoRoot, 'NH-ATMS', 'Frontend', 'nh-atms-web') },
];
// 다른 운영체제용 실행 파일 패키지 — 이 PC 의 npm ci 는 자기 운영체제 것만 받으므로 따로 넣는다
const WANT_PLATFORMS = [{ os: 'win32', cpu: 'x64' }, { os: 'linux', cpu: 'x64' }];

const log = (m) => console.log(`[npm-carry] ${m}`);
function fail(m) {
  console.error(`\n[npm-carry] 실패: ${m}`);
  process.exit(1);
}
const q = (s) => (/[\s&()^]/.test(s) ? `"${s}"` : s);
function run(cmd, args, cwd) {
  log(`${cwd ? `(${path.basename(cwd)}) ` : ''}${cmd} ${args.join(' ')}`);
  // .cmd 를 실행하려면 Windows 에서는 shell 이 필요하다 (Node 20+)
  const r = spawnSync(cmd, args.map(q), { cwd, stdio: 'inherit', shell: true });
  if (r.status !== 0) fail(`${cmd} ${args.join(' ')} (종료코드 ${r.status})`);
}
const npm = (args, cwd) => run('npm', args, cwd);

// ---- 0. 점검 ---------------------------------------------------------
const [maj, min] = process.versions.node.split('.').map(Number);
if (maj < 22 || (maj === 22 && min < 13)) fail(`Node ${process.versions.node} — 22.13 이상이 필요합니다`);
for (const p of PROJECTS) {
  for (const f of ['package.json', 'package-lock.json']) {
    if (!fs.existsSync(path.join(p.dir, f))) fail(`${p.dir}\\${f} 없음 — 저장소 전체를 받은 뒤 실행하세요`);
  }
}
if (fs.existsSync(out) && fs.readdirSync(out).length > 0) {
  fail(`${out} 이 비어 있지 않습니다 — 지우거나 다른 폴더를 인수로 주세요 (예: node make-npm-carry.mjs D:\\npm-carry-2)`);
}
fs.mkdirSync(cache, { recursive: true });
log(`저장소: ${repoRoot}`);
log(`결과 폴더: ${out}`);

// ---- 1. 프로젝트별 실제 설치로 캐시 채우기 ----------------------------------
// npm cache add 는 의존 패키지를 받지 않으므로 lock 그대로 npm ci (스크립트는 실행하지 않음)
for (const p of PROJECTS) {
  const work = path.join(out, 'work', p.name);
  fs.mkdirSync(work, { recursive: true });
  for (const f of ['package.json', 'package-lock.json']) fs.copyFileSync(path.join(p.dir, f), path.join(work, f));
  npm(['ci', '--cache', cache, '--registry', REGISTRY, '--ignore-scripts', '--no-audit', '--no-fund'], work);
}

// ---- 2. 다른 운영체제용 실행 파일 패키지 ---------------------------------------
const extra = new Set();
for (const p of PROJECTS) {
  const lock = JSON.parse(fs.readFileSync(path.join(p.dir, 'package-lock.json'), 'utf8'));
  for (const [key, v] of Object.entries(lock.packages || {})) {
    if (!key || !v.os || !v.cpu) continue;
    if (WANT_PLATFORMS.some((w) => v.os.includes(w.os) && v.cpu.includes(w.cpu))) {
      extra.add(`${key.slice(key.lastIndexOf('node_modules/') + 'node_modules/'.length)}@${v.version}`);
    }
  }
}
const extraList = [...extra].sort();
log(`운영체제별 실행 파일 패키지 ${extraList.length}개: ${extraList.join(', ')}`);
if (extraList.length) npm(['cache', 'add', ...extraList, '--cache', cache, '--registry', REGISTRY]);

// ---- 3. 자체 검증: 인터넷 없이 이 캐시만으로 설치되는지 ------------------------------
for (const p of PROJECTS) {
  const check = path.join(out, 'check', p.name);
  fs.mkdirSync(check, { recursive: true });
  for (const f of ['package.json', 'package-lock.json']) fs.copyFileSync(path.join(p.dir, f), path.join(check, f));
  npm(['ci', '--offline', '--cache', cache, '--registry', REGISTRY, '--ignore-scripts', '--no-audit', '--no-fund'], check);
}
if (extraList.length) npm(['cache', 'add', ...extraList, '--offline', '--cache', cache, '--registry', REGISTRY]);
for (const pkg of ['node-forge', '@types/node-forge']) {
  const ok = fs.existsSync(path.join(out, 'check', 'NH-ATMS', 'node_modules', ...pkg.split('/'), 'package.json'));
  if (!ok) fail(`${pkg} 가 오프라인 설치 결과에 없음`);
}
log('자체 검증 통과 (두 프로젝트 오프라인 설치 + node-forge + 운영체제별 패키지)');

// ---- 4. zip + SHA256 ----------------------------------------------------
const zip = path.join(out, 'npm-carry.zip');
if (isWin) {
  // Windows 내장 tar(bsdtar): zip 안 경로를 '/' 로 저장 → ws01 python3 -m zipfile 로 정상 풀림
  // (PowerShell 5.1 Compress-Archive 는 '\' 로 저장되는 경우가 있어 쓰지 않는다)
  run('tar', ['-a', '-c', '-f', zip, '-C', cache, '_cacache']);
} else {
  run('python3', ['-m', 'zipfile', '-c', zip, path.join(cache, '_cacache')]);
}
const sha = createHash('sha256').update(fs.readFileSync(zip)).digest('hex');
fs.writeFileSync(`${zip}.sha256.txt`, `${sha}  npm-carry.zip\n`);

// ---- 5. 정리 -------------------------------------------------------------
fs.rmSync(path.join(out, 'work'), { recursive: true, force: true });
fs.rmSync(path.join(out, 'check'), { recursive: true, force: true });
const mb = (fs.statSync(zip).size / 1024 / 1024).toFixed(1);
console.log(`
[npm-carry] 완료
  반입 파일 : ${zip}  (${mb} MB)
  SHA256    : ${sha}
              (같은 값이 ${zip}.sha256.txt 에도 있음 — 반입 신청에 적는다)
  캐시 원본 : ${cache}  (반입 후 지워도 됨)
  다음      : docs/REQUIRED_FILES.md 3-5 ② 팀 PC 합치기, ④ ws01 Jenkins 합치기
`);
