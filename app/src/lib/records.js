// 做题记录（localStorage 持久化，兼容 v1 键，老记录可直接继承）
import { reactive } from 'vue'

const RKEY = 'bupt801-records-v1'

function load() {
  try { return JSON.parse(localStorage.getItem(RKEY) || '{}') } catch (e) { return {} }
}

export const rec = reactive(load())

export function saveRec() {
  try { localStorage.setItem(RKEY, JSON.stringify(rec)) } catch (e) {}
}

// ok 为 true/false 时累加对错计数并记录最近结果；仅查看解析不计分
export function record(id, ok) {
  const r = rec[id] || { c: 0, w: 0 }
  if (ok === true) r.c++
  else if (ok === false) r.w++
  r.ok = ok
  r.t = Date.now()
  rec[id] = r
  saveRec()
}

// 三档掌握度自评：1=会 2=模糊 3=不会（会计对、不会计错、模糊单独计 f）
export function setLevel(id, level) {
  const r = rec[id] || { c: 0, w: 0 }
  r.level = level
  if (level === 1) r.c++
  else if (level === 3) r.w++
  else r.f = (r.f || 0) + 1
  r.ok = level === 1 ? true : level === 3 ? false : undefined
  r.t = Date.now()
  rec[id] = r
  saveRec()
}

export function levelLabel(l) {
  return l === 1 ? '会' : l === 2 ? '模糊' : l === 3 ? '不会' : ''
}

// 收藏星标
export function toggleStar(id) {
  const r = rec[id] || { c: 0, w: 0 }
  r.star = !r.star
  rec[id] = r
  saveRec()
}

export function starredIds() {
  return Object.keys(rec).filter((id) => rec[id] && rec[id].star)
}

export function clearRec() {
  Object.keys(rec).forEach((k) => delete rec[k])
  saveRec()
}

export function isWrong(id) { return !!(rec[id] && rec[id].ok === false) }

/* ---------- 派生统计（供首页 / 统计页复用） ---------- */

// 已接触过的题（选过项 / 看过解析 / 自评过）
export function touchedIds() {
  return Object.keys(rec).filter((id) => rec[id] && (rec[id].c || rec[id].w || rec[id].revealed))
}

// 一组题目的完成进度
export function progressOf(items) {
  const total = items.length
  let done = 0
  items.forEach((it) => {
    const r = rec[it.q.id]
    if (r && (r.c || r.w || r.revealed)) done++
  })
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
}

// 正确率（只看选择题的累计对错计数）
export function accuracy() {
  let ok = 0, all = 0
  Object.keys(rec).forEach((id) => {
    const r = rec[id]
    if (!r) return
    ok += r.c || 0
    all += (r.c || 0) + (r.w || 0)
  })
  return { ok, all, pct: all ? Math.round((ok / all) * 100) : 0 }
}

// 最近一次作答记录（用于首页「继续上次」）
export function lastTouched() {
  let best = null
  Object.keys(rec).forEach((id) => {
    const r = rec[id]
    if (!r || !r.t) return
    if (!best || r.t > best.t) best = { id, t: r.t, r }
  })
  return best
}

function dayKey(ts) {
  const d = new Date(ts)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

// 近 N 天每日作答量（按每题最近一次作答时间归日）
export function dailyCounts(days) {
  const n = days || 14
  const buckets = {}
  const today = new Date()
  const list = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i)
    const key = dayKey(d.getTime())
    buckets[key] = 0
    list.push({ key, label: (d.getMonth() + 1) + '/' + d.getDate(), n: 0 })
  }
  Object.keys(rec).forEach((id) => {
    const r = rec[id]
    if (!r || !r.t) return
    const k = dayKey(r.t)
    if (buckets[k] !== undefined) buckets[k]++
  })
  list.forEach((d) => { d.n = buckets[d.key] })
  return list
}
