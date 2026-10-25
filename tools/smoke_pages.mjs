#!/usr/bin/env node
/**
 * 无浏览器页面冒烟：jsdom + dist 产物
 *
 * 为什么不用 vite dev / HTTP：本机沙箱拦截了 localhost 网络访问（curl 返回 502），
 * 也拦截了 fs.copyFileSync（npm run sync 报 EPERM）。这里改成纯文件通道：
 *   1) 读 app/dist/index.html，按顺序取出所有 <script src>（数据脚本 + katex）；
 *   2) 在 jsdom 的 window 里 window.eval 它们（数据脚本必须早于 bundle）；
 *   3) 以唯一 query 动态 import dist/assets/app.js（bundle 自带 mount）。
 *
 * 用法：node tools/smoke_pages.mjs
 * 退出码非 0 表示有断言失败。
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL, fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const APP = path.join(ROOT, 'app')
const DIST = path.join(APP, 'dist')
const require = createRequire(path.join(APP, 'package.json'))
const { JSDOM } = require('/home/xiuming/.workbuddy/binaries/node/workspace/node_modules/jsdom')

const ROUTES = [
  ['/', '首页'],
  ['/paper/2023', '试卷页'],
  ['/practice?y=2023', '练习页'],
  ['/exam?y=2023', '考试页'],
  ['/stats', '统计页'],
  ['/figures', '图库页']
]

const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
const scripts = [...html.matchAll(/<script[^>]*src="([^"]+)"[^>]*>\s*<\/script>/g)]
  .map((m) => m[1])
  .filter((s) => !/app\.js$/.test(s))

function localFile(src) {
  if (src.startsWith('/data/')) return path.join(ROOT, src.slice(1))
  if (src.startsWith('/vendor/')) {
    const p1 = path.join(DIST, src.slice(1))
    if (fs.existsSync(p1)) return p1
    return path.join(APP, 'public', src.slice(1))
  }
  return path.join(DIST, src.replace(/^\//, ''))
}

function globalsFor(w) {
  const keys = [
    'window', 'document', 'navigator', 'location', 'history', 'localStorage',
    'sessionStorage', 'Element', 'HTMLElement', 'SVGElement', 'Node', 'Event',
    'MouseEvent', 'KeyboardEvent', 'CustomEvent', 'getComputedStyle',
    'requestAnimationFrame', 'cancelAnimationFrame', 'matchMedia', 'CSS', 'crypto'
  ]
  for (const k of keys) {
    const v = k === 'window' ? w : w[k]
    if (v === undefined) continue
    try {
      globalThis[k] = v
    } catch {
      Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true })
    }
  }
  w.scrollTo = () => {}
  w.Element.prototype.scrollIntoView = () => {}
  w.confirm = () => true
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const report = []
let failed = 0

for (let i = 0; i < ROUTES.length; i++) {
  const [route, label] = ROUTES[i]
  const errs = []
  const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
    url: 'http://127.0.0.1:3000' + route,
    pretendToBeVisual: true,
    runScripts: 'outside-only'
  })
  const w = dom.window
  w.addEventListener('error', (e) => errs.push('window.error: ' + e.message))
  globalsFor(w)

  for (const src of scripts) {
    const f = localFile(src)
    if (!fs.existsSync(f)) {
      errs.push('缺少脚本 ' + src + ' → ' + f)
      continue
    }
    try {
      w.eval(fs.readFileSync(f, 'utf8'))
    } catch (e) {
      errs.push('执行 ' + src + ' 失败: ' + e.message)
    }
  }

  try {
    await import(pathToFileURL(path.join(DIST, 'assets', 'app.js')).href + '?r=' + i)
  } catch (e) {
    errs.push('bundle 加载失败: ' + (e && e.message))
  }
  await sleep(120)

  const doc = w.document
  const app = doc.getElementById('app')
  const vueErrs = w.__vueErrors || []
  const katexErr = doc.querySelectorAll('.katex-error').length
  const katexCnt = doc.querySelectorAll('.katex').length
  const svgCnt = doc.querySelectorAll('svg').length
  const textLen = (app.textContent || '').replace(/\s+/g, '').length

  const stats = { route, label, textLen, katexCnt, katexErr, svgCnt, vueErr: vueErrs.length, errs: errs.length }

  if (!app || textLen < 200) errs.push('页面几乎空白（textLen=' + textLen + '）')
  if (katexErr) errs.push('KaTeX 渲染失败 ' + katexErr + ' 处')
  if (vueErrs.length) errs.push('Vue 错误: ' + vueErrs.slice(0, 2).join(' | '))

  report.push({ ...stats, detail: errs })
  if (errs.length) failed++
  w.close()
}

// ---- 交互 ----
async function openPage(route, tag) {
  const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
    url: 'http://127.0.0.1:3000' + route,
    pretendToBeVisual: true,
    runScripts: 'outside-only'
  })
  const w = dom.window
  globalsFor(w)
  for (const src of scripts) w.eval(fs.readFileSync(localFile(src), 'utf8'))
  await import(pathToFileURL(path.join(DIST, 'assets', 'app.js')).href + '?tag=' + tag)
  await sleep(140)
  return w
}
const click = (w, el) =>
  el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }))
const btnByText = (w, t) =>
  [...w.document.querySelectorAll('button')].find((b) => (b.textContent || '').includes(t))

const inter = []
async function step(name, fn) {
  try {
    await fn()
    inter.push([name, '✓', ''])
  } catch (e) {
    inter.push([name, '✗', e.message])
    failed++
  }
}

await step('首页 → 点导航进 /paper/2023', async () => {
  const w = await openPage('/', 'nav')
  const link = [...w.document.querySelectorAll('a')].find((a) => /\/paper\/2023/.test(a.getAttribute('href') || ''))
  if (!link) throw new Error('首页找不到 /paper/2023 链接')
  click(w, link)
  await sleep(200)
  if (w.location.pathname !== '/paper/2023') throw new Error('pathname=' + w.location.pathname)
  if (!w.document.querySelector('.bigq')) throw new Error('试卷页没有 .bigq 节点')
  w.close()
})

await step('考试页：点「开始考试」进入答题态', async () => {
  const w = await openPage('/exam?y=2023', 'exam')
  const b = btnByText(w, '开始考试')
  if (!b) throw new Error('找不到「开始考试」按钮')
  click(w, b)
  await sleep(240)
  const card = w.document.querySelector('.qcard')
  if (!card) throw new Error('没有渲染题卡 .qcard（可能仍停在设置页）')
  const timer = w.document.querySelector('.timer')
  if (!timer || !/\d+:\d+/.test(timer.textContent || '')) throw new Error('倒计时未启动')
  const sheet = w.document.querySelectorAll('.qnav .progress, .qnav')
  if (!sheet.length) throw new Error('缺少上一题/下一题导航')
  const kx = w.document.querySelectorAll('.katex').length
  if (kx < 3) throw new Error('公式只渲染了 ' + kx + ' 处')
  if ((w.__vueErrors || []).length) throw new Error('Vue 错误: ' + w.__vueErrors[0])
  w.close()
})

await step('练习页：选选项 → 查看解析', async () => {
  const w = await openPage('/practice?y=2023', 'prac')
  const opt = w.document.querySelector('td[data-k]')
  if (!opt) throw new Error('找不到选项单元格 td[data-k]')
  click(w, opt)
  await sleep(120)
  const b = btnByText(w, '查看解析')
  if (!b) throw new Error('找不到「查看解析」按钮')
  click(w, b)
  await sleep(240)
  if (!w.document.querySelector('.ans')) throw new Error('没有渲染解析块 .ans')
  const kx = w.document.querySelectorAll('.katex').length
  if (kx < 3) throw new Error('解析区公式只有 ' + kx + ' 处')
  if ((w.__vueErrors || []).length) throw new Error('Vue 错误: ' + w.__vueErrors[0])
  w.close()
})

const pad = (s, n) => String(s).padEnd(n, ' ')
console.log('\n页面冒烟（jsdom + dist）')
console.log(pad('路由', 18) + pad('文字量', 8) + pad('katex', 7) + pad('svg', 5) + '结论')
for (const r of report) {
  const ok = r.detail.length === 0
  console.log(
    pad(r.route, 18) + pad(r.textLen ?? '-', 8) + pad(r.katexCnt ?? '-', 7) + pad(r.svgCnt ?? '-', 5) + (ok ? '✓' : '✗ ' + r.detail.join('; '))
  )
}
console.log('\n交互：')
for (const [name, ok, msg] of inter) console.log('  ' + ok + ' ' + name + (msg ? ' — ' + msg : ''))
console.log(failed === 0 ? '\n结果: 全部通过' : '\n结果: ' + failed + ' 个页面有问题')
process.exit(failed === 0 ? 0 : 1)
