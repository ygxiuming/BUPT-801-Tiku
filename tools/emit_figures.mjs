// 图库落盘：扫描 data/images/<年>/** 位图 → 注册表 _index.js。
// 解析/重建逻辑在 tools/fig_registry.js（server 启动同步与图片变更监听共用同一份）。
//
// 存储形态（2026-11 定稿：图件只有位图，SVG 重绘已退役）：
//   data/images/<年>/<年>-<题号>-<key>.png          题图（唯一维护对象）
//   data/images/<年>/answer/<年>-<题号>-<key>.png   解析配图
//   data/images/<年>/_meta.json                    可选：{ "<key>": { q, kind, desc } }，键序 = 显示序
//   data/images/<年>/_index.js                     自动生成的注册表（浏览器/Node 两用，勿手改）
//
// 用法：
//   node tools/emit_figures.mjs <年>       重建该年注册表
//   node tools/emit_figures.mjs --sync-all 全部年份重建（sync/dev/server 启动用）
import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import reg from './fig_registry.js'

const { rebuildIndex, readIndexHint } = reg

const root = join(dirname(dirname(fileURLToPath(import.meta.url)))) // 项目根

// 注册表重建结果的一句话汇报：张数/文件名不合规/尺寸未知都要显式说出来，
// 否则「我把图放进 data/images 了怎么页面还是没图」会被当成 bug 查半天。
function report(year, r) {
  const bits = [r.count + ' figures']
  if (r.imgs) bits.push('位图 ' + r.imgs + ' 张（data/images）')
  if (r.unknown && r.unknown.length) bits.push('⚠ 读不出像素尺寸（已按 1200x800 占位）：' + r.unknown.join(','))
  if (r.badNames && r.badNames.length) {
    bits.push('⚠ 文件名不合规范、未注册（应改名成 <年>-<题号>-<key>.png）：' + r.badNames.join('，'))
  }
  console.log('rebuilt data/images/' + year + '/_index.js: ' + bits.join('；') + (r.changed ? '' : '（内容未变，未写盘）'))
}

// —— 主流程（直接执行时才跑；被 import 时只提供上面的重建函数）——
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (isMain) {
  const imgRootAll = join(root, 'data', 'images')

  // 全部年份 = data/images/ 的 4 位年份目录
  const allYears = () => {
    const ys = new Set()
    try { for (const y of readdirSync(imgRootAll)) if (/^\d{4}$/.test(y)) ys.add(y) } catch { /* 目录还没建 */ }
    return [...ys].sort()
  }

  // --sync-all：全部年份重建 _index.js（sync-data.mjs / npm run dev / server 启动时调用）
  if (process.argv.includes('--sync-all')) {
    for (const y of allYears()) {
      const r = rebuildIndex(join(imgRootAll, y), y, null)
      if (r.changed) report(y, r)
    }
    console.log('figure registries synced（源：data/images/<年>/** 位图）')
  } else {
    const year = process.argv[2] || '2025'
    let hint = null
    try { hint = readIndexHint(readFileSync(join(imgRootAll, year, '_index.js'), 'utf8')) } catch { /* 首次生成无旧表 */ }
    const r = rebuildIndex(join(imgRootAll, year), year, hint)
    report(year, r)
  }
}

export { rebuildIndex, readIndexHint }
