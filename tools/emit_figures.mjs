// 图库落盘：生成器输出 / 现有 .svg / 可选截图 → 注册表 _index.js。
// 解析/重建逻辑在 tools/fig_registry.js（server 启动同步与 svg/图片监听共用同一份）。
//
// 存储形态（2026-10-29 定稿：SVG 重绘为主，截图逐张可选覆盖）：
//   data/figures/<年>/*.svg                    矢量图真身（默认画法，唯一维护对象，首行带 figureMeta）
//   data/figures/<年>/_index.js                自动生成的注册表（浏览器/Node 两用，勿手改）
//   data/images/<年>/<年>-<题号>-<key>.png     可选：把这张换成原卷截图（同名 key 优先于 svg）
//   data/images/<年>/answer/*.png              可选：解析配图同上
//   data/images/<年>/_meta.json                可选：{ "<key>": { q, kind, desc } }，键序 = 显示序
//
// 用法：
//   node tools/emit_figures.mjs <年>             重建该年注册表（扫 data/images 截图 + data/figures 历史 svg）
//   node tools/emit_figures.mjs <年> --run-gen   额外先跑 tools/gen_figures_<年>.py 覆盖 .svg（改了生成器才用）
//   node tools/emit_figures.mjs <年> --rebuild   兼容旧写法，等同于默认行为（= 老参数 --from-svg）
//   node tools/emit_figures.mjs --sync-all       全部年份重建（sync/dev 启动用）
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import reg from './fig_registry.js'

const { FIG_RE, META_RE, payloadOf, unescape1, escape1, parseMetaObj, parseSvgFile, svgTextOf, rebuildIndex, readIndexHint } = reg

const root = join(dirname(dirname(fileURLToPath(import.meta.url)))) // 项目根

// 注册表重建结果的一句话汇报：截图命中数必须显式说出来，
// 否则「我把图放进 data/images 了怎么还是老图」会被当成 bug 查半天。
function report(year, r) {
  const bits = [r.count + ' figures']
  if (r.imgs) bits.push('截图 ' + r.imgs + ' 张（data/images）')
  if (r.shots) bits.push('其中 ' + r.shots + ' 张走位图：' + r.shotKeys.join(','))
  if (r.unknown && r.unknown.length) bits.push('⚠ 读不出像素尺寸（已按 1200x800 占位）：' + r.unknown.join(','))
  if (r.badNames && r.badNames.length) {
    bits.push('⚠ 文件名不合规范、未注册（应改名成 <年>-<题号>-<key>.png）：' + r.badNames.join('，'))
  }
  if (r.unused && r.unused.length) bits.push('⚠ assets/ 里没有同名图、未使用：' + r.unused.join(','))
  console.log('rebuilt data/figures/' + year + '/_index.js: ' + bits.join('；') + (r.changed ? '' : '（内容未变，未写盘）'))
}

// —— 主流程（直接执行时才跑；被 import 时只提供上面的解析/重建函数）——
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (isMain) {
  const figRootAll = join(root, 'data', 'figures')
  const imgRootAll = join(root, 'data', 'images')

  // 全部年份 = figures/ ∪ images/ 的 4 位年份目录（新年份可能只有 data/images/）
  const allYears = () => {
    const ys = new Set()
    for (const d of [figRootAll, imgRootAll]) {
      try { for (const y of readdirSync(d)) if (/^\d{4}$/.test(y)) ys.add(y) } catch { /* 目录还没建 */ }
    }
    return [...ys].sort()
  }

  // --sync-all：全部年份重建 _index.js（sync-data.mjs / npm run dev / server 启动时调用）
  if (process.argv.includes('--sync-all')) {
    for (const y of allYears()) {
      const r = rebuildIndex(join(figRootAll, y), y, null)
      if (r.changed) report(y, r)
    }
    console.log('figure registries synced（截图 data/images 优先，无截图回落 .svg）')
  } else {
    const year = process.argv[2] || '2025'
    // 默认**只重建注册表**，不动 .svg：图件默认是 SVG 重绘（+ 可选的逐张截图覆盖），
    // 而生成器会按输出**覆盖**同名 .svg —— Inkscape 手改过的图一跑就没（2021 出过事）。
    // 要由生成器产出/刷新 .svg，显式加 --run-gen（新画一批图时用）。
    const runGen = process.argv.includes('--run-gen')
    const figDir = join(root, 'data', 'figures', year)
    let hint = null

  const genPath = join(root, 'tools', 'gen_figures_' + year + '.py')
  if (runGen && existsSync(genPath)) {
    const out = execFileSync('python3', [genPath], { encoding: 'utf8' })
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
    console.log('⚠ 本次按生成器输出覆盖了 data/figures/' + year + '/*.svg ——'
      + '手改过的图已丢，先 git diff 核对，必要时 git checkout 回滚')
    // 生成器自己的 _index 块带 require 顺序（= FIGS 声明序 = 题号序），拿它当重建顺序
    const idxBlock = Object.entries(files).find(([rel]) => rel.endsWith('_index.js'))
    if (idxBlock) {
      hint = (idxBlock[1].match(/require\("\.\/([^"]+\.js)"\)/g) || [])
        .map((s) => keyByStem[s.replace(/^require\("\.\//, '').replace(/\.js"\)$/, '').replace(/^.*\//, '')])
        .filter(Boolean)
    }
  } else {
    if (runGen) console.log('· 没有 tools/gen_figures_' + year + '.py，只重建注册表（该年靠现有 .svg / 截图）')
    try { hint = readIndexHint(readFileSync(join(figDir, '_index.js'), 'utf8')) } catch { /* 首次生成无旧表 */ }
  }

  const r = rebuildIndex(figDir, year, hint)
  report(year, r)
  }
}

export { FIG_RE, META_RE, payloadOf, unescape1, escape1, parseMetaObj, parseSvgFile, svgTextOf, rebuildIndex, readIndexHint }
