#!/usr/bin/env node
/**
 * 리액트 책 빌드 — 원고(Markdown) → HTML → PDF.
 *
 *   node scripts/build.mjs                 책 전체 → dist/book.html, react-book.pdf (2번 인쇄: 쪽번호 채우기)
 *   node scripts/build.mjs --only 05       5장만 → dist/ch05.pdf (쪽수 확인용, 빠름)
 *   node scripts/build.mjs --only 05 --png 5장을 쪽별 PNG 로도 저장 → dist/png/ch05-1.png …
 *   node scripts/build.mjs --no-pdf        HTML 만
 *
 * 원고 문법은 STYLE.md 참고. 코드 블록에 src="경로:시작-끝" 을 달면 실제 소스와 한 줄씩 대조한다(다르면 실패).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import MarkdownIt from 'markdown-it';
import mdContainer from 'markdown-it-container';
import mdAttrs from 'markdown-it-attrs';
import { createHighlighter, createCssVariablesTheme } from 'shiki';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
const ONLY = opt('--only');
const WANT_PNG = flag('--png');
const NO_PDF = flag('--no-pdf');
const QUIET = flag('--quiet');
const TAG = opt('--tag'); // 같은 장을 여러 작업이 동시에 빌드할 때 결과 파일 이름을 나눈다 (dist/ch05-<tag>.pdf)
const CHECK_ONLY = flag('--check'); // 파일을 만들지 않고 원고 문법·소스 인용 대조만
{
  const KNOWN = new Set(['--only', '--png', '--no-pdf', '--quiet', '--tag', '--check', '--dpi']);
  const WITH_VALUE = new Set(['--only', '--tag', '--dpi']);
  for (let i = 0; i < args.length; i += 1) {
    if (!KNOWN.has(args[i])) { console.error(`모르는 옵션: ${args[i]}\n쓸 수 있는 것: --only <장번호|preface|guide> --png [--dpi N] --tag <이름> --check --no-pdf --quiet`); process.exit(2); }
    if (WITH_VALUE.has(args[i])) i += 1;
  }
}

const config = (await import(pathToFileURL(path.join(ROOT, 'book.config.mjs')).href)).default;
const SRC_ROOT = path.resolve(ROOT, config.sourceRoot);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad2 = (n) => String(n).padStart(2, '0');
const errors = [];
const warns = [];
const fail = (where, msg) => errors.push(`[${where}] ${msg}`);

/* ------------------------------------------------------------------ 구문 강조 */
const theme = createCssVariablesTheme({ name: 'book', variablePrefix: '--shiki-', variableDefaults: {}, fontStyle: true });
const LANGS = ['tsx', 'typescript', 'javascript', 'jsx', 'html', 'css', 'json', 'bash', 'sql', 'java', 'xml', 'yaml', 'diff'];
const highlighter = await createHighlighter({ themes: [theme], langs: LANGS });
const LANG_ALIAS = { ts: 'typescript', js: 'javascript', sh: 'bash', shell: 'bash', term: 'bash', console: 'bash', cmd: 'bash', yml: 'yaml' };
const PLAIN = new Set(['text', 'txt', 'out', 'output', 'plain', '']);

const tokenLines = (code, lang) => {
  const l = LANG_ALIAS[lang] ?? lang;
  if (PLAIN.has(l) || !LANGS.includes(l)) return code.split('\n').map((t) => esc(t));
  const { tokens } = highlighter.codeToTokens(code, { lang: l, theme: 'book' });
  return tokens.map((line) =>
    line
      .map((t) => {
        const st = [];
        if (t.color && t.color !== 'var(--shiki-foreground)') st.push(`color:${t.color}`);
        if (t.fontStyle & 1) st.push('font-style:italic');
        if (t.fontStyle & 2) st.push('font-weight:700');
        return st.length ? `<span style="${st.join(';')}">${esc(t.content)}</span>` : esc(t.content);
      })
      .join(''),
  );
};

/* ------------------------------------------------------------------ 소스 인용 대조 */
const GAP_RE = /^\s*(\/\/|\{\/\*|\/\*|#|<!--)?\s*(…|\.\.\.|⋮)\s*(\(.*\))?\s*(\*\/\}|\*\/|-->)?\s*$/;
const srcCache = new Map();
const readSrc = (rel) => {
  if (!srcCache.has(rel)) {
    const p = path.join(SRC_ROOT, rel);
    srcCache.set(rel, fs.existsSync(p) ? fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n').split('\n') : null);
  }
  return srcCache.get(rel);
};
/** 인용 코드 줄마다 실제 줄 번호를 찾는다. 틀리면 오류를 쌓는다. 반환: 줄별 { no | null, gap } */
export const matchQuote = (codeLines, srcSpec, where) => {
  const m = /^(.+?):(\d+)(?:-(\d+))?$/.exec(srcSpec);
  if (!m) { fail(where, `src 형식 오류: "${srcSpec}" (예: src/app/App.tsx:1-9)`); return codeLines.map(() => ({ no: null })); }
  const [, rel, aS, bS] = m;
  const a = Number(aS); const b = Number(bS ?? aS);
  const lines = readSrc(rel);
  if (!lines) { fail(where, `소스 파일 없음: ${rel}`); return codeLines.map(() => ({ no: null })); }
  if (b > lines.length) fail(where, `${rel} 은 ${lines.length}줄인데 ${b}줄까지 인용`);
  let p = a - 1; let afterGap = false; const out = [];
  for (let i = 0; i < codeLines.length; i += 1) {
    const L = codeLines[i];
    if (GAP_RE.test(L) && L.trim() !== '') { out.push({ no: null, gap: true }); afterGap = true; continue; }
    if (L.trim() === '') {
      if (p < b && lines[p] !== undefined && lines[p].trim() === '') { out.push({ no: p + 1 }); p += 1; } else out.push({ no: null });
      continue;
    }
    let q = p;
    while (q < b && (lines[q] ?? '').trim() !== L.trim()) q += 1;
    if (q >= b) { fail(where, `${rel}:${a}-${b} 에 없는 줄(인용 ${i + 1}번째): ${L.trim().slice(0, 90)}`); out.push({ no: null }); continue; }
    const skipped = lines.slice(p, q).filter((s) => s.trim() !== '').length;
    if (skipped > 0 && !afterGap) fail(where, `${rel}:${p + 1}-${q} 을 건너뛰었는데 줄임표(// …) 가 없다 — 인용 ${i + 1}번째 줄 앞`);
    out.push({ no: q + 1 }); p = q + 1; afterGap = false;
  }
  return out;
};

/* ------------------------------------------------------------------ Markdown */
const BOX_TAG = { tip: '팁', warn: '주의', note: '잠깐', term: '용어', source: '소스', try: '해 보기', check: '확인' };
const md = new MarkdownIt({ html: true, linkify: false, typographer: false, breaks: false });
// 곧은따옴표를 책 모양(“ ” ‘ ’)으로. markdown-it 의 자동 바꿈은 닫는 따옴표 뒤에 조사가 붙는 한국어("소스"의)를 못 바꿔서 직접 한다.
// 규칙: 앞이 줄 처음·빈칸·여는 괄호·여는 따옴표면 여는 따옴표, 아니면 닫는 따옴표. 코드(`…`)와 HTML 은 건드리지 않는다.
md.core.ruler.push('ko_quotes', (state) => {
  for (const blk of state.tokens) {
    if (blk.type !== 'inline' || !blk.children) continue;
    let prev = '';
    for (const t of blk.children) {
      if (t.type === 'text') {
        let out = '';
        for (const ch of t.content) {
          if (ch === '"' || ch === "'") {
            const open = prev === '' || /[\s(\[{“‘<·/]/.test(prev);
            out += ch === '"' ? (open ? '“' : '”') : (open ? '‘' : '’');
          } else out += ch;
          prev = ch;
        }
        t.content = out;
      } else if (t.type === 'softbreak' || t.type === 'hardbreak') prev = ' ';
      else if (t.type === 'code_inline' || t.type === 'ix' || t.type === 'image') prev = 'x';
    }
  }
});
md.use(mdAttrs, { allowedAttributes: ['id', 'class', 'width', 'w'] });
for (const name of Object.keys(BOX_TAG)) {
  md.use(mdContainer, name, {
    render(tokens, idx) {
      const t = tokens[idx];
      if (t.nesting === 1) {
        const title = t.info.trim().slice(name.length).trim();
        return `<aside class="box ${name}"><div class="tag">${BOX_TAG[name]}</div><div class="body">${title ? `<p class="ttl">${md.renderInline(title)}</p>` : ''}\n`;
      }
      return '</div></aside>\n';
    },
  });
}
md.use(mdContainer, 'step', {
  render(tokens, idx) {
    const t = tokens[idx];
    if (t.nesting === 1) {
      const m = /^step\s+(\S+)\s*(.*)$/.exec(t.info.trim()) ?? [null, '?', ''];
      return `<div class="step"><div class="sno">단계<b>${esc(/^\d+$/.test(m[1]) ? pad2(m[1]) : m[1])}</b></div><div class="sttl">${md.renderInline(m[2])}</div><div class="sdesc">\n`;
    }
    return '</div></div>\n';
  },
});
md.use(mdContainer, 'summary', {
  render: (tokens, idx, _o, env) => (tokens[idx].nesting === 1 ? `<section class="summary"><div class="hd">핵심 정리<span>${env.ch ? `${env.ch}장` : ''}</span></div><div class="bd">\n` : '</div></section>\n'),
});
md.use(mdContainer, 'quiz', {
  render: (tokens, idx, _o, env) => (tokens[idx].nesting === 1 ? `<section class="quiz"><div class="hd">확인 문제<span>${env.ch ? `${env.ch}장` : ''}</span></div><div class="bd">\n` : '</div></section>\n'),
});
md.use(mdContainer, 'answer', { render: (tokens, idx) => (tokens[idx].nesting === 1 ? '<div class="answer">\n' : '</div>\n') });

// 찾아보기 표시: @@용어@@ · @@보이는글|색인어@@ · @@|색인어@@(보이지 않음)
const defaultCodeInline = md.renderer.rules.code_inline;
md.renderer.rules.code_inline = (tokens, idx, o, env, self) => {
  const out = defaultCodeInline(tokens, idx, o, env, self);
  const next = tokens[idx + 1];
  return next && next.type === 'text' && /^[가-힣]/.test(next.content) ? `${out}\u2060` : out;
};

md.inline.ruler.before('emphasis', 'ix', (state, silent) => {
  const s = state.src; const pos = state.pos;
  if (s.charCodeAt(pos) !== 0x40 || s.charCodeAt(pos + 1) !== 0x40) return false;
  const end = s.indexOf('@@', pos + 2);
  if (end < 0 || end - pos > 80 || s.slice(pos + 2, end).includes('\n')) return false;
  if (!silent) {
    const raw = s.slice(pos + 2, end);
    const [text, key] = raw.includes('|') ? raw.split('|') : [raw, raw];
    const t = state.push('ix', '', 0);
    t.meta = { text, key: (key || text).trim() };
  }
  state.pos = end + 2;
  return true;
});
md.renderer.rules.ix = (tokens, idx, _o, env) => {
  const { text, key } = tokens[idx].meta;
  const id = `ix-${env.ixSeq.n += 1}`;
  env.ix.push({ id, key });
  return `<span class="ix" id="${id}">${md.renderInline(text, { ...env, nested: true })}</span>`;
};

/** 차례에 들어가는 제목 글자용 — 위 규칙과 같은 따옴표 바꿈 */
const smartQ = (s) => { let prev = ''; let out = ''; for (const ch of s) { if (ch === '"' || ch === "'") { const open = prev === '' || /[\s(\[{“‘<·/]/.test(prev); out += ch === '"' ? (open ? '“' : '”') : (open ? '‘' : '’'); } else out += ch; prev = ch; } return out; };

// 표 캡션: 표 바로 앞 문단이 "표: …" 로 시작하면 캡션
md.core.ruler.push('table_caption', (state) => {
  const tk = state.tokens;
  for (let i = 0; i + 3 < tk.length; i += 1) {
    if (tk[i].type === 'paragraph_open' && tk[i + 1].type === 'inline' && /^표:\s*/.test(tk[i + 1].content) && tk[i + 3].type === 'table_open') {
      tk[i].meta = { tcap: true };
      const c = tk[i + 1].children?.[0];
      if (c && c.type === 'text') c.content = c.content.replace(/^표:\s*/, '');
      tk[i + 1].content = tk[i + 1].content.replace(/^표:\s*/, '');
    }
  }
});
const defaultParaOpen = md.renderer.rules.paragraph_open ?? ((tokens, idx, o, _e, self) => self.renderToken(tokens, idx, o));
md.renderer.rules.paragraph_open = (tokens, idx, o, env, self) => {
  if (tokens[idx].meta?.tcap) {
    env.tbl += 1;
    return `<p class="tcap"><b>표 ${env.ch ?? ''}${env.ch ? '-' : ''}${env.tbl}</b>`;
  }
  // 그림만 있는 문단은 <p> 를 쓰지 않는다
  const inl = tokens[idx + 1];
  if (inl?.children?.length === 1 && inl.children[0].type === 'image') { tokens[idx].meta = { figOnly: true }; return ''; }
  return defaultParaOpen(tokens, idx, o, env, self);
};
const defaultParaClose = md.renderer.rules.paragraph_close ?? ((tokens, idx, o, _e, self) => self.renderToken(tokens, idx, o));
md.renderer.rules.paragraph_close = (tokens, idx, o, env, self) => {
  const open = tokens.slice(0, idx).reverse().find((t) => t.type === 'paragraph_open' && t.level === tokens[idx].level);
  if (open?.meta?.figOnly) return '';
  return defaultParaClose(tokens, idx, o, env, self);
};

// 제목: h2 는 "장.절" 번호, id 는 sec-장-절 (원고에서 {#이름} 을 주면 그 이름도 상호참조에 쓴다)
md.renderer.rules.heading_open = (tokens, idx, _o, env) => {
  const t = tokens[idx];
  const custom = t.attrGet('id');
  const text = tokens[idx + 1].content.replace(/\s*\{[#.][^}]*\}\s*$/, '').replace(/@@([^|@]*)(\|[^@]*)?@@/g, '$1').replace(/[*`]/g, '');
  if (t.tag === 'h2') {
    env.sec += 1;
    const no = env.ch ? `${env.ch}.${env.sec}` : '';
    const id = env.ch ? `sec-${env.ch}-${env.sec}` : (custom ?? `sec-${env.key}-${env.sec}`);
    env.sections.push({ id, no, text: smartQ(text) });
    if (custom) env.xref.set(custom, { id, label: no ? `${no}절` : text });
    env.xref.set(id, { id, label: no ? `${no}절` : text });
    return `<h2 id="${id}">${no ? `<span class="no">${no}</span>` : ''}<span>`;
  }
  if (custom) env.xref.set(custom, { id: custom, label: `‘${text}’` });
  return `<${t.tag}${custom ? ` id="${custom}"` : ''}>`;
};
md.renderer.rules.heading_close = (tokens, idx) => (tokens[idx].tag === 'h2' ? '</span></h2>\n' : `</${tokens[idx].tag}>\n`);

// 그림: ![캡션](img/x.svg){width=80%} — svg 는 본문에 직접 넣어 책 글꼴을 쓴다
let svgSeq = 0;
const inlineSvg = (file, where) => {
  let s = fs.readFileSync(file, 'utf8').replace(/<\?xml[^>]*\?>/g, '').replace(/<!DOCTYPE[^>]*>/g, '').replace(/<!--[\s\S]*?-->/g, '').trim();
  if (!/viewBox=/.test(s)) fail(where, `SVG 에 viewBox 가 없다: ${file}`);
  const pre = `f${(svgSeq += 1)}-`;
  // 태그 안의 속성만 바꾼다(글자 속 id="root" 같은 문장은 그대로)
  s = s.replace(/<[^>]+>/g, (tag) => tag.replace(/\sid="([^"]+)"/g, ` id="${pre}$1"`).replace(/url\(#([^)]+)\)/g, `url(#${pre}$1)`).replace(/\s(xlink:href|href)="#([^"]+)"/g, ` $1="#${pre}$2"`));
  s = s.replace(/<svg\b([^>]*)>/, (_m, at) => `<svg${at.replace(/\s(width|height)="[^"]*"/g, '')}>`);
  return s;
};
md.renderer.rules.image = (tokens, idx, _o, env) => {
  const t = tokens[idx];
  const src = t.attrGet('src'); const cap = t.content; const w = t.attrGet('width') ?? t.attrGet('w') ?? '100%';
  const abs = path.join(ROOT, src);
  if (!fs.existsSync(abs)) { fail(env.where, `그림 파일 없음: ${src}`); return `<figure class="fig"><div style="border:1px dashed red;padding:8mm">그림 없음: ${esc(src)}</div></figure>`; }
  let body;
  if (/\.svg$/i.test(src)) body = `<div style="width:${esc(w)};margin:0 auto">${inlineSvg(abs, env.where)}</div>`;
  else body = `<img class="${/shots?\//.test(src) ? 'shot' : ''}" src="../${esc(src)}" style="width:${esc(w)}" alt="">`;
  let capHtml = '';
  if (cap) { env.fig += 1; capHtml = `<figcaption><b>그림 ${env.ch ?? ''}${env.ch ? '-' : ''}${env.fig}</b>${md.renderInline(cap)}</figcaption>`; }
  return `<figure class="fig">${body}${capHtml}</figure>\n`;
};

// 코드 블록
const parseInfo = (info) => {
  const m = /^(\S*)\s*(.*)$/.exec(info.trim());
  const attrs = {};
  const re = /([\w-]+)(?:="([^"]*)")?/g; let a;
  while ((a = re.exec(m[2])) !== null) attrs[a[1]] = a[2] ?? true;
  return { lang: m[1] ?? '', attrs };
};
const parseSet = (s) => {
  const set = new Set();
  for (const part of String(s || '').split(',').map((x) => x.trim()).filter(Boolean)) {
    const r = /^(\d+)(?:-(\d+))?$/.exec(part); if (!r) continue;
    for (let i = Number(r[1]); i <= Number(r[2] ?? r[1]); i += 1) set.add(i);
  }
  return set;
};
md.renderer.rules.fence = (tokens, idx, _o, env) => {
  const t = tokens[idx];
  const { lang, attrs } = parseInfo(t.info);
  let lines = t.content.replace(/\n$/, '').split('\n');
  const where = `${env.where} 코드블록(${t.map ? `원고 ${t.map[0] + 1}줄` : '?'})`;
  // diff: 첫 글자가 + / - / 공백
  let dmark = null;
  if (attrs.diff) {
    dmark = lines.map((l) => (l[0] === '+' ? 'add' : l[0] === '-' ? 'del' : ''));
    lines = lines.map((l) => (l[0] === '+' || l[0] === '-' || l[0] === ' ' ? l.slice(1) : l));
  }
  const isTerm = ['bash', 'sh', 'shell', 'term', 'console', 'cmd'].includes(lang);
  const isOut = ['out', 'output'].includes(lang);
  let nums = null;
  if (attrs.src) {
    const mt = matchQuote(lines, attrs.src, where);
    nums = mt.map((x) => (x.gap ? 'gap' : x.no));
  }
  const hl = parseSet(attrs.hl);
  const marks = new Map(String(attrs.marks || '').split(';').map((s) => s.split('=')).filter((p) => p.length === 2).map(([k, v]) => [Number(k), v]));
  // 긴 코드 줄이 낱말 가운데서 접히지 않게, 구두점 뒤에 줄바꿈 자리(<wbr>)를 둔다. <wbr> 은 글자가 아니라 복사해도 코드가 그대로다
  const wbr = (h) => h.replace(/(<[^>]*>)|(\$\{)|((?:&amp;){2}|\|\||=&gt;|[.(,{[\/=:?])(?!\s|$)/g, (m, tag, tpl, p) => (tag || tpl ? m : `${p}<wbr>`));
  const html = tokenLines(lines.join('\n'), lang).map(wbr);
  const showNums = Boolean(attrs.src) || attrs.nums === true || Boolean(attrs.diff);
  const start = typeof attrs.nums === 'string' ? Number(attrs.nums) : 1;
  const body = html
    .map((h, i) => {
      const cls = ['line'];
      if (hl.has(i + 1)) cls.push('hl');
      if (dmark?.[i]) cls.push(dmark[i]);
      let no = '';
      if (nums) { if (nums[i] === 'gap') { cls.push('gap'); return `<span class="${cls.join(' ')}"><span class="ln"></span><span class="lc">⋮</span></span>`; } no = nums[i] ?? ''; }
      else if (showNums) no = start + i;
      const dm = dmark?.[i] === 'add' ? '<b class="dm">+</b>' : dmark?.[i] === 'del' ? '<b class="dm">−</b>' : '';
      return `<span class="${cls.join(' ')}"><span class="ln">${no}${dm}</span><span class="lc">${h || ' '}</span>${marks.has(i + 1) ? `<span class="mk">${esc(marks.get(i + 1))}</span>` : ''}</span>`;
    })
    .join('');
  let cap = '';
  const title = attrs.title ?? (attrs.src ? String(attrs.src).replace(/:\d+(-\d+)?$/, '') : '');
  let kind = attrs.kind ?? '';
  if (!kind && attrs.src) { const r = /:(\d+)(?:-(\d+))?$/.exec(attrs.src); kind = r ? `우리 소스 ${r[1]}${r[2] && r[2] !== r[1] ? `–${r[2]}` : ''}줄` : '우리 소스'; }
  if (title || kind) cap = `<div class="cap${attrs.src ? '' : ' plain'}"><span class="path">${esc(title)}</span><span class="kind">${esc(kind)}</span></div>`;
  const keep = lines.length <= 14 ? ' keep' : '';
  return `<figure class="listing${keep}">${cap}<pre class="code${showNums ? ' nums' : ''}${isTerm ? ' term' : ''}${isOut ? ' out' : ''}">${body}</pre></figure>\n`;
};

/* ------------------------------------------------------------------ 원고 읽기 */
const ixSeq = { n: 0 };
const xref = new Map();
const allIx = [];
const HOIST_RE = /^:::[ \t]*(lead|goals|files)[ \t]*\n([\s\S]*?)\n:::[ \t]*$/gm;
/** 원고 손질: `**@@용어@@**` → `@@**용어**|용어@@` (닫는 ** 앞이 @ 라서 굵게가 안 닫히는 것을 막는다) */
const fixBoldIx = (src) => src.replace(/\*\*@@([^@|\n]+?)(?:\|([^@\n]+?))?@@\*\*/g, (_m, text, key) => `@@**${text}**|${key ?? text}@@`);
/** 조판된 글에 원고 기호(** 나 @@)가 그대로 남았는지 본다 — 코드 안은 빼고 */
const checkLeftover = (html, where) => {
  const text = html.replace(/<pre[\s\S]*?<\/pre>/g, '').replace(/<code>[\s\S]*?<\/code>/g, '').replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, '');
  const m = /(.{0,24})(\*\*|@@)(.{0,24})/.exec(text);
  if (m) fail(where, `원고 기호 "${m[2]}" 가 글에 그대로 남았다: …${m[1]}${m[2]}${m[3]}… (굵게·찾아보기 표시의 짝이나 순서를 확인)`);
};

const renderChapter = (ch, part) => {
  const where = `${ch.no}장`;
  let src = ch.files.map((f) => {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) { fail(where, `원고 파일 없음: ${f}`); return ''; }
    return fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
  }).join('\n\n');
  const h1 = /^#\s+(.+?)\s*$/m.exec(src);
  const title = h1 ? h1[1] : ch.title;
  if (h1) src = src.replace(h1[0], '');
  if (ch.title && h1 && ch.title !== title) warns.push(`[${where}] 원고 제목 "${title}" ≠ 설정 제목 "${ch.title}"`);
  const hoist = {};
  src = src.replace(HOIST_RE, (m, k, body) => { hoist[k] = body; return '\n'.repeat(m.split('\n').length - 1); });
  const env = { ch: ch.no, key: `ch${ch.no}`, where, sec: 0, fig: 0, tbl: 0, sections: [], ix: allIx, ixSeq, xref };
  src = fixBoldIx(src);
  const body = md.render(src, env);
  checkLeftover(body, where);
  xref.set(`ch${ch.no}`, { id: `ch-${ch.no}`, label: `${ch.no}장` });
  const rows = [];
  rows.push(`<div class="lbl chno"><span>${part ? `${part.no}부` : ''}</span><b>${pad2(ch.no)}</b></div><div class="val title"><h1 id="ch-${ch.no}">${md.renderInline(title, env)}</h1>${hoist.lead ? `<p class="lead">${md.renderInline(hoist.lead.replace(/\n+/g, ' '), env)}</p>` : ''}</div>`);
  if (hoist.goals) rows.push(`<div class="lbl">이 장에서<br>배우는 것</div><div class="val">${md.render(hoist.goals, env)}</div>`);
  if (hoist.files) rows.push(`<div class="lbl">함께 볼<br>소스</div><div class="val files">${md.render(hoist.files, env)}</div>`);
  const open = `<header class="ch-open"><div class="part-line"><span>${part ? `${part.no}부 ${esc(part.title)}` : ''}</span><span class="no">${pad2(ch.no)} / ${pad2(config.parts.flatMap((p) => p.chapters).length)}</span></div><div class="slip">${rows.join('')}</div></header>`;
  return { no: ch.no, title, budget: ch.budget, sections: env.sections, html: `<section class="chapter" data-ch="${ch.no}">${open}\n${body}</section>` };
};

const renderFront = (f) => {
  const p = path.join(ROOT, f.file);
  if (!fs.existsSync(p)) { fail(f.id, `원고 파일 없음: ${f.file}`); return { ...f, html: '' }; }
  let src = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
  const h1 = /^#\s+(.+?)\s*$/m.exec(src);
  if (h1) src = src.replace(h1[0], '');
  const env = { ch: null, key: f.id, where: f.id, sec: 0, fig: 0, tbl: 0, sections: [], ix: allIx, ixSeq, xref };
  src = fixBoldIx(src);
  checkLeftover(md.render(src, { ...env, ix: [], ixSeq: { n: 0 }, xref: new Map() }), f.id);
  return { ...f, title: h1 ? h1[1] : f.title, html: `<section class="front" id="${f.id}"><h1 class="ft" id="fm-${f.id}">${esc(h1 ? h1[1] : f.title)}</h1>\n${md.render(src, env)}</section>` };
};

/** 원고를 렌더링하지 않고 제목만 훑어 상호참조 글자표를 만든다(--only 빌드용) */
const scanXrefLabels = () => {
  const map = new Map();
  for (const p of config.parts) for (const c of p.chapters) {
    map.set(`ch${c.no}`, { id: `ch-${c.no}`, label: `${c.no}장` });
    let sec = 0; let fence = false;
    for (const f of c.files) {
      const fp = path.join(ROOT, f); if (!fs.existsSync(fp)) continue;
      for (const line of fs.readFileSync(fp, 'utf8').split('\n')) {
        if (/^(```|~~~)/.test(line)) { fence = !fence; continue; }
        if (fence) continue;
        const h2 = /^##\s+(.*?)\s*(\{#([\w-]+)\})?\s*$/.exec(line);
        if (h2 && !line.startsWith('###')) { sec += 1; const id = `sec-${c.no}-${sec}`; const v = { id, label: `${c.no}.${sec}절` }; map.set(id, v); if (h2[3]) map.set(h2[3], v); continue; }
        const h3 = /^###+\s+(.*?)\s*\{#([\w-]+)\}\s*$/.exec(line);
        if (h3) map.set(h3[2], { id: h3[2], label: `‘${h3[1].replace(/[*`]/g, '')}’` });
      }
    }
  }
  return map;
};

/* ------------------------------------------------------------------ 조립 */
const PG = (id) => `<span class="pg" data-ref="${id}">000</span>`;
const pageCss = (chapters) => {
  const head = `font-family:'Pretendard',sans-serif;font-size:7.4pt;font-weight:500;color:#7d8591;padding-top:7mm;vertical-align:top;`;
  let css = `@page :left { @top-left { content: "${config.runningTitle.replace(/"/g, '\\"')}"; ${head} } }\n`;
  for (const c of chapters) {
    css += `.chapter[data-ch="${c.no}"] { page: ch${c.no}; }\n@page ch${c.no}:right { @top-right { content: "${c.no}장  ${c.title.replace(/"/g, '\\"')}"; ${head} } }\n`;
  }
  return css;
};
const wrapHtml = (body, css, title) => `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><title>${esc(title)}</title>
<link rel="stylesheet" href="../styles/book.css"><style>${css}</style></head>
<body>${body}</body></html>`;

const resolveXref = (html, where) =>
  html.replace(/\[\[#([\w-]+)\]\]/g, (_m, id) => {
    const x = xref.get(id);
    if (!x) { fail(where, `상호참조 대상 없음: [[#${id}]]`); return `<span style="color:red">[[#${id}]]</span>`; }
    return `<a class="xref" href="#${x.id}">${esc(x.label)}</a>`;
  });

const HANGUL_GROUP = ['ㄱ', 'ㄱ', 'ㄴ', 'ㄷ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅂ', 'ㅅ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const groupOf = (key) => {
  const c = key.codePointAt(0);
  if (c >= 0xac00 && c <= 0xd7a3) return { g: HANGUL_GROUP[Math.floor((c - 0xac00) / 588)], ord: 1 };
  if (/[A-Za-z]/.test(key[0])) return { g: key[0].toUpperCase(), ord: 2 };
  return { g: '기호', ord: 0 };
};
const buildIndex = (pages) => {
  const byKey = new Map();
  for (const { id, key } of allIx) { if (!byKey.has(key)) byKey.set(key, []); byKey.get(key).push(id); }
  const items = [...byKey.entries()].map(([key, ids]) => ({ key, ids, ...groupOf(key) }));
  const coll = new Intl.Collator('ko');
  items.sort((x, y) => x.ord - y.ord || coll.compare(x.g, y.g) || coll.compare(x.key, y.key));
  let html = ''; let cur = null;
  for (const it of items) {
    if (it.g !== cur) { html += `<div class="grp">${esc(it.g)}</div>`; cur = it.g; }
    let p;
    if (pages) {
      const nums = [...new Set(it.ids.map((id) => pages.get(id)).filter(Boolean))].sort((a, b) => a - b);
      p = nums.map((n, i) => `<a href="#${it.ids.find((id) => pages.get(id) === n)}">${n}</a>${i < nums.length - 1 ? ', ' : ''}`).join('');
    } else p = it.ids.map((id) => `<a href="#${id}">000</a>`).join(', ');
    html += `<div class="it"><span class="k">${esc(it.key)}</span><span class="d"></span><span class="p">${p}</span></div>`;
  }
  return `<section class="index" id="index"><h1 class="ft" id="fm-index">찾아보기</h1><div class="cols">${html}</div></section>`;
};

const assemble = (pages) => {
  const fronts = (config.front ?? []).map(renderFront);
  const parts = config.parts.map((p) => ({ ...p, rendered: p.chapters.map((c) => renderChapter(c, p)) }));
  const chapters = parts.flatMap((p) => p.rendered);
  const pg = (id) => (pages ? `<span class="pg">${pages.get(id) ?? '?'}</span>` : PG(id));
  // 차례
  let toc = `<section class="toc" id="toc"><h1 class="ft">차례</h1><div class="front-items">`;
  for (const f of fronts) toc += `<a class="row fm" href="#fm-${f.id}"><span>${esc(f.title)}</span><span class="dots"></span>${pg(`fm-${f.id}`)}</a>`;
  toc += '</div>';
  for (const p of parts) {
    toc += `<a class="tp" href="#part-${p.no}"><span class="no">${p.no}부</span><span>${esc(p.title)}</span></a>`;
    for (const c of p.rendered) {
      toc += `<div class="tc"><a class="row ch" href="#ch-${c.no}"><span class="no">${pad2(c.no)}</span><span>${esc(c.title)}</span><span class="dots"></span>${pg(`ch-${c.no}`)}</a>`;
      for (const s of c.sections) toc += `<a class="row sec" href="#${s.id}"><span class="no">${s.no}</span><span>${esc(s.text)}</span><span class="dots"></span>${pg(s.id)}</a>`;
      toc += '</div>';
    }
  }
  if (config.index !== false) toc += `<div class="front-items" style="margin:1.2mm 0 0"><a class="row fm" href="#fm-index"><span>찾아보기</span><span class="dots"></span>${pg('fm-index')}</a></div>`;
  toc += '</section>';
  // 부 표지 + 장
  let main = '';
  for (const p of parts) {
    main += `<section class="part" id="part-${p.no}"><div class="band"></div><div class="pno">${p.no}부</div><h1>${esc(p.title)}</h1><div class="intro">${(p.intro ?? []).map((t) => `<p>${md.renderInline(t)}</p>`).join('')}</div><div class="plist">${p.rendered.map((c) => `<div class="n">${pad2(c.no)}</div><div class="t"><b>${esc(c.title)}</b><span>${esc(p.chapters.find((x) => x.no === c.no)?.blurb ?? '')}</span></div><a class="p" href="#ch-${c.no}">${pg(`ch-${c.no}`)}</a>`).join('')}</div></section>`;
    main += p.rendered.map((c) => c.html).join('\n');
  }
  const read = (f) => (f && fs.existsSync(path.join(ROOT, f)) ? fs.readFileSync(path.join(ROOT, f), 'utf8') : '');
  const cover = read(config.coverHtml);
  const half = read(config.halfTitleHtml);
  const colophon = read(config.colophonHtml);
  const index = config.index !== false ? buildIndex(pages) : '';
  let body = `${cover}${half}${colophon}${fronts.map((f) => f.html).join('\n')}${toc}${main}${index}`;
  body = resolveXref(body, '책 전체');
  return { html: wrapHtml(body, pageCss(chapters), config.title), chapters, parts, fronts };
};

/* ------------------------------------------------------------------ PDF */
const toPdf = async (browser, htmlPath, pdfPath) => {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
  // 쪽 머리글·쪽번호(여백 상자)에만 쓰이는 글꼴도 미리 불러 둔다
  await page.evaluate(async () => { await Promise.all([...document.fonts].map((f) => f.load().catch(() => null))); await document.fonts.ready; });
  await page.pdf({ path: pdfPath, preferCSSPageSize: true, printBackground: true, outline: true, tagged: false });
  await page.close();
};
const readPdf = async (pdfPath, ids) => {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(pdfPath)), verbosity: 0 }).promise;
  const pages = new Map();
  if (ids) {
    const dests = await doc.getDestinations();
    for (const id of ids) {
      const d = dests[id];
      if (!d) continue;
      pages.set(id, (await doc.getPageIndex(d[0])) + 1);
    }
  }
  const n = doc.numPages;
  await doc.destroy();
  return { n, pages };
};

fs.mkdirSync(DIST, { recursive: true });

if (ONLY) {
  // 한 장만: 쪽수 확인용
  const all = config.parts.flatMap((p) => p.chapters.map((c) => ({ c, p })));
  const hit = all.find(({ c }) => pad2(c.no) === pad2(ONLY) || String(c.no) === String(ONLY));
  let body; let name; let title; let css = ''; let budget;
  if (hit) {
    const r = renderChapter(hit.c, hit.p);
    body = r.html; name = `ch${pad2(hit.c.no)}${TAG ? `-${TAG}` : ''}`; title = r.title; css = pageCss([r]); budget = hit.c.budget;
    // 다른 장을 가리키는 [[#…]] 는 원고 제목만 훑어 책 전체 빌드와 같은 글자로 만든다(줄바꿈·쪽수가 같아지게)
    const outer = scanXrefLabels();
    body = body.replace(/\[\[#([\w-]+)\]\]/g, (_m, id) => {
      const x = xref.get(id) ?? outer.get(id);
      if (!x) { fail(`${hit.c.no}장`, `상호참조 대상 없음: [[#${id}]]`); return `<span class="xref">(→${id})</span>`; }
      return `<a class="xref" href="#${x.id}">${esc(x.label)}</a>`;
    });
    if (errors.length) { console.error(`오류 ${errors.length}건\n${errors.join('\n')}`); process.exit(1); }
  } else {
    const f = (config.front ?? []).find((x) => x.id === ONLY);
    if (!f) { console.error(`--only ${ONLY}: 그런 장/머리글이 없다`); process.exit(2); }
    const r = renderFront(f); body = r.html; name = `${f.id}${TAG ? `-${TAG}` : ''}`; title = r.title; budget = f.budget;
  }
  if (errors.length) { console.error(`오류 ${errors.length}건\n${errors.join('\n')}`); process.exit(1); }
  if (CHECK_ONLY) { console.log(`${name}: 원고 문법·소스 인용 대조 통과`); if (warns.length) console.warn(warns.join('\n')); process.exit(0); }
  const htmlPath = path.join(DIST, `${name}.html`);
  fs.writeFileSync(htmlPath, wrapHtml(body, css, title));
  if (!NO_PDF) {
    const { chromium } = require('playwright');
    const browser = await chromium.launch();
    const pdfPath = path.join(DIST, `${name}.pdf`);
    await toPdf(browser, htmlPath, pdfPath);
    await browser.close();
    const { n } = await readPdf(pdfPath);
    const state = budget ? (n === budget ? '맞음' : n > budget ? `${n - budget}쪽 넘침` : `${budget - n}쪽 모자람`) : '';
    console.log(`${name} "${title}": ${n}쪽${budget ? ` (목표 ${budget}쪽 — ${state})` : ''}`);
    if (WANT_PNG) {
      const dir = path.join(DIST, 'png'); fs.mkdirSync(dir, { recursive: true });
      const mine = new RegExp(`^${name}-\\d+\\.png$`);
      for (const f of fs.readdirSync(dir)) if (mine.test(f)) fs.rmSync(path.join(dir, f));
      execFileSync('pdftoppm', ['-r', opt('--dpi') ?? '80', '-png', pdfPath, path.join(dir, name)]);
      console.log(`PNG: ${dir}/${name}-*.png`);
    }
  }
  if (warns.length && !QUIET) console.warn(warns.join('\n'));
  process.exit(0);
}

// 책 전체
const first = assemble(null);
if (errors.length) { console.error(`오류 ${errors.length}건\n${errors.join('\n')}`); process.exit(1); }
const htmlPath = path.join(DIST, 'book.html');
fs.writeFileSync(htmlPath, first.html);
if (NO_PDF) { console.log(`HTML: ${htmlPath}`); process.exit(0); }
const { chromium } = require('playwright');
const browser = await chromium.launch();
const tmpPdf = path.join(DIST, 'book-pass1.pdf');
await toPdf(browser, htmlPath, tmpPdf);
const ids = [...first.html.matchAll(/(?:data-ref|href)="#?([\w-]+)"/g)].map((m) => m[1]).concat(allIx.map((x) => x.id));
const p1 = await readPdf(tmpPdf, new Set(ids));
// 2번째: 쪽번호를 채워 다시 인쇄 (원고는 다시 렌더링 — 찾아보기 id 순번을 처음부터)
ixSeq.n = 0; allIx.length = 0; svgSeq = 0; errors.length = 0; warns.length = 0;
const second = assemble(p1.pages);
fs.writeFileSync(htmlPath, second.html);
const outPdf = path.join(ROOT, config.output ?? 'react-book.pdf');
await toPdf(browser, htmlPath, outPdf);
await browser.close();
const p2 = await readPdf(outPdf, new Set(ids));
let moved = 0;
for (const [id, n] of p1.pages) if (p2.pages.get(id) !== n) moved += 1;
fs.rmSync(tmpPdf, { force: true });

// 보고: 장별 쪽수
const starts = [];
for (const p of second.parts) { starts.push({ label: `${p.no}부 표지`, id: `part-${p.no}` }); for (const c of p.rendered) starts.push({ label: `${pad2(c.no)}장 ${c.title}`, id: `ch-${c.no}`, budget: c.budget }); }
if (config.index !== false) starts.push({ label: '찾아보기', id: 'fm-index' });
const rows = starts.map((s, i) => {
  const a = p2.pages.get(s.id); const b = i + 1 < starts.length ? p2.pages.get(starts[i + 1].id) : p2.n + 1;
  return { ...s, from: a, pages: a && b ? b - a : null };
});
console.log(`\n총 ${p2.n}쪽 (목표 ${config.totalPages ?? '-'}쪽)  →  ${outPdf}`);
for (const r of rows) console.log(`  ${String(r.from ?? '?').padStart(3)}쪽  ${String(r.pages ?? '?').padStart(2)}쪽${r.budget ? ` / 목표 ${String(r.budget).padStart(2)}` : '          '}  ${r.budget && r.pages !== r.budget ? '≠' : ' '} ${r.label}`);
if (moved) console.warn(`주의: 2번째 인쇄에서 쪽이 바뀐 항목 ${moved}개 — 차례·찾아보기 쪽번호를 다시 확인`);
const lost = allIx.filter((x) => !p2.pages.get(x.id));
if (lost.length) { console.error(`오류: 찾아보기 위치를 PDF 에서 찾지 못한 표시 ${lost.length}개 — ${lost.map((x) => x.key).join(', ')}`); process.exitCode = 1; }
if (warns.length && !QUIET) console.warn(warns.join('\n'));
fs.writeFileSync(path.join(DIST, 'report.json'), JSON.stringify({ total: p2.n, rows, moved }, null, 2));
