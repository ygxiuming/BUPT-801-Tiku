#!/usr/bin/env node
/**
 * 格式体检（数据层）：不渲染页面，直接查 paper.js 里的格式缺陷。
 *
 * 查四类问题（都是「页面看着不对」的根因）：
 *   A. 选择题组的题干里必须出现本组每个空的「（n）」全角标记，否则这一空在卷面上没有位置
 *   B. 大题小问必须走 subs 数组、每行以「（n）」开头且编号连续；stem 里不许残留编号小问
 *   C. 选项表必须四选项齐全、选项非空（缺项会让 (B)/(C) 在页面上凭空消失）
 *   D. 图件 viewBox 尺寸（过宽 ⇒ 正文里会被撑到满栏；过窄 ⇒ 字太小）
 *
 * 用法：node tools/check_format.mjs [年…]     不带参数=全部年份
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const require = createRequire(path.join(ROOT, 'package.json'))
// 2012 于 2026-10-29 补入。2013–2015 仍在表外（这三年的数据早于本工具），
// 其中 2013 已查出一处已知缺陷（g10.o20 只有 A/B/C，缺 D），纳入前须先核原卷。
const ALL = [2012, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]
const args = process.argv.slice(2).map(Number).filter(Boolean)
const YEARS = args.length ? args : ALL

global.window = global
for (const y of YEARS) {
  const p = path.join(ROOT, 'data/questions', String(y), 'paper.js')
  const a = path.join(ROOT, 'data/questions', String(y), 'answer.js')
  if (!fs.existsSync(p)) { console.error('缺 paper.js: ' + y); continue }
  require(p)
  if (fs.existsSync(a)) require(a)
  const idx = path.join(ROOT, 'data/figures', String(y), '_index.js')
  if (fs.existsSync(idx)) require(idx)
}

const P = global.BUPT801.papers || {}

let bad = 0
const warn = (y, msg) => { console.log(`  ✗ ${y} ${msg}`); bad++ }

for (const y of YEARS) {
  const p = P[String(y)]
  if (!p) { console.log(`  ! ${y} 未注册`); bad++; continue }
  const ch = p.questions.filter((q) => q.type === 'choice')
  const big = p.questions.filter((q) => q.type === 'big')
  const byGroup = {}
  ch.forEach((q) => { (byGroup[q.group] = byGroup[q.group] || []).push(q) })

  // A. 组干里每个空都要有全角（n）
  for (const [gk, arr] of Object.entries(byGroup)) {
    const g = p.groups[gk]
    if (!g) { warn(y, `选择题 ${gk} 没有对应的 groups 定义`); continue }
    const stem = g.stem || ''
    for (const q of arr) {
      if (!stem.includes('（' + q.blank + '）')) warn(y, `${gk} 组干里找不到空号（${q.blank}）（题 ${q.num}）`)
    }
  }
  // 组定义没被任何题引用
  for (const gk of Object.keys(p.groups || {})) {
    if (!byGroup[gk]) warn(y, `groups.${gk} 没有被任何选择题引用（脏数据）`)
  }
  // C. 选项齐全
  for (const [gk, arr] of Object.entries(byGroup)) {
    const g = p.groups[gk]
    if (!g) continue
    const sets = g.optionSets && g.optionSets.length
      ? g.optionSets.map((k) => [k, g[k]])
      : Object.keys(g).filter((k) => /^options/.test(k)).map((k) => [k, g[k]])
    if (!sets.length && g.options) sets.push(['options', g.options])
    if (!sets.length) { warn(y, `${gk} 没有任何选项`); continue }
    for (const [k, o] of sets) {
      if (!o) { warn(y, `${gk}.${k} 为空`); continue }
      const miss = ['A', 'B', 'C', 'D'].filter((x) => o[x] === undefined || String(o[x]).trim() === '')
      if (miss.length) warn(y, `${gk}.${k} 缺选项 ${miss.join('')}`)
    }
    // 题上 oKey 必须指向组内真实存在的选项集
    for (const q of arr) {
      if (q.oKey && !g[q.oKey]) warn(y, `${q.id} 的 oKey=${q.oKey} 在 ${gk} 里不存在`)
    }
  }

  // B. 大题小问
  for (const q of big) {
    const subs = q.subs || []
    const stem = q.stem || ''
    if (!subs.length) {
      if (/[（(]\s*1\s*[)）]/.test(stem)) warn(y, `大题 ${q.num} 没 subs，但 stem 里挤着编号小问`)
      continue
    }
    // 小问行首编号：全角/半角都认（渲染时 normSubNo 统一成全角），
    // 但编号必须连续（第 k 行是（k））；「1、」这类一级标题单独判。
    let subSeq = 0
    subs.forEach((s, i) => {
      const t = String(s).trim()
      const m = /^[（(]\s*([0-9]+)\s*[)）]\s*/.exec(t)
      if (!m) {
        if (!/^[0-9]+\s*[、.．]/.test(t)) warn(y, `大题 ${q.num} 第 ${i + 1} 行没有编号：${t.slice(0, 26)}`)
        subSeq = 0
        return
      }
      subSeq++
      if (Number(m[1]) !== subSeq) {
        warn(y, `大题 ${q.num} 第 ${i + 1} 行小问编号是（${m[1]}），按顺序应为（${subSeq}）`)
        subSeq = Number(m[1])
      }
      // 去掉行首编号后还以（n）开头、或分号后另起一个编号 → 一行塞了两问
      const body = t.slice(m[0].length)
      if (/^[（(]\s*[0-9]+\s*[)）]/.test(body) || /[；;]\s*[（(]\s*[0-9]{1,2}\s*[)）]/.test(body)) {
        warn(y, `大题 ${q.num} 第 ${i + 1} 行可能塞了两个小问：${body.slice(0, 30)}`)
      }
    })
    // stem 里如果有「（1）」这类编号且 subs 也有，说明重复
    if (/[（(]\s*1\s*[)）]/.test(stem)) warn(y, `大题 ${q.num} stem 与 subs 同时带编号小问（可能重复）`)
  }

  // D. 图件尺寸
  const figs = (global.BUPT801.figures || {})[String(y)] || {}
  for (const [k, s] of Object.entries(figs)) {
    // 注册值两种：'<svg …>'（矢量）或 { src, w, h }（位图替换，assets/<key>.png 优先于 svg）。
    // 位图没有 viewBox 可读，按外壳口径算：图宽+36 × 图高+36（四边 18 留白）。
    const isImg = s && typeof s === 'object'
    const m = isImg ? null
      : /viewBox=['"]([-0-9.]+) ([-0-9.]+) ([-0-9.]+) ([-0-9.]+)['"]/.exec(s)
    if (!isImg && !m) { warn(y, `图 ${k} 没有 viewBox`); continue }
    if (isImg && !(s.src && s.w && s.h)) { warn(y, `图 ${k} 位图描述符不完整（需 src/w/h）`); continue }
    const w = isImg ? +s.w + 36 : +m[3], h = isImg ? +s.h + 36 : +m[4]
    if (w < 180) warn(y, `图 ${k} 只有 ${w}px 宽，正文里会被放大到失真（建议 ≥300）`)
    if (w > 900) console.log(`  · ${y} 图 ${k} ${Math.round(w)}×${Math.round(h)}${isImg ? '（位图）' : ''}（正文按 680px 显示，点击可放大）`)
  }
  console.log(`  ${y}: 选择题 ${ch.length} 空 / ${Object.keys(byGroup).length} 组，大题 ${big.length} 题，图 ${Object.keys(figs).length} 张`)
}
console.log(bad ? `\n共 ${bad} 处格式问题` : '\n格式检查通过')
process.exit(bad ? 1 : 0)
