// 把扫描原图（位图）嵌进图库 —— 用于"直接显示原卷图片"的题（2018 选择17 眼图）。
// 产出与 gen_figures_<年>.py 同格式的 data/figures/<年>/<年>-<题号>-<key>.js，
// 唯一区别是 SVG 里放一个 <image>（base64 内联，PDF 导出与离线访问都不依赖外部文件）。
// 用法：node tools/embed_figure_images.mjs [年份]
import { readFileSync, writeFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(dirname(fileURLToPath(import.meta.url))))
const year = process.argv[2] || '2018'

// 图片题登记：key / 题号（用于文件名与元信息）/ 描述 / 资产路径
const IMAGES = [
  {
    key: 'q17eye',
    no: '十七',
    desc: '眼图四幅（选择17，原卷扫描图）',
    src: `data/figures/${year}/assets/q17eye.png`
  }
]

const PAD = 18 // 与 svgkit.PAD 一致：四边各留 18px，图不贴边

for (const it of IMAGES) {
  const file = join(root, it.src)
  const b64 = readFileSync(file).toString('base64')
  // PNG 宽高从 IHDR 读（偏移 16..24，大端）
  const buf = readFileSync(file)
  const w = buf.readUInt32BE(16)
  const h = buf.readUInt32BE(20)
  // 只用 xlink:href：浏览器（含 HTML 解析进 v-html）与 cairosvg 都认，写两个会让文件翻倍
  const uri = 'data:image/png;base64,' + b64
  const svg = "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 " +
    (w + 2 * PAD) + ' ' + (h + 2 * PAD) + "' font-size='14'><image x='" + PAD + "' y='" + PAD +
    "' width='" + w + "' height='" + h + "' xlink:href='" + uri + "'/></svg>"
  const rel = `data/figures/${year}/${year}-${it.no}-${it.key}.js`
  const body = [
    `// ${year} · 题${it.no} 题目原图 · ${it.desc} —— 由 tools/embed_figure_images.mjs 生成，勿手改`,
    'window.BUPT801 = window.BUPT801 || {};',
    'window.BUPT801.figures = window.BUPT801.figures || {};',
    `(window.BUPT801.figures["${year}"] = window.BUPT801.figures["${year}"] || {}).${it.key} = ${JSON.stringify(svg)};`,
    'window.BUPT801.figureMeta = window.BUPT801.figureMeta || {};',
    `(window.BUPT801.figureMeta["${year}"] = window.BUPT801.figureMeta["${year}"] || {}).${it.key} = ` +
      `{ q: "题${it.no}", kind: "paper", desc: ${JSON.stringify(it.desc)} };`,
    ''
  ].join('\n')
  writeFileSync(join(root, rel), body)
  console.log('embedded ' + rel + '  (' + w + 'x' + h + ', ' + Math.round(statSync(join(root, rel)).size / 1024) + ' kB)')
}
