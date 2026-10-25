// 主题（浅色 / 深色）：html[data-theme] 驱动 app.css 的设计令牌
import { ref } from 'vue'

const KEY = 'bupt801-theme'

function readSaved() {
  try { return localStorage.getItem(KEY) } catch (e) { return null }
}

function systemTheme() {
  try {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch (e) { return 'light' }
}

export const theme = ref(readSaved() || systemTheme())

function apply(t) {
  const el = document.documentElement
  el.setAttribute('data-theme', t)
  el.style.colorScheme = t
}

export function setTheme(t) {
  theme.value = t === 'dark' ? 'dark' : 'light'
  apply(theme.value)
  try { localStorage.setItem(KEY, theme.value) } catch (e) {}
}

export function toggleTheme() {
  setTheme(theme.value === 'dark' ? 'light' : 'dark')
}

export function initTheme() {
  apply(theme.value)
}
