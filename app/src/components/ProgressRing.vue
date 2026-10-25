<template>
  <div class="ring" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" :viewBox="'0 0 ' + size + ' ' + size">
      <circle class="ring-track" :cx="c" :cy="c" :r="r" :stroke-width="stroke" fill="none" />
      <circle class="ring-bar" :cx="c" :cy="c" :r="r" :stroke-width="stroke" fill="none"
        :style="{ stroke: color }" stroke-linecap="round"
        :stroke-dasharray="dash" :stroke-dashoffset="offset"
        :transform="'rotate(-90 ' + c + ' ' + c + ')'" />
    </svg>
    <div class="ring-label">
      <b :style="{ color: color }">{{ text }}</b>
      <span v-if="label">{{ label }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProgressRing',
  props: {
    value: { type: Number, default: 0 },     // 0~100
    size: { type: Number, default: 116 },
    stroke: { type: Number, default: 9 },
    text: { type: String, default: '' },
    label: { type: String, default: '' },
    color: { type: String, default: 'var(--brand)' }
  },
  computed: {
    c() { return this.size / 2 },
    r() { return this.size / 2 - this.stroke / 2 - 2 },
    circ() { return 2 * Math.PI * this.r },
    dash() { return this.circ },
    offset() {
      const p = Math.max(0, Math.min(100, Number(this.value) || 0))
      return this.circ * (1 - p / 100)
    }
  }
}
</script>
