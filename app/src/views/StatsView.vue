<template>
  <div class="wrap" style="max-width:1040px">
    <h1 class="sr-only">做题统计与学习数据</h1>

    <div class="section-head" style="margin-top:6px">
      <div>
        <div class="eyebrow">LEARNING DATA</div>
        <h2>做题统计</h2>
      </div>
      <span class="desc">记录只保存在本机浏览器 · 建议定期导出备份</span>
      <span class="spacer"></span>
      <button class="btn sm ghost" @click="gotoBackup"><Icon name="download" :size="14" />备份 / 恢复</button>
      <button class="btn sm ghost" @click="clear"><Icon name="trash" :size="14" />清空记录</button>
    </div>

    <!-- ============ 计划 + 周报 ============ -->
    <div class="duo">
      <div class="card pad">
        <div class="row" style="justify-content:space-between;margin-bottom:10px">
          <h5 style="margin:0;color:var(--muted);font-size:11px;letter-spacing:1.6px;font-weight:800">学习计划</h5>
          <span class="badge brand" v-if="daysLeft !== null">距考试 {{ daysLeft }} 天</span>
        </div>
        <div class="plan-grid">
          <label class="plan-field">
            <span>目标分</span>
            <input type="number" min="0" max="150" :value="plan.target" @change="savePlan({ target: clampNum($event.target.value, 0, 150) })" />
          </label>
          <label class="plan-field">
            <span>考试日</span>
            <input type="date" :value="plan.examDate" @change="savePlan({ examDate: $event.target.value })" />
          </label>
          <label class="plan-field">
            <span>每周目标（题）</span>
            <input type="number" min="0" max="2000" :value="plan.weekly" @change="savePlan({ weekly: clampNum($event.target.value, 0, 2000) })" />
          </label>
          <div class="plan-field static">
            <span>今日待复习</span>
            <b><router-link to="/review">{{ due }} 题 →</router-link></b>
          </div>
        </div>
        <div class="week-bar">
          <div class="pline"><i :style="{ width: weekPct + '%' }"></i></div>
          <span>{{ week.cur }} / {{ plan.weekly }} 题 · {{ weekPct }}%</span>
        </div>
        <p class="qhint" style="margin:8px 0 0;font-size:12px">
          本周学习 {{ week.days }} 天 · 连续 {{ streak }} 天 · 上周 {{ week.prev }} 题
          <span :class="week.cur >= week.prev ? 'ok-ink' : 'bad-ink'">
            （{{ week.cur >= week.prev ? '↑' : '↓' }}{{ Math.abs(week.cur - week.prev) }}）
          </span>
        </p>
      </div>

      <div class="card pad">
        <h5 style="margin:0 0 10px;color:var(--muted);font-size:11px;letter-spacing:1.6px;font-weight:800">本周周报</h5>
        <div class="mini-grid">
          <div class="mini"><span>本周作答</span><b>{{ week.cur }}<small>次</small></b></div>
          <div class="mini"><span>活跃天数</span><b>{{ week.days }}<small>/7 天</small></b></div>
          <div class="mini"><span>新增笔记</span><b>{{ weekNotes }}<small>条</small></b></div>
          <div class="mini"><span>模考次数</span><b>{{ weekExams }}<small>次</small></b></div>
        </div>
        <p class="qhint" style="margin:10px 0 0;font-size:12.5px">{{ weeklyTip }}</p>
      </div>
    </div>

    <!-- ============ KPI ============ -->
    <div class="kpi-grid" style="margin-top:16px">
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

    <!-- ============ 成绩趋势 ============ -->
    <div class="card pad" style="margin-top:16px">
      <div class="row" style="justify-content:space-between;margin-bottom:4px">
        <h5 style="margin:0;color:var(--muted);font-size:11px;letter-spacing:1.6px;font-weight:800">模考成绩趋势</h5>
        <span class="qhint" style="font-size:12px">最近 {{ exams.length }} 次 · 目标 {{ plan.target }} 分</span>
      </div>
      <TrendChart :items="examItems" :target="plan.target" />
      <div class="list-scroll" style="max-height:180px;margin-top:10px" v-if="exams.length">
        <div class="list-row" v-for="e in recentExams" :key="e.id">
          <span class="badge" :class="e.score >= plan.target ? 'ok' : 'gray'">{{ e.score }} / {{ e.full }}</span>
          <div class="lr-main">
            <b>{{ e.year }} 年 · {{ e.scope === 'choice' ? '仅选择题' : '整卷' }}</b>
            <div class="lr-sub">{{ dateText(e.at) }} · 用时 {{ durText((e.usedSec || 0) * 1000) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ 考点热度 ============ -->
    <div class="card pad" style="margin-top:16px" id="sec-heat">
      <div class="row" style="justify-content:space-between;margin-bottom:10px">
        <h5 style="margin:0;color:var(--muted);font-size:11px;letter-spacing:1.6px;font-weight:800">考点热度 · 章 × 年</h5>
        <span class="qhint" style="font-size:12px">复习优先级：深色且近年连续出现的章</span>
      </div>
      <HeatmapMatrix @pick="(q) => $router.push(q)" />
    </div>

    <!-- ============ 节奏分析 ============ -->
    <div class="card pad" style="margin-top:16px">
      <div class="row" style="justify-content:space-between;margin-bottom:4px">
        <h5 style="margin:0;color:var(--muted);font-size:11px;letter-spacing:1.6px;font-weight:800">每题耗时与分值</h5>
        <span class="qhint" style="font-size:12px">来自最近一次作答（{{ timedCount }} 题有计时）</span>
      </div>
      <TimeScatter :items="scatterItems" :ref-sec="50" />
      <div class="bar-row" v-for="r in slowest" :key="r.id">
        <span class="bl">{{ r.label }}</span>
        <span class="bar"><i :style="{ width: r.pct + '%' }"></i></span>
        <span class="bv">{{ r.sec }} 秒 / {{ r.score }} 分</span>
      </div>
      <p class="qhint" style="margin:6px 0 0;font-size:12px" v-if="slowest.length">{{ paceTip }}</p>
    </div>

    <!-- ============ 掌握度 + 活跃度 ============ -->
    <div class="duo" style="margin-top:16px">
      <div class="card pad">
        <h5 style="margin:0 0 12px;color:var(--muted);font-size:11px;letter-spacing:1.6px;font-weight:800">掌握度分布</h5>
        <div class="mastery">
          <div style="position:relative;width:132px;height:132px;flex:none">
            <svg width="132" height="132" viewBox="0 0 132 132" role="img" aria-label="掌握度环形图">
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
          <div class="day" v-for="d in activity" :key="d.key" :class="{ has: d.n > 0 }" :title="d.key + '：' + d.n + ' 次'">
            <i :style="{ height: (d.n ? Math.max(8, d.n / activityMax * 100) : 3) + '%' }"></i>
            <span v-if="d.n === activityMax && d.n > 0">{{ d.n }}</span>
          </div>
        </div>
        <div class="row" style="justify-content:space-between;margin-top:8px;font-size:11.5px;color:var(--faint)">
          <span>{{ activity[0].label }}</span>
          <span>今天</span>
        </div>
        <p class="qhint" style="margin:8px 0 0;font-size:12px">共 {{ activityTotal }} 次作答 · 峰值 {{ activityMax }} 次/天</p>
      </div>
    </div>

    <!-- ============ 分章正确率 ============ -->
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

    <!-- ============ 错题本 / 收藏 ============ -->
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
              <div class="lr-sub">{{ timeOf(id) }}<span v-if="hasNote(id)" class="note-mark"> · 有笔记</span></div>
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
              <div class="lr-sub">{{ timeOf(id) }}<span v-if="hasNote(id)" class="note-mark"> · 有笔记</span></div>
            </div>
            <router-link class="btn sm ghost" :to="{ path: '/practice', query: { id } }">打开</router-link>
          </div>
        </div>
        <div class="empty" v-if="!starIds.length" style="padding:24px 12px">还没有收藏，刷题时点 ☆ 收藏</div>
      </div>
    </div>

    <!-- ============ 备份 / 恢复 ============ -->
    <div class="card pad" style="margin-top:16px" id="sec-backup">
      <div class="row" style="justify-content:space-between;margin-bottom:6px">
        <h5 style="margin:0;color:var(--muted);font-size:11px;letter-spacing:1.6px;font-weight:800">数据备份与恢复</h5>
        <span class="qhint" style="font-size:12px">{{ backupSummary }}</span>
      </div>
      <p class="qhint" style="margin:0 0 10px;font-size:12.5px">
        导出包含做题记录、复习排期、笔记、模考成绩与学习计划。换浏览器 / 换设备时导入即可续上。
        导入默认按 id 逐字段合并（对错次数取大、收藏取或、复习状态取更晚一次），不会覆盖本地更新的数据。
      </p>
      <div class="row">
        <button class="btn sm primary" @click="exportFile"><Icon name="download" :size="14" />导出 JSON 文件</button>
        <button class="btn sm" @click="copyBackup">复制备份文本</button>
        <label class="btn sm ghost file-btn">
          选择备份文件
          <input type="file" accept=".json,application/json" @change="onFile" />
        </label>
      </div>
      <textarea v-model="importText" class="ed-textarea mono" rows="3" style="margin-top:10px"
        placeholder="也可以把备份 JSON 直接粘贴到这里，然后点「导入」" aria-label="备份 JSON 内容"></textarea>
      <div class="row" style="margin-top:8px">
        <label class="row" style="font-size:12.5px;color:var(--muted);gap:6px;cursor:pointer">
          <input type="checkbox" v-model="replaceMode" /> 先清空本地再导入（危险，仅在确认覆盖时用）
        </label>
        <span class="spacer" style="flex:1"></span>
        <button class="btn sm" :disabled="!importText.trim()" @click="doImport">导入</button>
      </div>
      <p class="qhint" style="margin:8px 0 0;font-size:12px" v-if="importMsg">{{ importMsg }}</p>
    </div>
  </div>
</template>

<script>
import Icon from '../components/Icon.vue'
import TrendChart from '../components/TrendChart.vue'
import TimeScatter from '../components/TimeScatter.vue'
import HeatmapMatrix from '../components/HeatmapMatrix.vue'
import { chapters, allQuestions, chapterLabel, shortTitle } from '../lib/data.js'
import { rec, clearRec, starredIds, dailyCounts, weekStats, streakDays } from '../lib/records.js'
import { hasNote, noteIds, notes } from '../lib/notes.js'
import { exams, clearExams, examSnapshot } from '../lib/examlog.js'
import { plan, setPlan, daysToExam } from '../lib/plan.js'
import { dueIds } from '../lib/srs.js'
import { buildBackup, toText, parseBackup, applyBackup, downloadBackup } from '../lib/backup.js'
import { dateText, durText } from '../lib/format.js'
import { toast } from '../lib/toast.js'
import { renderMathZones } from '../lib/render.js'

export default {
  name: 'StatsView',
  components: { Icon, TrendChart, TimeScatter, HeatmapMatrix },
  data: () => ({
    plan, importText: '', replaceMode: false, importMsg: '', tick: 0
  }),
  computed: {
    // 模板只能访问实例属性，模块级 import 必须在计算属性里桥接一次
    exams() { return exams },
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
    },
    // ---- 计划 / 周报 ----
    daysLeft() { this.tick; return daysToExam() },
    week() { this.tick; return weekStats() },
    streak() { this.tick; return streakDays() },
    weekPct() {
      const g = this.plan.weekly || 0
      return g ? Math.min(100, Math.round(this.week.cur / g * 100)) : 0
    },
    weekNotes() {
      const start = this.week.start
      return Object.keys(notes).filter((id) => notes[id] && (notes[id].t || 0) >= start).length
    },
    weekExams() {
      const start = this.week.start
      return exams.filter((e) => (e.at || 0) >= start).length
    },
    due() { this.tick; return dueIds(rec, Date.now()).length },
    weeklyTip() {
      const w = this.week
      if (!w.cur) return '本周还没有作答记录。每天 10 题、坚持到考前，比周末突击 200 题有效得多。'
      if (this.plan.weekly && w.cur < this.plan.weekly * 0.6) return '本周进度偏慢，还剩 ' + (7 - w.days) + ' 天，可以把目标拆成每天 ' + Math.max(1, Math.ceil((this.plan.weekly - w.cur) / Math.max(1, 7 - w.days))) + ' 题。'
      if (w.cur >= w.prev && w.prev > 0) return '比上周多 ' + (w.cur - w.prev) + ' 次，节奏在往上走，注意别只刷会的题。'
      return '本周已作答 ' + w.cur + ' 次，保持这个节奏，把错题和到期复习优先清掉。'
    },
    // ---- 模考趋势 ----
    examItems() {
      return exams.map((e) => ({ at: e.at, score: e.score, full: e.full, year: e.year, scope: e.scope }))
    },
    recentExams() { return exams.slice().sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 8) },
    // ---- 节奏 ----
    timed() {
      return this.entries.filter((e) => e.r.msAvg > 0 || e.r.ms > 0)
    },
    timedCount() { return this.timed.length },
    scatterItems() {
      return this.timed.map((e) => ({
        ms: e.r.msAvg || e.r.ms,
        score: e.it.q.score || 1,
        type: e.it.q.type,
        label: e.it.year + ' · ' + shortTitle(e.it.q)
      }))
    },
    slowest() {
      const list = this.timed
        .map((e) => ({ id: e.id, ms: e.r.msAvg || e.r.ms, score: e.it.q.score || 1, label: e.it.year + ' · ' + shortTitle(e.it.q) }))
        .sort((a, b) => b.ms - a.ms)
        .slice(0, 4)
      const max = Math.max(1, ...list.map((x) => x.ms))
      return list.map((x) => Object.assign(x, { sec: Math.round(x.ms / 1000), pct: Math.round(x.ms / max * 100) }))
    },
    paceTip() {
      const bad = this.slowest.filter((x) => x.ms > x.score * 50000 * 2)
      if (bad.length) return '「' + bad[0].label + '」花了 ' + Math.round(bad[0].ms / 1000) + ' 秒却只有 ' + bad[0].score + ' 分：这类题要么背结论秒杀，要么果断跳过，别在考场上耗着。'
      return '整体节奏健康：耗时基本随分值线性增长。'
    },
    backupSummary() {
      return '记录 ' + Object.keys(rec).length + ' 题 · 笔记 ' + noteIds().length + ' 条 · 模考 ' + exams.length + ' 次'
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
    hasNote,
    dateText,
    durText,
    noteTimeOf(id) {
      const m = window.localStorage.getItem('bupt801-notes-v1')
      if (!m) return 0
      try { const o = JSON.parse(m); return (o[id] && o[id].t) || 0 } catch (e) { return 0 }
    },
    clampNum(v, a, b) {
      const n = Number(v)
      if (isNaN(n)) return a
      return Math.min(b, Math.max(a, Math.round(n)))
    },
    savePlan(patch) { setPlan(patch); toast('计划已更新', 'ok') },
    gotoBackup() {
      const el = document.getElementById('sec-backup')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    exportFile() {
      const r = downloadBackup()
      if (r.ok) toast('已导出 ' + r.name, 'ok')
      else { this.importText = r.text; toast('当前环境不能下载，已把备份填入下方文本框，可手动复制', 'info') }
    },
    copyBackup() {
      const text = toText(buildBackup())
      const done = () => toast('备份文本已复制', 'ok')
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(() => { this.importText = text; toast('复制受限，已填入下方文本框', 'info') })
        } else {
          this.importText = text
          toast('已填入下方文本框，请手动复制', 'info')
        }
      } catch (e) {
        this.importText = text
        toast('已填入下方文本框，请手动复制', 'info')
      }
    },
    onFile(e) {
      const f = e.target.files && e.target.files[0]
      if (!f) return
      const reader = new FileReader()
      reader.onload = () => { this.importText = String(reader.result || ''); this.importMsg = '已读取 ' + f.name + '，点「导入」确认' }
      reader.onerror = () => { this.importMsg = '读取文件失败，试试直接粘贴备份文本' }
      reader.readAsText(f)
    },
    doImport() {
      try {
        const obj = parseBackup(this.importText)
        const s = applyBackup(obj, this.replaceMode ? 'replace' : 'merge')
        this.importMsg = '导入完成：记录 ' + s.records + ' 条、笔记 ' + s.notes + ' 条、模考 ' + s.exams + ' 次' +
          (s.conflicts ? '（' + s.conflicts + ' 条笔记冲突，已保留较新的）' : '') +
          (s.plan ? ' · 计划已更新' : '')
        this.importText = ''
        this.replaceMode = false
        toast('备份已导入', 'ok')
        this.$nextTick(() => renderMathZones(document))
      } catch (e) {
        this.importMsg = '导入失败：' + e.message
        toast('导入失败：' + e.message, 'bad')
      }
    },
    clear() {
      if (!confirm('确定清空全部做题记录（含错题本、收藏、复习排期、模考成绩）？笔记会保留。')) return
      clearRec()
      clearExams()
      try { localStorage.removeItem('bupt801-exam-v1') } catch (e) {}
      toast('记录已清空', 'ok')
    }
  },
  created() { this.timer = setInterval(() => { this.tick++ }, 60000) },
  beforeUnmount() { clearInterval(this.timer) },
  mounted() { this.$nextTick(() => renderMathZones(document)) }
}
</script>
