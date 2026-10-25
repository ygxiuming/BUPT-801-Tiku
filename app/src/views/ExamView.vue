<template>
  <div class="wrap">
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
      <p class="qhint" style="margin-top:0">倒计时作答，交卷后选择题自动判分、综合题按分值自评，全卷可回顾解析。</p>

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
            <p class="qhint" style="margin:8px 0 0;font-size:12px">原卷考试时间 180 分钟 · 作答每 15 秒自动保存，误关页面可继续</p>
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
            <span class="qhint" style="flex-basis:100%;font-size:12px">快捷键：A~D 选项 · ← → 切题 · M 标记存疑</span>
          </div>
        </div>

        <aside class="side">
          <div class="card">
            <h5>答题卡</h5>
            <SheetPanel :items="queue" :current="pos" :answered-set="answeredSet" :wrong-set="emptySet"
              :marked="markedSet" :show-mark="true" @jump="(i) => { pos = i; scrollUp() }" />
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
            <div class="row" style="margin-top:12px">
              <button class="btn primary" @click="stage = 'review'">回顾全卷</button>
              <button class="btn" @click="reset">再考一次</button>
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

      <div class="card pad" style="margin-top:16px" v-if="bigItems.length">
        <h5 style="margin:0 0 4px;color:var(--muted);font-size:11px;letter-spacing:1.6px;font-weight:800">综合题自评</h5>
        <p class="qhint" style="margin:0 0 10px">按各题实际分值计入总分，自评实时更新</p>
        <div class="bar-row" v-for="it in bigItems" :key="it.q.id">
          <span class="bl">综合题 {{ it.q.num }}（{{ it.q.score }} 分）</span>
          <button class="btn sm ok" @click="judgeBig(it, true)">满分 {{ it.q.score }}</button>
          <button class="btn sm bad" @click="judgeBig(it, false)">0 分</button>
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
import { papers, allQuestions, optsOf, paperStat } from '../lib/data.js'
import { record } from '../lib/records.js'
import { renderMathZones } from '../lib/render.js'
import { lightbox } from '../lib/lightbox.js'
import { toast } from '../lib/toast.js'

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
      remain: 0, timer: null, usedSec: 0,
      selfScore: {}, emptySet: new Set(),
      choiceScore: 0, choiceTotal: 0, bigScored: 0,
      resumeInfo: null, reviewOnlyWrong: false
    }
  },
  computed: {
    yearList() { return Object.keys(papers()).sort().reverse() },
    stat() { return paperStat(papers()[this.setup.year]) },
    totalN() { return papers()[this.setup.year].questions.length },
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
    timerText() {
      const m = Math.floor(this.remain / 60), s = this.remain % 60
      const h = Math.floor(m / 60)
      return (h ? h + ':' : '') + String(m % 60).padStart(2, '0') + ':' + String(s).padStart(2, '0')
    },
    usedText() {
      const m = Math.floor(this.usedSec / 60), s = this.usedSec % 60
      return m + ' 分 ' + s + ' 秒'
    },
    score() {
      let t = this.choiceScore
      Object.values(this.selfScore).forEach((v) => { t += v || 0 })
      return t
    },
    scorePct() { return this.fullScore ? Math.round(this.score / this.fullScore * 100) : 0 },
    scoreColor() { return this.scorePct >= 80 ? 'var(--ok)' : this.scorePct >= 60 ? 'var(--warn)' : 'var(--bad)' },
    gradeText() {
      const p = this.scorePct
      return p >= 90 ? '接近满分' : p >= 75 ? '已经很稳' : p >= 60 ? '及格线上' : '还有提升空间'
    },
    bigTotal() { return this.bigItems.length },
    reviewList() {
      if (!this.reviewOnlyWrong) return this.queue
      return this.queue.filter((it) => {
        if (it.q.type !== 'choice') return false
        return this.examAnswers[it.q.id] !== it.q.answer
      })
    }
  },
  methods: {
    // ---- 中断恢复：考试中实时落盘，刷新后可继续 ----
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
        savedAt: Date.now()
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
      this.usedSec = s.usedSec || 0
      this.remain = s.remain || this.setup.minutes * 60
      this.resumeInfo = null
      this.stage = 'run'
      this.startTimer()
      this.$nextTick(() => renderMathZones(document))
    },
    discardExam() { this.resumeInfo = null; this.clearExam() },
    startTimer() {
      clearInterval(this.timer)
      this.timer = setInterval(() => {
        this.remain--; this.usedSec++
        if (this.usedSec % 15 === 0) this.saveExam()
        if (this.remain <= 0) { this.remain = 0; this.submit(true) }
      }, 1000)
    },
    start() {
      const p = papers()[this.setup.year]
      this.queue = p.questions.map((q) => ({ year: p.year, q, p }))
      if (this.setup.scope === 'choice') this.queue = this.queue.filter((it) => it.q.type === 'choice')
      this.examAnswers = {}; this.markedSet = new Set(); this.selfScore = {}
      this.pos = 0; this.usedSec = 0
      this.remain = this.setup.minutes * 60
      this.stage = 'run'
      this.clearExam()
      this.startTimer()
      this.$nextTick(() => renderMathZones(document))
    },
    onPick(k) { this.examAnswers[this.cur.q.id] = k; this.saveExam() },
    toggleMark() {
      const id = this.cur.q.id
      this.markedSet.has(id) ? this.markedSet.delete(id) : this.markedSet.add(id)
      this.markedSet = new Set(this.markedSet) // 触发响应
      this.saveExam()
    },
    prev() { if (this.pos > 0) { this.pos--; this.scrollUp(); this.saveExam() } },
    next() { if (this.pos < this.queue.length - 1) { this.pos++; this.scrollUp(); this.saveExam() } },
    scrollUp() { window.scrollTo({ top: 0, behavior: 'smooth' }) },
    onKey(e) {
      if (lightbox.open || this.stage !== 'run' || !this.cur) return
      const t = e.target
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
      const k = e.key.toLowerCase()
      if (k === 'arrowleft') { this.prev(); e.preventDefault() }
      else if (k === 'arrowright') { this.next(); e.preventDefault() }
      else if (k === 'm') this.toggleMark()
      else if (k >= 'a' && k <= 'd') {
        const key = k.toUpperCase()
        const opts = optsOf(this.cur)
        if (this.cur.q.type === 'choice' && opts[key] !== undefined) this.onPick(key)
      }
    },
    submit(auto) {
      const unanswered = this.choiceTotalAll - this.answeredN
      if (!auto && unanswered > 0 && !confirm('还有 ' + unanswered + ' 道选择题未作答，确定交卷？')) return
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
        record(it.q.id, ok)
      })
      this.choiceScore = score; this.choiceTotal = total
      this.bigScored = Object.keys(this.selfScore).length
      this.stage = 'result'
      this.reviewOnlyWrong = false
      this.$nextTick(() => renderMathZones(document))
      toast(auto ? '时间到，已自动交卷' : '已交卷，选择题判分完成', 'ok')
    },
    judgeBig(it, ok) {
      record(it.q.id, ok)
      this.selfScore[it.q.id] = ok ? (it.q.score || 15) : 0
      this.bigScored = Object.keys(this.selfScore).length
    },
    reset() {
      clearInterval(this.timer)
      this.clearExam()
      this.stage = 'setup'
      this.examAnswers = {}; this.markedSet = new Set(); this.selfScore = {}
    }
  },
  watch: {
    cur: {
      immediate: true,
      handler() { this.$nextTick(() => renderMathZones(document)) }
    },
    // 进入回顾等阶段会一次性挂载大量解析，cur 不变也需重渲染公式
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
