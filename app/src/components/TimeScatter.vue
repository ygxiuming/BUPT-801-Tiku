<template>
  <div class="scatter">
    <div class="empty" v-if="!items.length" style="padding:24px 12px">
      还没有逐题耗时数据。刷题/模考时会自动记录每题用时，做十几题后再回来。
    </div>
    <template v-else>
      <svg class="scatter-svg" :viewBox="'0 0 ' + W + ' ' + H" role="img"
        :aria-label="'每题耗时与分值散点图，共 ' + items.length + ' 题'">
        <g class="scatter-grid">
          <line v-for="g in yGrid" :key="'y' + g.v" :x1="P.l" :x2="W - P.r" :y1="g.y" :y2="g.y" />
          <text v-for="g in yGrid" :key="'yl' + g.v" :x="P.l - 6" :y="g.y + 3.5" text-anchor="end">{{ g.label }}</text>
          <text v-for="g in xGrid" :key="'xl' + g.v" :x="xOf(g.v)" :y="H - P.b + 14" text-anchor="middle">{{ g.v }}分</text>
        </g>
        <line class="scatter-ref" :x1="P.l" :x2="W - P.r" :y1="yOf(maxScore * refSec * 1000)" :y2="yOf(0)" />
        <text class="scatter-ref-label" :x="W - P.r - 4" :y="yOf(maxScore * refSec * 1000) + 12" text-anchor="end">
          参考节奏 {{ refSec }} 秒/分
        </text>
        <circle v-for="(p, i) in pts" :key="i" :cx="p.x" :cy="p.y" r="3.6" :class="p.cls">
          <title>{{ p.label }}</title>
        </circle>
      </svg>
      <div class="scatter-legend">
        <span><i class="sw choice"></i>选择题</span>
        <span><i class="sw big"></i>综合题</span>
        <span class="sep"></span>
        <span>线上方 = 超时（按 {{ refSec }} 秒/分 估）</span>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'TimeScatter',
  props: {
    // [{ ms, score, label, type }]
    items: { type: Array, default: () => [] },
    refSec: { type: Number, default: 50 }
  },
  data: () => ({ W: 640, H: 210, P: { l: 42, r: 14, t: 14, b: 30 } }),
  computed: {
    list() { return this.items.filter((x) => x.ms > 0).slice(0, 200) },
    maxMs() {
      const mx = Math.max(...this.list.map((x) => x.ms), 60000)
      return Math.ceil(mx / 60000) * 60000
    },
    maxScore() { return Math.max(4, ...this.list.map((x) => x.score || 1)) },
    yGrid() {
      const out = []
      for (let i = 0; i <= 3; i++) {
        const v = (this.maxMs / 3) * i
        out.push({ v, y: this.yOf(v), label: Math.round(v / 60000) + '分' })
      }
      return out
    },
    xGrid() {
      const step = Math.max(1, Math.round(this.maxScore / 4))
      const out = []
      for (let v = 0; v <= this.maxScore; v += step) out.push({ v })
      return out
    },
    pts() {
      return this.list.map((x) => ({
        x: Math.round(this.xOf(x.score || 1)),
        y: Math.round(this.yOf(x.ms)),
        cls: 'dot ' + (x.type === 'big' ? 'big' : 'choice'),
        label: x.label + ' · ' + Math.round(x.ms / 1000) + ' 秒'
      }))
    }
  },
  methods: {
    xOf(score) {
      const innerW = this.W - this.P.l - this.P.r
      return this.P.l + (innerW * Math.min(this.maxScore, score)) / this.maxScore
    },
    yOf(ms) {
      const innerH = this.H - this.P.t - this.P.b
      const ratio = Math.min(1, Math.max(0, ms / this.maxMs))
      return this.P.t + innerH * (1 - ratio)
    }
  }
}
</script>
