<template>
  <div class="trend">
    <div class="empty" v-if="!items.length" style="padding:24px 12px">
      还没有模考成绩。交卷后自动记录，这里就会出现折线。
      <div class="row" style="justify-content:center;margin-top:10px">
        <router-link class="btn sm primary" to="/exam">去模考</router-link>
      </div>
    </div>
    <template v-else>
      <svg class="trend-svg" :viewBox="'0 0 ' + W + ' ' + H" role="img"
        :aria-label="'模考成绩趋势：共 ' + items.length + ' 次，最高 ' + best + ' 分'">
        <g class="trend-grid">
          <line v-for="g in grid" :key="'g' + g.v" :x1="P.l" :x2="W - P.r" :y1="g.y" :y2="g.y" />
          <text v-for="g in grid" :key="'t' + g.v" :x="P.l - 6" :y="g.y + 3.5" text-anchor="end">{{ g.v }}</text>
        </g>
        <line class="trend-target" :x1="P.l" :x2="W - P.r" :y1="yOf(target)" :y2="yOf(target)" />
        <text class="trend-target-label" :x="W - P.r + 4" :y="yOf(target) + 3.5">目标 {{ target }}</text>
        <polyline class="trend-line" :points="poly" />
        <g v-for="(p, i) in pts" :key="i">
          <circle :cx="p.x" :cy="p.y" :r="p.r" :class="p.cls">
            <title>{{ p.label }}</title>
          </circle>
        </g>
        <text v-if="items.length === 1" class="trend-single" :x="pts[0].x" :y="pts[0].y - 10" text-anchor="middle">首考 {{ pts[0].score }} 分</text>
      </svg>
      <div class="trend-meta">
        <span>共 <b>{{ items.length }}</b> 次</span>
        <span>最高 <b>{{ best }}</b></span>
        <span>最近 <b>{{ last }}</b></span>
        <span :class="gap >= 0 ? 'ok-ink' : 'bad-ink'">
          {{ gap >= 0 ? '已达目标 +' + gap : '距目标 ' + Math.abs(gap) }}
        </span>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'TrendChart',
  props: {
    // [{ at, score, full, year, scope }]，任意顺序
    items: { type: Array, default: () => [] },
    target: { type: Number, default: 110 },
    limit: { type: Number, default: 12 }
  },
  data: () => ({ W: 640, H: 190, P: { l: 36, r: 46, t: 16, b: 22 } }),
  computed: {
    list() {
      return this.items.slice().sort((a, b) => (a.at || 0) - (b.at || 0)).slice(-this.limit)
    },
    full() { return Math.max(150, ...this.list.map((x) => x.full || 0)) },
    best() { return this.list.length ? Math.max(...this.list.map((x) => x.score || 0)) : 0 },
    last() { return this.list.length ? this.list[this.list.length - 1].score || 0 : 0 },
    gap() { return this.last - this.target },
    grid() {
      const out = []
      for (let i = 0; i <= 4; i++) {
        const v = Math.round((this.full / 4) * i)
        out.push({ v, y: this.yOf(v) })
      }
      return out
    },
    pts() {
      const n = this.list.length
      const innerW = this.W - this.P.l - this.P.r
      return this.list.map((x, i) => {
        const xx = n === 1 ? this.P.l + innerW / 2 : this.P.l + (innerW * i) / (n - 1)
        const yy = this.yOf(x.score || 0)
        const cls = (x.score || 0) >= this.target ? 'pt ok' : (x.score || 0) >= this.full * 0.6 ? 'pt warn' : 'pt bad'
        const d = new Date(x.at || Date.now())
        return {
          x: Math.round(xx * 10) / 10,
          y: Math.round(yy * 10) / 10,
          r: i === n - 1 ? 4.5 : 3.2,
          cls,
          score: x.score || 0,
          label: (x.year || '') + ' 年 · ' + (x.score || 0) + '/' + (x.full || this.full) + ' 分 · ' +
            (d.getMonth() + 1) + '/' + d.getDate() + (x.scope === 'choice' ? '（仅选择）' : '')
        }
      })
    },
    poly() { return this.pts.map((p) => p.x + ',' + p.y).join(' ') }
  },
  methods: {
    yOf(v) {
      const innerH = this.H - this.P.t - this.P.b
      const ratio = Math.min(1, Math.max(0, v / this.full))
      return Math.round((this.P.t + innerH * (1 - ratio)) * 10) / 10
    }
  }
}
</script>
