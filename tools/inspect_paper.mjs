#!/usr/bin/env node
/** 试卷页结构体检：把 jsdom 渲染出的 DOM 按「节 → 题 → 小问/选项」逐层打印，用来看版式分组对不对 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL, fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const APP = path.join(ROOT, 'app')
const DIST = path.join(APP, 'dist')
const require = createRequire(path.join(APP, 'package.json'))
const { JSDOM } = (() => { for (const p of ['jsdom', '/home/xiuming/.workbuddy/binaries/node/workspace/node_modules/jsdom']) { try { return require(p) } catch (e) {} } })()
const year = process.argv[2] || '2017'
const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
const scripts = [...html.matchAll(/<script([^>]*)\ssrc="([^"]+)"([^>]*)>\s*<\/script>/g)]
  .filter((m) => !/type="module"/.test(m[1] + m[3])).map((m) => m[2]).filter((s) => !/app\.js$/.test(s))
const localFile = (src) => src.startsWith('/data/') ? path.join(ROOT, src.slice(1))
  : src.startsWith('/vendor/') ? path.join(DIST, src.slice(1)) : path.join(DIST, src.replace(/^\//, ''))
const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { url: 'http://127.0.0.1:3000/paper/' + year, pretendToBeVisual: true, runScripts: 'outside-only' })
const w = dom.window
for (const k of ['window','document','navigator','location','history','localStorage','Element','HTMLElement','SVGElement','Node','Event','MouseEvent','KeyboardEvent','getComputedStyle','requestAnimationFrame','cancelAnimationFrame','matchMedia','CSS','crypto','Document','ShadowRoot','HTMLInputElement','HTMLTextAreaElement','HTMLAnchorElement','Blob','FileReader','File','FormData','URL']) {
  const v = k === 'window' ? w : w[k]; if (v === undefined) continue
  try { globalThis[k] = v } catch { Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true }) }
}
w.scrollTo = () => {}; w.Element.prototype.scrollIntoView = () => {}
const noFetch = async () => { throw new Error('no fetch') }; w.fetch = noFetch; globalThis.fetch = noFetch
for (const k of ['MutationObserver','IntersectionObserver','ResizeObserver']) { const v = w[k] || class { observe(){} unobserve(){} disconnect(){} takeRecords(){return []} }; w[k] = v; globalThis[k] = v }
if (!w.URL.createObjectURL) w.URL.createObjectURL = () => 'blob:x'
const m = html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/)
const entry = path.join(DIST, m[1].slice(m[1].indexOf('assets/')))
for (const src of scripts) w.eval(fs.readFileSync(localFile(src), 'utf8'))
await import(pathToFileURL(entry).href + '?ins=' + Date.now())
await new Promise((r) => setTimeout(r, 400))
const doc = w.document
const txt = (el) => el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : ''
const body = doc.querySelector('.paper-sheet')
const walk = (el, depth, label) => {
  const out = []
  for (const c of el.children) {
    const t = c.tagName.toLowerCase()
    if (c.classList.contains('qgroup')) {
      out.push(`  [组] 号=${txt(c.querySelector('.qnr'))} | ${txt(c.querySelector('.qline')).slice(0, 60)}`)
      const caps = [...c.querySelectorAll('.opt-cap')].map(txt)
      const tabs = c.querySelectorAll('table.opt-table')
      out.push(`      选项表 ${tabs.length} 个；cap=${JSON.stringify(caps)}；首表首行=${txt(tabs[0] && tabs[0].querySelector('td'))}`)
      const exps = c.querySelectorAll('.ans')
      out.push(`      解析块 ${exps.length}`)
    } else if (c.classList.contains('bigq')) {
      out.push(`  [大题] ${txt(c.querySelector('.qnum'))} | stem: ${txt(c.querySelector('.stem')).slice(0, 60)}`)
      const subs = c.querySelector('.subs')
      out.push(`      subs 容器 ${subs ? subs.children.length + ' 行' : '无'}：` + (subs ? [...subs.children].map((x, i) => `(${i + 1})「${txt(x).slice(0, 30)}」`).join(' ') : ''))
      out.push(`      图 ${c.querySelectorAll('.figblock svg').length}`)
    } else if (c.classList.contains('sec-title')) out.push(`\n### ${txt(c)}`)
    else if (t === 'div' && c.children.length) out.push(...walk(c, depth + 1, label))
  }
  return out
}
console.log(walk(body, 0, '').join('\n'))
if (w.document.querySelectorAll('.katex-error').length) console.log('!! katex-error ' + w.document.querySelectorAll('.katex-error').length)
