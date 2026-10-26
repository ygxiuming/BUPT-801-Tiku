// 一次性迁移（2026-10-26）：data/figures/<年>/**/*.js 单图注册文件 → *.svg 真身 + 重建 _index.js。
// 从磁盘现有 .js 转换（不重跑生成器），保证与迁移前字节级等价；转换成功后才删旧 .js。
// 之后新图一律走 node tools/emit_figures.mjs <年>；手改 svg 后用 --from-svg 重建注册表。
// 用法：node tools/migrate_figures_js2svg.mjs [年...]（缺省全部年份）
import { readdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FIG_RE, META_RE, parseMetaObj, payloadOf, svgTextOf, rebuildIndex, readIndexHint } from './emit_figures.mjs'

const root = join(dirname(dirname(fileURLToPath(import.meta.url))))
const figRoot = join(root, 'data', 'figures')

const YEARS = readdirSync(figRoot).filter((y) => /^\d{4}$/.test(y)).sort()
  .filter((y) => !process.argv.slice(2).length || process.argv.slice(2).includes(y))

let converted = 0
const toDelete = []
for (const year of YEARS) {
  const dirs = [join(figRoot, year), join(figRoot, year, 'answer')]
  const pairs = []
  for (const dir of dirs) {
    let names = []
    try { names = readdirSync(dir).sort() } catch { continue }
    for (const name of names) {
      if (!name.endsWith('.js') || name.startsWith('_')) continue
      const content = readFileSync(join(dir, name), 'utf8')
      const fig = content.match(FIG_RE)
      const meta = content.match(META_RE)
      if (!fig || !meta || fig[2] !== meta[2]) throw new Error('无法解析：' + join(dir, name))
      const metaObj = { key: meta[2], ...parseMetaObj(meta[3]) }
      pairs.push({ js: join(dir, name), svgPath: join(dir, name.replace(/\.js$/, '.svg')),
                   key: metaObj.key, text: svgTextOf(metaObj, payloadOf(fig[3])) })
    }
  }
  for (const p of pairs) writeFileSync(p.svgPath, p.text)
  for (const p of pairs) toDelete.push(p.js)
  // 顺序提示：旧 _index.js 的 require 顺序 = 生成器 FIGS 声明序 = 题号序，必须保留
  let hint = null
  try {
    const keyByStem = {}
    for (const p of pairs) keyByStem[p.js.replace(/^.*\//, '').replace(/\.js$/, '')] = p.key
    hint = (readFileSync(join(figRoot, year, '_index.js'), 'utf8')
      .match(/require\(['"]\.\/([^'"]+\.js)['"]\)/g) || [])
      .map((s) => keyByStem[s.replace(/^require\(['"]\.\//, '').replace(/\.js['"]\)$/, '').replace(/^.*\//, '')])
      .filter(Boolean)
  } catch { /* 无旧表 */ }
  const n = rebuildIndex(join(figRoot, year), year, hint)
  converted += pairs.length
  console.log(year + ': ' + pairs.length + ' 图转 .svg，_index.js 重建（' + n + ' 项）')
}

for (const js of toDelete) unlinkSync(js)
console.log('迁移完成：' + converted + ' 个 .js → .svg，已删除旧文件')
