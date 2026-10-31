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
 *  4. 检查每个注册的图确实是 {src,w,h} 位图描述符（SVG 重绘已退役）。
 *  5. 核对 data/images/<年>/ 里的截图是否都进了注册表（忘跑 emit 的静默漏图）。
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

/** 从任意嵌套结构里收集所有 fig 引用：fig/figKey 字段 + 正文里单独一行的 [[fig:key]] */
function collectFigKeys(obj, acc = new Set()) {
  if (typeof obj === 'string') { // 数组元素是字符串，必须在这一层收内联图，否则只能捡到对象上的 fig 字段
    for (const m of obj.matchAll(/\[\[fig:([A-Za-z0-9_-]+)\]\]/g)) acc.add(m[1])
    return acc
  }
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

/**
 * 图上一条命：截图放进 data/images 只是"源文件到位"，还得经过 emit 才进注册表。
 * 忘了重建注册表时页面照常、图静默保持旧版（或整块空白），这里把它抓出来。
 * key 规则与 tools/fig_registry.js: keyFromImageName 一致。
 */
function scanImageKeys(dir, acc = { keys: [], bad: [] }) {
  let names = []
  try { names = fs.readdirSync(dir, { withFileTypes: true }) } catch { return acc }
  for (const d of names) {
    if (d.name.startsWith('_') || d.name.startsWith('.')) continue
    const full = path.join(dir, d.name)
    if (d.isDirectory()) { scanImageKeys(full, acc); continue }
    if (!/\.(png|jpe?g|webp|gif)$/i.test(d.name)) continue
    const stem = path.basename(d.name, path.extname(d.name))
    const m = /^\d{4}-([^-]+)-(.+)$/.exec(stem)
    const key = (m ? m[2] : stem).trim()
    if (/^[A-Za-z0-9_-]+$/.test(key)) acc.keys.push(key)
    else acc.bad.push(path.relative(ROOT, full))
  }
  return acc
}

for (const t of TARGETS) {
  const r = { missing: [], dangling: [], orphan: [], badSvg: [], unregistered: [], strayImage: [], years: {}, refs: 0 }
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
    // 只认 4 位年份目录：Mimosa hook 会在快照里塞 .mimosa 状态目录，不跳过会把整年遍历搞崩
    const years = fs.readdirSync(qDir).filter(y => /^\d{4}$/.test(y) && fs.statSync(path.join(qDir, y)).isDirectory())
    for (const y of years) {
      const paperF = path.join(qDir, y, 'paper.js')
      const ansF = path.join(qDir, y, 'answer.js')
      const figs = []
      const figDir = path.join(t.dir, 'data', 'images', y)
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
        const v = reg[k]
        // 注册值一律是 { src, w, h } 位图描述符（SVG 重绘已于 2026-11 退役）
        if (!v || typeof v !== 'object' || !v.src) {
          r.badSvg.push({ year: y, fig: k, why: '注册值不是 {src,w,h} 位图描述符（旧 svg 字符串残留？重跑 emit）' })
          continue
        }
        if (v.w < 40 || v.h < 40) r.badSvg.push({ year: y, fig: k, why: `位图描述符尺寸可疑：${v.w}x${v.h}` })
        // 描述符的 src 是浏览器真实请求路径，必须在快照目录下真的存在，否则图静默空白（FigBlock 的 v-if 为假）。
        const ref = String(v.src || '')
        if (ref.startsWith('/data/') && !fs.existsSync(path.join(t.dir, ref))) {
          r.missing.push({ file: ref, why: `图 ${y}/${k} 引用的图片在快照里不存在（图会空白）` })
        }
        if (!used.has(k)) r.orphan.push({ year: y, fig: k })
      }

      // 截图到位但没进注册表（忘跑 emit）：页面不报错、只显示老图/空白，smoke/audit 都看不见
      const imgScan = scanImageKeys(path.join(t.dir, 'data', 'images', y))
      for (const k of imgScan.keys) {
        if (!regKeys.includes(k)) r.unregistered.push({ year: y, fig: k, why: 'data/images 里有这张截图，但注册表里没有（先跑 node tools/emit_figures.mjs ' + y + '）' })
      }
      for (const f of imgScan.bad) r.strayImage.push({ file: f, why: '文件名不合规范，未注册（应改名成 <年>-<题号>-<key>.png/.jpg）' })
    }
  }

  if (r.missing.length || r.dangling.length || r.badSvg.length || r.unregistered.length) failed = true
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
  if (r.unregistered.length) {
    console.log(`  ✗ 截图未注册 ${r.unregistered.length}（data/images 里有图，注册表里没有 —— 页面会用老图/空白）`)
    for (const u of r.unregistered) console.log(`    - ${u.year} ${u.fig}  (${u.why})`)
  }
  if (r.strayImage.length) {
    console.log(`  ! 文件名不合规范的截图 ${r.strayImage.length}（不会生效，仅提示）`)
    for (const s of r.strayImage) console.log(`    - ${s.file}  (${s.why})`)
  }
  if (!r.missing.length && !r.dangling.length && !r.badSvg.length && !r.unregistered.length) console.log('  ✓ 资源与图库注册全部对上')
}

console.log(`\n== 结果 ==\n${failed ? '✗ 有问题（见上）' : '✓ 全部通过'}`)
process.exit(failed ? 1 : 0)
