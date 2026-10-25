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
  ['/stats', '统计页'],
  ['/figures', '图库页'],
  ['/review', '复习页'],
  ['/editor', '录入编辑器']
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
  await import(pathToFileURL(path.join(DIST, 'assets', 'app.js')).href + '?tag=' + tag + '-' + (++pageSeq))
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
