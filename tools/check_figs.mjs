// 图库自检：扫描 data/figures/ 全部 .svg，检查 figureMeta 注释是否有效、占位符是否残留、
// 题目引用的 key 是否都能解析，并真实加载各年 _index.js（emit 自动生成的注册表）。
// 手改图后跑一次：node tools/check_figs.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(dirname(fileURLToPath(import.meta.url)))) // 项目根
const figRoot = join(root, 'data', 'figures')

const problems = []
const registry = {} // key -> [文件...]

function walk(dir) {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) { walk(p); continue }
    if (!name.endsWith('.svg') || name.startsWith('_')) continue // _ 前缀 = 备份/草稿，不注册
    const src = readFileSync(p, 'utf8')
    const rel = p.replace(root + '/', '')
    // 占位符残留（AI 模板常见坑）
    for (const bad of ['"YEAR"', '.FIGURE_NAME', '`${']) {
      if (src.includes(bad)) problems.push(`${rel}: 残留占位符 ${bad}（年份/key 没替换成真实值）`)
    }
    // figureMeta 注释必须出现在 <svg 之前（Inkscape 存盘会在最前插 xml 声明，不锁首行）
    const ci = src.indexOf('<!-- figureMeta')
    const si = src.indexOf('<svg')
    if (ci === -1 || si === -1 || ci > si) {
      problems.push(`${rel}: <svg 之前缺 <!-- figureMeta {...} --> 注释，emit 无法注册`)
      continue
    }
    const m = src.slice(ci).match(/^<!--\s*figureMeta\s+([\s\S]*?)\s*-->/)
    try {
      const meta = JSON.parse(m[1])
      if (!meta.key) throw new Error('缺 key')
      if (!/^[A-Za-z0-9_]+$/.test(meta.key)) throw new Error('key 含非法字符：' + meta.key)
      if (!/^\s*<svg\b/i.test(src.slice(si))) throw new Error('注释后不是 <svg 开头')
      registry[meta.key] = registry[meta.key] || []
      registry[meta.key].push(rel)
    } catch (e) {
      problems.push(`${rel}: figureMeta 注释有问题：${e.message}`)
    }
  }
}
walk(figRoot)

// 题目引用检查：paper.js / answer.js 里 fig: "key" 是否都能在注册表找到
const qRoot = join(root, 'data', 'questions')
for (const y of readdirSync(qRoot)) {
  const dir = join(qRoot, y)
  if (!statSync(dir).isDirectory()) continue
  for (const f of ['paper.js', 'answer.js']) {
    const src = readFileSync(join(dir, f), 'utf8')
    for (const m of src.matchAll(/"fig":\s*"([A-Za-z0-9_]+)"/g)) {
      if (!registry[m[1]]) problems.push(`${y}/${f}: 题目引用 fig:"${m[1]}" 在图库中找不到注册`)
    }
  }
}

// Node 端真实加载验证（语法有效性）
const g = { window: { BUPT801: {} } }
global.window = g.window
try {
  const { createRequire } = await import('node:module')
  const req = createRequire(import.meta.url)
  for (const y of readdirSync(figRoot)) {
    const dir = join(figRoot, y)
    // 跳过 data/figures/ 下的散文件（如 _TEMPLATE.md），否则 statSync(_TEMPLATE.md/_index.js) 会抛 ENOTDIR
    try { if (!statSync(dir).isDirectory()) continue } catch { continue }
    const idx = join(dir, '_index.js')
    try { if (statSync(idx).isFile()) req(idx) } catch (e) { problems.push(`figures/${y}/_index.js 加载失败: ${e.message}`) }
  }
} catch (e) { /* ignore */ }

console.log('注册的图 key:', Object.keys(registry).sort().join(', ') || '(无)')
if (problems.length) {
  console.log('\n发现 ' + problems.length + ' 个问题:')
  problems.forEach((p) => console.log('  ✗', p))
  process.exit(1)
} else {
  console.log('\n✓ 图库自检通过')
}
