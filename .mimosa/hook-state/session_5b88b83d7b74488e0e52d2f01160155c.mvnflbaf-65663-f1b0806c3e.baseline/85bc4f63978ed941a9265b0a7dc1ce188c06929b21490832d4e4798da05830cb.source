// 图片放大弹窗（lightbox）全局状态：任何 .figblock 点击后由 Lightbox 组件捕获并打开
import { reactive } from 'vue'

export const lightbox = reactive({
  open: false,
  svg: ''
})

export function openLightbox(svgHtml) {
  if (!svgHtml) return
  lightbox.svg = svgHtml
  lightbox.open = true
}

export function closeLightbox() {
  lightbox.open = false
}
