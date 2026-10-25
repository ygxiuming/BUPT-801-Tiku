// 模考成绩档案：交卷后落盘，供趋势图与「目标分还差多少」使用
// 结构：数组（追加式），每项
//   { id, at, year, scope, score, full, choiceScore, choiceTotal, bigDone, usedSec, perQ: [{id,ms,score}] }
import { reactive } from 'vue'

const KEY = 'bupt801-exams-v1'
const MAX = 60

function load() {
  try {
    const a = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(a) ? a : []
  } catch (e) { return [] }
}

export const exams = reactive(load())

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(exams)) } catch (e) {}
}

export function addExam(e) {
  const item = Object.assign({ id: 'e' + Date.now(), at: Date.now() }, e)
  exams.push(item)
  while (exams.length > MAX) exams.shift()
  save()
  return item
}

// 交卷后自评会改分，用 id 回写最近一次
export function updateExam(id, patch) {
  const e = exams.find((x) => x.id === id)
  if (!e) return
  Object.assign(e, patch)
  save()
}

export function clearExams() {
  exams.length = 0
  save()
}

export function examSnapshot() { return JSON.parse(JSON.stringify(exams)) }

// 交卷时问「每题耗时」用：把逐题记录压平成 {id: ms} —— 同时写进做题记录
export function perQMap(perQ) {
  const m = {}
  ;(perQ || []).forEach((x) => { if (x && x.id) m[x.id] = x.ms })
  return m
}
