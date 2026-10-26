// 图库落盘：gen_figures_<年>.py 的 ###FILE: 输出 → 单图 .svg 真身 + 每年一个注册文件 _index.js。
//
// 存储形态（2026-10-26 定稿）：
//   data/figures/<年>/<年>-<题号>-<key>.svg   单图真身：<!-- figureMeta {"key":...,...} --> + <svg>…
//   data/figures/<年>/answer/*.svg            解析配图，同上
//   data/figures/<年>/_index.js               自动生成的注册表（浏览器/Node 两用，勿手改）
//
// 用法：
//   node tools/emit_figures.mjs <年>             跑生成器 → 写 .svg → 重建 _index.js
//   node tools/emit_figures.mjs <年> --from-svg  不跑生成器，直接由现有 .svg 重建 _index.js（手改 svg 后用）
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(dirname(fileURLToPath(import.meta.url)))) // 项目根

// —— 生成器输出的 .js 块解析（格式由生成器保证，全仓统一；embed 工具产物是双引号，兼容两种）——
const FIG_RE = /\(window\.BUPT801\.figures\["(\d{4})"\][^)]*\)\.([A-Za-z0-9_]+) = ('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*");/s
// fig[3] 带首尾引号（单/双两种包裹都在组里），用 payloadOf 剥壳后再反转义
function payloadOf(quoted) {
  return unescape1(quoted.slice(1, -1))
}
const META_RE = /\(window\.BUPT801\.figureMeta\["(\d{4})"\][^)]*\)\.([A-Za-z0-9_]+) = (\{[^}]*\});/s

function unescape1(s) {
  // 单/双引号 JS 字符串字面量 → 原文。要认全转义：\' \\ \" \uXXXX \u{...} \xXX \n \t 等，
  // 否则像 2016 a11trellis 里的 \u3000（全角空格）会被啃成 u3000。
  return s.replace(/\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[\s\S])/g, (_, e) => {
    if (e[0] === 'u' || e[0] === 'x') {
      const hex = e[0] === 'u' && e[1] === '{' ? e.slice(2, -1) : e.slice(1)
      const cp = parseInt(hex, 16)
      return cp > 0xffff ? String.fromCodePoint(cp) : String.fromCharCode(cp)
    }
    const map = { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', v: '\v', '0': '\0' }
    return Object.prototype.hasOwnProperty.call(map, e) ? map[e] : e
  })
}

function escape1(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

// 从生成器 .js 块里抠出 meta 三字段（q/kind/desc 都是 "..." 字面量）
function parseMetaObj(literal) {
  const get = (k) => {
    const m = literal.match(new RegExp(k + ':\\s*"([^"]*)"'))
    if (!m) throw new Error('meta 缺字段 ' + k + '：' + literal)
    return m[1]
  }
  return { q: get('q'), kind: get('kind'), desc: get('desc') }
}

// .svg 真身的 meta 注释 ↔ 注册表重建
const META_COMMENT_RE = /^<!--\s*figureMeta\s+([\s\S]*?)\s*-->\s*([\s\S]*)$/

function parseSvgFile(text, rel) {
  const m = text.match(META_COMMENT_RE)
  if (!m) throw new Error(rel + ' 缺 figureMeta 注释（首行应为 <!-- figureMeta {...} -->）')
  const meta = JSON.parse(m[1])
  if (!meta.key) throw new Error(rel + ' figureMeta 注释缺 key')
  return { meta, svg: m[2].trim() }
}

function svgTextOf(meta, svg) {
  return '<!-- figureMeta ' + JSON.stringify(meta) + ' -->\n' + svg.trim() + '\n'
}

// 扫描年目录全部 .svg 重建 _index.js。orderHint 是 key 的期望顺序（来自生成器 _index 块或
// 现有 _index.js 的 require 顺序）——图库页按注册顺序显示，必须跟着题号走，不能按文件名排。
function rebuildIndex(figDir, year, orderHint) {
  const items = []
  const addDir = (dir, sub) => {
    for (const name of readdirSync(dir).sort()) {
      if (!name.endsWith('.svg')) continue
      const rel = sub ? sub + '/' + name : name
      const parsed = parseSvgFile(readFileSync(join(dir, name), 'utf8'), 'figures/' + year + '/' + rel)
      parsed.file = rel
      items.push(parsed)
    }
  }
  addDir(figDir, '')
  const ansDir = join(figDir, 'answer')
  let hasAns = false
  try { readdirSync(ansDir); hasAns = true } catch { /* 无 answer/ 目录 */ }
  if (hasAns) addDir(ansDir, 'answer')

  const hint = orderHint || []
  const rank = (it) => {
    const i = hint.indexOf(it.meta.key)
    return i === -1 ? hint.length + 1000 + items.indexOf(it) : i
  }
  items.sort((a, b) => rank(a) - rank(b))

  const lines = [
    '// ' + year + ' 图库注册表 —— 由 tools/emit_figures.mjs 自动生成；源文件是本目录（含 answer/）的 *.svg，勿手改',
    'window.BUPT801 = window.BUPT801 || {};',
    'window.BUPT801.figures = window.BUPT801.figures || {};',
    'window.BUPT801.figureMeta = window.BUPT801.figureMeta || {};',
    '',
  ]
  for (const it of items) {
    lines.push('(window.BUPT801.figures["' + year + '"] = window.BUPT801.figures["' + year + '"] || {}).' +
      it.meta.key + " = '" + escape1(it.svg) + "';")
  }
  lines.push('')
  for (const it of items) {
    lines.push('(window.BUPT801.figureMeta["' + year + '"] = window.BUPT801.figureMeta["' + year + '"] || {}).' +
      it.meta.key + ' = { q: ' + JSON.stringify(it.meta.q) + ', kind: ' + JSON.stringify(it.meta.kind) +
      ', desc: ' + JSON.stringify(it.meta.desc) + ' };')
  }
  writeFileSync(join(figDir, '_index.js'), lines.join('\n') + '\n')
  return items.length
}

// —— 主流程（直接执行时才跑；被 import 时只提供上面的解析/重建函数）——
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

// 从一个 _index.js 文本里按注册出现顺序取 key（--from-svg / 迁移时保序用）
function readIndexHint(text) {
  const keys = []
  for (const m of text.matchAll(/figures\["\d{4}"\][^=]*?\.([A-Za-z0-9_]+)\s*=/g)) keys.push(m[1])
  return keys
}

if (isMain) {
  const year = process.argv[2] || '2025'
  const fromSvg = process.argv.includes('--from-svg')
  const figDir = join(root, 'data', 'figures', year)
  let hint = null

  if (!fromSvg) {
    const out = execFileSync('python3', [join(root, 'tools', 'gen_figures_' + year + '.py')], { encoding: 'utf8' })
    const files = {}
    let cur = null
    const buf = []
    for (const line of out.split('\n')) {
      const m = line.match(/^###FILE:(.+)$/)
      if (m) {
        if (cur) files[cur] = buf.join('\n')
        cur = m[1]
        buf.length = 0
      } else if (cur !== null) {
        buf.push(line)
      }
    }
    if (cur) files[cur] = buf.join('\n')

    let n = 0
    const keyByStem = {} // 文件名 stem -> key（供顺序提示用）
    for (const [rel, content] of Object.entries(files)) {
      if (rel.endsWith('_index.js')) continue // 旧索引入口已废弃，_index.js 由 rebuildIndex 重建
      const fig = content.match(FIG_RE)
      const meta = content.match(META_RE)
      if (!fig || !meta || fig[2] !== meta[2]) throw new Error('无法解析生成器输出块：' + rel)
      const metaObj = { key: meta[2], ...parseMetaObj(meta[3]) }
      keyByStem[rel.replace(/^.*\//, '').replace(/\.js$/, '')] = metaObj.key
      const dst = join(root, rel.replace(/\.js$/, '.svg'))
      mkdirSync(dirname(dst), { recursive: true })
      writeFileSync(dst, svgTextOf(metaObj, payloadOf(fig[3])))
      n++
    }
    console.log('wrote ' + n + ' .svg for ' + year)
    // 生成器自己的 _index 块带 require 顺序（= FIGS 声明序 = 题号序），拿它当重建顺序
    const idxBlock = Object.entries(files).find(([rel]) => rel.endsWith('_index.js'))
    if (idxBlock) {
      hint = (idxBlock[1].match(/require\("\.\/([^"]+\.js)"\)/g) || [])
        .map((s) => keyByStem[s.replace(/^require\("\.\//, '').replace(/\.js"\)$/, '').replace(/^.*\//, '')])
        .filter(Boolean)
    }
  } else {
    try { hint = readIndexHint(readFileSync(join(figDir, '_index.js'), 'utf8')) } catch { /* 首次生成无旧表 */ }
  }

  const count = rebuildIndex(figDir, year, hint)
  console.log('rebuilt data/figures/' + year + '/_index.js: ' + count + ' figures')
}

export { FIG_RE, META_RE, payloadOf, unescape1, escape1, parseMetaObj, parseSvgFile, svgTextOf, rebuildIndex, readIndexHint }

