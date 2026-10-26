// 图库落盘：gen_figures_<年>.py 的 ###FILE: 输出 → 单图 .svg 真身 + 每年一个注册文件 _index.js。
// 解析/重建逻辑在 tools/fig_registry.js（server 启动同步与 svg 监听共用同一份）。
//
// 存储形态（2026-10-26 定稿）：
//   data/figures/<年>/<年>-<题号>-<key>.svg   单图真身：<!-- figureMeta {"key":...,...} --> + <svg>…
//   data/figures/<年>/answer/*.svg            解析配图，同上
//   data/figures/<年>/_index.js               自动生成的注册表（浏览器/Node 两用，勿手改；
//                                             server 在跑时改 .svg 存盘即自动重建）
//
// 用法：
//   node tools/emit_figures.mjs <年>             跑生成器 → 写 .svg → 重建 _index.js
//   node tools/emit_figures.mjs <年> --from-svg  不跑生成器，直接由现有 .svg 重建 _index.js（保序）
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import reg from './fig_registry.js'

const { FIG_RE, META_RE, payloadOf, unescape1, escape1, parseMetaObj, parseSvgFile, svgTextOf, rebuildIndex, readIndexHint } = reg

const root = join(dirname(dirname(fileURLToPath(import.meta.url)))) // 项目根

// —— 主流程（直接执行时才跑；被 import 时只提供上面的解析/重建函数）——
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

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

  const r = rebuildIndex(figDir, year, hint)
  console.log('rebuilt data/figures/' + year + '/_index.js: ' + r.count + ' figures' + (r.changed ? '' : '（内容未变，未写盘）'))
}

export { FIG_RE, META_RE, payloadOf, unescape1, escape1, parseMetaObj, parseSvgFile, svgTextOf, rebuildIndex, readIndexHint }
