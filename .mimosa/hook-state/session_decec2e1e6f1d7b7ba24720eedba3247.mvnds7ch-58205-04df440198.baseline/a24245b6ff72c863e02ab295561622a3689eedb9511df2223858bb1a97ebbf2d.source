// 服务端 KaTeX 渲染：把文本中的 $...$ 与 $$...$$ 预渲染为 HTML
const katex = require('katex')

function renderTex(tex, displayMode) {
  return katex.renderToString(tex, {
    displayMode,
    throwOnError: false,
    strict: 'ignore'
  })
}

function renderMathInString(s) {
  if (typeof s !== 'string' || !s.includes('$')) return s
  // 先拆 $$ 显示公式
  const disp = s.split('$$')
  let out = ''
  for (let i = 0; i < disp.length; i++) {
    if (i % 2 === 1) {
      out += renderTex(disp[i], true)
    } else {
      // 行内 $...$
      const parts = disp[i].split('$')
      for (let j = 0; j < parts.length; j++) {
        out += (j % 2 === 1) ? renderTex(parts[j], false) : parts[j]
      }
    }
  }
  return out
}

module.exports = { renderMathInString }
