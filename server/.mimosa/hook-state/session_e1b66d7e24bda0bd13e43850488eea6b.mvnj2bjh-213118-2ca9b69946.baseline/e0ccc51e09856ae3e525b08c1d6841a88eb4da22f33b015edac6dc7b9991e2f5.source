// 在 Node 端加载题库数据（数据脚本向 window.BUPT801 挂载）
// 题目：data/questions/<年>/paper.js（真题）+ answer.js（答案解析，按题目 id）
// 图库：data/figures/<年>/ 内单图文件由 _index.js 静态索引（生成器维护）
global.window = global.window || {}
require('../../data/chapters.js')
require('../../data/figures/2025/_index.js')
require('../../data/questions/2025/paper.js')
require('../../data/questions/2025/answer.js')
require('../../data/figures/2026/_index.js')
require('../../data/questions/2026/paper.js')
require('../../data/questions/2026/answer.js')

// 把 answers 合并回题目（与前端 app/src/lib/data.js 的 hydrateAnswers 同逻辑）
const B = global.window.BUPT801
Object.keys(B.answers || {}).forEach((y) => {
  const p = B.papers && B.papers[y]
  if (!p) return
  const a = B.answers[y]
  p.questions.forEach((q) => {
    const m = a[q.id]
    if (!m) return
    if (m.answer !== undefined) q.answer = m.answer
    if (m.exp !== undefined) q.exp = m.exp
    if (m.sol !== undefined) q.sol = m.sol
  })
})

module.exports = { B }
