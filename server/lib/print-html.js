// 打印/排版 HTML 构建：统一真题版式，服务端预渲染 KaTeX 公式与 SVG
const path = require('path')
const { B } = require('./print-html-data.js')
const { renderMathInString } = require('./tex.js')
const { buildInlineCss } = require('./inline-css.js')

const HAN = ['二', '三', '四', '五', '六', '七', '八', '九', '十']

// HTML 转义：公式里的裸 <（如 $0<r<1$）不转义会被浏览器当成标签吞掉
function esc(s) {
  if (s == null) return ''
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function M(s) { return renderMathInString(esc(s)) }

function boldBlanks(s) {
  return M(s).replace(/（(\d+)）/g, '（<strong class="blank">$1</strong>）')
}

function optTable(o) {
  const cells = ['A', 'B', 'C', 'D'].filter((k) => o[k] !== undefined)
    .map((k) => `<td><span class="optkey">(${k})</span>${M(o[k])}</td>`)
  let rows = ''
  for (let i = 0; i < cells.length; i += 2) rows += '<tr>' + cells[i] + (cells[i + 1] || '<td></td>') + '</tr>'
  return `<table class="opt-table"><tbody>${rows}</tbody></table>`
}

// 与 app/src/lib/render.js scopeIds 同一套处理：图件的 marker id 是按内容哈希起的名字，
// 一页里放了多张图就会撞 id，url(#a241) 会指向别的图的箭头。打印页同样要加前缀。
function scopeIds(s, prefix) {
  if (!s) return s
  const p = String(prefix || 'f')
  const ids = []
  const re = /\sid\s*=\s*["']([^"']+)["']/g
  let m
  while ((m = re.exec(s))) ids.push(m[1])
  if (!ids.length) return s
  for (const id of ids) {
    const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const to = p + '-' + id
    s = s.replace(new RegExp('url\\(["\']?#' + esc + '["\']?\\)', 'g'), 'url(#' + to + ')')
    s = s.replace(new RegExp('(["\'])#' + esc + '\\1', 'g'), '$1#' + to + '$1')
  }
  return s.replace(/\sid\s*=\s*["']([^"']+)["']/g, (mm, id) => ' id="' + p + '-' + id + '"')
}

// 同一张图可能在一页里出现多次（两个小问引用同一张配图），再叠上出现序号
const figSeq = {}
function figSvg(year, key) {
  const f = B.figures[String(year)]
  const s = (f && f[key]) || ''
  const k = String(year) + '/' + key
  const n = (figSeq[k] = (figSeq[k] || 0) + 1)
  return scopeIds(s, 'f' + year + '-' + key + '-' + n)
}

function chapterName(q) {
  const ch = B.chapters.find((c) => c.id === q.chapter)
  return ch ? ch.name : ''
}

function choiceExp(q) {
  const keys = ['A', 'B', 'C', 'D'].filter((k) => q.exp.opts && q.exp.opts[k])
  return `<div class="ans"><div class="ans-title">答案：<span class="ans-letter">${q.answer}</span>` +
    `<span class="ans-meta">${chapterName(q)}</span></div>` +
    `<div class="ans-concl">${M(q.exp.concl)}</div><div class="ans-opts">` +
    keys.map((k) => `<div class="opt-exp${k === q.answer ? ' right' : ''}"><b>(${k})</b>${M(q.exp.opts[k])}</div>`).join('') +
    `</div>${q.exp.note ? `<div class="ans-note"><b>提示：</b>${M(q.exp.note)}</div>` : ''}</div>`
}

function bigSol(year, q) {
  const steps = (q.sol.steps || []).map((st) =>
    `<details class="sol-step" open><summary>${M(st.q)}</summary><div class="step-body">` +
    (st.body || []).map((x) => `<div class="step-line">${M(x)}</div>`).join('') +
    (st.fig ? `<figure class="figblock">${figSvg(year, st.fig)}</figure>` : '') +
    (st.ans ? `<div class="step-ans">${M(st.ans)}</div>` : '') +
    `</div></details>`).join('')
  return `<div class="ans"><div class="ans-title">参考解析<span class="ans-meta">${chapterName(q)}</span></div>` +
    `<div class="ans-concl">${M(q.sol.intro)}</div>${steps}` +
    `<div class="sol-summary"><b>答案汇总：</b>${M(q.sol.summary)}</div>` +
    (q.sol.pitfalls ? `<div class="ans-note"><b>易错点：</b>${M(q.sol.pitfalls)}</div>` : '') +
    `</div>`
}

function buildBody(year, withAnswers) {
  const p = B.papers[String(year)]
  let html = ''
  const c0 = p.sections[0]
  html += `<div class="sec-title">一、${c0.name}（每题1分，共${c0.score}分）</div>`
  html += `<div class="sec-intro">${M(c0.intro)}</div>`
  const choice = p.questions.filter((q) => q.type === 'choice')
  let i = 0
  while (i < choice.length) {
    const q = choice[i]
    const g = p.groups[q.group]
    const cluster = [q]
    let j = i + 1
    while (j < choice.length && choice[j].group === q.group) { cluster.push(choice[j]); j++ }
    // 选项表：2026 起 optionSets 显式声明多套；兼容 2025 的 options12/13/25/26 键与单套 options
    let multi = (g.optionSets || []).map((k) => g[k]).filter(Boolean)
    if (!multi.length) {
      multi = [g.options12, g.options13, g.options25, g.options26].filter(Boolean)
      if (!multi.length && g.options) multi = [g.options]
    }
    html += `<div class="qgroup"><div class="qline">${boldBlanks(g.stem || '')}</div>`
    multi.forEach((o) => { html += optTable(o) })
    cluster.forEach((cq) => { html += choiceExp(cq) })
    html += `</div>`
    i = j
  }
  const big = p.questions.filter((q) => q.type === 'big')
  const s1 = p.sections[1]
  // 大题分值不一定均匀（如2026第二题20分、其余15分），标题只报总分，明细交给 sections.intro
  html += `<div class="sec-title">二、${s1.name}（共${s1.score}分）</div>`
  if (s1.intro) html += `<div class="sec-intro">${M(s1.intro)}</div>`
  big.forEach((q, idx) => {
    html += `<div class="bigq"><div class="qnum">${HAN[idx]}．（${q.score}分）</div>` +
      `<div class="stem">${boldBlanks(q.stem)}</div>`
    if (q.fig) html += `<figure class="figblock">${figSvg(year, q.fig)}</figure>`
    if (q.subs && q.subs.length) html += `<div class="subs">${q.subs.map((s) => `<div>${boldBlanks(s)}</div>`).join('')}</div>`
    html += bigSol(year, q) + `</div>`
  })
  return html
}

function buildPrintHtml(year, withAnswers) {
  const p = B.papers[String(year)]
  const body = buildBody(year, withAnswers)
  return `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8">
<title>${year}年${p.subject}真题${withAnswers ? '含解析' : ''}</title>
<style>${buildInlineCss()}</style>
</head><body class="${withAnswers ? 'with-ans' : 'no-ans'}">
<div class="paper-sheet">
  <div class="paper-head">
    <div class="t1">北京邮电大学</div>
    <div class="t2">${year} 年硕士研究生招生考试试题</div>
    <div class="t3">考试科目：${p.subject}</div>
  </div>
  <div class="paper-note">${M(p.note)}</div>
  ${body}
</div>
</body></html>`
}

module.exports = { buildPrintHtml, buildBody }
