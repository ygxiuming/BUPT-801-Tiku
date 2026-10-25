<template>
  <div class="wrap" style="max-width:1120px">
    <div class="section-head" style="margin-top:6px">
      <div>
        <div class="eyebrow">FIGURES</div>
        <h2>矢量图库</h2>
      </div>
      <span class="desc">全部由 SVG 重绘 · 点击放大查看细节</span>
      <span class="spacer"></span>
      <span class="badge gray">共 {{ total }} 张</span>
    </div>

    <div class="fig-toolbar">
      <div class="search-box">
        <Icon name="search" :size="16" />
        <input v-model="kw" type="search" aria-label="搜索图库"
          placeholder="搜索图名 / 题号 / 说明，如 题五、星座、q3recv" />
      </div>
      <span class="chip" v-for="y in years" :key="y" :class="{ on: fYear === y }" @click="fYear = fYear === y ? '' : y">{{ y }}</span>
      <button class="btn sm ghost" v-if="kw || fYear" @click="kw = ''; fYear = ''">清除</button>
    </div>

    <template v-for="y in shownYears" :key="y">
      <h4 class="fig-year">{{ y }} 年</h4>
      <template v-for="g in groupsOf(y)" :key="y + g.kind">
        <div class="fig-group-title">
          <span class="badge" :class="g.kind === 'answer' ? 'warn' : 'brand'">
            {{ g.kind === 'answer' ? '解析配图' : '题目原图' }}
          </span>
          <span class="qhint">{{ g.items.length }} 张</span>
        </div>
        <div class="fig-grid">
          <div class="card fig-card" v-for="it in g.items" :key="it.key">
            <div class="fig-head">
              <span class="badge" :class="g.kind === 'answer' ? 'warn' : 'brand'">{{ it.meta.q || '—' }}</span>
              <span class="fig-desc">{{ it.meta.desc }}</span>
            </div>
            <figure class="figblock"><div v-html="fitted(it)"></div></figure>
            <div class="fig-file">{{ fileName(y, it) }}</div>
          </div>
        </div>
      </template>
    </template>

    <div class="empty" v-if="!shownYears.length">
      <div class="empty-ico"><Icon name="image" :size="28" /></div>
      {{ total ? '没有匹配的图，换个关键词试试' : '图库为空' }}
    </div>
  </div>
</template>

<script>
import Icon from '../components/Icon.vue'
import { papers, figuresOf } from '../lib/data.js'
import { fitSvg, withTitle, scopeIds } from '../lib/render.js'

export default {
  name: 'FiguresView',
  components: { Icon },
  data() {
    const q = new URLSearchParams(location.search)
    return { kw: q.get('q') || '', fYear: q.get('y') || '' }
  },
  computed: {
    years() { return Object.keys(papers()).sort().reverse() },
    allGroups() {
      const out = []
      this.years.forEach((y) => {
        const figs = figuresOf(y)
        const meta = (window.BUPT801.figureMeta || {})[String(y)] || {}
        Object.keys(figs).forEach((key) => {
          const m = meta[key] || { q: '', kind: 'paper', desc: key }
          out.push({ year: y, key, svg: figs[key], meta: m })
        })
      })
      return out
    },
    total() { return this.allGroups.length },
    filtered() {
      const kw = this.kw.trim().toLowerCase()
      return this.allGroups.filter((it) => {
        if (this.fYear && it.year !== this.fYear) return false
        if (!kw) return true
        const hay = [it.key, it.meta.desc, it.meta.q, it.year].join(' ').toLowerCase()
        return hay.indexOf(kw) >= 0
      })
    },
    shownYears() {
      const set = new Set(this.filtered.map((it) => it.year))
      return this.years.filter((y) => set.has(y))
    }
  },
  methods: {
    // 卡片内限高 176px、基准宽 560px 注入显式尺寸（viewBox-only 的 svg 无固有尺寸）
    fitted(it) {
      const s = scopeIds(it.svg, 'f' + it.year + '-' + it.key)
      return withTitle(fitSvg(s, 560, 176), it.meta.desc || it.key)
    },
    itemsOf(y) { return this.filtered.filter((it) => it.year === y) },
    groupsOf(y) {
      const items = this.itemsOf(y)
      const pick = (kind) => items.filter((it) => (it.meta.kind || 'paper') === kind)
      return [
        { kind: 'paper', items: pick('paper') },
        { kind: 'answer', items: pick('answer') }
      ].filter((g) => g.items.length)
    },
    fileName(y, it) {
      const qnum = (it.meta.q || '').replace('题', '')
      const base = y + '-' + qnum + '-' + it.key + '.js'
      return it.meta.kind === 'answer' ? 'answer/' + base : base
    }
  }
}
</script>
