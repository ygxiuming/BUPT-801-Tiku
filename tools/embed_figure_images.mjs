// 把扫描原图（位图）嵌进图库 —— 用于"直接显示原卷图片"的题（2018 选择17 眼图）。
// 产出 data/figures/<年>/<年>-<题号>-<key>.svg（真身，首行带 figureMeta 注释），随后
// 自动重建该年 _index.js 注册表（同 emit --from-svg）。
// 用法：node tools/embed_figure_images.mjs [年份]
import { readFileSync, writeFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { svgTextOf, rebuildIndex, readIndexHint } from './emit_figures.mjs'

const root = join(dirname(dirname(fileURLToPath(import.meta.url))))
const year = process.argv[2] || '2018'

// 图片题登记：year / key / 题号（用于文件名与元信息）/ 描述 / 资产路径
//   dir  : 'answer' 表示解析配图（放 answer/ 子目录），缺省为试卷题图
//   kind : 缺省 'paper'
const IMAGES = [
  {
    year: '2018',
    key: 'q17eye',
    no: '十七',
    desc: '眼图四幅（选择17，原卷扫描图）',
    src: `data/figures/2018/assets/q17eye.png`
  },
  {
    year: '2021',
    key: 'q7enc',
    no: '七',
    dir: 'answer',
    kind: 'answer',
    desc: '(3,1,4) 卷积码编码器框图（原卷图，位图）',
    src: `data/figures/2021/assets/q7enc.png`
  }
]

const PAD = 18 // 与 svgkit.PAD 一致：四边各留 18px，图不贴边

for (const it of IMAGES.filter((x) => !x.year || x.year === year)) {
  const file = join(root, it.src)
  // PNG 宽高从 IHDR 读（偏移 16..24，大端）
  const buf = readFileSync(file)
  const w = buf.readUInt32BE(16)
  const h = buf.readUInt32BE(20)
  // 位图下发方式：默认**外链** —— 外壳 svg 只留几百字节，_index.js 不会被 base64 撑大
  // （2018 眼图最初是 base64 内联，单张就让当年注册表从 60 kB 涨到 230 kB）。
  // 前提：png 必须落在 data/figures/<年>/assets/ 下，sync-data.mjs 会把位图拷进 public/dist 快照；
  // 想单文件自包含（不走快照）时给条目加 inline: true。
  const useInline = it.inline === true
  if (!useInline && !/^data\/figures\/[^/]+\/assets\/[^/]+$/.test(it.src)) {
    throw new Error('外链位图必须放在 data/figures/<年>/assets/ 下：' + it.src)
  }
  // 只用 xlink:href：浏览器（含 HTML 解析进 v-html）与 cairosvg 都认，写两个会让文件翻倍
  const uri = useInline
    ? 'data:image/png;base64,' + buf.toString('base64')
    : '/data/' + it.src.replace(/^data\//, '')
  const svg = "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 " +
    (w + 2 * PAD) + ' ' + (h + 2 * PAD) + "' font-size='14'><image x='" + PAD + "' y='" + PAD +
    "' width='" + w + "' height='" + h + "' xlink:href='" + uri + "'/></svg>"
  const sub = it.dir ? it.dir + '/' : ''
  const rel = `data/figures/${year}/${sub}${year}-${it.no}-${it.key}.svg`
  const dst = join(root, rel)
  writeFileSync(dst, svgTextOf({ key: it.key, q: `题${it.no}`, kind: it.kind || 'paper', desc: it.desc }, svg))
  // 保序重建：现有 _index.js 的注册序（= 生成器 FIGS 声明序）不能被文件名排序打乱
  let hint = null
  const idxPath = join(root, 'data', 'figures', year, '_index.js')
  try { hint = readIndexHint(readFileSync(idxPath, 'utf8')) } catch { /* 首次无旧表 */ }
  const n = rebuildIndex(join(root, 'data', 'figures', year), year, hint)
  const kb = statSync(dst).size
  console.log('embedded ' + rel + '  (' + w + 'x' + h + ', ' + (kb < 1024 ? kb + ' B' : Math.round(kb / 1024) + ' kB') + ')；_index.js 重建（' + n.count + ' 项）')
}
