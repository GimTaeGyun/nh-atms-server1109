#!/usr/bin/env node
/**
 * 그림(SVG) 미리보기 — 책 글꼴·스타일을 입혀 PNG 로 만든다(눈으로 확인용).
 *   node scripts/fig.mjs img/ch05-tree.svg [너비%=100]   →  dist/fig/ch05-tree.png
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [file, width = '100'] = process.argv.slice(2);
if (!file) { console.error('사용법: node scripts/fig.mjs img/이름.svg [너비%]'); process.exit(2); }
const abs = path.resolve(ROOT, file);
const svg = fs.readFileSync(abs, 'utf8').replace(/<\?xml[^>]*\?>/g, '').replace(/<svg\b([^>]*)>/, (_m, at) => `<svg${at.replace(/\s(width|height)="[^"]*"/g, '')}>`);
const out = path.join(ROOT, 'dist', 'fig', `${path.basename(file, '.svg')}.png`);
fs.mkdirSync(path.dirname(out), { recursive: true });
const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><link rel="stylesheet" href="../../styles/book.css">
<style>html,body{margin:0;background:#fff}#w{width:150mm;padding:3mm}</style></head>
<body><div id="w"><figure class="fig" style="margin:0"><div style="width:${String(width).replace('%', '')}%;margin:0 auto">${svg}</div></figure></div></body></html>`;
const tmp = path.join(ROOT, 'dist', 'fig', `_preview-${path.basename(file, '.svg')}.html`);
fs.writeFileSync(tmp, html);
const { chromium } = require('playwright');
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });
await page.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.locator('#w').screenshot({ path: out });
// 글자가 그림 밖으로 나갔는지 간단 검사
const over = await page.evaluate(() => {
  const s = document.querySelector('svg'); const b = s.getBoundingClientRect(); const bad = [];
  for (const t of s.querySelectorAll('text')) { const r = t.getBoundingClientRect(); if (r.left < b.left - 1 || r.right > b.right + 1 || r.top < b.top - 1 || r.bottom > b.bottom + 1) bad.push(t.textContent.slice(0, 20)); }
  return bad;
});
await browser.close();
fs.rmSync(tmp, { force: true });
console.log(`${out}${over.length ? `\n주의: 그림 밖으로 나간 글자 ${over.length}개 — ${over.join(' / ')}` : ''}`);
