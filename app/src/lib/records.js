// 做题记录（localStorage 持久化，兼容 v1 键，老记录可直接继承）
// v2：在 v1 的 {c,w,ok,t,level,star,pick,revealed} 之上追加
//   ms / msAvg   该题最近一次耗时、指数滑动平均（节奏分析用）
//   srs          FSRS 复习状态 {s,d,due,reps,lap,last}（间隔复习用）
// 另外单独维护「每日作答次数」计数器 bupt801-activity-v1：
// 旧口径按「每题最后一次作答」归日，同一天反复刷同一题只算 1 次，会低估练习量。
import { reactive } from 'vue'
import { nextState } from './srs.js'

const RKEY = 'bupt801-records-v1'
const AKEY = 'bupt801-activity-v1'

function load(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}') } catch (e) { return {} }
}

export const rec = reactive(load(RKEY))
export const activity = reactive(load(AKEY))

export function saveRec() {
  try { localStorage.setItem(RKEY, JSON.stringify(rec)) } catch (e) {}
}

function saveActivity() {
  try { localStorage.setItem(AKEY, JSON.stringify(activity)) } catch (e) {}
}

function dayKey(ts) {
  const d = new Date(ts)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

// 每发生一次「实际作答/自评」就记一笔，供活跃度与周报使用
export function bumpActivity(n) {
  const k = dayKey(Date.now())
  activity[k] = (activity[k] || 0) + (n || 1)
  saveActivity()
}

function base(id) {
  const r = rec[id] || { c: 0, w: 0 }
  if (!r.c) r.c = 0
  if (!r.w) r.w = 0
  return r
}

// 写入一次 SRS 复习（grade: 1 不会 / 2 模糊 / 3 会 / 4 很熟）
function applySrs(r, id, grade, now) {
  r.srs = nextState(r.srs, grade, now, id)
  r.lastSrs = now
}

// ok 为 true/false 时累加对错计数并记录最近结果；仅查看解析不计分
// ms：本次作答耗时（毫秒，可选）
export function record(id, ok, ms) {
  const now = Date.now()
  const r = base(id)
  if (ok === true) r.c++
  else if (ok === false) r.w++
  r.ok = ok
  r.t = now
  if (ms && ms > 0) {
    r.ms = Math.round(ms)
    r.msAvg = Math.round(r.msAvg ? r.msAvg * 0.6 + r.ms * 0.4 : r.ms)
  }
  applySrs(r, id, ok ? 3 : 1, now)
  rec[id] = r
  saveRec()
  bumpActivity()
}

// 三档掌握度自评：1=会 2=模糊 3=不会（会计对、不会计错、模糊单独计 f）
export function setLevel(id, level, ms) {
  const now = Date.now()
  const r = base(id)
  r.level = level
  if (level === 1) r.c++
  else if (level === 3) r.w++
  else r.f = (r.f || 0) + 1
  r.ok = level === 1 ? true : level === 3 ? false : undefined
  r.t = now
  if (ms && ms > 0) {
    r.ms = Math.round(ms)
    r.msAvg = Math.round(r.msAvg ? r.msAvg * 0.6 + r.ms * 0.4 : r.ms)
  }
  applySrs(r, id, level === 1 ? 3 : level === 3 ? 1 : 2, now)
  rec[id] = r
  saveRec()
  bumpActivity()
}

// 复习页用：四档评分（会额外计入对错统计，保持与练习页口径一致）
export function review(id, grade, ms) {
  const now = Date.now()
  const r = base(id)
  if (grade >= 3) r.c++
  else if (grade === 1) r.w++
  else r.f = (r.f || 0) + 1
  r.ok = grade >= 3 ? true : grade === 1 ? false : undefined
  r.t = now
  if (ms && ms > 0) {
    r.ms = Math.round(ms)
    r.msAvg = Math.round(r.msAvg ? r.msAvg * 0.6 + r.ms * 0.4 : r.ms)
  }
  applySrs(r, id, grade, now)
  rec[id] = r
  saveRec()
  bumpActivity()
}

export function levelLabel(l) {
  return l === 1 ? '会' : l === 2 ? '模糊' : l === 3 ? '不会' : ''
}

// 收藏星标
export function toggleStar(id) {
  const r = base(id)
  r.star = !r.star
  rec[id] = r
  saveRec()
}

export function starredIds() {
  return Object.keys(rec).filter((id) => rec[id] && rec[id].star)
}

export function clearRec() {
  Object.keys(rec).forEach((k) => delete rec[k])
  Object.keys(activity).forEach((k) => delete activity[k])
  saveRec()
  saveActivity()
}

export function isWrong(id) { return !!(rec[id] && rec[id].ok === false) }

// 该题是否「已做过」（与 progressOf 口径保持一致：选过项 / 看过解析 / 自评过）
export function touched(id) {
  const r = rec[id]
  return !!(r && (r.c || r.w || r.f || r.revealed))
}

/* ---------- 派生统计（供首页 / 统计页复用） ---------- */

// 已接触过的题
export function touchedIds() {
  return Object.keys(rec).filter(touched)
}

// 一组题目的完成进度
export function progressOf(items) {
  const total = items.length
  let done = 0
  items.forEach((it) => { if (touched(it.q.id)) done++ })
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
}

// 正确率（只看累计对错计数）
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

// 近 N 天每日作答量：优先用活动计数器（可累计同日多次），
// 老数据没有计数器时退回「每题最后一次作答」归日。
export function dailyCounts(days) {
  const n = days || 14
  const today = new Date()
  const list = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i)
    const key = dayKey(d.getTime())
    list.push({ key, label: (d.getMonth() + 1) + '/' + d.getDate(), n: activity[key] || 0 })
  }
  const hasActivity = Object.keys(activity).length > 0
  if (!hasActivity) {
    const buckets = {}
    list.forEach((d) => { buckets[d.key] = d })
    Object.keys(rec).forEach((id) => {
      const r = rec[id]
      if (!r || !r.t) return
      const b = buckets[dayKey(r.t)]
      if (b) b.n++
    })
  }
  return list
}

// 连续学习天数（今天没学则从昨天往前数）
export function streakDays(now) {
  const t = now || Date.now()
  const counts = dailyCounts(400)
  const map = {}
  counts.forEach((d) => { map[d.key] = d.n })
  let streak = 0
  const cursor = new Date(t)
  if (!map[dayKey(cursor.getTime())]) cursor.setDate(cursor.getDate() - 1)
  for (let i = 0; i < 400; i++) {
    if (map[dayKey(cursor.getTime())] > 0) { streak++; cursor.setDate(cursor.getDate() - 1) }
    else break
  }
  return streak
}

// 本周（周一起）与上周的作答量，用于周报
export function weekStats(now) {
  const t = now || Date.now()
  const d = new Date(t)
  const dow = (d.getDay() + 6) % 7 // 周一=0
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow).getTime()
  const map = {}
  dailyCounts(60).forEach((x) => { map[x.key] = x.n })
  let cur = 0, prev = 0, days = 0
  for (let i = 0; i < 7; i++) {
    const k = dayKey(start + i * 86400000)
    const v = map[k] || 0
    cur += v
    if (v > 0 && start + i * 86400000 <= t) days++
  }
  for (let i = 7; i < 14; i++) prev += map[dayKey(start - (i - 6) * 86400000)] || 0
  return { cur, prev, days, start }
}

// 导出/导入用：纯数据快照（脱离 reactive 代理）
export function snapshotRecords() {
  return JSON.parse(JSON.stringify(rec))
}
