#!/usr/bin/env node
/**
 * 资源自检：页面能打开 ≠ 图能显示。
 *
 * smoke_pages.mjs / audit_site.mjs 都直接读项目 data/ 目录（绕过 app/public、
 * app/dist 快照），所以「数据齐全但快照漏了某年的图目录」这类问题它们抓不到，
 * 表现就是页面结构一切正常、公式都在，只有图整块消失（FigBlock 的 v-if="svg" 为假）。
 *
 * 本工具做四件事：
 *  1. 把 app/index.html、app/dist/index.html 里每个本地 <script src> / <link href>
 *     拿去 app/public、app/dist 下逐个查存在性（下发路径 = 浏览器真实请求路径）。
 *  2. 在同目录里加载题目数据（paper.js / answer.js）与图库，核对「引用了但没注册」
 *     的悬空图 key。
 *  3. 反向核对「注册了但没人引用」的孤儿图（多为改题后忘删，不算错，只提示）。
 *  4. 检查每个注册的图确实是 <svg 开头的字符串。
 *
 * 用法：
 *   node tools/check_assets.mjs            # public + dist 全查
 *   node tools/check_assets.mjs --public   # 只查 dev 快照
 *   node tools/check_assets.mjs --dist     # 只查构建产物
 *   node tools/check_assets.mjs --json     # 机器可读
 * 退出码：0 全通过；1 有缺失/悬空引用/坏图。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const APP = path.join(ROOT, 'app')
const DATA = path.join(ROOT, 'data')

const argv = process.argv.slice(2)
const onlyPublic = argv.includes('--public')
const onlyDist = argv.includes('--dist')
const asJson = argv.includes('--json')
const TARGETS = [
  { name: 'public', dir: path.join(APP, 'public'), index: path.join(APP, 'index.html') },
  { name: 'dist', dir: path.join(APP, 'dist'), index: path.join(APP, 'dist', 'index.html') },
].filter(t => (onlyPublic ? t.name === 'public' : true) && (onlyDist ? t.name === 'dist' : true))

const report = {}
let failed = false

function localRefs(html) {
  const out = new Set()
  for (const m of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) out.add(m[1])
  for (const m of html.matchAll(/<link\b[^>]*\bhref="([^"]+)"/g)) out.add(m[1])
  return [...out].filter(u => u.startsWith('/') && !u.startsWith('//'))
    // /src/ 是 vite 开发入口（由 vite 内部解析，public 下本来就没有）
    .filter(u => !u.startsWith('/src/'))
}

/** 从任意嵌套结构里收集所有 fig 字段 */
function collectFigKeys(obj, acc = new Set()) {
  if (!obj || typeof obj !== 'object') return acc
  if (Array.isArray(obj)) { obj.forEach(o => collectFigKeys(o, acc)); return acc }
  for (const [k, v] of Object.entries(obj)) {
    if ((k === 'fig' || k === 'figKey') && typeof v === 'string' && v) acc.add(v)
    else collectFigKeys(v, acc)
  }
  return acc
}

function loadInSandbox(files) {
  const win = {}
  for (const f of files) {
    try { new Function('window', fs.readFileSync(f, 'utf8'))(win) } catch (e) {
      throw new Error(`加载失败 ${path.relative(ROOT, f)}: ${e.message}`)
    }
  }
  return win
}

for (const t of TARGETS) {
  const r = { missing: [], dangling: [], orphan: [], badSvg: [], years: {}, refs: 0 }
  // 1) 静态资源存在性
  if (!fs.existsSync(t.index)) {
    r.missing.push({ file: path.relative(ROOT, t.index), why: 'index.html 不存在' })
  } else {
    const html = fs.readFileSync(t.index, 'utf8')
    for (const u of localRefs(html)) {
      r.refs++
      if (!fs.existsSync(path.join(t.dir, u))) r.missing.push({ file: u, why: 'index.html 引用了但目录下没有' })
    }
  }

  // 2) 题目数据 + 图库注册表（读该目录下真实下发的文件）
  const qDir = path.join(t.dir, 'data', 'questions')
  if (fs.existsSync(qDir)) {
    const years = fs.readdirSync(qDir).filter(y => fs.statSync(path.join(qDir, y)).isDirectory())
    for (const y of years) {
      const paperF = path.join(qDir, y, 'paper.js')
      const ansF = path.join(qDir, y, 'answer.js')
      const figs = []
      const figDir = path.join(t.dir, 'data', 'figures', y)
      // 图库注册表 = emit 自动生成的 _index.js（浏览器/Node 两用，快照里必须真实下发）
      if (fs.existsSync(path.join(figDir, '_index.js'))) figs.push(path.join(figDir, '_index.js'))
      const files = [paperF, ansF, ...figs].filter(f => fs.existsSync(f))
      let win
      try { win = loadInSandbox(files) } catch (e) { r.missing.push({ file: path.relative(ROOT, e.message.split(' ')[1] || paperF), why: e.message }); continue }

      const paper = (win.BUPT801.papers || {})[y]
      const answer = (win.BUPT801.answers || {})[y]
      const used = collectFigKeys([paper, answer])
      const reg = (win.BUPT801.figures || {})[y] || {}
      const regKeys = Object.keys(reg)

      r.years[y] = { used: used.size, registered: regKeys.length }
      for (const k of used) if (!regKeys.includes(k)) r.dangling.push({ year: y, fig: k, why: '题干/解析引用了，但图库里没有' })
      for (const k of regKeys) {
        const s = reg[k]
        if (!/^\s*<svg\b/i.test(String(s || ''))) r.badSvg.push({ year: y, fig: k, why: '注册值不是 <svg 字符串' })
        if (!used.has(k)) r.orphan.push({ year: y, fig: k })
      }
    }
  }

  if (r.missing.length || r.dangling.length || r.badSvg.length) failed = true
  report[t.name] = r
}

if (asJson) {
  console.log(JSON.stringify(report, null, 2))
  process.exit(failed ? 1 : 0)
}

for (const [name, r] of Object.entries(report)) {
  console.log(`\n== ${name} ==`)
  const yl = Object.entries(r.years).map(([y, v]) => `${y}:${v.used}引/${v.registered}图`).join('  ')
  console.log(`  引用资源 ${r.refs} 个；年份 ${yl}`)
  if (r.missing.length) {
    console.log(`  ✗ 缺失 ${r.missing.length}`)
    for (const m of r.missing.slice(0, 25)) console.log(`    - ${m.file}  (${m.why})`)
    if (r.missing.length > 25) console.log(`    … 另有 ${r.missing.length - 25} 个`)
  }
  if (r.dangling.length) {
    console.log(`  ✗ 悬空图引用 ${r.dangling.length}`)
    for (const d of r.dangling) console.log(`    - ${d.year} ${d.fig}  (${d.why})`)
  }
  if (r.badSvg.length) {
    console.log(`  ✗ 坏图 ${r.badSvg.length}`)
    for (const b of r.badSvg) console.log(`    - ${b.year} ${b.fig}  (${b.why})`)
  }
  if (r.orphan.length) {
    console.log(`  ! 孤儿图 ${r.orphan.length}（注册了但题干/解析没引用，仅提示）`)
    for (const o of r.orphan) console.log(`    - ${o.year} ${o.fig}`)
  }
  if (!r.missing.length && !r.dangling.length && !r.badSvg.length) console.log('  ✓ 资源与图库注册全部对上')
}

console.log(`\n== 结果 ==\n${failed ? '✗ 有问题（见上）' : '✓ 全部通过'}`)
process.exit(failed ? 1 : 0)
