// 学习计划：目标分 / 考试日 / 每周题量目标
// 与模考成绩（examlog）一起支撑「成绩趋势 + 目标分」和「周报」。
import { reactive } from 'vue'

const KEY = 'bupt801-plan-v1'

const DEFAULT = { target: 110, examDate: '', weekly: 60, updatedAt: 0 }

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null')
    return raw && typeof raw === 'object' ? Object.assign({}, DEFAULT, raw) : Object.assign({}, DEFAULT)
  } catch (e) { return Object.assign({}, DEFAULT) }
}

export const plan = reactive(load())

export function setPlan(patch) {
  Object.keys(patch || {}).forEach((k) => { plan[k] = patch[k] })
  plan.updatedAt = Date.now()
  try { localStorage.setItem(KEY, JSON.stringify(plan)) } catch (e) {}
}

export function planSnapshot() { return JSON.parse(JSON.stringify(plan)) }

// 距考试天数：未设置或已过期返回 null
export function daysToExam(now) {
  if (!plan.examDate) return null
  const t = new Date(plan.examDate + 'T00:00:00').getTime()
  if (isNaN(t)) return null
  const d = Math.round((t - (now || Date.now())) / 86400000)
  return d >= 0 ? d : 0
}
