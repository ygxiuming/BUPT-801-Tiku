<template>
  <div class="wrap">
    <h1 class="sr-only">间隔复习</h1>

    <div class="section-head" style="margin-top:6px">
      <div>
        <div class="eyebrow">SPACED REPETITION</div>
        <h2>间隔复习</h2>
      </div>
      <span class="desc">按遗忘曲线排期，先到期先复习 · FSRS 简化调度</span>
      <span class="spacer"></span>
      <button class="btn sm ghost" @click="rebuild(true)"><Icon name="refresh" :size="14" />重排今日队列</button>
    </div>

    <!-- 概览 -->
    <div class="kpi-grid">
      <div class="kpi brand">
        <div class="k-top"><span class="k-label">今日到期</span><span class="k-ico"><Icon name="clock" :size="15" /></span></div>
        <div class="k-val">{{ dueCount }}<small>题</small></div>
      </div>
      <div class="kpi warn">
        <div class="k-top"><span class="k-label">已进入复习</span><span class="k-ico"><Icon name="layers" :size="15" /></span></div>
        <div class="k-val">{{ learned }}<small>题</small></div>
      </div>
      <div class="kpi ok">
        <div class="k-top"><span class="k-label">平均间隔</span><span class="k-ico"><Icon name="chart" :size="15" /></span></div>
        <div class="k-val">{{ avgInterval }}<small>天</small></div>
      </div>
      <div class="kpi bad">
        <div class="k-top"><span class="k-label">本周遗忘</span><span class="k-ico"><Icon name="x" :size="15" /></span></div>
        <div class="k-val">{{ lapses7 }}<small>次</small></div>
      </div>
    </div>

    <div class="layout2" style="margin-top:16px">
      <div>
        <div class="card pad empty" v-if="!queue.length">
          <div class="empty-ico"><Icon name="check" :size="28" /></div>
          <template v-if="dueCount">今日到期都复习完了 🎉</template>
          <template v-else-if="learned">今天没有到期的题，下次到期在 {{ nextDueText }}</template>
          <template v-else>还没有进入复习的题。先去刷几题，做过的题会自动排进复习计划。</template>
          <div class="row" style="justify-content:center;margin-top:14px">
            <router-link class="btn sm primary" to="/practice">去刷题</router-link>
            <button class="btn sm" v-if="learned" @click="ahead">提前复习最弱的 10 题</button>
          </div>
        </div>

        <template v-else>
          <div class="toolrow no-print">
            <span class="tr-pos"><b>{{ pos + 1 }}</b> / {{ queue.length }}</span>
            <div class="tr-bar">
              <div class="pline"><i :style="{ width: donePct + '%' }"></i></div>
              <span class="tr-pct">{{ graded }} 已评 · 剩 {{ queue.length - pos }}</span>
            </div>
            <span class="sep"></span>
            <span class="badge" :class="dueNow ? 'warn' : 'gray'">{{ dueNow ? '到期 ' + dueCount + ' 题' : '提前复习' }}</span>
            <button class="btn sm ghost" @click="prev" :disabled="pos === 0" aria-label="上一题" title="上一题（←）"><Icon name="left" :size="15" /></button>
            <button class="btn sm ghost" @click="next" :disabled="pos >= queue.length - 1" aria-label="下一题" title="下一题（→）"><Icon name="right" :size="15" /></button>
          </div>

          <QuestionCard :item="cur" :pick="pick" :revealed="revealed" :locked="revealed" @pick="onPick">
            <div class="qactions">
              <button class="btn primary" v-if="!revealed" @click="reveal">显示答案 <kbd>Enter</kbd></button>
              <template v-else>
                <span class="qhint">评价一下这次的回忆质量：</span>
                <button v-for="g in grades" :key="g.g" class="btn sm grade-btn" :class="g.cls"
                  @click="grade(g.g)" :title="g.hint">{{ g.label }} <kbd>{{ g.g }}</kbd></button>
              </template>
              <span class="spacer" style="flex:1"></span>
              <span class="qhint shortcuts">1~4 评分 · ← → 切题 · Enter 看答案</span>
            </div>
          </QuestionCard>

          <div class="card pad" style="margin-top:16px">
            <NotePanel :id="cur.q.id" :label="'复习笔记 ' + cur.q.id" />
          </div>
        </template>
      </div>

      <aside class="side">
        <div class="card">
          <h5>未来 14 天负荷</h5>
          <div class="forecast">
            <div class="fc-day" v-for="d in forecast" :key="d.key" :title="d.label + '：' + d.n + ' 题'">
              <i :style="{ height: (d.n ? Math.max(10, d.n / fcMax * 100) : 3) + '%' }"></i>
              <span>{{ d.n || '' }}</span>
            </div>
          </div>
          <div class="row" style="justify-content:space-between;margin-top:6px;font-size:11px;color:var(--faint)">
            <span>今天</span><span>+13 天</span>
          </div>
          <p class="qhint" style="margin:8px 0 0;font-size:12px">每天 20–40 题是可持续的节奏；尖峰太高就分散到前后两天。</p>
        </div>

        <div class="card">
          <h5>队列设置</h5>
          <div class="fgroup">
            <label for="rv-limit">每次最多复习</label>
            <select id="rv-limit" v-model.number="limit" @change="rebuild(true)">
              <option v-for="n in [10, 20, 30, 50]" :key="n" :value="n">{{ n }} 题</option>
            </select>
          </div>
          <label class="row" style="font-size:12.5px;color:var(--muted);gap:6px;cursor:pointer;margin-top:6px">
            <input type="checkbox" v-model="includeNew" @change="rebuild(true)" /> 没学过新题也混进来
          </label>
          <p class="qhint" style="margin:10px 0 0;font-size:12px">
            评分 1「不会」→ 稳定度打折、明天再来；3「会」→ 间隔按稳定度放大；
            4「很熟」→ 额外拉长 60%。
          </p>
        </div>

        <div class="card">
          <h5>评分说明</h5>
          <div class="grade-legend">
            <div v-for="g in grades" :key="g.g" class="gl-row">
              <span class="badge" :class="g.cls === 'bad' ? 'bad' : g.cls === 'fuzzy' ? 'warn' : g.cls === 'ok' ? 'ok' : 'brand'">{{ g.label }}</span>
              <span>{{ g.hint }}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import QuestionCard from '../components/QuestionCard.vue'
import NotePanel from '../components/NotePanel.vue'
import Icon from '../components/Icon.vue'
import { allQuestions, findItem, optsOf } from '../lib/data.js'
import { rec, review } from '../lib/records.js'
import { GRADES, dueIds, forecast, intervalOf, dueText } from '../lib/srs.js'
import { renderMathZones } from '../lib/render.js'
import { lightbox } from '../lib/lightbox.js'
import { toast } from '../lib/toast.js'

export default {
  name: 'ReviewView',
  components: { QuestionCard, NotePanel, Icon },
  data: () => ({
    queue: [], pos: 0, revealed: false, pick: '', limit: 20, includeNew: false,
    grades: GRADES, done: 0, qStart: Date.now(), tick: 0
  }),
  computed: {
    cur() { return this.queue[this.pos] },
    dueCount() { this.tick; return dueIds(rec, Date.now()).length },
    dueNow() { this.tick; return dueIds(rec, Date.now()).length > 0 },
    learned() { return Object.keys(rec).filter((id) => rec[id] && rec[id].srs).length },
    avgInterval() {
      const list = Object.keys(rec).filter((id) => rec[id] && rec[id].srs).map((id) => intervalOf(rec[id].srs))
      if (!list.length) return 0
      return Math.round(list.reduce((a, b) => a + b, 0) / list.length)
    },
    lapses7() {
      const t = Date.now() - 7 * 86400000
      return Object.keys(rec).filter((id) => rec[id] && rec[id].srs && rec[id].srs.last >= t && rec[id].srs.lap > 0).length
    },
    forecast() { this.tick; return forecast(rec, 14, Date.now()) },
    fcMax() { return Math.max(1, ...this.forecast.map((d) => d.n)) },
    graded() { return this.pos + (this.revealed ? 1 : 0) },
    donePct() { return this.queue.length ? Math.round((this.pos / this.queue.length) * 100) : 0 },
    nextDueText() {
      const dues = Object.keys(rec).filter((id) => rec[id] && rec[id].srs).map((id) => rec[id].srs.due)
      if (!dues.length) return '—'
      return dueText(Math.min(...dues))
    }
  },
  methods: {
    rebuild(manual) {
      const now = Date.now()
      const due = dueIds(rec, now)
      let deck = due.slice()
      if (this.includeNew || (!due.length && !this.learned)) {
        const fresh = allQuestions()
          .filter((it) => !rec[it.q.id] || !rec[it.q.id].srs)
          .map((it) => {
            const r = rec[it.q.id]
            const w = !r ? 0 : r.level === 3 ? 4 : r.ok === false ? 3 : r.level === 2 ? 2 : 1
            return { it, w }
          })
          .sort((a, b) => b.w - a.w || Number(b.it.year) - Number(a.it.year))
          .map((x) => x.it.q.id)
        deck = deck.concat(fresh)
      }
      deck = deck.slice(0, this.limit)
      this.queue = deck.map((id) => findItem(id)).filter(Boolean)
      this.pos = 0
      this.revealed = false
      this.pick = ''
      this.qStart = Date.now()
      if (manual) toast('队列已重排：' + this.queue.length + ' 题', 'ok')
      this.$nextTick(() => renderMathZones(document))
    },
    ahead() {
      const ids = Object.keys(rec)
        .filter((id) => rec[id] && rec[id].srs)
        .sort((a, b) => {
          const ra = rec[a], rb = rec[b]
          const wa = ra.level === 3 ? 3 : ra.ok === false ? 2 : ra.level === 2 ? 1 : 0
          const wb = rb.level === 3 ? 3 : rb.ok === false ? 2 : rb.level === 2 ? 1 : 0
          return wb - wa
        })
        .slice(0, 10)
      this.queue = ids.map((id) => findItem(id)).filter(Boolean)
      this.pos = 0
      this.revealed = false
      this.$nextTick(() => renderMathZones(document))
    },
    reveal() {
      this.revealed = true
      this.$nextTick(() => renderMathZones(document))
    },
    onPick(k) { this.pick = k },
    grade(g) {
      if (!this.cur) return
      const id = this.cur.q.id
      review(id, g, Date.now() - this.qStart)
      const st = rec[id].srs
      const txt = g === 1 ? '下次 ' + dueText(st.due) : '下次 ' + dueText(st.due) + '（间隔 ' + intervalOf(st) + ' 天）'
      toast(this.grades.find((x) => x.g === g).label + ' · ' + txt, g === 1 ? 'bad' : g >= 3 ? 'ok' : 'info')
      this.tick++
      if (this.pos < this.queue.length - 1) this.next()
      else { this.revealed = false; this.pick = '' }
    },
    prev() { if (this.pos > 0) { this.pos--; this.revealed = false; this.pick = ''; this.qStart = Date.now() } },
    next() {
      if (this.pos < this.queue.length - 1) {
        this.pos++
        this.revealed = false
        this.pick = ''
        this.qStart = Date.now()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    onKey(e) {
      if (lightbox.open) return
      const t = e.target
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
      if (!this.cur) return
      const k = e.key.toLowerCase()
      if (k === 'enter' || k === ' ') { if (!this.revealed) { this.reveal(); e.preventDefault() } }
      else if (k === 'arrowleft') { this.prev(); e.preventDefault() }
      else if (k === 'arrowright') { this.next(); e.preventDefault() }
      else if (k >= '1' && k <= '4') { if (this.revealed) this.grade(Number(k)); else { this.reveal(); this.grade(Number(k)) } }
      else if (k >= 'a' && k <= 'd') {
        const key = k.toUpperCase()
        if (this.cur.q.type === 'choice' && optsOf(this.cur)[key] !== undefined && !this.revealed) this.pick = key
      }
    }
  },
  created() {
    this.rebuild()
    this.timer = setInterval(() => { this.tick++ }, 60000)
  },
  mounted() { window.addEventListener('keydown', this.onKey) },
  beforeUnmount() { window.removeEventListener('keydown', this.onKey); clearInterval(this.timer) },
  watch: {
    cur: { immediate: true, handler() { this.$nextTick(() => renderMathZones(document)) } },
    revealed() { this.$nextTick(() => renderMathZones(document)) }
  }
}
</script>
