<template>
  <div class="wrap">
    <h1 class="sr-only">{{ year }} 年真题试卷</h1>

    <!-- 工具条 -->
    <div class="paper-toolbar no-print" v-if="p">
      <router-link class="btn ghost sm" to="/">
        <Icon name="left" :size="14" />返回
      </router-link>
      <span class="badge brand">{{ year }} 年 · {{ p.subject }}</span>
      <button class="btn sm" :class="{ soft: showAns }" @click="toggleAns">
        <Icon :name="showAns ? 'check' : 'paper'" :size="14" />{{ showAns ? '已显示解析' : '显示解析' }}
      </button>
      <div class="seg mode-seg" role="group" aria-label="卷面显示模式">
        <span v-for="m in modes" :key="m.v" :class="{ on: mode === m.v }" @click="setMode(m.v)">{{ m.n }}</span>
      </div>
      <span class="sep"></span>
      <router-link class="btn sm ghost" :to="'/practice?y=' + year"><Icon name="target" :size="14" />刷这份卷</router-link>
      <button class="btn sm ghost" @click="printPaper"><Icon name="print" :size="14" />打印</button>
      <a class="btn sm" :href="pdfUrl(false)" target="_blank"><Icon name="download" :size="14" />试卷 PDF</a>
      <a class="btn sm primary" :href="pdfUrl(true)" target="_blank"><Icon name="download" :size="14" />含解析 PDF</a>
    </div>

    <div v-if="!p" class="card pad empty" style="max-width:900px;margin:0 auto">
      没找到 {{ year }} 年的试卷。已收录：
      <router-link v-for="y in yearList" :key="y" :to="'/paper/' + y" style="margin:0 4px">{{ y }} 年</router-link>
    </div>

    <div v-else class="paper-layout">
      <!-- 目录 -->
      <nav class="toc no-print" aria-label="试卷目录">
        <h6>目录</h6>
        <a v-for="t in toc" :key="t.id" :href="'#' + t.id" :class="{ 'toc-sub': t.sub, active: active === t.id }"
          @click.prevent="goto(t.id)">
          {{ t.label }}
          <span v-if="t.note" style="color:var(--faint);font-size:11.5px"> · {{ t.note }}</span>
        </a>
        <div class="toc-group">
          <a href="#" @click.prevent="gotoTop">↑ 回到卷首</a>
          <router-link :to="'/practice?y=' + year">刷这份卷 →</router-link>
          <router-link :to="'/exam?y=' + year">模拟测试 →</router-link>
        </div>
      </nav>

      <!-- 卷面 -->
      <div class="paper-sheet" :class="sheetClass">
        <header class="paper-head">
          <div class="t1">北京邮电大学</div>
          <div class="t2">{{ year }} 年硕士研究生招生考试试题</div>
          <div class="t3">考试科目：{{ p.subject }}</div>
        </header>
        <div class="paper-note">{{ p.note }}</div>
        <div v-html="bodyHtml" ref="bodyEl"></div>
      </div>
    </div>
  </div>
</template>

<script>
import Icon from '../components/Icon.vue'
import { papers, escHtml } from '../lib/data.js'
import { renderMath, figureSvg } from '../lib/render.js'

export default {
  name: 'PaperView',
  components: { Icon },
  props: { year: { type: String, required: true } },
  data: () => ({
    showAns: false,
    mode: 'both',
    active: '',
    ansRendered: false,
    modes: [
      { v: 'both', n: '题 + 解析' },
      { v: 'q', n: '只看题' },
      { v: 'a', n: '只看解析' }
    ]
  }),
  computed: {
    p() { return papers()[this.year] || null },
    yearList() { return Object.keys(papers()).sort().reverse() },
    sheetClass() {
      return {
        'hide-ans': !this.showAns,
        'only-q': this.mode === 'q',
        'only-a': this.mode === 'a'
      }
    },
    toc() {
      const p = this.p
      if (!p) return []
      const out = []
      const choice = p.questions.filter((q) => q.type === 'choice')
      const big = p.questions.filter((q) => q.type === 'big')
      out.push({ id: 'sec-choice', label: '一、' + p.sections[0].name, note: choice.length + ' 空' })
      out.push({ id: 'sec-big', label: '二、' + p.sections[1].name, note: big.length + ' 题' })
      // 大题序号直接用数据里的 q.num（中文数字），不再按数组下标推 —— 否则会整体错一位
      big.forEach((q) => out.push({ id: 'q-' + q.num, label: '第 ' + q.num + ' 题', note: q.score + ' 分', sub: true }))
      return out
    },
    bodyHtml() {
      const B = window.BUPT801
      const p = this.p
      const blank = (s) => escHtml(s).replace(/（(\d+)）/g, '（<strong class="blank">$1</strong>）')
      const optTable = (o) => {
        const cells = ['A', 'B', 'C', 'D'].filter((k) => o[k] !== undefined)
          .map((k) => `<td><span class="optkey">(${k})</span>${escHtml(o[k])}</td>`)
        let rows = ''
        for (let i = 0; i < cells.length; i += 2) rows += '<tr>' + cells[i] + (cells[i + 1] || '<td></td>') + '</tr>'
        return `<table class="opt-table"><tbody>${rows}</tbody></table>`
      }
      const exp = (q) => {
        const keys = ['A', 'B', 'C', 'D'].filter((k) => q.exp.opts && q.exp.opts[k])
        return `<div class="ans" id="ans-${q.id}"><div class="ans-title">答案：<span class="ans-letter">${q.answer}</span><span class="ans-meta">${B.chapters.find((c) => c.id === q.chapter)?.name || ''}</span></div>` +
          `<div class="ans-concl">${escHtml(q.exp.concl)}</div><div class="ans-opts">` +
          keys.map((k) => `<div class="opt-exp${k === q.answer ? ' right' : ''}"><b>(${k})</b>${escHtml(q.exp.opts[k])}</div>`).join('') +
          `</div>${q.exp.note ? `<div class="ans-note"><b>💡 提示：</b>${escHtml(q.exp.note)}</div>` : ''}</div>`
      }
      const bigSol = (q) => {
        const steps = (q.sol.steps || []).map((st) =>
          `<details class="sol-step" open><summary>${escHtml(st.q)}</summary><div class="step-body">` +
          (st.body || []).map((x) => `<div class="step-line">${escHtml(x)}</div>`).join('') +
          (st.fig ? `<figure class="figblock">${figureSvg(this.year, st.fig)}</figure>` : '') +
          (st.ans ? `<div class="step-ans">${escHtml(st.ans)}</div>` : '') +
          `</div></details>`).join('')
        return `<div class="ans"><div class="ans-title">参考解析</div><div class="ans-concl">${escHtml(q.sol.intro)}</div>${steps}` +
          `<div class="sol-summary"><b>答案汇总：</b>${escHtml(q.sol.summary)}</div>` +
          (q.sol.pitfalls ? `<div class="ans-note"><b>💡 易错点：</b>${escHtml(q.sol.pitfalls)}</div>` : '') + `</div>`
      }
      const fig = (key) => `<figure class="figblock">${figureSvg(this.year, key)}</figure>`

      let html = ''
      const c0 = p.sections[0]
      html += `<div class="sec-title" id="sec-choice">一、${c0.name}（每题1分，共${c0.score}分）</div>`
      html += `<div class="sec-intro">${escHtml(c0.intro)}</div>`
      const choice = p.questions.filter((q) => q.type === 'choice')
      let i = 0
      while (i < choice.length) {
        const q = choice[i]
        const g = p.groups[q.group]
        const cluster = [q]
        let j = i + 1
        while (j < choice.length && choice[j].group === q.group) { cluster.push(choice[j]); j++ }
        // 一组选项覆盖多个空时按 optionSets 顺序展示（旧数据无 optionSets，沿用 options12/13/25/26 约定）
        const multi = g.optionSets && g.optionSets.length
          ? g.optionSets.map((k) => g[k]).filter(Boolean)
          : [g.options12, g.options13, g.options25, g.options26].filter(Boolean)
        if (!multi.length && g.options) multi.push(g.options)
        html += `<div class="qgroup"><div class="qline">${blank(g.stem || '')}</div>`
        multi.forEach((o) => { html += optTable(o) })
        cluster.forEach((cq) => { html += exp(cq) })
        html += `</div>`
        i = j
      }
      const big = p.questions.filter((q) => q.type === 'big')
      const s1 = p.sections[1]
      // 大题分值不一定均匀（如 2026 第二题 20 分、其余 15 分），标题只报总分
      html += `<div class="sec-title" id="sec-big">二、${s1.name}（共${s1.score}分）</div>`
      if (s1.intro) html += `<div class="sec-intro">${escHtml(s1.intro)}</div>`
      big.forEach((q) => {
        html += `<div class="bigq" id="q-${q.num}"><div class="qnum">${q.num}．（${q.score}分）<a class="qanchor no-print" href="#q-${q.num}" title="复制/引用本题锚点">#</a></div>` +
          `<div class="stem">${blank(q.stem)}</div>`
        if (q.fig) html += fig(q.fig)
        if (q.subs && q.subs.length) html += `<div class="subs">${q.subs.map((s) => `<div>${blank(s)}</div>`).join('')}</div>`
        html += bigSol(q) + `</div>`
      })
      return html
    }
  },
  mounted() {
    this.postRender()
    window.addEventListener('scroll', this.onScroll, { passive: true })
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.onScroll)
  },
  watch: {
    bodyHtml() {
      this.ansRendered = false
      this.$nextTick(() => this.postRender())
    },
    year() { this.showAns = false; this.mode = 'both'; this.ansRendered = false },
    showAns() { this.$nextTick(() => this.postRender()) }
  },
  methods: {
    // 懒渲染：题面必渲染；解析区只在实际显示时渲染一次。
    // 2024 年全卷 1,271 处公式，首屏不渲染解析可省掉大半 KaTeX 开销。
    postRender() {
      const el = this.$refs.bodyEl
      if (!el) return
      el.querySelectorAll('.qline, .opt-table, .bigq > .stem, .bigq > .subs, .sec-intro, .paper-note')
        .forEach((node) => renderMath(node))
      if (this.showAns && !this.ansRendered) {
        el.querySelectorAll('.ans').forEach((node) => renderMath(node))
        this.ansRendered = true
      }
    },
    setMode(v) {
      this.mode = v
      this.showAns = v !== 'q'
      this.$nextTick(() => this.postRender())
    },
    toggleAns() {
      this.showAns = !this.showAns
      this.mode = this.showAns ? (this.mode === 'q' ? 'both' : this.mode) : 'q'
    },
    printPaper() { window.print() },
    pdfUrl(withAns) { return '/api/pdf/' + this.year + (withAns ? '/ans' : '/paper') },
    goto(id) {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    gotoTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) },
    onScroll() {
      if (this._raf) return
      this._raf = requestAnimationFrame(() => {
        this._raf = null
        const ids = this.toc.map((t) => t.id)
        let cur = ''
        ids.forEach((id) => {
          const el = document.getElementById(id)
          if (el && el.getBoundingClientRect().top <= 150) cur = id
        })
        this.active = cur
      })
    }
  }
}
</script>
