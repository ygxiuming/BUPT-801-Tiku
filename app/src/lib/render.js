// KaTeX 渲染辅助
export function renderMath(el) {
  if (!el || !window.renderMathInElement) return
  window.renderMathInElement(el, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false }
    ],
    throwOnError: false
  })
}

// 只渲染"数学区域"（.math-zone：全部是 v-html 输出的容器）。
// 切勿对 Vue 管理结构的根节点整体渲染——auto-render 改写文本节点会破坏 vdom 锚点，
// 导致后续 patch 报 insertBefore(null)/parentNode 并冻结视图。
export function renderMathZones(root) {
  const scope = root || document
  scope.querySelectorAll('.math-zone').forEach(function (el) { renderMath(el) })
}

export function figureSvg(year, key) {
  const f = (window.BUPT801.figures || {})[String(year)]
  return (f && f[key]) || ''
}

// viewBox-only 的 svg 没有固有尺寸，在 flex/受限容器里会塌缩成 0：
// 按 viewBox 宽高比显式注入 width/height（适配 maxW×maxH），CSS max-width 可再响应式收缩。
// 入参可能带旧 width/height（如图库 DOM 的 outerHTML），先剥离再注入，避免属性重复。
export function fitSvg(svgStr, maxW, maxH) {
  let s = svgStr || ''
  const m = s.match(/viewBox=['"]([^'"]+)['"]/)
  if (!m) return s
  const p = m[1].trim().split(/\s+/).map(Number)
  const w = p[2], h = p[3]
  if (!w || !h) return s
  const k = Math.min(maxW / w, maxH / h)
  const W = Math.max(40, Math.round(w * k)), H = Math.max(30, Math.round(h * k))
  s = s.replace(/(<svg\b[^>]*?)\s+width=["'][^"']*["']/i, '$1')
  s = s.replace(/(<svg\b[^>]*?)\s+height=["'][^"']*["']/i, '$1')
  return s.replace('<svg ', '<svg width="' + W + '" height="' + H + '" ')
}
