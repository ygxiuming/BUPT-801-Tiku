// 全站搜索索引
// ------------------------------------------------------------
// 192 道题全量在内存里（题干/选项/解析/标签/知识点/图名），首次打开搜索时建一次，
// 之后查询走纯字符串匹配，不做分词（中文按子串命中即可，足够对付「眼图」「HDB3」这类查询）。
// 打分：标签/知识点权重最高，其次题干，最后是解析正文。
import { papers, chapters, figuresOf, stemOf, optsOf } from './data.js'

const PLAIN_RE = /\$+/g

function plain(s) {
  return String(s == null ? '' : s).replace(PLAIN_RE, ' ').replace(/\s+/g, ' ').trim()
}

let INDEX = null

function pushQuestion(it, idx) {
  const q = it.q
  const p = it.p
  const ch = chapters().find((c) => c.id === q.chapter)
  const stem = plain(stemOf(it)) + ' ' + plain((q.subs || []).join(' '))
  const opts = plain(Object.values(optsOf(it) || {}).join(' '))
  const ans = plain(
    (q.exp && [q.exp.concl, q.exp.note].concat(Object.values(q.exp.opts || {})).join(' ')) ||
    (q.sol && [q.sol.intro, q.sol.summary, q.sol.pitfalls, (q.sol.steps || []).map((s) => s.q + ' ' + (s.body || []).join(' ') + ' ' + (s.ans || '')).join(' ')].join(' ')) ||
    ''
  )
  idx.push({
    kind: 'q',
    id: q.id,
    year: String(it.year),
    num: q.num,
    type: q.type,
    chapterId: q.chapter,
    chapter: ch ? ch.name : '',
    point: q.point || '',
    tags: q.tags || [],
    title: (q.type === 'choice' ? '选择题 ' + q.num : '综合题 ' + q.num),
    snippet: stem.slice(0, 90),
    hay: {
      tag: (q.tags || []).join(' ').toLowerCase(),
      point: String(q.point || '').toLowerCase(),
      chapter: (ch ? ch.name : '').toLowerCase(),
      stem: stem.toLowerCase(),
      opts: opts.toLowerCase(),
      ans: ans.toLowerCase(),
      meta: [it.year, q.type === 'choice' ? '选择 选择题' : '综合 综合题 大题 计算题', q.id].join(' ').toLowerCase()
    }
  })
}

function pushFigures(idx) {
  Object.keys(papers()).forEach((y) => {
    const figs = figuresOf(y)
    const meta = (window.BUPT801.figureMeta || {})[String(y)] || {}
    Object.keys(figs).forEach((key) => {
      const m = meta[key] || { q: '', desc: key }
      idx.push({
        kind: 'fig',
        id: y + '/' + key,
        year: String(y),
        key,
        title: '图 · ' + (m.desc || key),
        snippet: [y + ' 年', m.q, m.desc, key].filter(Boolean).join(' · '),
        hay: {
          tag: '',
          point: '',
          chapter: '',
          stem: String(m.desc || '').toLowerCase() + ' ' + key.toLowerCase(),
          opts: '',
          ans: '',
          meta: [y, '图 图片 框图 图库', m.q || ''].join(' ').toLowerCase()
        }
      })
    })
  })
}

export function buildIndex() {
  if (INDEX) return INDEX
  const idx = []
  Object.keys(papers()).forEach((y) => {
    const p = papers()[y]
    p.questions.forEach((q) => pushQuestion({ year: p.year, q, p }, idx))
  })
  pushFigures(idx)
  INDEX = idx
  return INDEX
}

export function indexSize() { return buildIndex().length }

function scoreOf(entry, tokens) {
  let score = 0
  const h = entry.hay
  for (const tk of tokens) {
    if (h.tag.includes(tk)) score += 9
    if (h.point.includes(tk)) score += 7
    if (h.chapter.includes(tk)) score += 5
    if (h.stem.includes(tk)) score += 6
    if (h.opts.includes(tk)) score += 3
    if (h.ans.includes(tk)) score += 2
    if (h.meta.includes(tk)) score += 4
    const all = h.tag + h.point + h.chapter + h.stem + h.opts + h.ans + h.meta
    if (!all.includes(tk)) return -1
  }
  // 题干以关键词开头（近似「标题命中」）略加权
  if (tokens.length && h.stem.startsWith(tokens[0])) score += 3
  return score
}

// 返回按相关度排序的结果；query 为空返回 []
export function search(query, limit) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return []
  const tokens = q.split(/\s+/).filter(Boolean).slice(0, 5)
  const idx = buildIndex()
  const out = []
  for (const entry of idx) {
    const s = scoreOf(entry, tokens)
    if (s < 0) continue
    out.push({ entry, score: s })
  }
  out.sort((a, b) => b.score - a.score || Number(b.entry.year) - Number(a.entry.year))
  return out.slice(0, limit || 14).map((x) => Object.assign({}, x.entry, { score: x.score, tokens }))
}

// 把命中词包成 <mark>（先转义，避免题干里的 < > 被当成标签）
export function highlight(text, tokens) {
  let s = String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  ;(tokens || []).forEach((tk) => {
    if (!tk) return
    const re = new RegExp('(' + tk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi')
    s = s.replace(re, '<mark>$1</mark>')
  })
  return s
}

export function resetIndex() { INDEX = null }
