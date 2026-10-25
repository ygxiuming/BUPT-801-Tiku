// 题库数据访问（window.BUPT801 由 index.html 中的数据脚本注入）
export const B = () => window.BUPT801

// 把 answer.js 的答案/解析合并回题目：paper.js 只存真题（题干/选项），
// answer.js 按 <题目id> 存 { answer?, exp?, sol? }，此处加载后就地合并。
// 数据脚本在 <head> 同步加载完毕后才执行本模块，可安全直接合并。
export function hydrateAnswers() {
  const papers = window.BUPT801.papers || {}
  const answers = window.BUPT801.answers || {}
  Object.keys(papers).forEach((y) => {
    const a = answers[y] || {}
    papers[y].questions.forEach((q) => {
      const m = a[q.id]
      if (!m) return
      if (m.answer !== undefined) q.answer = m.answer
      if (m.exp !== undefined) q.exp = m.exp
      if (m.sol !== undefined) q.sol = m.sol
    })
  })
}
hydrateAnswers()

export function papers() { return window.BUPT801.papers }
export function chapters() { return window.BUPT801.chapters }
export function figuresOf(year) { return (window.BUPT801.figures || {})[String(year)] || {} }

export function allQuestions() {
  const out = []
  Object.keys(papers()).forEach((y) => {
    const p = papers()[y]
    p.questions.forEach((q) => out.push({ year: p.year, q, p }))
  })
  return out
}

export function choiceCount(p) { return p.questions.filter((q) => q.type === 'choice').length }
export function bigCount(p) { return p.questions.filter((q) => q.type === 'big').length }

// 组干/题干合成：组干已含空格编号则用组干，否则组干+题干
export function stemOf(item) {
  const q = item.q
  const g = q.group ? item.p.groups[q.group] : null
  const marker = '（' + q.blank + '）'
  if (q.stem) {
    if (g && g.stem && g.stem.indexOf(marker) >= 0) return g.stem
    return (g && g.stem ? g.stem : '') + q.stem
  }
  return g && g.stem ? g.stem : q.stem
}

export function optsOf(item) {
  const q = item.q
  const g = q.group ? item.p.groups[q.group] : null
  if (!g) return q.options || {}
  // 显式指定该空用哪一套选项（2026 起任意组可有多套选项，键名如 options5 / options2829）
  if (q.oKey) return g[q.oKey] || g.options || {}
  if (q.blank === 12) return g.options12 || g.options || {}
  if (q.blank === 13) return g.options13 || g.options || {}
  if (q.blank === 25) return g.options25 || g.options || {}
  if (q.blank === 26) return g.options26 || g.options || {}
  return g.options || {}
}

export function chapterLabel(q) {
  const ch = (chapters() || []).find((c) => c.id === q.chapter)
  return (ch ? ch.name : '') + (q.point ? ' · ' + q.point : '')
}

export function allTags() {
  const set = new Set()
  allQuestions().forEach((it) => (it.q.tags || []).forEach((t) => set.add(t)))
  return Array.from(set).sort()
}

/* ---------- 汇总与便捷查询（视图层用，纯函数） ---------- */

export function totalQuestions() {
  return allQuestions().length
}

export function totalPoints() {
  return (chapters() || []).reduce((s, c) => s + (c.points || []).length, 0)
}

export function findItem(id) {
  return allQuestions().find((it) => it.q.id === id) || null
}

export function paperStat(p) {
  const choice = p.questions.filter((q) => q.type === 'choice')
  const big = p.questions.filter((q) => q.type === 'big')
  return {
    choice: choice.length,
    big: big.length,
    total: p.questions.length,
    choiceScore: choice.reduce((s, q) => s + (q.score || 1), 0),
    bigScore: big.reduce((s, q) => s + (q.score || 0), 0)
  }
}

// 各章题目数（首页「考点覆盖」与统计页复用）
export function chapterCoverage() {
  const map = {}
  allQuestions().forEach((it) => { map[it.q.chapter] = (map[it.q.chapter] || 0) + 1 })
  return (chapters() || []).map((c) => ({
    id: c.id, name: c.name, n: map[c.id] || 0, points: (c.points || []).length
  }))
}

// 题目短标题：选择题 12 / 综合题 三
export function shortTitle(q) {
  return q.type === 'choice' ? '选择题 ' + q.num : '综合题 ' + q.num
}

// 数据串进 v-html 前统一转义：公式里的裸 <（如 $0<r<1$）否则会被浏览器当成标签吞掉
export function escHtml(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function boldBlanks(s) {
  return escHtml(s).replace(/（(\d+)）/g, '（<strong class="blank">$1</strong>）')
}
