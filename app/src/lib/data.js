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

/** 题干 → HTML：在 boldBlanks 基础上支持块级 markdown 表格（2019 六的信道转移概率表等
 *  直接渲染成真表格，不再配图）。表格判定/拼装与解析正文 mdBlocks 是同一套；
 *  表头单元格要写公式竖线时用 \\vert，字面 | 会被当成列分隔符切开。 */
export function stemHtml(s) {
  const lines = String(s == null ? '' : s).split('\n')
  const out = []
  let buf = []
  const flush = () => {
    if (!buf.length) return
    out.push(buf.join('\n'))
    buf = []
  }
  for (let i = 0; i < lines.length; i++) {
    if (isRow(lines[i]) && isRow(lines[i + 1]) && isSep(lines[i + 1])) {
      flush()
      const head = mdCells(lines[i])
      const rows = []
      i += 1
      while (i + 1 < lines.length && isRow(lines[i + 1])) {
        i += 1
        rows.push(mdCells(lines[i]))
      }
      out.push(mdTable(head, rows))
      continue
    }
    buf.push(boldBlanks(lines[i]))
  }
  flush()
  return out.join('\n')
}

/* ---------- 卷面编号（选择题 / 大题小问） ----------
   选择题按「题号」编号：一题对应一个空（2018/2025/2026），也可能一题含多个空
   （2017/2019/2021/2022/2024 的 num≠blank），所以行首写题号、空号另标。
   大题小问按「（1）（2）」，少数年份的大题是「两道小题各带自己的小问」——
   那种行首是「1、」「2、」，属于一级标题，不是小问，要和 (n) 分两档缩进。 */

// 连续数字折叠成 a–b；不连续用顿号。入参可以是字符串或数字，重复项自动去重
export function numRange(nums) {
  const a = [...new Set(nums.map(Number).filter((n) => !Number.isNaN(n)))].sort((x, y) => x - y)
  if (!a.length) return ''
  if (a.length === 1) return String(a[0])
  const cont = a.every((v, i) => i === 0 || v === a[i - 1] + 1)
  return cont ? a[0] + '–' + a[a.length - 1] : a.join('、')
}

// 小问行拆成 { lv, no, text }：
//   lv 0 = 一级标题（「1、设某线性分组码…」），lv 1 = 小问（「（1）写出…」）
//   no 保留原编号（统一成全角），text 是去掉编号后的正文
// 数据里 2016~2026 全部写的是半角 (1)，考试卷面是「（1）」——
// 渲染时统一收口成全角，不去改 300 多条原始数据（导入时手写半角也无所谓）。
export function normSubNo(s) {
  return String(s == null ? '' : s).replace(/^\s*[（(]\s*([0-9]+)\s*[)）]\s*/, (m, n) => '（' + n + '）')
}

export function subRow(s) {
  const t = String(s == null ? '' : s).trim()
  let m = /^[（(]\s*([0-9]+)\s*[)）]\s*/.exec(t)
  if (m) return { lv: 1, no: '（' + m[1] + '）', text: t.slice(m[0].length) }
  m = /^([0-9]+)\s*[、.．]\s*/.exec(t)
  if (m) return { lv: 0, no: m[1] + '、', text: t.slice(m[0].length) }
  return { lv: 1, no: '', text: t }
}

// subs 数组 → 渲染行；grp 表示这一行属于前面某个「1、」一级标题，缩进要再深一级
export function subsRows(subs) {
  let grp = false
  return (subs || []).map((s) => {
    const r = subRow(s)
    if (r.lv === 0) { grp = true; return Object.assign({}, r, { grp: true }) }
    return Object.assign({}, r, { grp })
  })
}

// 小问 HTML（试卷页与题卡共用一份，避免两处缩进/编号各自长一套）：
// 每行悬挂缩进，编号加粗；「1、」是一级标题（不缩进、上下留白更大）
export function subsHtml(subs, cls) {
  const rows = subsRows(subs)
  if (!rows.length) return ''
  const body = rows.map((r) => {
    if (r.lv === 0) return `<div class="sub-grp"><b class="subno">${r.no}</b>${boldBlanks(r.text)}</div>`
    const no = r.no ? `<b class="subno">${r.no}</b>` : ''
    return `<div class="sub-row${r.grp ? ' lv2' : ''}">${no}${boldBlanks(r.text)}</div>`
  }).join('')
  return `<div class="${cls || 'subs'}">${body}</div>`
}

/* ---------- 解析正文的轻量 Markdown ----------
   数据里只用到两种语法，没必要引第三方解析器：
     1. 行内 **粗体**（跳过 $...$ / $$...$$ 内部，避免吃掉公式里的星号）
     2. 块级表格：连续 `| a | b |` 行，第二行是 `|---|` 分隔行
   表格必须整块拼好再输出：body 是「一段一个数组元素」，表格每行是一个元素，
   若按元素各自 v-html，表格会被切成 N 个 <div>，页面上只剩一列竖线。 */

const MD_ROW = /^\s*\|(.+)\|\s*$/
const MD_SEP = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/

const isRow = (s) => typeof s === 'string' && MD_ROW.test(s)
const isSep = (s) => typeof s === 'string' && MD_ROW.test(s) && MD_SEP.test(s)

function inlineMd(s) {
  // 按公式段切开，只对非公式段替换 **：公式里可能出现 *（如 H^{*}）
  return String(s)
    .split(/(\$\$[\s\S]*?\$\$|\$[^$\n]*\$)/g)
    .map((seg, i) => (i % 2 ? seg : seg.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')))
    .join('')
}

function mdCells(line) {
  let s = line.trim()
  if (s.startsWith('|')) s = s.slice(1)
  if (s.endsWith('|')) s = s.slice(0, -1)
  return s.split('|').map((c) => c.trim())
}

function mdTable(head, rows) {
  const th = head.map((c) => '<th>' + inlineMd(escHtml(c)) + '</th>').join('')
  const tb = rows
    .map((r) => '<tr>' + head.map((_, k) => '<td>' + inlineMd(escHtml(r[k] || '')) + '</td>').join('') + '</tr>')
    .join('')
  return (
    '<div class="md-table-wrap"><table class="md-table"><thead><tr>' + th + '</tr></thead><tbody>' + tb + '</tbody></table></div>'
  )
}

/** 单段文本 → HTML（段内 \n 变 <br>，支持 **粗体** 与表格） */
export function mdBlock(src) {
  const text = String(src == null ? '' : src)
  if (!text) return ''
  const lines = text.split('\n')
  const out = []
  let buf = []
  const flush = () => {
    if (!buf.length) return
    out.push(buf.map((l) => inlineMd(escHtml(l))).join('<br>'))
    buf = []
  }
  for (let i = 0; i < lines.length; i++) {
    if (isRow(lines[i]) && isRow(lines[i + 1]) && isSep(lines[i + 1])) {
      flush()
      const head = mdCells(lines[i])
      const rows = []
      i += 1
      while (i + 1 < lines.length && isRow(lines[i + 1])) {
        i += 1
        rows.push(mdCells(lines[i]))
      }
      out.push(mdTable(head, rows))
      continue
    }
    buf.push(lines[i])
  }
  flush()
  return out.join('')
}

/** body 数组 → 块数组 [{ t:'p'|'table'|'fig', html, key? }]，把连续表格行合成为一个 table 块
 *  单独一行写 `[[fig:key]]` 时可把图插到正文中间（否则图只能排在整段 body 之后，
 *  与「…框图如下：<图> …」的原卷排法对不上） */
const FIG_LINE = /^\s*\[\[fig:([\w-]+)\]\]\s*$/

export function mdBlocks(arr) {
  const src = Array.isArray(arr) ? arr : [arr]
  const out = []
  for (let i = 0; i < src.length; i++) {
    const fm = FIG_LINE.exec(String(src[i] == null ? '' : src[i]))
    if (fm) {
      out.push({ t: 'fig', key: fm[1], html: '' })
      continue
    }
    if (isRow(src[i]) && isRow(src[i + 1]) && isSep(src[i + 1])) {
      const head = mdCells(src[i])
      const rows = []
      i += 2
      while (i < src.length && isRow(src[i])) {
        rows.push(mdCells(src[i]))
        i += 1
      }
      i -= 1
      out.push({ t: 'table', html: mdTable(head, rows) })
      continue
    }
    out.push({ t: 'p', html: mdBlock(src[i]) })
  }
  return out
}
