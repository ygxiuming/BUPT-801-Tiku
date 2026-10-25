// 题目笔记：每题一段 Markdown 草稿（支持 $公式$），存 localStorage
// 结构 { <id>: { text, t } }。体量很小（192 题全写满也就几十 KB），
// 不需要 IndexedDB；与做题记录分离，清空记录时可以单独保留。
import { reactive } from 'vue'

const KEY = 'bupt801-notes-v1'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch (e) { return {} }
}

export const notes = reactive(load())

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(notes)) } catch (e) {}
}

export function noteOf(id) {
  const n = notes[id]
  return n && n.text ? n.text : ''
}

export function noteTime(id) {
  const n = notes[id]
  return n ? n.t || 0 : 0
}

export function setNote(id, text) {
  const t = String(text || '')
  if (!t.trim()) {
    delete notes[id]
    save()
    return
  }
  notes[id] = { text: t, t: Date.now() }
  save()
}

export function clearNote(id) {
  delete notes[id]
  save()
}

export function hasNote(id) { return !!(notes[id] && notes[id].text) }

export function noteIds() { return Object.keys(notes).filter(hasNote) }

export function clearAllNotes() {
  Object.keys(notes).forEach((k) => delete notes[k])
  save()
}

export function snapshotNotes() {
  return JSON.parse(JSON.stringify(notes))
}
