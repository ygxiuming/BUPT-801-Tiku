// 通用格式化（时间/日期/数值）—— 纯函数，无副作用

export function clamp(x, a, b) { return Math.min(b, Math.max(a, x)) }

export function dayKey(ts) {
  const d = new Date(ts)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

export function mdText(ts) {
  const d = new Date(ts)
  return (d.getMonth() + 1) + '-' + String(d.getDate()).padStart(2, '0')
}

export function dateText(ts) {
  const d = new Date(ts)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

export function relTime(ts, now) {
  if (!ts) return ''
  const diff = (now || Date.now()) - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return '刚刚'
  if (m < 60) return m + ' 分钟前'
  const h = Math.floor(m / 60)
  if (h < 24) return h + ' 小时前'
  const d = Math.floor(h / 24)
  if (d === 1) return '昨天'
  if (d < 30) return d + ' 天前'
  return dateText(ts)
}

// 毫秒 → 「1 分 20 秒」/「48 秒」；用于逐题耗时
export function durText(ms) {
  if (!ms || ms < 0) return '—'
  const s = Math.round(ms / 1000)
  if (s < 60) return s + ' 秒'
  const m = Math.floor(s / 60)
  const rest = s % 60
  if (m < 60) return rest ? m + ' 分 ' + rest + ' 秒' : m + ' 分'
  const h = Math.floor(m / 60)
  return h + ' 时 ' + (m % 60) + ' 分'
}

// 秒数 → 倒计时文本（h:mm:ss / mm:ss）
export function clockText(sec) {
  const s = Math.max(0, Math.floor(sec))
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  return (h ? h + ':' : '') + String(m % 60).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0')
}

export function daysBetween(a, b) { return Math.round((b - a) / 86400000) }

export function pct(a, b) { return b ? Math.round((a / b) * 100) : 0 }
