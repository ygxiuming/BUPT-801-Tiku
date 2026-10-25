<template>
  <div class="heat">
    <div class="heat-scroll">
      <table class="heat-table">
        <thead>
          <tr>
            <th class="heat-corner">章节 \ 年份</th>
            <th v-for="y in years" :key="y">{{ y }}</th>
            <th class="heat-sum">合计</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in rows" :key="c.id">
            <th class="heat-ch">
              <button class="heat-ch-btn" @click="pick(c.id, '')" :title="'只看「' + c.name + '」的题'">{{ c.name }}</button>
            </th>
            <td v-for="y in years" :key="y" class="heat-cell" :style="cellStyle(c.id, y)"
              :title="cellTitle(c, y)" @click="pick(c.id, y)">
              <b v-if="nOf(c.id, y)">{{ nOf(c.id, y) }}</b>
              <span v-else class="heat-zero">—</span>
              <em v-if="nOf(c.id, y)">{{ scoreOf(c.id, y) }} 分</em>
            </td>
            <td class="heat-sum">{{ c.n }} 题<span class="sub"> / {{ c.score }} 分</span></td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th>合计</th>
            <td v-for="y in years" :key="y">{{ colN[y] }} 题<span class="sub"> / {{ colScore[y] }} 分</span></td>
            <td class="heat-sum">{{ total.n }} 题<span class="sub"> / {{ total.score }} 分</span></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="heat-legend">
      <span>色深 = 该章在该年的题量（最深 {{ maxN }} 题）</span>
      <span class="heat-scale"><i v-for="s in 5" :key="s" :style="{ background: scaleColor(s / 5) }"></i></span>
      <span class="sep"></span>
      <span>点格子 → 只看这一章 + 这一年</span>
    </div>

    <div class="heat-cold" v-if="coldPoints.length">
      <b>零真题知识点（{{ coldPoints.length }}）</b>
      <span class="qhint">大纲里有、四年真题一次没考到 —— 要么是低频考点，要么是潜在盲区，值得扫一眼。</span>
      <div class="chips" style="margin-top:8px">
        <span class="chip static" v-for="p in coldPoints" :key="p.key" :title="p.chapter">{{ p.chapter }} · {{ p.point }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { chapters, papers, allQuestions } from '../lib/data.js'

export default {
  name: 'HeatmapMatrix',
  emits: ['pick'],
  computed: {
    years() { return Object.keys(papers()).sort() },
    rows() {
      const m = {}
      allQuestions().forEach((it) => {
        const q = it.q
        const key = q.chapter
        m[key] = m[key] || { n: 0, score: 0, byYear: {} }
        const sc = q.score || 1
        m[key].n++
        m[key].score += sc
        const yb = m[key].byYear[String(it.year)] || { n: 0, score: 0 }
        yb.n++
        yb.score += sc
        m[key].byYear[String(it.year)] = yb
      })
      return (chapters() || []).map((c) => {
        const st = m[c.id] || { n: 0, score: 0, byYear: {} }
        return { id: c.id, name: c.name, n: st.n, score: st.score, byYear: st.byYear, points: c.points || [] }
      })
    },
    maxN() {
      let mx = 1
      this.rows.forEach((r) => Object.keys(r.byYear).forEach((y) => { mx = Math.max(mx, r.byYear[y].n) }))
      return mx
    },
    colN() {
      const o = {}
      this.years.forEach((y) => { o[y] = this.rows.reduce((s, r) => s + ((r.byYear[y] || {}).n || 0), 0) })
      return o
    },
    colScore() {
      const o = {}
      this.years.forEach((y) => { o[y] = this.rows.reduce((s, r) => s + ((r.byYear[y] || {}).score || 0), 0) })
      return o
    },
    total() {
      return {
        n: this.rows.reduce((s, r) => s + r.n, 0),
        score: this.rows.reduce((s, r) => s + r.score, 0)
      }
    },
    coldPoints() {
      const hit = new Set()
      allQuestions().forEach((it) => { if (it.q.point) hit.add(it.q.chapter + '|' + it.q.point) })
      const out = []
      this.rows.forEach((r) => {
        r.points.forEach((p) => {
          if (!hit.has(r.id + '|' + p)) out.push({ key: r.id + '|' + p, chapter: r.name, point: p })
        })
      })
      return out
    }
  },
  methods: {
    nOf(ch, y) { const r = this.rows.find((x) => x.id === ch); return r && r.byYear[y] ? r.byYear[y].n : 0 },
    scoreOf(ch, y) { const r = this.rows.find((x) => x.id === ch); return r && r.byYear[y] ? r.byYear[y].score : 0 },
    cellTitle(c, y) {
      const n = this.nOf(c.id, y)
      return y + ' 年 · ' + c.name + '：' + (n ? n + ' 题 / ' + this.scoreOf(c.id, y) + ' 分' : '没考')
    },
    scaleColor(ratio) {
      const pct = Math.round(10 + 66 * Math.min(1, Math.max(0, ratio)))
      return 'color-mix(in srgb, var(--brand) ' + pct + '%, var(--surface))'
    },
    cellStyle(ch, y) {
      const n = this.nOf(ch, y)
      if (!n) return {}
      const ratio = n / this.maxN
      return { background: this.scaleColor(ratio), color: ratio > 0.55 ? 'var(--on-brand)' : 'var(--ink)' }
    },
    pick(chId, year) {
      const q = { path: '/practice', query: { ch: chId } }
      if (year) q.query.y = year
      this.$emit('pick', q)
    }
  }
}
</script>
