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

// 生成器给 marker / clipPath 起的 id 是按图内容算出来的短名（a241、a24c…），
// 一张图单独看没问题，但同一页会同时挂上十几张图，撞 id 时 url(#a241) 会指向别的图的箭头，
// getElementById 也只会拿到第一个。这里按「年-图名」给 id 加前缀，并把引用一起改掉。
export function scopeIds(svgStr, prefix) {
  let s = String(svgStr || '')
  const p = String(prefix || 'f')
  if (!s) return s
  const ids = []
  const re = /\sid\s*=\s*["']([^"']+)["']/g
  let m
  while ((m = re.exec(s))) ids.push(m[1])
  if (!ids.length) return s
  for (const id of ids) {
    const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const to = p + '-' + id
    s = s.replace(new RegExp('url\\(["\']?#' + esc + '["\']?\\)', 'g'), 'url(#' + to + ')')
    s = s.replace(new RegExp('(["\'])#' + esc + '\\1', 'g'), '$1#' + to + '$1')
  }
  // 最后改定义本身，避免刚改好的引用被再改一次
  return s.replace(/\sid\s*=\s*["']([^"']+)["']/g, (mm, id) => ' id="' + p + '-' + id + '"')
}

// 同一张图可能在一页里出现多次（例如两个小问引用同一张配图），
// 只按「年-图名」加前缀仍会撞，所以再叠上这张图本次渲染的序号。
const figSeq = {}
let figIssued = 0

function nextFigPrefix(year, key) {
  const k = String(year) + '/' + key
  const n = (figSeq[k] = (figSeq[k] || 0) + 1)
  // 页面反复重渲染会让计数一直涨，超量时清一次表，避免字符串与内存无上限增长
  if (++figIssued > 5000) { for (const p in figSeq) delete figSeq[p]; figIssued = 0 }
  return 'f' + year + '-' + key + '-' + n
}

export function figureSvg(year, key) {
  const f = (window.BUPT801.figures || {})[String(year)]
  const s = (f && f[key]) || ''
  if (!s) return s
  const meta = (window.BUPT801.figureMeta || {})[String(year)] || {}
  const desc = (meta[key] && meta[key].desc) || key
  return withTitle(scopeIds(s, nextFigPrefix(year, key)), desc)
}

// 给 SVG 注入 <title>：读屏与浏览器悬浮提示都能拿到图的语义名称。
// 生成器输出的 SVG 没有 <title>，这里统一补，避免 42 张图全是「无名称图形」。
export function withTitle(svgStr, text) {
  const s = String(svgStr || '')
  if (!s || /<title[\s>]/i.test(s)) return s
  const t = String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return s.replace(/<svg\b[^>]*>/i, (m) => m + '<title>' + t + '</title>')
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
