<template>
  <teleport to="body">
    <div class="lb-backdrop" v-if="lightbox.open" ref="backdropEl"
      @wheel.prevent="onWheel" @pointerdown="onPointerDown" @pointermove="onPointerMove"
      @pointerup="onPointerUp" @pointercancel="onPointerUp" @dblclick="onDblClick">
      <div class="lb-stage">
        <div class="lb-fig" :style="figStyle" v-html="figSvg"></div>
      </div>
      <div class="lb-bar">
        <span class="lb-zoom">{{ Math.round(scale * 100) }}%</span>
        <span class="lb-btn" @click.stop="zoomStep(-0.25)" title="缩小">−</span>
        <span class="lb-btn" @click.stop="reset" title="复位">⟲</span>
        <span class="lb-btn" @click.stop="zoomStep(0.25)" title="放大">＋</span>
        <span class="lb-tip">滚轮缩放 · 拖拽移动 · 双击复位</span>
        <span class="lb-close" @click.stop="close" title="关闭 (Esc)">✕ 关闭</span>
      </div>
    </div>
  </teleport>
</template>

<script>
import { lightbox, closeLightbox } from '../lib/lightbox.js'
import { fitSvg } from '../lib/render.js'

const MIN_SCALE = 0.2
const MAX_SCALE = 8

export default {
  name: 'Lightbox',
  data: () => ({ scale: 1, x: 0, y: 0, pointers: new Map(), moved: false, lastPinchDist: 0, vw: 0, vh: 0 }),
  computed: {
    lightbox() { return lightbox },
    // 显式注入 width/height，避免无固有尺寸的 svg 塌缩（见 lib/render.js fitSvg）
    figSvg() {
      return fitSvg(lightbox.svg, this.vw * 0.92 - 24, this.vh * 0.78 - 24)
    },
    figStyle() {
      return { transform: 'translate(' + this.x + 'px,' + this.y + 'px) scale(' + this.scale + ')' }
    }
  },
  watch: {
    'lightbox.open'(v) {
      document.body.style.overflow = v ? 'hidden' : ''
      if (v) this.reset()
    }
  },
  mounted() {
    document.addEventListener('keydown', this.onKey)
    this.onResize()
    window.addEventListener('resize', this.onResize)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onKey)
    window.removeEventListener('resize', this.onResize)
    document.body.style.overflow = ''
  },
  methods: {
    onResize() { this.vw = window.innerWidth; this.vh = window.innerHeight },
    close() { closeLightbox() },
    reset() { this.scale = 1; this.x = 0; this.y = 0 },
    clampScale(s) { return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s)) },
    // 以屏幕坐标 (mx,my) 为锚点缩放：保持锚点下的图像点不动
    zoomAt(mx, my, factor) {
      const ns = this.clampScale(this.scale * factor)
      const f = ns / this.scale
      const px = mx - window.innerWidth / 2
      const py = my - window.innerHeight / 2
      this.x = px - (px - this.x) * f
      this.y = py - (py - this.y) * f
      this.scale = ns
    },
    zoomStep(d) { this.zoomAt(window.innerWidth / 2, window.innerHeight / 2, 1 + d) },
    onWheel(e) { this.zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.15 : 1 / 1.15) },
    onDblClick(e) {
      e.preventDefault()
      if (this.scale === 1) this.zoomAt(e.clientX, e.clientY, 2.5)
      else this.reset()
    },
    onPointerDown(e) {
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      this.moved = false
    },
    onPointerMove(e) {
      if (!this.pointers.has(e.pointerId)) return
      const prev = this.pointers.get(e.pointerId)
      const cur = { x: e.clientX, y: e.clientY }
      // 双指捏合缩放
      if (this.pointers.size === 2) {
        const ids = Array.from(this.pointers.keys())
        const other = this.pointers.get(ids[0] === e.pointerId ? ids[1] : ids[0])
        const dist = Math.hypot(cur.x - other.x, cur.y - other.y)
        if (this.lastPinchDist > 0) this.zoomAt((cur.x + other.x) / 2, (cur.y + other.y) / 2, dist / this.lastPinchDist)
        this.lastPinchDist = dist
        this.moved = true
      } else {
        this.x += cur.x - prev.x
        this.y += cur.y - prev.y
        if (Math.abs(cur.x - prev.x) + Math.abs(cur.y - prev.y) > 0) this.moved = true
      }
      this.pointers.set(e.pointerId, cur)
    },
    onPointerUp(e) {
      this.pointers.delete(e.pointerId)
      if (this.pointers.size < 2) this.lastPinchDist = 0
      // 点击空白处（非图、非工具条、未拖动）关闭
      if (!this.moved && this.pointers.size === 0) {
        const t = e.target
        if (t && t.closest && !t.closest('.lb-fig') && !t.closest('.lb-bar')) this.close()
      }
    },
    onKey(e) {
      if (!lightbox.open) return
      if (e.key === 'Escape') this.close()
      else if (e.key === '+' || e.key === '=') this.zoomStep(0.25)
      else if (e.key === '-') this.zoomStep(-0.25)
      else if (e.key === '0') this.reset()
    }
  }
}
</script>
