<template>
  <div class="wrap">
    <h1 class="sr-only">模拟测试</h1>

    <!-- ============ 中断恢复 ============ -->
    <div class="card pad resume" style="margin:0 auto 18px;max-width:720px" v-if="stage === 'setup' && resumeInfo">
      <div class="r-ico"><Icon name="refresh" :size="19" /></div>
      <div class="r-main">
        <b>检测到未完成的考试</b>
        <p>{{ resumeInfo.setup.year }} 年 · 已答 {{ Object.keys(resumeInfo.examAnswers).length }}/{{ resumeInfo.ids.length }} 题 · 剩余 {{ Math.floor(resumeInfo.remain / 60) }} 分钟</p>
      </div>
      <div class="row">
        <button class="btn primary sm" @click="resumeExam"><Icon name="play" :size="14" />继续考试</button>
        <button class="btn ghost sm" @click="discardExam">放弃</button>
      </div>
    </div>

    <!-- ============ 考场设置 ============ -->
    <div v-if="stage === 'setup'" class="card pad" style="max-width:720px;margin:0 auto 10px">
      <div class="eyebrow">MOCK EXAM</div>
      <h3 style="margin:0 0 4px">模拟测试 · 考场设置</h3>
      <p class="qhint" style="margin-top:0">倒计时作答，交卷后选择题自动判分、综合题三档自评，全卷可回顾解析。成绩会存档，用于趋势与目标差距。</p>

      <div class="setup-grid" style="margin-top:18px">
        <div class="setup-row">
          <label>年份</label>
          <div class="setup-box chips">
            <span class="chip" v-for="y in yearList" :key="y" :class="{ on: setup.year === y }" @click="setup.year = y">{{ y }} 年</span>
          </div>
        </div>

        <div class="setup-row">
          <label>范围</label>
          <div class="setup-box scope-cards">
            <div class="scope-card" :class="{ on: setup.scope === 'all' }" @click="setup.scope = 'all'">
              <b>整卷</b>
              <span>{{ stat.total }} 题 / 150 分 · 综合题需自评</span>
            </div>
            <div class="scope-card" :class="{ on: setup.scope === 'choice' }" @click="setup.scope = 'choice'">
              <b>仅选择题</b>
              <span>{{ stat.choice }} 题 / {{ stat.choiceScore }} 分 · 自动判分</span>
            </div>
          </div>
        </div>

        <div class="setup-row">
          <label>时长</label>
          <div class="setup-box chips">
            <span class="chip" v-for="m in minutes" :key="m" :class="{ on: setup.minutes === m }" @click="setup.minutes = m">{{ m }} 分钟</span>
          </div>
        </div>

        <div class="setup-row">
          <label></label>
          <div class="setup-box">
            <button class="btn primary lg block" @click="start">
              开始考试 <Icon name="arrowRight" :size="15" />
            </button>
            <p class="qhint" style="margin:8px 0 0;font-size:12px">
              原卷 180 分钟 · 作答每 15 秒自动保存，误关页面可继续 · 目标分 {{ planTarget }}（<router-link to="/stats">可改</router-link>）
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ 考试中 ============ -->
    <template v-else-if="stage === 'run'">
      <div class="exambar">
        <div>
          <div class="name">{{ setup.year }} 年模拟测试</div>
          <div class="sub">{{ setup.scope === 'all' ? '整卷' : '仅选择题' }} · 标记 {{ markedSet.size }}</div>
        </div>
        <div class="eb-progress">
          <div class="pline"><i :style="{ width: answeredPct + '%' }"></i></div>
          <span>{{ answeredN }}/{{ queue.length }}</span>
        </div>
        <span class="timer" :class="{ danger: remain <= 300 }">{{ timerText }}</span>
        <button class="btn sm on-dark" @click="submit">交卷</button>
      </div>

      <div class="layout2" style="margin-top:16px">
        <div>
          <QuestionCard :item="cur" :pick="pick" :revealed="false" :locked="false" @pick="onPick">
            <div class="qactions">
              <span class="qhint" v-if="cur.q.type === 'choice'">考试模式：作答后暂不公布对错，交卷后统一判分</span>
              <span class="qhint" v-else>请先在草稿上完成本题，交卷后对照解析自评</span>
              <span class="qhint">本题已用 {{ curUsed }}</span>
              <span style="flex:1"></span>
              <button class="btn sm" :class="{ soft: isMarked }" @click="toggleMark">
                <Icon name="flag" :size="14" />{{ isMarked ? '已标记' : '标记存疑' }} <kbd>M</kbd>
              </button>
            </div>
          </QuestionCard>

          <div class="qnav" style="margin-top:14px">
            <button class="btn ghost sm" @click="prev" :disabled="pos === 0"><Icon name="left" :size="14" />上一题</button>
            <span class="progress">{{ pos + 1 }} / {{ queue.length }}</span>
            <button class="btn ghost sm" @click="next" :disabled="pos === queue.length - 1">下一题<Icon name="right" :size="14" /></button>
            <span class="qhint" style="flex-basis:100%;font-size:12px">快捷键：A~D 选项 · ← → 切题 · M 标记存疑 · G 跳第一个未答</span>
          </div>
        </div>

        <aside class="side">
          <div class="card">
            <h5>答题卡</h5>
            <SheetPanel :items="queue" :current="pos" :answered-set="answeredSet" :wrong-set="emptySet"
              :marked="markedSet" :show-mark="true" @jump="jumpTo" />
            <div class="row" style="margin-top:14px">
              <button class="btn primary block" @click="submit">交卷并出分</button>
            </div>
            <p class="qhint" style="margin:10px 0 0;font-size:12px">未答 {{ queue.length - answeredN }} 题 · 倒计时结束自动交卷</p>
          </div>
        </aside>
      </div>
    </template>

    <!-- ============ 成绩 ============ -->
    <div v-else-if="stage === 'result'" style="max-width:880px;margin:0 auto">
      <div class="card score-hero">
        <div class="eyebrow" style="justify-content:center">RESULT</div>
        <h3 style="margin:0 0 4px">{{ setup.year }} 年模拟测试</h3>
        <p class="qhint" style="margin:0">{{ setup.scope === 'all' ? '整卷' : '仅选择题' }} · 用时 {{ usedText }}</p>

        <div class="score-ring-wrap">
          <ProgressRing :value="scorePct" :size="150" :stroke="11" :text="score + ''" label="得分" :color="scoreColor" />
          <div style="text-align:left">
            <div class="score" style="font-size:40px">{{ score }}<small> / {{ fullScore }}</small></div>
            <div class="score-cap">得分率 {{ scorePct }}%{{ gradeText ? ' · ' + gradeText : '' }}</div>
            <div class="score-cap" v-if="targetGap !== null" :style="{ color: targetGap >= 0 ? 'var(--ok-ink)' : 'var(--bad-ink)' }">
              {{ targetGap >= 0 ? '已达目标分，超出 ' + targetGap + ' 分' : '距目标 ' + planTarget + ' 还差 ' + Math.abs(targetGap) + ' 分' }}
            </div>
            <div class="row" style="margin-top:12px">
              <button class="btn primary" @click="stage = 'review'">回顾全卷</button>
              <button class="btn" @click="reset">再考一次</button>
              <router-link class="btn ghost" to="/stats">成绩趋势</router-link>
            </div>
          </div>
        </div>

        <div class="score-split">
          <div class="score-cell">
            <div class="k">选择题（自动判分）</div>
            <div class="v">{{ choiceScore }}<small style="font-size:13px;color:var(--muted)"> / {{ choiceTotal }}</small></div>
          </div>
          <div class="score-cell">
            <div class="k">综合题（自评）</div>
            <div class="v">{{ bigScored }}<small style="font-size:13px;color:var(--muted)"> / {{ bigTotal }} 题</small></div>
          </div>
          <div class="score-cell">
            <div class="k">未作答</div>
            <div class="v">{{ unanswered }}</div>
          </div>
        </div>
      </div>

      <!-- 节奏分析 -->
      <div class="card pad" style="margin-top:16px">
        <div class="row" style="justify-content:space-between;margin-bottom:6px">
          <h5 style="margin:0;color:var(--muted);font-size:11px;letter-spacing:1.6px;font-weight:800">本场节奏</h5>
          <span class="qhint" style="font-size:12px">参考 {{ refSec }} 秒/分 · 满分 150 分 ≈ 180 分钟</span>
        </div>
        <div class="mini-grid">
          <div class="mini"><span>总用时</span><b>{{ usedText }}</b></div>
          <div class="mini"><span>选择题均速</span><b>{{ avgChoice }}</b></div>
          <div class="mini"><span>综合题均速</span><b>{{ avgBig }}</b></div>
          <div class="mini"><span>最慢一题</span><b>{{ slowestText }}</b></div>
        </div>
        <div class="bar-row" v-for="r in slowest" :key="r.id">
          <span class="bl">{{ r.label }}</span>
          <span class="bar"><i :style="{ width: r.pct + '%' }"></i></span>
          <span class="bv">{{ r.sec }} 秒</span>
        </div>
        <p class="qhint" style="margin:8px 0 0;font-size:12px" v-if="paceTip">{{ paceTip }}</p>
      </div>

      <div class="card pad" style="margin-top:16px" v-if="bigItems.length">
        <h5 style="margin:0 0 4px;color:var(--muted);font-size:11px;letter-spacing:1.6px;font-weight:800">综合题自评</h5>
        <p class="qhint" style="margin:0 0 10px">三档：满分 / 部分（按 60% 计） / 0 分。分数实时汇总，自评结果同时记入复习排期。</p>
        <div class="bar-row big-judge" v-for="it in bigItems" :key="it.q.id">
          <span class="bl">综合题 {{ it.q.num }}（{{ it.q.score }} 分）</span>
          <button class="btn sm ok" @click="judgeBig(it, 1)">满分 {{ it.q.score }}</button>
          <button class="btn sm fuzzy" @click="judgeBig(it, 2)">部分 {{ Math.round(it.q.score * 0.6) }}</button>
          <button class="btn sm bad" @click="judgeBig(it, 3)">0 分</button>
          <span class="bv">{{ selfScore[it.q.id] !== undefined ? selfScore[it.q.id] + ' 分' : '未评' }}</span>
        </div>
      </div>
    </div>

    <!-- ============ 回顾 ============ -->
    <template v-else-if="stage === 'review'">
      <div class="exambar light">
        <div>
          <div class="name">回顾全卷 · {{ setup.year }} 年</div>
          <div class="sub">选择题已标出对错，综合题解析全量展开</div>
        </div>
        <span class="sep"></span>
        <label class="row" style="font-size:13px;color:var(--muted);gap:6px;cursor:pointer">
          <input type="checkbox" v-model="reviewOnlyWrong" /> 只看错题
        </label>
        <span class="badge brand">得分 {{ score }} / {{ fullScore }}</span>
        <button class="btn sm" @click="stage = 'result'">返回成绩</button>
      </div>

      <div style="max-width:880px;margin:16px auto">
        <div v-for="it in reviewList" :key="it.q.id" style="margin-bottom:18px">
          <QuestionCard :item="it" :pick="examAnswers[it.q.id] || ''" :revealed="true" :locked="true">
            <div class="qactions" v-if="it.q.type === 'choice'">
              <span class="badge" :class="!examAnswers[it.q.id] ? 'gray' : examAnswers[it.q.id] === it.q.answer ? 'ok' : 'bad'">
                {{ !examAnswers[it.q.id] ? '未作答' : examAnswers[it.q.id] === it.q.answer ? '回答正确' : '你的选择 ' + examAnswers[it.q.id] }}
              </span>
              <span class="badge gray" v-if="qTiming[it.q.id]">用时 {{ Math.round(qTiming[it.q.id] / 1000) }} 秒</span>
            </div>
          </QuestionCard>
        </div>
        <div class="empty" v-if="!reviewList.length">没有错题，全部答对 🎉</div>
        <div class="row" style="justify-content:center;margin:20px 0 6px">
          <button class="btn primary" @click="stage = 'result'">返回成绩单</button>
          <button class="btn" @click="reset">再考一次</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import QuestionCard from '../components/QuestionCard.vue'
import SheetPanel from '../components/SheetPanel.vue'
import Icon from '../components/Icon.vue'
import ProgressRing from '../components/ProgressRing.vue'
import { papers, allQuestions, optsOf, paperStat, shortTitle } from '../lib/data.js'
import { record, setLevel } from '../lib/records.js'
import { addExam, updateExam } from '../lib/examlog.js'
import { plan } from '../lib/plan.js'
import { renderMathZones } from '../lib/render.js'
import { lightbox } from '../lib/lightbox.js'
import { toast } from '../lib/toast.js'
import { clockText, durText } from '../lib/format.js'

const EKEY = 'bupt801-exam-v1'

export default {
  name: 'ExamView',
  components: { QuestionCard, SheetPanel, Icon, ProgressRing },
  data() {
    const qs = new URLSearchParams(location.search)
    return {
      stage: 'setup',
      setup: { year: qs.get('y') || Object.keys(papers()).sort().pop(), scope: 'all', minutes: 180 },
      minutes: [30, 60, 90, 120, 150, 180],
      queue: [], pos: 0,
      examAnswers: {}, markedSet: new Set(),
      remain: 0, timer: null, usedSec: 0, deadline: 0,
      selfScore: {}, emptySet: new Set(),
      choiceScore: 0, choiceTotal: 0, bigScored: 0,
      resumeInfo: null, reviewOnlyWrong: false,
      qTiming: {}, qEnter: 0, examLogId: '',
      refSec: 50
    }
  },
  computed: {
    yearList() { return Object.keys(papers()).sort().reverse() },
    stat() { return paperStat(papers()[this.setup.year]) },
    totalN() { return papers()[this.setup.year].questions.length },
    planTarget() { return plan.target || 110 },
    cur() { return this.queue[this.pos] },
    pick() { return this.cur ? this.examAnswers[this.cur.q.id] || '' : '' },
    isMarked() { return this.cur ? this.markedSet.has(this.cur.q.id) : false },
    bigItems() { return this.queue.filter((it) => it.q.type === 'big') },
    answeredN() { return Object.keys(this.examAnswers).length },
    answeredPct() { return this.queue.length ? Math.round(this.answeredN / this.queue.length * 100) : 0 },
    answeredSet() { return this.examAnswers },
    choiceTotalAll() { return this.queue.filter((it) => it.q.type === 'choice').length },
    unanswered() { return Math.max(0, this.choiceTotalAll - this.answeredN) },
    fullScore() { return this.setup.scope === 'all' ? 150 : this.stat.choiceScore },
    timerText() { return clockText(this.remain) },
    usedText() { return durText(this.usedSec * 1000) },
    curUsed() { return durText(this.qTiming[this.cur ? this.cur.q.id : ''] || 0) },
    score() {
      let t = this.choiceScore
      Object.values(this.selfScore).forEach((v) => { t += v || 0 })
      return t
    },
    scorePct() { return this.fullScore ? Math.round(this.score / this.fullScore * 100) : 0 },
    scoreColor() { return this.scorePct >= 80 ? 'var(--ok)' : this.scorePct >= 60 ? 'var(--warn)' : 'var(--bad)' },
    targetGap() { return this.stage === 'result' ? this.score - this.planTarget : null },
    gradeText() {
      const p = this.scorePct
      return p >= 90 ? '接近满分' : p >= 75 ? '已经很稳' : p >= 60 ? '及格线上' : '还有提升空间'
    },
    bigTotal() { return this.bigItems.length },
    choiceItems() { return this.queue.filter((it) => it.q.type === 'choice') },
    avgChoice() {
      const list = this.choiceItems.map((it) => this.qTiming[it.q.id] || 0).filter((x) => x > 0)
      if (!list.length) return '—'
      return Math.round(list.reduce((a, b) => a + b, 0) / list.length / 1000) + ' 秒'
    },
    avgBig() {
      const list = this.bigItems.map((it) => this.qTiming[it.q.id] || 0).filter((x) => x > 0)
      if (!list.length) return '—'
      return durText(list.reduce((a, b) => a + b, 0) / list.length)
    },
    slowest() {
      const list = this.queue
        .map((it) => ({ id: it.q.id, ms: this.qTiming[it.q.id] || 0, label: it.year + ' · ' + shortTitle(it.q) }))
        .filter((x) => x.ms > 0)
        .sort((a, b) => b.ms - a.ms)
        .slice(0, 3)
      const max = Math.max(1, ...list.map((x) => x.ms))
      return list.map((x) => Object.assign(x, { sec: Math.round(x.ms / 1000), pct: Math.round(x.ms / max * 100) }))
    },
    slowestText() {
      const s = this.slowest[0]
      return s ? s.sec + ' 秒（' + s.label + '）' : '—'
    },
    paceTip() {
      const over = this.choiceItems.filter((it) => {
        const ms = this.qTiming[it.q.id] || 0
        return ms > this.refSec * 1000 * 2.5
      }).length
      if (over >= 3) return '有 ' + over + ' 道选择题花了 2 分钟以上：1 分的题不该纠缠，先把会做的拿满，再回头攻。'
      if (this.unanswered) return '还有 ' + this.unanswered + ' 题没作答：考场上先扫一遍全卷，把能拿的分先拿到手。'
      return '节奏正常：选择题控制在 1 分钟内、综合题按分值分配时间，留 10 分钟检查。'
    },
    reviewList() {
      if (!this.reviewOnlyWrong) return this.queue
      return this.queue.filter((it) => {
        if (it.q.type !== 'choice') return false
        return this.examAnswers[it.q.id] !== it.q.answer
      })
    }
  },
  methods: {
    // ---- 逐题计时：切题前把这一题停留的时长累加 ----
    flushTime() {
      const id = this.cur && this.cur.q.id
      const now = Date.now()
      if (id && this.qEnter) {
        const dt = now - this.qEnter
        if (dt > 0 && dt < 3 * 3600 * 1000) this.qTiming[id] = (this.qTiming[id] || 0) + dt
      }
      this.qEnter = now
    },
    // ---- 中断恢复 ----
    loadSaved() {
      try { return JSON.parse(localStorage.getItem(EKEY) || 'null') } catch (e) { return null }
    },
    saveExam() {
      if (this.stage !== 'run') return
      const data = {
        stage: 'run', setup: this.setup,
        ids: this.queue.map((it) => it.q.id),
        pos: this.pos, examAnswers: this.examAnswers,
        marked: Array.from(this.markedSet),
        selfScore: this.selfScore, remain: this.remain, usedSec: this.usedSec,
        qTiming: this.qTiming, savedAt: Date.now()
      }
      try { localStorage.setItem(EKEY, JSON.stringify(data)) } catch (e) {}
    },
    clearExam() { try { localStorage.removeItem(EKEY) } catch (e) {} },
    resumeExam() {
      const s = this.resumeInfo
      if (!s) return
      const byId = {}
      allQuestions().forEach((it) => { byId[it.q.id] = it })
      const queue = s.ids.map((id) => byId[id]).filter(Boolean)
      if (queue.length !== s.ids.length) { this.discardExam(); return }
      this.setup = s.setup
      this.queue = queue
      this.pos = Math.min(s.pos, queue.length - 1)
      this.examAnswers = s.examAnswers || {}
      this.markedSet = new Set(s.marked || [])
      this.selfScore = s.selfScore || {}
      this.qTiming = s.qTiming || {}
      this.usedSec = s.usedSec || 0
      this.remain = s.remain || this.setup.minutes * 60
      this.resumeInfo = null
      this.stage = 'run'
      this.qEnter = Date.now()
      this.startTimer()
      this.$nextTick(() => renderMathZones(document))
    },
    discardExam() { this.resumeInfo = null; this.clearExam() },
    // 用「截止时间戳」而不是逐秒自减：标签页被节流/切后台再回来，
    // 剩余时间仍然按真实时间走，不会越切越慢。
    startTimer() {
      clearInterval(this.timer)
      this.deadline = Date.now() + this.remain * 1000
      this.timer = setInterval(() => {
        const remain = Math.max(0, Math.round((this.deadline - Date.now()) / 1000))
        const changed = remain !== this.remain
        this.remain = remain
        this.usedSec = Math.max(this.usedSec, this.setup.minutes * 60 - remain)
        if (changed && remain % 15 === 0) this.saveExam()
        if (remain <= 0) { this.remain = 0; this.submit(true) }
      }, 1000)
    },
    start() {
      const p = papers()[this.setup.year]
      this.queue = p.questions.map((q) => ({ year: p.year, q, p }))
      if (this.setup.scope === 'choice') this.queue = this.queue.filter((it) => it.q.type === 'choice')
      this.examAnswers = {}; this.markedSet = new Set(); this.selfScore = {}
      this.qTiming = {}
      this.pos = 0; this.usedSec = 0
      this.remain = this.setup.minutes * 60
      this.stage = 'run'
      this.examLogId = ''
      this.qEnter = Date.now()
      this.clearExam()
      this.startTimer()
      this.$nextTick(() => renderMathZones(document))
    },
    onPick(k) { this.examAnswers[this.cur.q.id] = k; this.saveExam() },
    toggleMark() {
      const id = this.cur.q.id
      this.markedSet.has(id) ? this.markedSet.delete(id) : this.markedSet.add(id)
      this.markedSet = new Set(this.markedSet)
      this.saveExam()
    },
    prev() { this.flushTime(); if (this.pos > 0) { this.pos--; this.scrollUp(); this.saveExam() } },
    next() { this.flushTime(); if (this.pos < this.queue.length - 1) { this.pos++; this.scrollUp(); this.saveExam() } },
    jumpTo(i) { this.flushTime(); this.pos = i; this.scrollUp(); this.saveExam() },
    scrollUp() { window.scrollTo({ top: 0, behavior: 'smooth' }) },
    onKey(e) {
      if (lightbox.open || this.stage !== 'run' || !this.cur) return
      const t = e.target
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
      const k = e.key.toLowerCase()
      if (k === 'arrowleft') { this.prev(); e.preventDefault() }
      else if (k === 'arrowright') { this.next(); e.preventDefault() }
      else if (k === 'm') this.toggleMark()
      else if (k === 'g') {
        const idx = this.queue.findIndex((it) => this.examAnswers[it.q.id] === undefined && it.q.type === 'choice')
        if (idx >= 0) this.jumpTo(idx)
      } else if (k >= 'a' && k <= 'd') {
        const key = k.toUpperCase()
        const opts = optsOf(this.cur)
        if (this.cur.q.type === 'choice' && opts[key] !== undefined) this.onPick(key)
      }
    },
    submit(auto) {
      const unanswered = this.choiceTotalAll - this.answeredN
      if (!auto && unanswered > 0 && !confirm('还有 ' + unanswered + ' 道选择题未作答，确定交卷？')) return
      this.flushTime()
      clearInterval(this.timer)
      this.clearExam()
      let score = 0, total = 0
      this.queue.forEach((it) => {
        if (it.q.type !== 'choice') return
        total++
        const pick = this.examAnswers[it.q.id]
        if (pick === undefined) return
        const ok = pick === it.q.answer
        if (ok) score++
        record(it.q.id, ok, this.qTiming[it.q.id] || 0)
      })
      this.choiceScore = score; this.choiceTotal = total
      this.bigScored = Object.keys(this.selfScore).length
      this.stage = 'result'
      this.reviewOnlyWrong = false
      // 成绩落盘：趋势图与目标差距都靠它
      const entry = addExam({
        year: this.setup.year,
        scope: this.setup.scope,
        score: this.score,
        full: this.fullScore,
        choiceScore: score,
        choiceTotal: total,
        usedSec: this.usedSec,
        perQ: this.queue.map((it) => ({ id: it.q.id, score: it.q.score || 1, ms: this.qTiming[it.q.id] || 0 }))
      })
      this.examLogId = entry.id
      this.$nextTick(() => renderMathZones(document))
      toast(auto ? '时间到，已自动交卷' : '已交卷，选择题判分完成', 'ok')
    },
    judgeBig(it, level) {
      const full = it.q.score || 15
      const val = level === 1 ? full : level === 2 ? Math.round(full * 0.6) : 0
      // 三档与练习页口径一致：会 → c++、模糊 → f++、不会 → w++
      setLevel(it.q.id, level, this.qTiming[it.q.id] || 0)
      this.selfScore[it.q.id] = val
      this.bigScored = Object.keys(this.selfScore).length
      if (this.examLogId) updateExam(this.examLogId, { score: this.score, bigDone: this.bigScored })
    },
    reset() {
      clearInterval(this.timer)
      this.clearExam()
      this.stage = 'setup'
      this.examAnswers = {}; this.markedSet = new Set(); this.selfScore = {}
      this.qTiming = {}
    }
  },
  watch: {
    cur: {
      immediate: true,
      handler() { this.$nextTick(() => renderMathZones(document)) }
    },
    stage() { this.$nextTick(() => renderMathZones(document)) }
  },
  created() {
    const s = this.loadSaved()
    if (s && s.stage === 'run' && s.ids && s.ids.length) this.resumeInfo = s
  },
  mounted() { window.addEventListener('keydown', this.onKey) },
  beforeUnmount() { clearInterval(this.timer); window.removeEventListener('keydown', this.onKey) }
}
</script>
