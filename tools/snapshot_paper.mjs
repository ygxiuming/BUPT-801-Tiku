#!/usr/bin/env node
/**
 * 试卷页静态快照：jsdom 渲染 → 单文件 HTML（供预览面板/浏览器直接看版式）
 *
 * 为什么不用截图：本机 `/usr/bin/google-chrome --headless` 会 SIGTRAP（EXIT=133），
 * 而快照 HTML 由 jsdom 渲染（KaTeX 与内联 SVG 已经在 DOM 里），不需要再跑浏览器 JS。
 * 产物写在 app/dist/ 下，CSS/字体按相对路径正好找得到（dist 已被 gitignore）。
 *
 * 用法：node tools/snapshot_paper.mjs 2026 [--groups=6] [--bigs=2]
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL, fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const APP = path.join(ROOT, 'app')
const DIST = path.join(APP, 'dist')
const require = createRequire(path.join(APP, 'package.json'))
const { JSDOM } = (() => {
  for (const p of ['jsdom', '/home/xiuming/.workbuddy/binaries/node/workspace/node_modules/jsdom']) {
    try { return require(p) } catch (e) { /* next */ }
  }
  console.error('缺少 jsdom'); process.exit(1)
})()

const year = process.argv[2] || '2026'
const arg = (k, d) => {
  const m = process.argv.find((a) => a.startsWith('--' + k + '='))
  return m ? Number(m.split('=')[1]) : d
}
const nGroups = arg('groups', 6)
const nBigs = arg('bigs', 2)
// --only=八：只留某一道大题（看两级小问、图件尺寸时用）
const onlyArg = (process.argv.find((a) => a.startsWith('--only=')) || '').split('=')[1] || ''

const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
const scripts = [...html.matchAll(/<script([^>]*)\ssrc="([^"]+)"([^>]*)>\s*<\/script>/g)]
  .filter((m) => !/type="module"/.test(m[1] + m[3])).map((m) => m[2]).filter((s) => !/app\.js$/.test(s))
const localFile = (src) => src.startsWith('/data/') ? path.join(ROOT, src.slice(1))
  : src.startsWith('/vendor/') ? path.join(DIST, src.slice(1)) : path.join(DIST, src.replace(/^\//, ''))

const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
  url: 'http://127.0.0.1:3000/paper/' + year, pretendToBeVisual: true, runScripts: 'outside-only'
})
const w = dom.window
for (const k of ['window','document','navigator','location','history','localStorage','Element','HTMLElement','SVGElement','Node','Event','MouseEvent','KeyboardEvent','getComputedStyle','requestAnimationFrame','cancelAnimationFrame','matchMedia','CSS','crypto','Document','ShadowRoot','HTMLInputElement','HTMLTextAreaElement','HTMLAnchorElement','Blob','FileReader','File','FormData','URL']) {
  const v = k === 'window' ? w : w[k]; if (v === undefined) continue
  try { globalThis[k] = v } catch { Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true }) }
}
w.scrollTo = () => {}; w.Element.prototype.scrollIntoView = () => {}
const noFetch = async () => { throw new Error('no fetch') }
w.fetch = noFetch; globalThis.fetch = noFetch
for (const k of ['MutationObserver','IntersectionObserver','ResizeObserver']) {
  const v = w[k] || class { observe(){} unobserve(){} disconnect(){} takeRecords(){return []} }
  w[k] = v; globalThis[k] = v
}
if (!w.URL.createObjectURL) w.URL.createObjectURL = () => 'blob:x'
const mm = html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/)
const entry = path.join(DIST, mm[1].slice(mm[1].indexOf('assets/')))
for (const src of scripts) {
  const f = localFile(src)
  if (fs.existsSync(f)) w.eval(fs.readFileSync(f, 'utf8'))
}
await import(pathToFileURL(entry).href + '?snap=' + Date.now())
await new Promise((r) => setTimeout(r, 500))

const d = w.document
const sheet = d.querySelector('.paper-sheet')
if (!sheet) { console.error('没渲染出 .paper-sheet'); process.exit(1) }

// 只留前 nGroups 组选择题 + 前 nBigs 道大题，快照才不至于几屏都看不完
const groups = [...sheet.querySelectorAll('.qgroup')]
groups.slice(nGroups).forEach((el) => el.remove())
const bigs = [...sheet.querySelectorAll('.bigq')]
if (onlyArg) {
  bigs.forEach((el) => {
    const num = (el.querySelector('.qnum') || {}).textContent || ''
    if (!num.trim().startsWith(onlyArg)) el.remove()
  })
} else {
  bigs.slice(nBigs).forEach((el) => el.remove())
}

const out = path.join(DIST, '_preview_' + year + '.html')
fs.writeFileSync(out, `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<title>${year} 年 · 卷面快照</title>
<link rel="stylesheet" href="assets/app.css">
<link rel="stylesheet" href="vendor/katex/katex.min.css">
<style>
  body { background: #eef1f6; margin: 0; padding: 24px 16px 60px; }
  .paper-sheet { max-width: 900px; margin: 0 auto; }
  .preview-note { max-width: 900px; margin: 0 auto 14px; font: 13px/1.7 -apple-system,"PingFang SC","Microsoft YaHei",sans-serif;
    color: #45506b; background: #fff; border: 1px solid #dbe1ee; border-radius: 10px; padding: 10px 14px; }
  .preview-note b { color: #1d43c4; }
</style></head><body>
<div class="preview-note">快照：<b>${year} 年</b>卷面前 ${nGroups} 组选择题 + 前 ${nBigs} 道大题（含解析）。
展示的是渲染后的真实 DOM：题号在行首、小问逐行、图件按 320~680px 显示。</div>
<div class="paper-sheet">${sheet.innerHTML}</div>
</body></html>`, 'utf8')
console.log('OK ' + out + '  ' + (fs.statSync(out).size / 1024).toFixed(0) + ' kB')
w.close()
process.exit(0)
