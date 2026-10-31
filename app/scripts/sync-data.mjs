// 同步题库数据与 KaTeX 到 vite public 目录（开发快照；vite dev 用）
// 生产（server）通过 /data 实时映射项目 data/ 目录：改数据/图文件后刷新即生效，无需重新构建。
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, copyFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url))) // app/
const proj = join(root, '..')                                // 项目根
const pub = join(root, 'public')

// 图库注册表全盘重建：data/images/<年>/** 位图 → _index.js（自动生成）。
// npm run dev 每次启动都走这里（用户要求：启动服务就全盘重建一次），生产 3000 的
// 对称修复在 server/index.js 启动同步 + 目录监听。放新截图后重启 dev 或跑
// node tools/emit_figures.mjs <年> 都能生效。失败只告警，不阻塞快照。
const emitAll = spawnSync('node', [join(proj, 'tools', 'emit_figures.mjs'), '--sync-all'],
  { cwd: proj, encoding: 'utf8' })
if (emitAll.status !== 0) console.error('图库注册表重建失败（沿用上次的 _index.js）：' + (emitAll.stderr || '').trim())
else if (emitAll.stdout.trim()) console.log(emitAll.stdout.trim())

mkdirSync(join(pub, 'data'), { recursive: true })
mkdirSync(join(pub, 'vendor'), { recursive: true })

// data/ → public/data 逐文件镜像（页面按单文件 <script> 引用）。
// **图库主链路是 data/images/<年>/****：位图（真实请求路径 `/data/images/…`）与自动生成的
// 注册表 `_index.js` 都必须下发，缺一张就等于那张图空白。镜像式清理：源里已删除的文件
// 同步从 public 移除，防老版本残留。
const RASTER_RE = /\.(png|jpe?g|webp|gif|bmp)$/i
function copyAll(srcDir, dstDir) {
  if (!existsSync(srcDir)) { rmSync(dstDir, { recursive: true, force: true }); return } // 源目录整个没了 = 快照也别留
  mkdirSync(dstDir, { recursive: true })
  const srcNames = readdirSync(srcDir)
  const kept = new Set()
  for (const name of srcNames) {
    const src = join(srcDir, name)
    const dst = join(dstDir, name)
    if (statSync(src).isDirectory()) { kept.add(name); copyAll(src, dst) }
    else if (RASTER_RE.test(name)) { kept.add(name); copyFileSync(src, dst) }
    else if (name.endsWith('.js') && (!name.startsWith('_') || name === '_index.js')) { kept.add(name); copyFileSync(src, dst) }
  }
  // dst 里不在保留集合的一律清掉（旧格式残留、被过滤的文件类型、已删除的数据）
  for (const name of readdirSync(dstDir)) {
    if (!kept.has(name)) rmSync(join(dstDir, name), { recursive: true, force: true })
  }
}
copyFileSync(join(proj, 'data', 'chapters.js'), join(pub, 'data', 'chapters.js'))
copyAll(join(proj, 'data', 'images'), join(pub, 'data', 'images'))
copyAll(join(proj, 'data', 'questions'), join(pub, 'data', 'questions'))

// KaTeX（单一来源：server 的 npm 依赖，版本锁定 0.16.11）
const katexSrc = join(proj, 'server', 'node_modules', 'katex', 'dist')
const katexDst = join(pub, 'vendor', 'katex')
if (!existsSync(katexSrc)) { console.error('缺少 server/node_modules/katex，请先在 server/ 下 npm install'); process.exit(1) }
cpSync(katexSrc, katexDst, { recursive: true })

console.log('sync done: public/data（单文件引用，无合并 bundle）+ public/vendor/katex')
