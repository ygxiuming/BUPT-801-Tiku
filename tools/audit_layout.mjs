#!/usr/bin/env node
/**
 * 版式体检（逐年版）：把试卷页 DOM 拉出来，数「题号/小问/图件」三类格式问题。
 * 单年一个进程跑（jsdom 跑多年会吃满内存被 SIGTERM）。
 *
 * 用法：node tools/audit_layout.mjs 2017 [--json]
 * 输出：选择题组数、缺题号的组、缺空号标注的选项表、大题里挤进 stem 的小问、
 *       subs 行数与小问编号、图件张数与 viewBox 尺寸（>700 宽即视作会被放大）。
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
const year = process.argv[2]
const asJson = process.argv.includes('--json')
if (!year) { console.error('用法: node tools/audit_layout.mjs <年>'); process.exit(1) }

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
for (const src of scripts) w.eval(fs.readFileSync(localFile(src), 'utf8'))
await import(pathToFileURL(entry).href + '?a=' + Date.now())
await new Promise((r) => setTimeout(r, 350))

const doc = w.document
const t = (el) => (el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : '')
const out = { year: Number(year), choice: {}, big: [], figs: [] }

const groups = [...doc.querySelectorAll('.qgroup')]
out.choice.groups = groups.length
out.choice.noQno = groups.filter((g) => !t(g.querySelector('.qnr'))).length
out.choice.blkChip = groups.filter((g) => g.querySelector('.qblk')).length
out.choice.qnoSamples = groups.slice(0, 4).map((g) => t(g.querySelector('.qnr')))
// 选项表缺「空号标注」：连着排的表分不清属哪一空
out.choice.tables = groups.reduce((n, g) => n + g.querySelectorAll('table.opt-table').length, 0)
out.choice.tablesNoCap = groups.reduce((n, g) => {
  const caps = g.querySelectorAll('.opt-cap').length
  const tabs = g.querySelectorAll('table.opt-table').length
  return n + Math.max(0, tabs - caps)
}, 0)
out.choice.capSamples = groups.slice(0, 4).map((g) => [...g.querySelectorAll('.opt-cap')].map(t).join('|'))

// 2011 起第一节可以是无选项的填空题（.bigq 出现在 #sec-big 之前），
// 它们题干里的（n）是全卷连续空号，不算「小问挤在 stem 里」
const secBigEl = doc.getElementById('sec-big')
const isBlankQ = (el) => secBigEl && !!(el.compareDocumentPosition(secBigEl) & 4) // 4 = DOCUMENT_POSITION_FOLLOWING
for (const b of doc.querySelectorAll('.bigq')) {
  const blankQ = isBlankQ(b)
  const stem = t(b.querySelector(':scope > .stem'))
  const subs = b.querySelector(':scope > .subs')
  const rows = subs ? [...subs.querySelectorAll(':scope > .sub-row')] : []
  const grps = subs ? [...subs.querySelectorAll(':scope > .sub-grp')] : []
  // 小问挤在 stem 里的判据：stem 里出现「（1）」这类编号，且没有任何 subs 行
  const inline = !blankQ && /[（(]\s*[1１]\s*[)）]/.test(stem)
  out.big.push({
    num: t(b.querySelector('.qnum')).replace(/#.*/, '').trim(),
    subs: rows.length + grps.length,
    inlineInStem: inline && !rows.length && !grps.length,
    stemLen: stem.length,
    // 小问行必须以「（n）」开头；「1、」这类是组标题（sub-grp），单独算
    noSubNo: rows.filter((x) => !/^[（(]\s*\d+\s*[)）]/.test(t(x))).length,
    grpNoNo: grps.filter((x) => !/^\d+[、.]/.test(t(x))).length,
    fig: b.querySelectorAll(':scope > .figblock svg').length
  })
}
// 图件的实际显示尺寸：没有 width/height 就会被浏览器按「无固有尺寸」撑满正文宽
for (const svg of doc.querySelectorAll('.figblock svg')) {
  const vb = (svg.getAttribute('viewBox') || '').trim().split(/\s+/).map(Number)
  out.figs.push({
    w: vb[2], h: vb[3],
    dw: Number(svg.getAttribute('width')) || 0,
    hasWH: !!(svg.getAttribute('width') && svg.getAttribute('height'))
  })
}
out.figCount = out.figs.length
out.figsWide = out.figs.filter((f) => f.w > 700).length
out.figsNoWH = out.figs.filter((f) => !f.hasWH).length
out.figsOver = out.figs.filter((f) => f.dw > 690).length
out.katexErr = doc.querySelectorAll('.katex-error').length

// 判定：任一条不满足就是版式不合格（可当 CI 门禁用）
out.errors = []
if (out.choice.noQno) out.errors.push(`选择题有 ${out.choice.noQno} 组没渲染题号`)
if (out.choice.tablesNoCap) out.errors.push(`有 ${out.choice.tablesNoCap} 张选项表没标空号`)
for (const b of out.big) {
  if (b.inlineInStem) out.errors.push(`大题 ${b.num} 的小问挤在 stem 里（没有 subs）`)
  if (b.noSubNo) out.errors.push(`大题 ${b.num} 有 ${b.noSubNo} 行小问没有（n）编号`)
  if (b.grpNoNo) out.errors.push(`大题 ${b.num} 有 ${b.grpNoNo} 行组标题没有编号`)
}
if (out.figsNoWH) out.errors.push(`${out.figsNoWH} 张图没有 width/height（会被撑满正文宽）`)
if (out.figsOver) out.errors.push(`${out.figsOver} 张图显示宽度 > 690px`)
if (out.katexErr) out.errors.push(`KaTeX 渲染失败 ${out.katexErr} 处`)

if (asJson) console.log(JSON.stringify(out))
else {
  console.log(`== ${out.year} ==  选择题组 ${out.choice.groups}（缺题号 ${out.choice.noQno}，带「空 n」小标 ${out.choice.blkChip}）· 选项表 ${out.choice.tables}（缺空号 ${out.choice.tablesNoCap}）`)
  console.log('   题号示例: ' + out.choice.qnoSamples.join(' / ') + '   空号示例: ' + out.choice.capSamples.join(' / '))
  for (const b of out.big) {
    const flag = b.inlineInStem ? '  << 小问挤在 stem 里' : ''
    console.log(`   大题 ${b.num}: 小问 ${b.subs} 行（缺编号 ${b.noSubNo}）· stem ${b.stemLen} 字 · 图 ${b.fig}${flag}`)
  }
  console.log(`   图件 ${out.figCount} 张：无 width/height ${out.figsNoWH} 张，显示宽 ${out.figs.length ? Math.round(Math.min(...out.figs.map((f) => f.dw))) : 0}~${out.figs.length ? Math.round(Math.max(...out.figs.map((f) => f.dw))) : 0}px；katex-error ${out.katexErr}`)
  console.log(out.errors.length ? '   判定: ✗ ' + out.errors.join('；') : '   判定: ✓')
}
w.close()
process.exit(out.errors.length ? 1 : 0)
