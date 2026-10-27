#!/usr/bin/env node
/**
 * 无浏览器页面冒烟：jsdom + dist 产物
 *
 * 为什么不用 vite dev / HTTP：本机沙箱拦截了 localhost 网络访问（curl 返回 502），
 * 也拦截了 fs.copyFileSync（npm run sync 报 EPERM）。这里改成纯文件通道：
 *   1) 读 app/dist/index.html，按顺序取出所有 <script src>（数据脚本 + katex）；
 *   2) 在 jsdom 的 window 里 window.eval 它们（数据脚本必须早于 bundle）；
 *   3) 以唯一 query 动态 import dist 里的入口 bundle（从 index.html 解析，bundle 自带 mount）。
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
// jsdom 先按普通依赖找（CI 里 npm i jsdom 即可），找不到再退回本机固定路径（沙箱环境）
function loadJsdom() {
  for (const p of ['jsdom', '/home/xiuming/.workbuddy/binaries/node/workspace/node_modules/jsdom']) {
    try { return require(p) } catch (e) { /* 试下一个 */ }
  }
  console.error('缺少 jsdom：请先 npm i jsdom（或设 JSDOM_PATH 指向安装位置）')
  process.exit(1)
}
const { JSDOM } = loadJsdom()

const ROUTES = [
  ['/', '首页'],
  ['/paper/2021', '试卷页2021'],
  ['/practice?y=2021', '练习页2021'],
  ['/exam?y=2021', '考试页2021'],
  ['/paper/2022', '试卷页2022'],
  ['/practice?y=2022', '练习页2022'],
  ['/exam?y=2022', '考试页2022'],
  ['/paper/2022', '试卷页2022'],
  ['/practice?y=2022', '练习页2022'],
  ['/exam?y=2022', '考试页2022'],
  ['/paper/2023', '试卷页'],
  ['/practice?y=2023', '练习页'],
  ['/exam?y=2023', '考试页'],
  ['/paper/2024', '试卷页2024'],
  ['/practice?y=2024', '练习页2024'],
  ['/exam?y=2024', '考试页2024'],
  ['/paper/2025', '试卷页2025'],
  ['/practice?y=2025', '练习页2025'],
  ['/exam?y=2025', '考试页2025'],
  ['/paper/2026', '试卷页2026'],
  ['/practice?y=2026', '练习页2026'],
  ['/exam?y=2026', '考试页2026'],
  ['/paper/2017', '试卷页2017'],
  ['/practice?y=2017', '练习页2017'],
  ['/exam?y=2017', '考试页2017'],
  ['/paper/2019', '试卷页2019'],
  ['/practice?y=2019', '练习页2019'],
  ['/exam?y=2019', '考试页2019'],
  ['/paper/2018', '试卷页2018'],
  ['/practice?y=2018', '练习页2018'],
  ['/exam?y=2018', '考试页2018'],
  ['/paper/2020', '试卷页2020'],
  ['/practice?y=2020', '练习页2020'],
  ['/exam?y=2020', '考试页2020'],
  ['/paper/2016', '试卷页2016'],
  ['/practice?y=2016', '练习页2016'],
  ['/exam?y=2016', '考试页2016'],
  ['/paper/2015', '试卷页2015'],
  ['/practice?y=2015', '练习页2015'],
  ['/exam?y=2015', '考试页2015'],
  ['/paper/2014', '试卷页2014'],
  ['/practice?y=2014', '练习页2014'],
  ['/exam?y=2014', '考试页2014'],
  ['/paper/2013', '试卷页2013'],
  ['/practice?y=2013', '练习页2013'],
  ['/exam?y=2013', '考试页2013'],
  ['/stats', '统计页'],
  ['/figures', '图库页'],
  ['/review', '复习页'],
  ['/editor', '录入编辑器']
]

const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
// 只 eval 经典脚本（数据 + katex）。Vite 的入口是 type="module"，后面的动态 import 会执行它；
// 若这里再 eval 一次，模块代码会在非模块作用域里跑第二遍，直接报错。
const scripts = [...html.matchAll(/<script([^>]*)\ssrc="([^"]+)"([^>]*)>\s*<\/script>/g)]
  .filter((m) => !/type="module"/.test(m[1] + m[3]))
  .map((m) => m[2])
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
    'requestAnimationFrame', 'cancelAnimationFrame', 'matchMedia', 'CSS', 'crypto',
    // Vue 的 vModelText.beforeUpdate 里有 `getRootNode() instanceof Document || instanceof ShadowRoot`，
    // 这两个构造器在 jsdom 的 window 上存在但默认不会挂到 globalThis，缺了会让所有 v-model 更新抛 ReferenceError。
    'Document', 'ShadowRoot', 'HTMLInputElement', 'HTMLTextAreaElement', 'HTMLAnchorElement',
    'Blob', 'FileReader', 'File', 'FormData',
    // URL 必须用 jsdom 的那一份：Node 内置 URL.createObjectURL 只认 Node 的 Blob，
    // 传入 jsdom 的 Blob 会抛错，导致下载路径被误判成「环境不支持」。
    'URL'
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
  // fetch：jsdom 不提供，缺了会解析到 Node 全局 fetch（undici），
  // 在受限沙箱里初始化 Wasm 会直接 OOM 崩进程。试卷页用 fetch 探测排版服务可用性，
  // 这里统一拒绝，等价于「静态托管、无后端」的真实场景。
  const noFetch = async () => { throw new Error('fetch disabled in smoke') }
  w.fetch = noFetch
  // bundle 跑在 Node 的 ESM 作用域里，裸 fetch 解析到 globalThis，不是 jsdom 的 window
  globalThis.fetch = noFetch
  // 浏览器独有的 Observer：jsdom 有 MutationObserver 但不在 globalThis 上，
  // Intersection/Resize 干脆没有。依赖库（Vue / KaTeX）里任一分支碰到就整页 ReferenceError，
  // 所以统一补上——有就用 jsdom 的，没有给个空实现。
  for (const k of ['MutationObserver', 'IntersectionObserver', 'ResizeObserver']) {
    const v = w[k] || class { observe() {} unobserve() {} disconnect() {} takeRecords() { return [] } }
    w[k] = v
    globalThis[k] = v
  }
  // jsdom 没有这两个 API，导出/下载功能会用到；补桩让流程能走通
  if (!w.URL.createObjectURL) w.URL.createObjectURL = () => 'blob:mock'
  if (!w.URL.revokeObjectURL) w.URL.revokeObjectURL = () => {}
  w.__downloads = []
  if (!w.__downloadHook) {
    w.__downloadHook = 1
    const origClick = w.HTMLAnchorElement.prototype.click
    w.HTMLAnchorElement.prototype.click = function () {
      if (this.getAttribute('download')) {
        w.__downloads.push(this.getAttribute('download'))
        return // 真浏览器里会弹下载框，jsdom 里没必要走下去
      }
      return origClick.call(this)
    }
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// 入口文件名随构建器而变：vite 产出 assets/index-<hash>.js，esbuild 回退构建产出 assets/app.js。
// 从 dist/index.html 解析真实路径，不要硬编码 —— 否则换个构建器 CI 就整片红。
function bundleEntry() {
  const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
  const m = html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/)
  if (!m) throw new Error('dist/index.html 里找不到 type="module" 入口脚本')
  const url = m[1]
  const i = url.indexOf('assets/')
  return path.join(DIST, i >= 0 ? url.slice(i) : url.replace(/^\/+/, ''))
}

const report = []
let failed = 0

// 页面「图有没有画出来」不能只看 data/ 里图库注册是否齐全：
// 图库 JS 若在浏览器侧没加载成功（快照漏文件 / 路径 404），FigBlock 的 v-if="svg"
// 为假，整块 figure 直接不渲染，页面其它部分照旧 —— 只数 .katex 是抓不到的。
// 这里按 paper.js 里实际引用的 fig key 算出该年应有几张题图，再和 DOM 里的
// figure.figblock 数量对账。注：本脚本的 /data/ 映射到项目 data/（不走快照），
// 快照（app/public、app/dist）一致性由 tools/check_assets.mjs 单独负责。
function paperFigKeys(w, year) {
  const p = (w.BUPT801 && w.BUPT801.papers && w.BUPT801.papers[year]) || null
  if (!p) return null
  const acc = new Set()
  const walk = (o) => {
    if (!o || typeof o !== 'object') return
    if (Array.isArray(o)) return o.forEach(walk)
    for (const [k, v] of Object.entries(o)) {
      if ((k === 'fig' || k === 'figKey') && typeof v === 'string' && v) acc.add(v)
      else walk(v)
    }
  }
  walk(p)
  return acc
}

// 解析正文里有没有 Markdown 表格（`| a | b |` + `|---|`）。
// 有的话页面上必须出现 table.md-table —— 表格行被拆进不同 <div> 时只会渲染成一列
// 竖线，肉眼是「表格没渲染」，脚本只数 .katex 是看不出来的。
//
// 注意两处竞态（都吃过亏）：
//   ① 数据侧 —— 解析原文在 answers[年] 里，要等 hydration 把它并回 papers[年] 才看得见；
//      只看 papers[年] 时，hydration 慢一拍就「没找到表格」，判定被静默跳过（假绿）。
//      故两处都扫。
//   ② 渲染侧 —— 页面是 v-html 注入 + KaTeX 后处理，注入完成时刻不固定；查太早会假红。
//      故给最多 1s 轮询。
function paperHasMdTable(w, year) {
  const B = w.BUPT801 || {}
  const srcs = [B.papers && B.papers[year], B.answers && B.answers[year]].filter(Boolean)
  if (!srcs.length) return false
  let hit = false
  const walk = (o) => {
    if (hit || !o || typeof o !== 'object') return
    if (Array.isArray(o)) {
      for (let i = 0; i + 1 < o.length; i++) {
        if (typeof o[i] === 'string' && /^\s*\|.*\|\s*$/.test(o[i]) && /^\s*\|[\s:|-]+\|\s*$/.test(o[i + 1])) {
          hit = true
          return
        }
      }
      return o.forEach(walk)
    }
    for (const v of Object.values(o)) walk(v)
  }
  srcs.forEach(walk)
  return hit
}

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
    await import(pathToFileURL(bundleEntry()).href + '?r=' + i)
  } catch (e) {
    // 首个路由带堆栈，其余只带消息：CI 上产物与本地不同（vite vs esbuild），
    // 没堆栈根本不知道是哪个依赖炸的
    const stack = i === 0 ? '\n' + String((e && e.stack) || '').split('\n').slice(0, 8).join('\n') : ''
    errs.push('bundle 加载失败: ' + (e && e.message) + stack)
  }
  await sleep(120)

  const doc = w.document
  const app = doc.getElementById('app')
  const vueErrs = w.__vueErrors || []
  const katexErr = doc.querySelectorAll('.katex-error').length
  const katexCnt = doc.querySelectorAll('.katex').length
  const svgCnt = doc.querySelectorAll('svg').length
  const figCnt = doc.querySelectorAll('figure.figblock').length
  const textLen = (app.textContent || '').replace(/\s+/g, '').length

  const stats = { route, label, textLen, katexCnt, katexErr, svgCnt, figCnt, vueErr: vueErrs.length, errs: errs.length }

  if (!app || textLen < 200) errs.push('页面几乎空白（textLen=' + textLen + '）')
  if (katexErr) errs.push('KaTeX 渲染失败 ' + katexErr + ' 处')
  if (vueErrs.length) errs.push('Vue 错误: ' + vueErrs.slice(0, 2).join(' | '))

  // 试卷页：题干引用的题图必须逐张渲染成 figure.figblock
  const pm = route.match(/^\/paper\/(\d{4})$/)
  if (pm) {
    const need = paperFigKeys(w, pm[1])
    if (need && need.size && figCnt < need.size) {
      errs.push(`图件未渲染：题干引用 ${need.size} 张，页面上只有 ${figCnt} 个图块`)
    }
    stats.figNeed = need ? need.size : 0
    if (paperHasMdTable(w, pm[1])) {
      let tbl = 0
      for (let t = 0; t < 20 && !tbl; t++) {
        tbl = doc.querySelectorAll('table.md-table').length
        if (!tbl) await sleep(50)
      }
      if (!tbl) errs.push('解析表格未渲染（表格行被拆成多个 <div>，页面上只剩竖线）')
      stats.mdTable = tbl
    }
  }

  report.push({ ...stats, detail: errs })
  if (errs.length) failed++
  w.close()
}

// ---- 交互 ----
let pageSeq = 0
async function openPage(route, tag) {
  const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
    url: 'http://127.0.0.1:3000' + route,
    pretendToBeVisual: true,
    runScripts: 'outside-only'
  })
  const w = dom.window
  globalsFor(w)
  for (const src of scripts) w.eval(fs.readFileSync(localFile(src), 'utf8'))
  // 缓存参数必须每次唯一：ESM 模块只执行一次，tag 重复会让 app 不重新 mount（页面空白）
  await import(pathToFileURL(bundleEntry()).href + '?tag=' + tag + '-' + (++pageSeq))
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

await step('练习页2021：选选项 → 查看解析', async () => {
  const w = await openPage('/practice?y=2021', 'prac21')
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

await step('练习页2024：选选项 → 查看解析', async () => {
  const w = await openPage('/practice?y=2024', 'prac')
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

await step('练习页2017：选选项 → 查看解析', async () => {
  const w = await openPage('/practice?y=2017', 'prac17')
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

await step('练习页2017：综合题解析里的 Markdown 表格', async () => {
  // 2017 四(2) 量化电平表、六(3) 状态转移表都是纯文本表格，必须渲染成 <table>
  const w = await openPage('/practice?y=2017&type=big&id=2017-六', 'prac17big')
  const b = btnByText(w, '查看解析')
  if (!b) throw new Error('找不到「查看解析」按钮')
  click(w, b)
  await sleep(260)
  if (!w.document.querySelector('.ans')) throw new Error('没有渲染解析块 .ans')
  const tb = w.document.querySelectorAll('.ans table.md-table').length
  if (!tb) throw new Error('综合题解析里的表格没渲染成 table.md-table（仍是竖线文本）')
  const rows = w.document.querySelectorAll('.ans table.md-table tbody tr').length
  if (rows < 8) throw new Error('状态表只有 ' + rows + ' 行，应为 8 行')
  const cellKx = w.document.querySelectorAll('.ans table.md-table .katex').length
  if (cellKx < 2) throw new Error('表头/单元格里的公式没被 KaTeX 渲染（katex=' + cellKx + '）')
  if ((w.__vueErrors || []).length) throw new Error('Vue 错误: ' + w.__vueErrors[0])
  w.close()
})

await step('练习页2026：选选项 → 查看解析', async () => {
  const w = await openPage('/practice?y=2026', 'prac26')
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

await step('练习页2019：选选项 → 查看解析', async () => {
  const w = await openPage('/practice?y=2019', 'prac19')
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

await step('练习页2018：选选项 → 查看解析', async () => {
  const w = await openPage('/practice?y=2018', 'prac18')
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
  if (w.document.querySelectorAll('.katex-error').length) throw new Error('有 KaTeX 渲染错误')
  if ((w.__vueErrors || []).length) throw new Error('Vue 错误: ' + w.__vueErrors[0])
  w.close()
})

await step('试卷页2018：题图与解析图全部渲染（17 张 SVG）', async () => {
  const w = await openPage('/paper/2018', 'paper18fig')
  const n = w.document.querySelectorAll('.figblock svg').length
  if (n !== 17) throw new Error('.figblock svg ' + n + ' 张（应 17）')
  const empty = w.document.querySelectorAll('.figblock').length - n
  if (empty) throw new Error(empty + ' 个图块没解析出 SVG（fig key 悬空）')
  const bigs = [...w.document.querySelectorAll('.bigq > .subs')]
  if (bigs.length !== 7) throw new Error('.subs 容器 ' + bigs.length + ' 个（应 7）')
  if (w.document.querySelectorAll('.katex-error').length) throw new Error('有 KaTeX 渲染错误')
  if ((w.__vueErrors || []).length) throw new Error('Vue 错误: ' + w.__vueErrors[0])
  w.close()
})

await step('练习页2020：选选项 → 查看解析', async () => {
  const w = await openPage('/practice?y=2020', 'prac20')
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

await step('练习页2016：选选项 → 查看解析', async () => {
  const w = await openPage('/practice?y=2016', 'prac16')
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

await step('练习页2015：选选项 → 查看解析', async () => {
  const w = await openPage('/practice?y=2015', 'prac15')
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

await step('练习页2013：选选项 → 查看解析', async () => {
  const w = await openPage('/practice?y=2013', 'prac13')
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

await step('练习页2014：选选项 → 查看解析', async () => {
  const w = await openPage('/practice?y=2014', 'prac14')
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

await step('试卷页2016：大题小问逐行渲染（subs 与题干分离）', async () => {
  const w = await openPage('/paper/2016', 'paper16')
  const data = (w.BUPT801 && w.BUPT801.papers && w.BUPT801.papers['2016'].questions) || []
  const bigs = data.filter((q) => q.type === 'big')
  if (bigs.length !== 11) throw new Error('数据里大题数 ' + bigs.length + '（应 11）')
  const noSubs = bigs.filter((q) => !q.subs || !q.subs.length)
  if (noSubs.length) throw new Error('缺 subs：' + noSubs.map((q) => q.num).join('、'))
  // 题干里不该再残留「(1)」这类编号小问（历史 bug：小问全挤进 stem 排成一段）
  const dirty = bigs.filter((q) => /[(（]\s*1\s*[)）]/.test(q.stem))
  if (dirty.length) throw new Error('stem 里仍有编号小问：' + dirty.map((q) => q.num).join('、'))
  const boxes = [...w.document.querySelectorAll('.bigq > .subs')]
  if (boxes.length !== 11) throw new Error('.subs 容器 ' + boxes.length + ' 个（应 11）')
  const want = bigs.map((q) => q.subs.length)
  const got = boxes.map((el) => el.children.length)
  if (got.join(',') !== want.join(',')) throw new Error('小问行数不符：DOM ' + got.join(',') + ' vs 数据 ' + want.join(','))
  if ((w.__vueErrors || []).length) throw new Error('Vue 错误: ' + w.__vueErrors[0])
  w.close()
})

// 选择题节标题的「每空 X 分」必须读 sections[0].perBlank，不能写死 1 分。
// 2017 是 36 空 × 1.5 分 = 54 分，写死会显示成「每题1分，共54分」，自相矛盾。
await step('试卷页2017：选择题节标题按 perBlank 报分值', async () => {
  const w = await openPage('/paper/2017', 'paper17')
  const c0 = w.BUPT801.papers['2017'].sections[0]
  const per = c0.perBlank || 1
  if (per !== 1.5) throw new Error('2017 的 perBlank 应为 1.5，实际 ' + per)
  const el = w.document.querySelector('.sec-title#sec-choice')
  if (!el) throw new Error('没渲染出 .sec-title#sec-choice')
  const title = (el.textContent || '').replace(/\s+/g, '')
  if (!title.includes('每空' + per + '分')) throw new Error('节标题「' + title + '」没按「每空' + per + '分」报')
  if (title.includes('每题')) throw new Error('节标题仍以「题」为单位（2019/2021/2022/2024 存在题≠空）：' + title)
  if (!title.includes('共' + c0.score + '分')) throw new Error('节标题总分与 sections[0].score 不符：' + title)
  if ((w.__vueErrors || []).length) throw new Error('Vue 错误: ' + w.__vueErrors[0])
  w.close()
})

const setInput = (w, el, v) => {
  el.value = v
  el.dispatchEvent(new w.Event('input', { bubbles: true }))
}


// 键盘事件必须发到真正监听它的对象上：
//   ⌘K / Ctrl+K  → App 绑在 window 上
//   Enter/↑↓     → 面板输入框上的 @keydown
//   Esc          → 面板打开时临时绑在 document 上
const keyOn = (target, w, k, opts = {}) =>
  target.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...opts }))

await step('全站搜索：Ctrl+K 打开 → 输入关键词 → 回车跳转', async () => {
  const w = await openPage('/', 'cmdk')
  keyOn(w, w, 'k', { ctrlKey: true })
  await sleep(180)
  const box = w.document.querySelector('.cmdk input')
  if (!box) throw new Error('Ctrl+K 未打开搜索面板')
  setInput(w, box, 'HDB3')
  await sleep(240)
  const rows = w.document.querySelectorAll('.cmdk-row')
  if (!rows.length) throw new Error('搜「HDB3」零结果')
  if (!w.document.querySelector('.cmdk-title mark, .cmdk-snip mark')) throw new Error('命中关键词没有高亮')
  keyOn(box, w, 'Enter')
  await sleep(300)
  if (!/\/(paper|practice|figures)/.test(w.location.pathname)) {
    throw new Error('回车后未跳转到题目页，pathname=' + w.location.pathname)
  }
  if (!w.location.search) throw new Error('跳转没有带上题目定位参数：' + w.location.href)
  if (w.document.querySelector('.cmdk-mask')) throw new Error('跳转后面板未关闭')
  if (!w.document.querySelector('.qcard, .bigq')) {
    throw new Error('跳过去了但没渲染出题目卡片，pathname=' + w.location.pathname)
  }
  if ((w.__vueErrors || []).length) throw new Error('Vue 错误: ' + w.__vueErrors[0])
  w.close()
})

await step('全站搜索：↑↓ 移动选中项 + Esc 关闭', async () => {
  const w = await openPage('/', 'cmdk2')
  keyOn(w, w, 'k', { metaKey: true })
  await sleep(180)
  const box = w.document.querySelector('.cmdk input')
  if (!box) throw new Error('⌘K 未打开面板')
  if (!w.document.querySelectorAll('.cmdk-row').length) throw new Error('空态没有快捷入口')
  setInput(w, box, '卷积码')
  await sleep(240)
  const rows = [...w.document.querySelectorAll('.cmdk-row')]
  if (rows.length < 2) throw new Error('搜「卷积码」结果不足 2 条，无法测方向键')
  if (!rows[0].classList.contains('on')) throw new Error('默认未选中第 1 条')
  keyOn(box, w, 'ArrowDown')
  await sleep(120)
  if (!rows[1].classList.contains('on')) throw new Error('ArrowDown 未把选中项下移')
  keyOn(box, w, 'ArrowUp')
  await sleep(120)
  if (!rows[0].classList.contains('on')) throw new Error('ArrowUp 未把选中项上移')
  keyOn(w.document, w, 'Escape')
  await sleep(180)
  if (w.document.querySelector('.cmdk')) throw new Error('Esc 未关闭面板')
  w.close()
})

await step('复习页：重排今日队列 → 出现题卡 → 评分推进', async () => {
  const w = await openPage('/review?seed=1', 'review')
  const d = w.document
  const btn = [...d.querySelectorAll('button')].find((b) => (b.textContent || '').includes('重排今日队列'))
  if (!btn) throw new Error('找不到「重排今日队列」按钮')
  click(w, btn)
  await sleep(260)
  const card = d.querySelector('.qcard')
  if (!card) throw new Error('重排后仍未出现题卡 .qcard')
  const grades = [...d.querySelectorAll('.grade-btn, .grade button, .rv-grade button')]
  if (grades.length) {
    click(w, grades[grades.length - 1])
    await sleep(200)
  }
  if ((w.__vueErrors || []).length) throw new Error('Vue 错误: ' + w.__vueErrors[0])
  w.close()
})

await step('编辑器：填入示例 → 预览出公式 → 复制 paper 片段', async () => {
  const w = await openPage('/editor', 'editor')
  const d = w.document
  const btn = [...d.querySelectorAll('button')].find((b) => (b.textContent || '').includes('填入示例'))
  if (!btn) throw new Error('找不到「填入示例」按钮')
  click(w, btn)
  await sleep(300)
  if (!d.querySelectorAll('.katex').length) throw new Error('预览区没有渲染公式')
  const cp = [...d.querySelectorAll('button')].find((b) => (b.textContent || '').includes('复制'))
  if (!cp) throw new Error('找不到「复制」按钮')
  click(w, cp)
  await sleep(180)
  if ((w.__vueErrors || []).length) throw new Error('Vue 错误: ' + w.__vueErrors[0])
  w.close()
})

await step('编辑器：切到综合题 → 切回 → 预览仍可用', async () => {
  const w = await openPage('/editor', 'editor2')
  const d = w.document
  const seg = [...d.querySelectorAll('.seg span')].find((s) => (s.textContent || '').includes('综合题'))
  if (!seg) throw new Error('找不到题型切换')
  click(w, seg)
  await sleep(220)
  if (!d.querySelector('.ed-blank')) throw new Error('切到综合题后没有出现分步表单')
  if (![...d.querySelectorAll('button')].some((b) => (b.textContent || '').includes('再加一步'))) {
    throw new Error('综合题模式没有「再加一步」按钮')
  }
  if (!d.querySelector('.ed-preview')) throw new Error('综合题模式没有预览区')
  const back = [...d.querySelectorAll('.seg span')].find((s) => (s.textContent || '').includes('选择题'))
  click(w, back)
  await sleep(220)
  if (!d.querySelector('.ed-opt')) throw new Error('切回选择题后没出现选项编辑区')
  if ((w.__vueErrors || []).length) throw new Error('Vue 错误: ' + w.__vueErrors[0])
  w.close()
})

await step('统计页：导出备份 → 触发 JSON 下载', async () => {
  const w = await openPage('/stats', 'bak')
  const btn = [...w.document.querySelectorAll('button')].find(
    (b) => (b.textContent || '').includes('导出 JSON 文件')
  )
  if (!btn) throw new Error('统计页找不到「导出 JSON 文件」按钮')
  click(w, btn)
  await sleep(220)
  if (!w.__downloads.length) throw new Error('点击导出没有触发下载（downloads=0）')
  if (!/\.json$/.test(w.__downloads[0])) throw new Error('备份文件名不像 JSON：' + w.__downloads[0])
  w.close()
})

await step('统计页：粘贴备份文本 → 导入 → 记录数回来', async () => {
  const w = await openPage('/practice?y=2024', 'imp')
  // 先做两道题，让备份里有东西
  const opts = [...w.document.querySelectorAll('td[data-k]')]
  if (opts.length < 2) throw new Error('练习页选项不足')
  click(w, opts[0])
  await sleep(140)
  const raw = w.localStorage.getItem('bupt801-records-v1') || ''
  w.close()

  const w2 = await openPage('/stats', 'imp2')
  const ta = w2.document.querySelector('textarea[aria-label="备份 JSON 内容"]')
  if (!ta) throw new Error('统计页找不到备份文本框')
  const bak = JSON.stringify({
    v: 1,
    exportedAt: new Date().toISOString(),
    records: JSON.parse(raw || '{}'),
    notes: {},
    exams: [],
    plan: null
  })
  setInput(w2, ta, bak)
  await sleep(200)
  const imp = [...w2.document.querySelectorAll('button')].find(
    (b) => (b.textContent || '').trim() === '导入'
  )
  if (!imp) throw new Error('找不到「导入」按钮')
  if (imp.disabled) throw new Error('填入文本后「导入」按钮仍是禁用态')
  click(w2, imp)
  await sleep(300)
  const msg = (w2.document.body.textContent || '').replace(/\s+/g, ' ')
  if (/导入失败/.test(msg)) throw new Error('导入失败：' + msg.slice(0, 200))
  if (!/导入完成/.test(msg)) throw new Error('没有看到导入成功提示')
  if (!/记录 [1-9]/.test(msg)) throw new Error('导入的记录数是 0，备份数据没进去')
  if ((w2.__vueErrors || []).length) throw new Error('Vue 错误: ' + w2.__vueErrors[0])
  w2.close()
})

const pad = (s, n) => String(s).padEnd(n, ' ')
console.log('\n页面冒烟（jsdom + dist）')
console.log(pad('路由', 18) + pad('文字量', 8) + pad('katex', 7) + pad('svg', 5) + pad('图块', 6) + '结论')
for (const r of report) {
  const ok = r.detail.length === 0
  const figCell = r.figNeed ? `${r.figCnt}/${r.figNeed}` : String(r.figCnt ?? '-')
  console.log(
    pad(r.route, 18) + pad(r.textLen ?? '-', 8) + pad(r.katexCnt ?? '-', 7) + pad(r.svgCnt ?? '-', 5) + pad(figCell, 6) + (ok ? '✓' : '✗ ' + r.detail.join('; '))
  )
}
console.log('\n交互：')
for (const [name, ok, msg] of inter) console.log('  ' + ok + ' ' + name + (msg ? ' — ' + msg : ''))
console.log(failed === 0 ? '\n结果: 全部通过' : '\n结果: ' + failed + ' 个页面有问题')
process.exit(failed === 0 ? 0 : 1)
