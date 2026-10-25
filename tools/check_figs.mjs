// 图库自检：扫描 data/figures/ 全部 .js，检查注册语句是否有效、占位符是否残留、
// 题目引用的 key 是否都能解析。手改图后跑一次：node tools/check_figs.mjs
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
    if (!name.endsWith('.js') || name.startsWith('_')) continue
    const src = readFileSync(p, 'utf8')
    const rel = p.replace(root + '/', '')
    // 占位符残留（AI 模板常见坑）
    for (const bad of ['"YEAR"', '.FIGURE_NAME', '题号', '`${']) {
      if (src.includes(bad)) problems.push(`${rel}: 残留占位符 ${bad}（年份/key 没替换成真实值）`)
    }
    // 反引号必须成对
    if ((src.match(/`/g) || []).length % 2 !== 0) problems.push(`${rel}: 反引号不成对，JS 语法错误`)
    // 收集注册的 key
    for (const m of src.matchAll(/\.figures\["(\d{4)"\][^=]*\.([A-Za-z0-9_]+)\s*=/g)) {
      // 上面正则不捕获（引号写法），换一种宽松匹配：
    }
    for (const m of src.matchAll(/figures\[.(\d{4}).\][^=]*?\.([A-Za-z0-9_]+)\s*=/g)) {
      registry[m[2]] = registry[m[2]] || []
      registry[m[2]].push(rel)
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
