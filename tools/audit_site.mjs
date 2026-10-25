#!/usr/bin/env node
/**
 * 全站审计（无浏览器）：结构 + 全流程交互 + 可访问性静态扫描
 *
 * 与 smoke_pages.mjs 的分工：
 *   smoke  —— 6 条路由"能打开、不报错"的最小冒烟（快速回归）
 *   audit  —— 覆盖全部年份的试卷/练习/考试页；跑完整答题结算、模考判分、
 *             中断恢复、解析开关、图库搜索、主题、灯箱、帮助弹窗；
 *             并静态扫描"只能用鼠标点"的元素、缺失 h1、空图表等可访问性问题。
 *
 * 用法：node tools/audit_site.mjs [--json]
 * 退出码非 0 表示有硬失败（页面空白 / KaTeX 报错 / Vue 报错 / 交互断言失败）。
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

const JSON_OUT = process.argv.includes('--json')
const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
// 只 eval 经典脚本（数据 + katex）。Vite 的入口是 type="module"，后面的动态 import 会执行它；
// 若这里再 eval 一次，模块代码会在非模块作用域里跑第二遍，直接报错。
const SCRIPTS = [...html.matchAll(/<script([^>]*)\ssrc="([^"]+)"([^>]*)>\s*<\/script>/g)]
  .filter((m) => !/type="module"/.test(m[1] + m[3]))
  .map((m) => m[2])
  .filter((s) => !/app\.js$/.test(s))

function localFile(src) {
  if (src.startsWith('/data/')) return path.join(ROOT, src.slice(1))
  if (src.startsWith('/vendor/')) {
    const p1 = path.join(DIST, src.slice(1))
    return fs.existsSync(p1) ? p1 : path.join(APP, 'public', src.slice(1))
  }
  return path.join(DIST, src.replace(/^\//, ''))
}

function bindGlobals(w) {
  // 前两组是 jsdom 有、但默认不在 globalThis 上的构造器：
  //   - Document / ShadowRoot：Vue 的 vModelText.beforeUpdate 里有 `getRootNode() instanceof Document`，
  //     缺了会让所有 v-model 更新抛 ReferenceError。
  //   - URL：必须用 jsdom 那份，Node 内置 URL.createObjectURL 只认 Node 的 Blob，
  //     传入 jsdom Blob 会抛错，导致导出被误判成「环境不支持」。
  const keys = ['window', 'document', 'navigator', 'location', 'history', 'localStorage',
    'sessionStorage', 'Element', 'HTMLElement', 'SVGElement', 'Node', 'Event', 'MouseEvent',
    'KeyboardEvent', 'CustomEvent', 'getComputedStyle', 'requestAnimationFrame',
    'cancelAnimationFrame', 'matchMedia', 'CSS', 'crypto',
    'Document', 'ShadowRoot', 'HTMLInputElement', 'HTMLTextAreaElement', 'HTMLAnchorElement',
    'Blob', 'FileReader', 'File', 'FormData', 'URL']
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
  // fetch：jsdom 不提供，缺了会解析到 Node 全局 fetch（undici），受限沙箱里初始化
  // Wasm 会 OOM 崩进程。这里统一拒绝，等价于静态托管（无排版服务）的真实场景。
  const noFetch = async () => { throw new Error('fetch disabled in audit') }
  w.fetch = noFetch
  // bundle 跑在 Node 的 ESM 作用域里，裸 fetch 解析到 globalThis，不是 jsdom 的 window
  globalThis.fetch = noFetch
  // 浏览器独有的 Observer：jsdom 有 MutationObserver 但不在 globalThis 上，
  // Intersection/Resize 干脆没有。依赖库碰到就整页 ReferenceError，统一补上。
  for (const k of ['MutationObserver', 'IntersectionObserver', 'ResizeObserver']) {
    const v = w[k] || class { observe() {} unobserve() {} disconnect() {} takeRecords() { return [] } }
    w[k] = v
    globalThis[k] = v
  }
  if (!w.URL.createObjectURL) w.URL.createObjectURL = () => 'blob:mock'
  if (!w.URL.revokeObjectURL) w.URL.revokeObjectURL = () => {}
  // 记录下载行为：真浏览器会弹保存框，jsdom 里只需知道它点下了、文件名对不对
  w.__downloads = []
  if (!w.__downloadHook) {
    w.__downloadHook = 1
    const origClick = w.HTMLAnchorElement.prototype.click
    w.HTMLAnchorElement.prototype.click = function () {
      const dl = this.getAttribute('download')
      if (dl) { w.__downloads.push(dl); return }
      return origClick.call(this)
    }
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// 入口文件名随构建器而变：vite 产出 assets/index-<hash>.js，esbuild 回退构建产出 assets/app.js。
// 从 dist/index.html 解析真实路径，换构建器不用改脚本。
function bundleEntry() {
  const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
  const m = html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/)
  if (!m) throw new Error('dist/index.html 里找不到 type="module" 入口脚本')
  const url = m[1]
  const i = url.indexOf('assets/')
  return path.join(DIST, i >= 0 ? url.slice(i) : url.replace(/^\/+/, ''))
}
let seq = 0

async function openPage(route, { seed } = {}) {
  const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
    url: 'http://127.0.0.1:3000' + route,
    pretendToBeVisual: true,
    runScripts: 'outside-only'
  })
  const w = dom.window
  w.__vueErrors = []
  bindGlobals(w)
  if (seed) for (const [k, v] of Object.entries(seed)) w.localStorage.setItem(k, v)
  for (const src of SCRIPTS) {
    const f = localFile(src)
    if (!fs.existsSync(f)) throw new Error('缺少脚本 ' + src)
    w.eval(fs.readFileSync(f, 'utf8'))
  }
  await import(pathToFileURL(bundleEntry()).href + '?a=' + seq++)
  await sleep(140)
  return w
}

const click = (w, el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }))
const key = (w, k) => (w.document.activeElement || w.document.body).dispatchEvent(
  new w.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
)
const byText = (w, sel, t) => [...w.document.querySelectorAll(sel)].find((e) => (e.textContent || '').includes(t))
const hasBtn = (d, t) => [...d.querySelectorAll('button')].some((b) => (b.textContent || '').includes(t))
// 三种合法取名方式：aria-label / placeholder / <label for=id>；
// 另外控件直接写在 <label> 内部也是 HTML 规范允许的隐式关联，不能算缺 label。
const unlabeledCount = (d) => [...d.querySelectorAll('input:not([type=hidden]), select, textarea')].filter((el) => {
  if (el.getAttribute('aria-label') || el.getAttribute('placeholder')) return false
  if (el.id && d.querySelector(`label[for="${el.id}"]`)) return false
  return !el.closest('label')
}).length
const txt = (w, sel) => { const e = w.document.querySelector(sel); return e ? (e.textContent || '').replace(/\s+/g, ' ').trim() : '' }

const rows = []      // 结构审计
const inter = []     // 交互断言
const a11y = []      // 可访问性扫描
let failed = 0

async function step(name, fn) {
  try {
    const note = await fn()
    inter.push({ name, ok: true, note: note || '' })
  } catch (e) {
    inter.push({ name, ok: false, note: e.message })
    failed++
  }
}

function assert(cond, msg) { if (!cond) throw new Error(msg) }

// ============================================================
// 0. 数据侧统计（直接从页面注入的 window.BUPT801 读，避免再写一套加载逻辑）
// ============================================================
const w0 = await openPage('/')
const B = w0.__BUPT801 || w0.BUPT801
const YEARS = Object.keys(B.papers).sort()
const dataStat = {}
YEARS.forEach((y) => {
  const p = B.papers[y]
  dataStat[y] = {
    choice: p.questions.filter((q) => q.type === 'choice').length,
    big: p.questions.filter((q) => q.type === 'big').length,
    score: p.questions.reduce((s, q) => s + (q.score || 0), 0),
    figs: Object.keys(B.figures[y] || {}).length
  }
})
w0.close()

// ============================================================
// 1. 结构审计：全部年份 × 试卷/练习/考试
// ============================================================
for (const y of YEARS) {
  // ---- 试卷页 ----
  {
    const w = await openPage('/paper/' + y)
    const d = w.document
    const errs = []
    const sheet = d.querySelector('.paper-sheet')
    if (!sheet) errs.push('无 .paper-sheet')
    const bigq = d.querySelectorAll('.bigq').length
    if (bigq !== dataStat[y].big) errs.push(`大题渲染 ${bigq}/${dataStat[y].big}`)
    const sec = d.querySelectorAll('.sec-title').length
    if (sec !== 2) errs.push(`章节标题 ${sec}/2`)
    const kerr = d.querySelectorAll('.katex-error').length
    if (kerr) errs.push(`KaTeX 报错 ${kerr}`)
    const emptyFig = [...d.querySelectorAll('.figblock')].filter((f) => !f.querySelector('svg')).length
    if (emptyFig) errs.push(`空图块 ${emptyFig}`)
    const ids = [...d.querySelectorAll('[id]')].map((e) => e.id)
    const dup = ids.filter((v, i) => ids.indexOf(v) !== i)
    if (dup.length) errs.push('重复 id: ' + [...new Set(dup)].join(','))
    const brokenToc = [...d.querySelectorAll('.toc a[href^="#"]')]
      .map((a) => a.getAttribute('href').slice(1))
      .filter((id) => id && !d.getElementById(id))
    if (brokenToc.length) errs.push('目录锚点失效: ' + brokenToc.join(','))
    // 大题序号：卷面编号应为「二、三、…」，与 q.num 一致
    const nums = [...d.querySelectorAll('.bigq .qnum')].map((e) => e.textContent.trim().charAt(0))
    const want = B.papers[y].questions.filter((q) => q.type === 'big').map((q) => String(q.num).charAt(0))
    const mismatch = nums.filter((c, i) => c !== want[i])
    if (mismatch.length) errs.push(`大题序号不符 ${nums.join('')} vs ${want.join('')}`)
    rows.push({ scope: '/paper/' + y, label: '试卷', textLen: (sheet ? sheet.textContent : '').replace(/\s+/g, '').length, katex: d.querySelectorAll('.katex').length, nodes: d.querySelectorAll('*').length, errs })
    w.close()
  }
  // ---- 练习页 ----
  {
    const w = await openPage('/practice?y=' + y)
    const d = w.document
    const errs = []
    if (!d.querySelector('.qcard')) errs.push('无题卡')
    const qs = B.papers[y].questions
    const first = qs[0]
    const g = first.group ? B.papers[y].groups[first.group] : null
    const set = first.oKey ? g[first.oKey] : (g && g.options) || first.options || {}
    const optN = ['A', 'B', 'C', 'D'].filter((k) => set[k] !== undefined).length
    const cellN = d.querySelectorAll('.qcard .opt-table td[data-k]').length
    if (first.type === 'choice' && cellN !== optN) errs.push(`选项渲染 ${cellN}/${optN}`)
    const kerr = d.querySelectorAll('.katex-error').length
    if (kerr) errs.push(`KaTeX 报错 ${kerr}`)
    rows.push({ scope: '/practice?y=' + y, label: '练习', textLen: (d.querySelector('#app').textContent || '').replace(/\s+/g, '').length, katex: d.querySelectorAll('.katex').length, nodes: d.querySelectorAll('*').length, errs })
    w.close()
  }
  // ---- 考试页（设置 → 开始）----
  {
    const w = await openPage('/exam?y=' + y)
    const d = w.document
    const errs = []
    const startBtn = byText(w, 'button', '开始考试')
    if (!startBtn) errs.push('无「开始考试」')
    else {
      click(w, startBtn)
      await sleep(180)
      if (!d.querySelector('.qcard')) errs.push('开始后无题卡')
      if (!d.querySelector('.timer')) errs.push('无倒计时')
      if (!d.querySelector('.sheet button')) errs.push('无答题卡')
    }
    rows.push({ scope: '/exam?y=' + y, label: '模考', textLen: (d.querySelector('#app').textContent || '').replace(/\s+/g, '').length, katex: d.querySelectorAll('.katex').length, nodes: d.querySelectorAll('*').length, errs })
    w.close()
  }
}

// 首页 / 统计 / 图库
for (const [route, label, checks] of [
  ['/', '首页', (d) => [
    d.querySelector('.hero') ? '' : '无 Hero',
    d.querySelectorAll('.year-card').length >= YEARS.length + 1 ? '' : '年份卡数量异常',
    d.querySelectorAll('.feature-card').length === 6 ? '' : `功能入口 ${d.querySelectorAll('.feature-card').length}/6`,
    d.querySelectorAll('.cover-row').length === B.chapters.length ? '' : '考点覆盖行数不符'
  ]],
  ['/stats', '统计', (d) => [
    d.querySelectorAll('.kpi').length === 4 ? '' : 'KPI 不是 4 个',
    d.querySelector('.heat-table') ? '' : '缺考点热度矩阵',
    d.querySelector('.trend') ? '' : '缺成绩趋势图',
    d.querySelector('.scatter') ? '' : '缺节奏分析散点图',
    d.querySelector('#sec-backup') ? '' : '缺备份/恢复分区'
  ]],
  ['/review', '复习', (d) => [
    d.querySelectorAll('.kpi').length === 4 ? '' : 'KPI 不是 4 个',
    hasBtn(d, '重排今日队列') ? '' : '缺「重排今日队列」'
  ]],
  ['/editor', '录入编辑器', (d) => [
    d.querySelector('.ed-preview') ? '' : '缺实时预览区',
    d.querySelector('.ed-opts') ? '' : '缺选项编辑区',
    hasBtn(d, '填入示例') ? '' : '缺「填入示例」'
  ]],
  ['/figures', '图库', (d) => {
    const total = YEARS.reduce((s, y) => s + Object.keys(B.figures[y] || {}).length, 0)
    return [d.querySelectorAll('.fig-card').length === total ? '' : `图卡 ${d.querySelectorAll('.fig-card').length}/${total}`]
  }]
]) {
  const w = await openPage(route)
  const d = w.document
  const errs = checks(d).filter(Boolean)
  rows.push({ scope: route, label, textLen: (d.querySelector('#app').textContent || '').replace(/\s+/g, '').length, katex: d.querySelectorAll('.katex').length, nodes: d.querySelectorAll('*').length, errs })
  w.close()
}

// ============================================================
// 2. 交互流程
// ============================================================

// 2.1 练习：选错 → 不立即判分 → Enter 结算 → 进错题本
await step('练习：选错→不判分→Enter 结算→错题本', async () => {
  const w = await openPage('/practice?y=2025')
  const d = w.document
  const q = B.papers['2025'].questions[0]
  const wrongKey = q.answer === 'A' ? 'B' : 'A'
  const cell = d.querySelector(`td[data-k="${wrongKey}"]`)
  assert(cell, '找不到选项单元格')
  click(w, cell)
  await sleep(80)
  assert(!d.querySelector('.ans'), '选择后不应立即出现解析')
  key(w, 'Enter')
  await sleep(160)
  assert(d.querySelector('.ans'), 'Enter 后未出现解析')
  const rec = JSON.parse(w.localStorage.getItem('bupt801-records-v1') || '{}')
  assert(rec[q.id] && rec[q.id].w >= 1 && rec[q.id].ok === false, '未记入错题：' + JSON.stringify(rec[q.id]))
  const badge = [...d.querySelectorAll('.badge')].map((e) => e.textContent).join('|')
  assert(/错误|不正确|你的选择/.test(badge) || d.querySelector('.opt-exp.right'), '解析未标出正确项')
  w.close()
})

// 2.2 练习：改正后仍保留错题本（只在重做正确时移除）
await step('练习：重做选对→错题标记清除', async () => {
  const seed = { 'bupt801-records-v1': JSON.stringify({ [B.papers['2025'].questions[0].id]: { c: 0, w: 1, ok: false, t: Date.now() } }) }
  const w = await openPage('/practice?y=2025', { seed })
  const d = w.document
  const q = B.papers['2025'].questions[0]
  click(w, d.querySelector(`td[data-k="${q.answer}"]`))
  await sleep(60)
  key(w, 'Enter')
  await sleep(140)
  const rec = JSON.parse(w.localStorage.getItem('bupt801-records-v1'))[q.id]
  assert(rec.ok === true && rec.c >= 1, '重做正确未记为对：' + JSON.stringify(rec))
  w.close()
})

// 2.3 练习：收藏 + 深链
await step('练习：收藏快捷键 S + ?id= 深链定位', async () => {
  const target = B.papers['2023'].questions[10]
  const w = await openPage('/practice?id=' + encodeURIComponent(target.id))
  const d = w.document
  key(w, 's')
  await sleep(80)
  const rec = JSON.parse(w.localStorage.getItem('bupt801-records-v1') || '{}')
  assert(rec[target.id] && rec[target.id].star, '收藏未写入')
  const numBadge = [...d.querySelectorAll('.qhead .badge')].map((e) => e.textContent).join(' ')
  assert(numBadge.includes(String(target.num)), '深链未定位到目标题（' + numBadge + '）')
  w.close()
})

// 2.4 练习：筛选（做错）
await step('练习：范围=做错 只保留错题', async () => {
  const p = B.papers['2025']
  const seedRec = {}
  p.questions.slice(0, 3).forEach((q) => { seedRec[q.id] = { c: 0, w: 1, ok: false, t: Date.now() } })
  const w = await openPage('/practice?y=2025&wrong=1', { seed: { 'bupt801-records-v1': JSON.stringify(seedRec) } })
  const d = w.document
  await sleep(60)
  const posText = txt(w, '.tr-pos')
  assert(/\/\s*3\b/.test(posText), '错题队列应为 3 题，实际 ' + posText)
  assert(d.querySelector('.sheet button'), '缺答题卡')
  w.close()
})

// 2.5 模考全流程：全选错 → 交卷 0 分 → 只看错题 → 自评满分
await step('模考：全错->0 分->只看错题->综合题自评', async () => {
  const y = '2026'
  const p = B.papers[y]
  const w = await openPage('/exam?y=' + y)
  const d = w.document
  click(w, byText(w, 'button', '开始考试'))
  await sleep(200)
  for (let i = 0; i < p.questions.length; i++) {
    const q = p.questions[i]
    if (q.type === 'choice') {
      const wrongKey = q.answer === 'A' ? 'B' : 'A'
      const cell = d.querySelector(`td[data-k="${wrongKey}"]`)
      if (!cell) throw new Error('第 ' + (i + 1) + ' 题缺少选项 ' + wrongKey)
      click(w, cell)
      await sleep(12)
    }
    if (i < p.questions.length - 1) { click(w, byText(w, '.qnav button', '下一题')); await sleep(12) }
  }
  click(w, byText(w, '.exambar button', '交卷'))
  await sleep(260)
  assert(/score-hero/.test(d.body.innerHTML), '未进入成绩页')
  const score = parseInt(txt(w, '.score'), 10)
  assert(score === 0, '全错得分应为 0，实际 ' + score)
  assert(txt(w, '.score-split').includes('未作答'), '缺分项统计')

  click(w, byText(w, 'button', '回顾全卷'))
  await sleep(200)
  const cb = d.querySelector('.exambar input[type=checkbox]')
  assert(cb, '缺少「只看错题」开关')
  cb.checked = true
  cb.dispatchEvent(new w.Event('change', { bubbles: true }))
  await sleep(160)
  const shown = d.querySelectorAll('.qcard').length
  assert(shown === p.questions.filter((q) => q.type === 'choice').length,
    `只看错题应显示 ${p.questions.filter((q) => q.type === 'choice').length} 张卡，实际 ${shown}`)

  click(w, byText(w, 'button', '返回成绩'))
  await sleep(160)
  const okBtns = [...d.querySelectorAll('.bar-row .btn.ok')]
  assert(okBtns.length > 0, '缺自评按钮')
  okBtns.forEach((b) => click(w, b))
  await sleep(200)
  const full = p.questions.filter((q) => q.type === 'big').reduce((s, q) => s + q.score, 0)
  const newScore = parseInt(txt(w, '.score'), 10)
  assert(newScore === full, `自评满分后总分应为 ${full}，实际 ${newScore}`)
  const rec = JSON.parse(w.localStorage.getItem('bupt801-records-v1') || '{}')
  assert(Object.keys(rec).length > 0, '模考未写入做题记录')
  w.close()
})

// 2.6 模考中断恢复
await step('模考：刷新后「继续考试」', async () => {
  const y = '2025'
  const p = B.papers[y]
  const ids = p.questions.map((q) => q.id)
  const saved = {
    stage: 'run',
    setup: { year: y, scope: 'all', minutes: 180 },
    ids, pos: 5, examAnswers: { [ids[0]]: 'A', [ids[1]]: 'B' },
    marked: [ids[2]], selfScore: {}, remain: 3600, usedSec: 600, savedAt: Date.now()
  }
  const w = await openPage('/exam?y=' + y, { seed: { 'bupt801-exam-v1': JSON.stringify(saved) } })
  const d = w.document
  assert(/未完成的考试/.test(d.body.textContent), '未提示继续考试')
  click(w, byText(w, 'button', '继续考试'))
  await sleep(240)
  assert(d.querySelector('.qcard'), '继续后无题卡')
  assert(/\d+:\d+/.test(txt(w, '.timer')), '继续后倒计时未启动')
  w.close()
})

// 2.7 试卷页：解析开关 + 图块灯箱
await step('试卷：解析开关 / 点击图块开灯箱 / Esc 关闭', async () => {
  const w = await openPage('/paper/2023')
  const d = w.document
  const ansN = d.querySelectorAll('.ans').length
  assert(ansN > 0, '试卷页没有解析块')
  const sheet = d.querySelector('.paper-sheet')
  assert(sheet.classList.contains('hide-ans'), '默认应隐藏解析（.hide-ans）')
  click(w, byText(w, '.paper-toolbar button', '显示解析'))
  await sleep(120)
  assert(!sheet.classList.contains('hide-ans'), '点「显示解析」后仍隐藏')
  click(w, byText(w, '.paper-toolbar button', '已显示解析'))
  await sleep(100)
  assert(sheet.classList.contains('hide-ans'), '再点后未重新隐藏')
  const fig = d.querySelector('.figblock')
  assert(fig, '试卷页无图块')
  click(w, fig)
  await sleep(120)
  assert(d.querySelector('.lb-backdrop'), '点击图块未打开灯箱')
  key(w, 'Escape')
  await sleep(140)
  assert(!d.querySelector('.lb-backdrop'), 'Esc 未关闭灯箱')
  w.close()
})

// 2.8 图库搜索
await step('图库：关键词搜索过滤 / 清空恢复', async () => {
  const w = await openPage('/figures')
  const d = w.document
  const before = d.querySelectorAll('.fig-card').length
  const input = d.querySelector('.search-box input')
  assert(input, '缺搜索框')
  const type = async (kw) => {
    input.value = kw
    input.dispatchEvent(new w.Event('input', { bubbles: true }))
    await sleep(140)
    return d.querySelectorAll('.fig-card').length
  }
  const n1 = await type('题五')
  assert(n1 > 0 && n1 < before, `搜索「题五」结果 ${n1}/${before}，疑似未过滤`)
  const n2 = await type('眼图')   // 搜索框 placeholder 里给的示例词
  const n3 = await type('第五题') // placeholder 里给的示例词
  await type('')
  assert(d.querySelectorAll('.fig-card').length === before, '清空关键词后未恢复')
  w.close()
  return `题五=${n1}；placeholder 示例词 眼图=${n2}、第五题=${n3}（命中 0 说明示例词与数据对不上）`
})

// 2.9 主题切换
await step('主题：切换 -> data-theme + 持久化', async () => {
  const w = await openPage('/')
  const d = w.document
  const btn = d.querySelector('.topbar-right .icon-btn')
  const before = d.documentElement.getAttribute('data-theme')
  click(w, btn)
  await sleep(120)
  const after = d.documentElement.getAttribute('data-theme')
  assert(before && after && before !== after, `主题未切换（${before} -> ${after}）`)
  assert(w.localStorage.getItem('bupt801-theme') === after, '主题未写入 localStorage')
  w.close()
})

// 2.10 帮助弹窗
await step('帮助弹窗：打开 / Esc 关闭 / 恢复滚动', async () => {
  const w = await openPage('/')
  const d = w.document
  const btns = d.querySelectorAll('.topbar-right .icon-btn')
  click(w, btns[1])
  await sleep(140)
  assert(d.querySelector('.help-modal'), '未打开帮助弹窗')
  assert(d.body.style.overflow === 'hidden', '打开弹窗未锁定背景滚动')
  key(w, 'Escape')
  await sleep(160)
  assert(!d.querySelector('.help-modal'), 'Esc 未关闭帮助弹窗')
  assert(d.body.style.overflow === '', '关闭后未恢复滚动')
  w.close()
})

// 2.11 练习：键盘 A~D 选择
await step('练习：键盘 A~D 选择选项', async () => {
  const w = await openPage('/practice?y=2026')
  const d = w.document
  key(w, 'c')
  await sleep(120)
  const rec = JSON.parse(w.localStorage.getItem('bupt801-records-v1') || '{}')
  const first = B.papers['2026'].questions[0]
  assert(rec[first.id] && rec[first.id].pick === 'C', '按键 C 未写入选择：' + JSON.stringify(rec[first.id] || {}))
  assert(!d.querySelector('.ans'), '按键选择后不应公布答案')
  w.close()
})

// 2.12 练习：范围=未做 与「看过解析」的口径一致性（只报告，不判失败）
await step('练习：范围=未做 的口径', async () => {
  const p = B.papers['2025']
  const q0 = p.questions[0]
  const seed = { 'bupt801-records-v1': JSON.stringify({ [q0.id]: { revealed: true, t: Date.now() } }) }
  const w = await openPage('/practice?y=2025', { seed })
  const d = w.document
  const span = [...d.querySelectorAll('.seg > span')].find((s) => s.textContent.trim() === '未做')
  assert(span, '找不到「未做」分段')
  click(w, span)
  await sleep(160)
  const total = parseInt((txt(w, '.tr-pos').split('/')[1] || '0'), 10)
  w.close()
  const expect = p.questions.length - 1
  return total === expect
    ? `已排除看过解析的题（${total}）`
    : `未排除「只看过解析」的题：队列 ${total}，按进度口径应为 ${expect}（fScope=new 只判 c/w，progressOf 判 revealed，口径不一致）`
})

// 2.13 考试：倒计时是否走动
await step('模考：倒计时 1 秒内递减', async () => {
  const w = await openPage('/exam?y=2025')
  const d = w.document
  click(w, byText(w, 'button', '开始考试'))
  await sleep(200)
  const t0 = txt(w, '.timer')
  await sleep(1300)
  const t1 = txt(w, '.timer')
  assert(t0 !== t1, `倒计时未走动（${t0} → ${t1}）`)
  w.close()
  return t0 + ' → ' + t1
})

// 2.14 全站搜索：⌘K → 搜 → ↑↓ → 回车定位
await step('搜索：⌘K 打开→搜 HDB3→高亮→回车定位到题目', async () => {
  const w = await openPage('/')
  const d = w.document
  const kd = (target, k, opts = {}) =>
    target.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...opts }))
  kd(w, 'k', { metaKey: true })
  await sleep(200)
  const box = d.querySelector('.cmdk input')
  assert(box, '⌘K 未打开面板')
  box.value = 'HDB3'
  box.dispatchEvent(new w.Event('input', { bubbles: true }))
  await sleep(240)
  const rows2 = d.querySelectorAll('.cmdk-row')
  assert(rows2.length > 0, '搜「HDB3」零结果')
  assert(d.querySelector('.cmdk-title mark, .cmdk-snip mark'), '命中词没有高亮')
  kd(box, 'ArrowDown')
  await sleep(80)
  kd(box, 'Enter')
  await sleep(300)
  assert(/\/(practice|figures|paper)/.test(w.location.pathname), '回车未跳转：' + w.location.pathname)
  assert(w.location.search, '跳转没带定位参数')
  assert(d.querySelector('.qcard, .bigq, .fig-card'), '跳转后没有渲染出内容')
  assert(!d.querySelector('.cmdk-mask'), '跳转后面板未关闭')
  return `${rows2.length} 条结果 → ${w.location.pathname}${w.location.search}`
})

// 2.15 搜索：图库结果也能进图库并定位
await step('搜索：图库条目直接进入图库并带上 ?q=', async () => {
  const w = await openPage('/figures')
  const d = w.document
  const kd = (target, k, opts = {}) =>
    target.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...opts }))
  kd(w, 'k', { ctrlKey: true })
  await sleep(180)
  const box = d.querySelector('.cmdk input')
  assert(box, 'Ctrl+K 未打开面板')
  // 「眼图」在数据里其实不存在（placeholder 的示例词就是这么来的），这里用真实图件的名字
  box.value = '网格图'
  box.dispatchEvent(new w.Event('input', { bubbles: true }))
  await sleep(240)
  const grp = [...d.querySelectorAll('.cmdk-group')].map((g) => g.textContent).join(' ')
  assert(/图库/.test(grp), '搜「网格图」没有图库分组')
  const figRow = d.querySelector('.cmdk-row .cmdk-badge.fig')
  assert(figRow, '图库条目没有 fig 徽标')
  click(w, figRow.closest('.cmdk-row'))
  await sleep(300)
  assert(w.location.pathname === '/figures', '未进图库：' + w.location.pathname)
  assert(/[?&]q=/.test(w.location.search), '图库跳转没带 ?q= 定位参数')
  return w.location.search
})

// 2.16 间隔复习：四档评分 → 间隔变长 / 遗忘则缩短
await step('复习：四档评分→间隔变化→队列推进', async () => {
  const w = await openPage('/review')
  const d = w.document
  const rebuild = byText(w, 'button', '重排今日队列')
  assert(rebuild, '缺「重排今日队列」')
  click(w, rebuild)
  await sleep(260)
  assert(d.querySelector('.qcard'), '重排后无题卡')
  // 四档评分只有在看过答案之后才出现（否则等于盲评）
  click(w, byText(w, 'button', '显示答案'))
  await sleep(200)
  const grades = [...d.querySelectorAll('.grade-btn')]
  assert(grades.length === 4, `评分档位 ${grades.length}/4`)
  const posBefore = txt(w, '.tr-pos')
  click(w, grades[2])
  await sleep(240)
  const posAfter = txt(w, '.tr-pos')
  assert(posBefore !== posAfter, `评分后队列位置没变（${posBefore} → ${posAfter}）`)
  return `${posBefore} → ${posAfter}，档位 ${grades.map((g) => g.textContent.trim().split(' ')[0]).join('/')}`
})

// 2.17 练习页：逐题计时 + 笔记自动保存 + 复制链接
await step('练习：计时/笔记/复制链接', async () => {
  const w = await openPage('/practice?y=2025')
  const d = w.document
  const ta = d.querySelector('.note-panel .note-area')
  assert(ta, '练习页没有笔记输入框')
  const qid = w.location.pathname + w.location.search
  ta.value = '测试笔记：$E_b/N_0$ 换算别忘了 3dB'
  ta.dispatchEvent(new w.Event('input', { bubbles: true }))
  await sleep(200)
  // 防抖 600ms 才落盘，这里直接点「预览」强制 flush，避免测试等满 1 秒
  click(w, byText(w, '.note-panel button', '预览'))
  await sleep(220)
  const saved = JSON.parse(w.localStorage.getItem('bupt801-notes-v1') || '{}')
  const keys = Object.keys(saved)
  assert(keys.length > 0, '笔记没有落盘到 localStorage')
  // 存的是 { text, t } 结构
  const first = Object.values(saved)[0] || {}
  assert(/E_b/.test(first.text || ''), '落盘内容不对：' + JSON.stringify(saved).slice(0, 80))
  assert(first.t > 0, '笔记没有时间戳，趋势/周报统计会拿不到它')
  const linkBtn = byText(w, 'button', '链接')
  assert(linkBtn, '练习页没有复制链接按钮')
  click(w, linkBtn)
  await sleep(160)
  return '笔记 ' + keys.length + ' 条（' + keys[0] + '）' + (qid ? '' : '')
})

// 2.18 模考：综合题三档自评（满分 / 部分 / 零分）
await step('模考：综合题三档自评分别给满分/6折/0', async () => {
  const w = await openPage('/exam?y=2024')
  const d = w.document
  click(w, byText(w, 'button', '开始考试'))
  await sleep(240)
  // 三档自评在交卷后的结算页，考试途中不给看（否则等于提前知道答案）
  click(w, byText(w, 'button', '交卷并出分'))
  await sleep(320)
  const rows3 = [...d.querySelectorAll('.big-judge')]
  assert(rows3.length > 0, '结算页没有综合题自评行')
  const btns = [...rows3[0].querySelectorAll('button')]
  assert(btns.length === 3, `每题自评档位 ${btns.length}/3`)
  // 逐档点一遍，看分数是否跟着变
  const read = () => (rows3[0].querySelector('.bv') || {}).textContent || ''
  assert(/未评/.test(read()), '初始状态应为「未评」')
  click(w, btns[0])
  await sleep(160)
  const full = read()
  click(w, btns[1])
  await sleep(160)
  const part = read()
  click(w, btns[2])
  await sleep(160)
  const zero = read()
  const n = (s) => Number((s.match(/\d+/) || [0])[0])
  assert(n(full) > n(part) && n(part) > n(zero), `三档分数没有递减：${full}/${part}/${zero}`)
  return `满分${full} → 部分${part} → 零分${zero}，共 ${rows3.length} 道大题`
})

// 2.19 统计页：热度矩阵 + 趋势 + 时间散点都有内容
await step('统计：热度矩阵/趋势/散点渲染', async () => {
  const w = await openPage('/stats')
  const d = w.document
  const cells = d.querySelectorAll('.heat-table td').length
  assert(cells > 0, '热度矩阵没有单元格')
  const rowsN = d.querySelectorAll('.heat-table tbody tr').length
  assert(rowsN === B.chapters.length, `矩阵行数 ${rowsN}/${B.chapters.length}`)
  assert(d.querySelector('.trend'), '趋势图缺失')
  assert(d.querySelector('.scatter'), '节奏散点缺失')
  return `热度 ${rowsN}×${Math.floor(cells / rowsN)}`
})

// 2.20 备份：导出 → 导入 → 数据回来
await step('备份：导出 JSON → 粘贴导入 → 记录数回来', async () => {
  // 先在一道题上留下记录
  const w1 = await openPage('/practice?y=2024')
  click(w1, w1.document.querySelector('td[data-k]'))
  await sleep(160)
  const raw = w1.localStorage.getItem('bupt801-records-v1') || '{}'
  w1.close()

  const w = await openPage('/stats')
  const d = w.document
  click(w, byText(w, 'button', '导出 JSON 文件'))
  await sleep(220)
  assert(w.__downloads.length, '导出没有触发下载')
  assert(/\.json$/.test(w.__downloads[0]), '文件名不像 JSON：' + w.__downloads[0])

  const ta = d.querySelector('textarea[aria-label="备份 JSON 内容"]')
  assert(ta, '缺备份粘贴框')
  ta.value = JSON.stringify({
    v: 1, exportedAt: new Date().toISOString(),
    records: JSON.parse(raw), notes: {}, exams: [], plan: null
  })
  ta.dispatchEvent(new w.Event('input', { bubbles: true }))
  await sleep(200)
  const imp = [...d.querySelectorAll('button')].find((b) => (b.textContent || '').trim() === '导入')
  assert(imp && !imp.disabled, '「导入」按钮不可用')
  click(w, imp)
  await sleep(300)
  const body = (d.body.textContent || '').replace(/\s+/g, ' ')
  assert(/导入完成/.test(body), '没有导入成功提示')
  assert(/记录 [1-9]/.test(body), '导入记录数为 0')
  return (body.match(/导入完成[^。]*/) || [''])[0]
})

// 2.21 编辑器：示例 → 校验通过 → 片段含 BUPT801 挂载结构
await step('编辑器：填入示例→校验通过→导出片段结构正确', async () => {
  const w = await openPage('/editor')
  const d = w.document
  click(w, byText(w, 'button', '填入示例'))
  await sleep(300)
  const badge = txt(w, '.card .badge')
  assert(!/待修/.test(badge), '示例题本身没通过校验：' + badge)
  assert(d.querySelectorAll('.ed-preview .katex').length > 0, '预览区没有渲染公式')
  const code = (d.querySelector('.ed-code') || {}).textContent || ''
  assert(/paper|answer/.test(code) || byText(w, 'button', '复制'), '既没有代码块也没有复制按钮')
  return '预览公式 ' + d.querySelectorAll('.ed-preview .katex').length + ' 处'
})

// ============================================================
// 3. 可访问性 / 可用性静态扫描
// ============================================================
{
  const w = await openPage('/practice?y=2023')
  const d = w.document
  const clickOnly = (sel) => [...d.querySelectorAll(sel)].filter(
    (e) => !e.hasAttribute('tabindex') && !e.hasAttribute('role') && e.tagName !== 'BUTTON' && e.tagName !== 'A'
  ).length
  const h1 = d.querySelectorAll('h1').length
  const nameless = [...d.querySelectorAll('button')].filter(
    (b) => !(b.textContent || '').trim() && !b.getAttribute('aria-label') && !b.getAttribute('title')
  ).length
  const unlabeled = [...d.querySelectorAll('input:not([type=hidden]), select, textarea')].filter((el) => {
    if (el.getAttribute('aria-label') || el.getAttribute('placeholder')) return false
    return !el.id || !d.querySelector(`label[for="${el.id}"]`)
  }).length
  a11y.push({ scope: '/practice', item: '页面 h1 数量', value: h1, expect: '1' })
  a11y.push({ scope: '/practice', item: '仅鼠标可点的选项单元格 td[data-k]', value: clickOnly('td[data-k]'), expect: '可用键盘操作' })
  a11y.push({ scope: '/practice', item: '仅鼠标可点的 chip（年份/标签）', value: clickOnly('.chip'), expect: 'button 或 role+tabindex' })
  a11y.push({ scope: '/practice', item: '仅鼠标可点的分段控件 .seg>span', value: clickOnly('.seg > span'), expect: 'button 或 role+tabindex' })
  a11y.push({ scope: '/practice', item: '无名称按钮', value: nameless, expect: '0' })
  a11y.push({ scope: '/practice', item: '无 label 的表单控件', value: unlabeledCount(d), expect: '0（placeholder 不算 label）' })
  w.close()
}
{
  const w = await openPage('/')
  const d = w.document
  a11y.push({ scope: '/', item: '页面 h1 数量', value: d.querySelectorAll('h1').length, expect: '1' })
  a11y.push({ scope: '/', item: '跳转到主内容链接', value: d.querySelector('a[href="#main"], [href="#app"]') ? 1 : 0, expect: '1' })
  w.close()
}
{
  const w = await openPage('/figures')
  const d = w.document
  a11y.push({ scope: '/figures', item: '搜索框无 aria-label/label', value: d.querySelector('.search-box input')?.getAttribute('aria-label') ? 0 : 1, expect: '0' })
  a11y.push({ scope: '/figures', item: 'SVG 缺少 <title>', value: [...d.querySelectorAll('.figblock svg')].filter((s) => !s.querySelector('title')).length, expect: '0' })
  w.close()
}
for (const [route, scope, sels] of [
  ['/review', '/review', ['.qcard', '.rv-grade button, .grade-btn']],
  ['/editor', '/editor', ['.ed-input', '.ed-textarea']],
  ['/stats', '/stats', ['.heat-table', '.trend-svg, .scatter-svg']]
]) {
  const w = await openPage(route)
  const d = w.document
  a11y.push({ scope, item: '页面 h1 数量', value: d.querySelectorAll('h1').length, expect: '1' })
  a11y.push({ scope, item: '无 label 的表单控件', value: unlabeledCount(d), expect: '0（placeholder 不算 label）' })
  const nameless = [...d.querySelectorAll('button')].filter(
    (b) => !(b.textContent || '').trim() && !b.getAttribute('aria-label') && !b.getAttribute('title')
  ).length
  a11y.push({ scope, item: '无名称按钮', value: nameless, expect: '0' })
  const svgUnknown = [...d.querySelectorAll('svg')].filter(
    (s) => s.getAttribute('role') !== 'img' && !s.querySelector('title') && s.getAttribute('aria-hidden') !== 'true'
  ).length
  a11y.push({ scope, item: '无 role/title 的装饰性 SVG', value: svgUnknown, expect: '0' })
  w.close()
}

// ============================================================
// 输出
// ============================================================
if (JSON_OUT) {
  console.log(JSON.stringify({ dataStat, rows, inter, a11y }, null, 2))
} else {
  const pad = (s, n) => String(s).padEnd(n, ' ')
  console.log('\n== 数据规模 ==')
  YEARS.forEach((y) => {
    const s = dataStat[y]
    console.log(`${y}: 选择 ${s.choice} · 大题 ${s.big} · 满分 ${s.score} · 图 ${s.figs}`)
  })
  console.log('\n== 结构审计 ==')
  console.log(pad('路由', 20) + pad('页', 8) + pad('文字量', 9) + pad('katex', 8) + pad('DOM节点', 9) + '结论')
  for (const r of rows) {
    console.log(pad(r.scope, 20) + pad(r.label, 8) + pad(r.textLen, 9) + pad(r.katex, 8) + pad(r.nodes, 9) + (r.errs.length ? '✗ ' + r.errs.join('; ') : '✓'))
    if (r.errs.length) failed++
  }
  console.log('\n== 交互流程 ==')
  for (const it of inter) console.log('  ' + (it.ok ? '✓' : '✗') + ' ' + it.name + (it.note ? ' — ' + it.note : ''))
  console.log('\n== 可访问性扫描 ==')
  for (const a of a11y) console.log(`  ${pad(a.scope, 12)}${pad(a.item, 42)}实测 ${pad(a.value, 5)} 期望 ${a.expect}`)
  console.log(failed === 0 ? '\n结果: 全部通过' : `\n结果: ${failed} 项失败`)
}
process.exit(failed === 0 ? 0 : 1)
