<template>
  <div class="wrap" style="max-width:1040px">
    <div class="section-head" style="margin-top:6px">
      <div>
        <div class="eyebrow">LEARNING DATA</div>
        <h2>做题统计</h2>
      </div>
      <span class="desc">记录只保存在本机浏览器</span>
      <span class="spacer"></span>
      <button class="btn sm ghost" @click="clear"><Icon name="trash" :size="14" />清空记录</button>
    </div>

    <!-- KPI -->
    <div class="kpi-grid">
      <div class="kpi brand">
        <div class="k-top"><span class="k-label">累计作答</span><span class="k-ico"><Icon name="bolt" :size="15" /></span></div>
        <div class="k-val">{{ totalN }}<small>次</small></div>
      </div>
      <div class="kpi ok">
        <div class="k-top"><span class="k-label">答对</span><span class="k-ico"><Icon name="check" :size="15" /></span></div>
        <div class="k-val">{{ okN }}<small>次</small></div>
      </div>
      <div class="kpi bad">
        <div class="k-top"><span class="k-label">错题</span><span class="k-ico"><Icon name="x" :size="15" /></span></div>
        <div class="k-val">{{ wrongIds.length }}<small>题</small></div>
      </div>
      <div class="kpi warn">
        <div class="k-top"><span class="k-label">总正确率</span><span class="k-ico"><Icon name="chart" :size="15" /></span></div>
        <div class="k-val">{{ pct }}<small>%</small></div>
      </div>
    </div>

    <!-- 掌握度 + 活跃度 -->
    <div class="duo" style="margin-top:16px">
      <div class="card pad">
        <h5 style="margin:0 0 12px;color:var(--muted);font-size:11px;letter-spacing:1.6px;font-weight:800">掌握度分布</h5>
        <div class="mastery">
          <div style="position:relative;width:132px;height:132px;flex:none">
            <svg width="132" height="132" viewBox="0 0 132 132">
              <circle cx="66" cy="66" r="54" fill="none" stroke="var(--surface-3)" stroke-width="14" />
              <circle v-for="(s, i) in segs" :key="i" cx="66" cy="66" r="54" fill="none"
                :style="{ stroke: s.color }" stroke-width="14" stroke-linecap="butt"
                :stroke-dasharray="s.len + ' ' + (C - s.len)" :stroke-dashoffset="-s.off"
                transform="rotate(-90 66 66)" />
            </svg>
            <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.2">
              <b style="font-size:22px;font-weight:800">{{ masteryTotal }}</b>
              <span style="font-size:11px;color:var(--muted)">已自评</span>
            </div>
          </div>
          <div class="mastery-legend">
            <div class="ml-row"><i style="background:var(--ok)"></i>会 <b>{{ levelN.lev1 }}</b></div>
            <div class="ml-row"><i style="background:var(--warn)"></i>模糊 <b>{{ levelN.lev2 }}</b></div>
            <div class="ml-row"><i style="background:var(--bad)"></i>不会 <b>{{ levelN.lev3 }}</b></div>
            <div class="ml-row" style="color:var(--muted);font-size:12px">综合题看解析后可自评三档</div>
          </div>
        </div>
      </div>

      <div class="card pad">
        <h5 style="margin:0 0 6px;color:var(--muted);font-size:11px;letter-spacing:1.6px;font-weight:800">最近 14 天作答</h5>
        <div class="activity">
          <div class="day" v-for="d in activity" :key="d.key" :class="{ has: d.n > 0 }" :title="d.key + '：' + d.n + ' 题'">
            <i :style="{ height: (d.n ? Math.max(8, d.n / activityMax * 100) : 3) + '%' }"></i>
            <span v-if="d.n === activityMax && d.n > 0">{{ d.n }}</span>
          </div>
        </div>
        <div class="row" style="justify-content:space-between;margin-top:8px;font-size:11.5px;color:var(--faint)">
          <span>{{ activity[0].label }}</span>
          <span>今天</span>
        </div>
        <p class="qhint" style="margin:8px 0 0;font-size:12px">共 {{ activityTotal }} 题 · 峰值 {{ activityMax }} 题/天</p>
      </div>
    </div>

    <!-- 分章正确率 -->
    <div class="card pad" style="margin-top:16px">
      <div class="row" style="justify-content:space-between;margin-bottom:4px">
        <h5 style="margin:0;color:var(--muted);font-size:11px;letter-spacing:1.6px;font-weight:800">分章正确率</h5>
        <span class="qhint" style="font-size:12px">按累计对错次数统计</span>
      </div>
      <div class="bar-row" v-for="row in chapterRows" :key="row.id" :class="{ low: row.pct < 50, mid: row.pct < 75 }">
        <span class="bl" :title="row.name">{{ row.name }}</span>
        <span class="bar"><i :style="{ width: row.pct + '%' }"></i></span>
        <span class="bv">{{ row.pct }}% · {{ row.n }}次</span>
      </div>
      <div class="empty" v-if="!chapterRows.length" style="margin-top:8px">
        <div class="empty-ico"><Icon name="chart" :size="26" /></div>
        暂无做题数据，先去刷几题吧
        <div class="row" style="justify-content:center;margin-top:12px">
          <router-link class="btn sm soft" to="/practice">去刷题</router-link>
        </div>
      </div>
    </div>

    <!-- 错题本 / 收藏 -->
    <div class="duo" style="margin-top:16px">
      <div class="card pad">
        <div class="row" style="justify-content:space-between;margin-bottom:6px">
          <h5 style="margin:0;color:var(--muted);font-size:11px;letter-spacing:1.6px;font-weight:800">错题本 · {{ wrongIds.length }}</h5>
          <router-link class="btn sm primary" v-if="wrongIds.length" :to="{ path: '/practice', query: { wrong: '1' } }">
            错题重练
          </router-link>
        </div>
        <div class="list-scroll">
          <div class="list-row" v-for="id in wrongIds" :key="id">
            <span class="badge bad">错</span>
            <div class="lr-main">
              <b>{{ titleOf(id) }}</b>
              <div class="lr-sub">{{ timeOf(id) }}</div>
            </div>
            <router-link class="btn sm ghost" :to="{ path: '/practice', query: { id } }">重做</router-link>
          </div>
        </div>
        <div class="empty" v-if="!wrongIds.length" style="padding:24px 12px">还没有错题，保持住 🎉</div>
      </div>

      <div class="card pad">
        <div class="row" style="justify-content:space-between;margin-bottom:6px">
          <h5 style="margin:0;color:var(--muted);font-size:11px;letter-spacing:1.6px;font-weight:800">收藏 · {{ starIds.length }}</h5>
          <router-link class="btn sm primary" v-if="starIds.length" :to="{ path: '/practice', query: { star: '1' } }">
            只刷收藏
          </router-link>
        </div>
        <div class="list-scroll">
          <div class="list-row" v-for="id in starIds" :key="id">
            <span class="badge warn">★</span>
            <div class="lr-main">
              <b>{{ titleOf(id) }}</b>
              <div class="lr-sub">{{ timeOf(id) }}</div>
            </div>
            <router-link class="btn sm ghost" :to="{ path: '/practice', query: { id } }">打开</router-link>
          </div>
        </div>
        <div class="empty" v-if="!starIds.length" style="padding:24px 12px">还没有收藏，刷题时点 ☆ 收藏</div>
      </div>
    </div>
  </div>
</template>

<script>
import Icon from '../components/Icon.vue'
import { chapters, allQuestions, chapterLabel, shortTitle } from '../lib/data.js'
import { rec, clearRec, starredIds, dailyCounts } from '../lib/records.js'
import { toast } from '../lib/toast.js'

export default {
  name: 'StatsView',
  components: { Icon },
  computed: {
    byId() {
      const m = {}
      allQuestions().forEach((it) => { m[it.q.id] = it })
      return m
    },
    entries() {
      return Object.keys(rec)
        .filter((id) => rec[id] && (rec[id].c || rec[id].w))
        .map((id) => ({ id, r: rec[id], it: this.byId[id] }))
        .filter((e) => e.it)
    },
    totalN() { return this.entries.reduce((s, e) => s + e.r.c + e.r.w, 0) },
    okN() { return this.entries.reduce((s, e) => s + e.r.c, 0) },
    pct() { return this.totalN ? Math.round(this.okN / this.totalN * 100) : 0 },
    wrongIds() { return this.sortByTime(Object.keys(rec).filter((id) => rec[id] && rec[id].ok === false)) },
    starIds() { return this.sortByTime(starredIds()) },
    levelN() {
      const n = { lev1: 0, lev2: 0, lev3: 0 }
      Object.keys(rec).forEach((id) => {
        const l = rec[id] && rec[id].level
        if (l === 1) n.lev1++
        else if (l === 2) n.lev2++
        else if (l === 3) n.lev3++
      })
      return n
    },
    masteryTotal() { return this.levelN.lev1 + this.levelN.lev2 + this.levelN.lev3 },
    C() { return 2 * Math.PI * 54 },
    segs() {
      const total = this.masteryTotal || 1
      const parts = [
        { n: this.levelN.lev1, color: 'var(--ok)' },
        { n: this.levelN.lev2, color: 'var(--warn)' },
        { n: this.levelN.lev3, color: 'var(--bad)' }
      ]
      let off = 0
      return parts.filter((p) => p.n > 0).map((p) => {
        const len = (p.n / total) * this.C
        const seg = { len: Math.max(0, len - 2), off, color: p.color }
        off += len
        return seg
      })
    },
    activity() { return dailyCounts(14) },
    activityMax() { return Math.max(1, ...this.activity.map((d) => d.n)) },
    activityTotal() { return this.activity.reduce((s, d) => s + d.n, 0) },
    chapterRows() {
      const map = {}
      this.entries.forEach((e) => {
        const key = e.it.q.chapter
        map[key] = map[key] || { c: 0, w: 0 }
        map[key].c += e.r.c; map[key].w += e.r.w
      })
      return chapters().filter((c) => map[c.id]).map((c) => {
        const st = map[c.id]
        return { id: c.id, name: c.name, n: st.c + st.w, pct: Math.round(st.c / (st.c + st.w) * 100) }
      }).sort((a, b) => a.pct - b.pct)
    }
  },
  methods: {
    sortByTime(ids) {
      return ids.slice().sort((a, b) => (rec[b].t || 0) - (rec[a].t || 0))
    },
    titleOf(id) {
      const it = this.byId[id]
      if (!it) return id
      return it.year + ' 年 ' + shortTitle(it.q)
    },
    timeOf(id) {
      const r = rec[id]
      const it = this.byId[id]
      const ch = it ? chapterLabel(it.q) : ''
      if (!r || !r.t) return ch
      const d = new Date(r.t)
      const md = (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日'
      return ch + ' · ' + md + ' 最后一次'
    },
    clear() {
      if (!confirm('确定清空全部做题记录（含错题本、收藏、模考进度）？')) return
      clearRec()
      try { localStorage.removeItem('bupt801-exam-v1') } catch (e) {}
      toast('记录已清空', 'ok')
    }
  }
}
</script>
