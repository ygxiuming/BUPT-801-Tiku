// 同步题库数据与 KaTeX 到 vite public 目录（开发快照；vite dev 用）
// 生产（server）通过 /data 实时映射项目 data/ 目录：改数据/图文件后刷新即生效，无需重新构建。
import { cpSync, existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url))) // app/
const proj = join(root, '..')                                // 项目根
const pub = join(root, 'public')

mkdirSync(join(pub, 'data'), { recursive: true })
mkdirSync(join(pub, 'vendor'), { recursive: true })

// data/ → public/data 逐文件拷贝（页面按单文件 <script> 引用）。
// _ 前缀文件（如 figures/<年>/_index.js 是 Node 端索引）不进浏览器，跳过。
function copyAll(srcDir, dstDir) {
  mkdirSync(dstDir, { recursive: true })
  for (const name of readdirSync(srcDir)) {
    const src = join(srcDir, name)
    const dst = join(dstDir, name)
    if (statSync(src).isDirectory()) copyAll(src, dst)
    else if (name.endsWith('.js') && !name.startsWith('_')) copyFileSync(src, dst)
  }
}
copyFileSync(join(proj, 'data', 'chapters.js'), join(pub, 'data', 'chapters.js'))
copyAll(join(proj, 'data', 'figures'), join(pub, 'data', 'figures'))
copyAll(join(proj, 'data', 'questions'), join(pub, 'data', 'questions'))

// KaTeX（单一来源：server 的 npm 依赖，版本锁定 0.16.11）
const katexSrc = join(proj, 'server', 'node_modules', 'katex', 'dist')
const katexDst = join(pub, 'vendor', 'katex')
if (!existsSync(katexSrc)) { console.error('缺少 server/node_modules/katex，请先在 server/ 下 npm install'); process.exit(1) }
cpSync(katexSrc, katexDst, { recursive: true })

console.log('sync done: public/data（单文件引用，无合并 bundle）+ public/vendor/katex')
