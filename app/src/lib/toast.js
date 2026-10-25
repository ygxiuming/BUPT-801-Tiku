// 轻量提示条：用于收藏、清空记录等即时反馈（替代 alert，不打断操作流）
import { reactive } from 'vue'

export const toasts = reactive([])
let seq = 0

export function toast(msg, type, ms) {
  const t = { id: ++seq, msg, type: type || 'info' }
  toasts.push(t)
  setTimeout(() => {
    const i = toasts.findIndex((x) => x.id === t.id)
    if (i >= 0) toasts.splice(i, 1)
  }, ms || 2000)
}

export function dismissToast(id) {
  const i = toasts.findIndex((x) => x.id === id)
  if (i >= 0) toasts.splice(i, 1)
}
