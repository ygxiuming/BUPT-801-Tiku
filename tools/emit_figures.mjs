// 把 gen_figures_<年>.py 的 ###FILE: 分隔输出落盘到 data/figures/<年>/
// 用法：node tools/emit_figures.mjs [年份]（默认 2025）
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(dirname(fileURLToPath(import.meta.url)))) // 项目根
const year = process.argv[2] || '2025'
const out = execFileSync('python3', [join(root, 'tools', 'gen_figures_' + year + '.py')], { encoding: 'utf8' })

const files = {}
let cur = null
let buf = []
for (const line of out.split('\n')) {
  const m = line.match(/^###FILE:(.+)$/)
  if (m) {
    if (cur) files[cur] = buf.join('\n') + '\n'
    cur = m[1]
    buf = []
  } else if (cur !== null) {
    buf.push(line)
  }
}
if (cur !== null) files[cur] = buf.join('\n') + '\n'

let n = 0
for (const [rel, content] of Object.entries(files)) {
  const dst = join(root, rel)
  mkdirSync(dirname(dst), { recursive: true })
  writeFileSync(dst, content)
  n++
}
console.log('emitted ' + n + ' figure files for ' + year)
