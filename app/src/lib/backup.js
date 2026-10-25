// 记录备份：导出 / 校验 / 合并导入
// ------------------------------------------------------------
// 做题记录是本站唯一「不可再生」的用户资产（换浏览器/清缓存即归零），
// 所以导出格式带 format + version，导入一律走白名单校验 + 逐字段合并，
// 绝不整体覆盖 reactive 对象（避免脏字段污染渲染）。
import { rec, snapshotRecords, saveRec, activity } from './records.js'
import { notes, snapshotNotes } from './notes.js'
import { exams, examSnapshot } from './examlog.js'
import { plan, planSnapshot, setPlan } from './plan.js'

export const FORMAT = 'bupt801-backup'
export const VERSION = 2

export function buildBackup() {
  return {
    format: FORMAT,
    v: VERSION,
    exportedAt: Date.now(),
    app: '北邮801通信原理真题库',
    records: snapshotRecords(),
    activity: JSON.parse(JSON.stringify(activity)),
    notes: snapshotNotes(),
    exams: examSnapshot(),
    plan: planSnapshot()
  }
}

export function toText(obj) {
  return JSON.stringify(obj, null, 2)
}

// 解析并做最低限度的结构校验；不合法直接抛错，由调用方 toast
export function parseBackup(text) {
  let obj
  try { obj = JSON.parse(String(text || '').trim()) } catch (e) {
    throw new Error('不是合法的 JSON 文件')
  }
  if (!obj || typeof obj !== 'object') throw new Error('备份内容为空')
  if (obj.format && obj.format !== FORMAT) throw new Error('不是本站的备份文件（format 不符）')
  if (!obj.records && !obj.notes && !obj.exams) throw new Error('备份里没有可导入的数据')
  if (obj.v && obj.v > VERSION) throw new Error('备份来自更新版本（v' + obj.v + '），请先升级页面')
  return obj
}

const NUM_FIELDS = ['c', 'w', 'f', 'reps']

function newerField(cur, inc) {
  return (inc.t || 0) > (cur.t || 0) ? inc : cur
}

function mergeRecord(cur, inc) {
  const out = Object.assign({}, cur)
  NUM_FIELDS.forEach((k) => { if (inc[k]) out[k] = Math.max(cur[k] || 0, inc[k] || 0) })
  out.star = !!(cur.star || inc.star)
  out.revealed = !!(cur.revealed || inc.revealed)
  const nw = newerField(cur, inc)
  ;['ok', 'pick', 'level', 'ms', 'msAvg'].forEach((k) => { if (nw[k] !== undefined) out[k] = nw[k] })
  if (nw === inc && inc.t) out.t = inc.t
  else if (cur.t) out.t = cur.t
  // SRS：以后一次复习为准（保留两者中更晚的 last / 更长的 reps）
  if (cur.srs || inc.srs) {
    const a = cur.srs || {}
    const b = inc.srs || {}
    const pick = (b.last || 0) > (a.last || 0) ? b : a
    out.srs = Object.assign({}, pick, { reps: Math.max(a.reps || 0, b.reps || 0) })
    out.lastSrs = Math.max(cur.lastSrs || 0, inc.lastSrs || 0)
  }
  return out
}

// mode: 'merge'（默认，逐字段合并且不丢本地）| 'replace'（先清空再导入）
export function applyBackup(obj, mode) {
  const summary = { records: 0, notes: 0, exams: 0, activity: 0, plan: false, conflicts: 0 }
  const inRec = obj.records || {}
  if (mode === 'replace') {
    Object.keys(rec).forEach((k) => delete rec[k])
    Object.keys(notes).forEach((k) => delete notes[k])
    exams.length = 0
    Object.keys(activity).forEach((k) => delete activity[k])
  }
  Object.keys(inRec).forEach((id) => {
    const inc = inRec[id]
    if (!inc || typeof inc !== 'object') return
    rec[id] = rec[id] ? mergeRecord(rec[id], inc) : inc
    summary.records++
  })
  Object.keys(obj.activity || {}).forEach((k) => {
    const v = Number(obj.activity[k]) || 0
    if (v > 0) { activity[k] = Math.max(activity[k] || 0, v); summary.activity++ }
  })
  const inNotes = obj.notes || {}
  Object.keys(inNotes).forEach((id) => {
    const inc = inNotes[id]
    if (!inc || typeof inc.text !== 'string' || !inc.text.trim()) return
    const cur = notes[id]
    if (!cur) { notes[id] = { text: inc.text, t: inc.t || Date.now() }; summary.notes++; return }
    if (cur.text === inc.text) return
    summary.conflicts++
    if ((inc.t || 0) > (cur.t || 0)) notes[id] = { text: inc.text, t: inc.t || Date.now() }
  })
  const seen = {}
  exams.forEach((e) => { seen[(e.at || 0) + '|' + (e.year || '')] = true })
  ;(obj.exams || []).forEach((e) => {
    if (!e || typeof e !== 'object' || !e.at) return
    const k = (e.at || 0) + '|' + (e.year || '')
    if (seen[k]) return
    seen[k] = true
    exams.push(e)
    summary.exams++
  })
  exams.sort((a, b) => (a.at || 0) - (b.at || 0))
  if (obj.plan && obj.plan.updatedAt && obj.plan.updatedAt > (plan.updatedAt || 0)) {
    setPlan({
      target: Number(obj.plan.target) || plan.target,
      examDate: typeof obj.plan.examDate === 'string' ? obj.plan.examDate : plan.examDate,
      weekly: Number(obj.plan.weekly) || plan.weekly
    })
    summary.plan = true
  }
  saveRec()
  try { localStorage.setItem('bupt801-notes-v1', JSON.stringify(notes)) } catch (e) {}
  try { localStorage.setItem('bupt801-activity-v1', JSON.stringify(activity)) } catch (e) {}
  try { localStorage.setItem('bupt801-exams-v1', JSON.stringify(exams)) } catch (e) {}
  return summary
}

// 下载为文件；沙箱/老浏览器不支持 Blob URL 时返回 false，由 UI 提示改用「复制」
export function downloadBackup() {
  const text = toText(buildBackup())
  const name = 'bupt801-backup-' + new Date().toISOString().slice(0, 10) + '.json'
  try {
    const blob = new Blob([text], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    return { ok: true, name, text }
  } catch (e) {
    return { ok: false, name, text }
  }
}
