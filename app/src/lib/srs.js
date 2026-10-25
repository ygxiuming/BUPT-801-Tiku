// 间隔复习调度（FSRS 简化版）
// ------------------------------------------------------------
// 采用 FSRS-4.5 的双变量模型（稳定度 S / 难度 D + 幂函数遗忘曲线），
// 但把 21 个自由参数压缩成 4 个可解释的常量，便于维护与手算校验：
//   记忆保持率 R(t, S) = (1 + FACTOR · t / S)^DECAY ，t = S 时 R ≈ 0.9
//   S 越大 → 下次到期越晚；D 越大（越难）→ 单次收益越小
// 纯函数：不读写 localStorage，便于单测与在任意视图复算。
//
// 记录里的字段刻意用短名，避免 localStorage 体积膨胀：
//   { s: stable_days, d: difficulty, due: ts, reps, lap, last: ts }

export const DAY = 86400000

const DECAY = -0.5
const FACTOR = 19 / 81          // 令 R(S, S) = 0.9
const MAX_INTERVAL = 180        // 天：考研备考窗口有限，超过半年没有意义
const MIN_STAB = 0.5

// 四档评分（练习页只用前三档，复习页四档全开）
export const GRADES = [
  { g: 1, label: '不会', hint: '看了也想不起来', cls: 'bad' },
  { g: 2, label: '模糊', hint: '想起一部分，过程卡顿', cls: 'fuzzy' },
  { g: 3, label: '会', hint: '独立做出来', cls: 'ok' },
  { g: 4, label: '很熟', hint: '秒答，可以拉长间隔', cls: 'soft' }
]

const FIRST_S = { 1: 0.6, 2: 1.6, 3: 3.6, 4: 8.5 }

function clamp(x, a, b) { return Math.min(b, Math.max(a, x)) }

// 稳定度 → 距离下次复习的天数（R = 0.9 处）
export function stabilityToDays(s) { return clamp(Math.round(s), 1, MAX_INTERVAL) }

// 给定已过天数与稳定度，估算当前记忆保持率（0–1）
export function retrievability(elapsedDays, stab) {
  const s = stab > 0 ? stab : FIRST_S[3]
  return Math.pow(1 + FACTOR * Math.max(0, elapsedDays) / s, DECAY)
}

// 由题目 id 派生 ±8% 的确定性抖动：同样的记录每次算出的到期日一致，
// 但不同题目不会都挤在同一天（不引入随机数，测试可复现）。
function fuzz(id) {
  let h = 0
  const s = String(id || '')
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100003
  return 1 + ((h % 17) - 8) / 100
}

function initialState(grade, now) {
  return { s: FIRST_S[grade] || FIRST_S[3], d: clamp(6.6 - 1.4 * (grade - 3), 1, 10), reps: 1, lap: grade === 1 ? 1 : 0, last: now }
}

// 一次复习后的新状态。prev 为空表示首次学习。
export function nextState(prev, grade, now, id) {
  const g = clamp(grade | 0, 1, 4)
  if (!prev || !prev.s) {
    const st = initialState(g, now)
    st.due = now + stabilityToDays(st.s * fuzz(id)) * DAY
    return st
  }
  const elapsed = Math.max(0, (now - (prev.last || now)) / DAY)
  const R = retrievability(elapsed, prev.s)
  // 难度：忘了 → 明显变难；模糊 → 略难；会 → 略降；很熟 → 明显降
  const dNext = clamp((prev.d || 5) + (g === 1 ? 1.1 : g === 2 ? 0.25 : g === 4 ? -0.6 : -0.15), 1, 10)
  let s
  if (g === 1) {
    // 遗忘：稳定度打折，并把难度带进折扣里
    s = Math.max(MIN_STAB, prev.s * (0.32 + 0.06 * (11 - (prev.d || 5))))
  } else {
    const bonus = g === 2 ? 0.55 : g === 4 ? 1.35 : 1
    const gain = 1 + 0.55 * (11 - (prev.d || 5)) * Math.pow(prev.s, -0.18) * (Math.exp((1 - R) * 1.7) - 1) * bonus
    s = Math.max(prev.s * 1.05, prev.s * gain)
    if (g === 4) s = Math.max(s, prev.s * 1.6)
  }
  s = clamp(s, MIN_STAB, MAX_INTERVAL)
  const next = {
    s,
    d: dNext,
    reps: (prev.reps || 0) + 1,
    lap: (prev.lap || 0) + (g === 1 ? 1 : 0),
    last: now
  }
  next.due = now + stabilityToDays(s * fuzz(id)) * DAY
  return next
}

// 以「天」为单位的当前间隔（用于展示与预测）
export function intervalOf(state) {
  if (!state || !state.due || !state.last) return 0
  return Math.max(1, Math.round((state.due - state.last) / DAY))
}

// 到期文案：越期 / 今天 / N 天后
export function dueText(due, now) {
  const t = now || Date.now()
  const d = Math.round((due - t) / DAY)
  if (due <= t) {
    const late = Math.max(1, Math.round((t - due) / DAY))
    return '逾期 ' + late + ' 天'
  }
  if (d === 0) return '今天'
  return d + ' 天后'
}

// 已到期待复习的题（srs.due <= now），按逾期程度降序
export function dueIds(rec, now) {
  const t = now || Date.now()
  return Object.keys(rec || {})
    .filter((id) => rec[id] && rec[id].srs && rec[id].srs.due <= t)
    .sort((a, b) => rec[a].srs.due - rec[b].srs.due)
}

// 未来 days 天的复习负荷（不含逾期）
export function forecast(rec, days, now) {
  const t = now || Date.now()
  const n = days || 14
  const list = []
  for (let i = 0; i < n; i++) {
    const day = new Date(t + i * DAY)
    list.push({
      key: day.getFullYear() + '-' + String(day.getMonth() + 1).padStart(2, '0') + '-' + String(day.getDate()).padStart(2, '0'),
      label: (day.getMonth() + 1) + '/' + day.getDate(),
      n: 0
    })
  }
  const idx = {}
  list.forEach((d, i) => { idx[d.key] = i })
  Object.keys(rec || {}).forEach((id) => {
    const s = rec[id] && rec[id].srs
    if (!s || !s.due || s.due < t) return
    const k = (function (d) {
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
    })(new Date(s.due))
    if (idx[k] !== undefined) list[idx[k]].n++
  })
  return list
}
