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
      <template v-if="pdfReady">
        <a class="btn sm" :href="pdfUrl(false)" target="_blank"><Icon name="download" :size="14" />试卷 PDF</a>
        <a class="btn sm primary" :href="pdfUrl(true)" target="_blank"><Icon name="download" :size="14" />含解析 PDF</a>
      </template>
      <span v-else class="btn sm ghost" title="静态托管下没有排版服务；用浏览器打印同样可存为 PDF，或自建 server/ 以获得服务端排版">PDF 需自建服务</span>
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
import { papers, escHtml, mdBlock, mdBlocks, numRange, subsHtml, normSubNo } from '../lib/data.js'
import { renderMath, figureSvg } from '../lib/render.js'
import { APP_BASE } from '../router.js'

export default {
  name: 'PaperView',
  components: { Icon },
  props: { year: { type: String, required: true } },
  data: () => ({
    showAns: false,
    mode: 'both',
    active: '',
    ansRendered: false,
    // 服务端排版（Puppeteer）只在自建服务上存在；GitHub Pages 是纯静态，探测失败就隐藏 PDF 按钮
    pdfReady: false,
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
      // 一张选项表服务哪几个空（多空共用一套选项时按「（1）（2）」并列标出）——
      // 不加这行，四张表连着排、解析又只写「答案：C」，读者分不清哪张表对哪一空。
      const optTable = (o, tag) => {
        const cells = ['A', 'B', 'C', 'D'].filter((k) => o[k] !== undefined)
          .map((k) => `<td><span class="optkey">(${k})</span>${escHtml(o[k])}</td>`)
        let rows = ''
        for (let i = 0; i < cells.length; i += 2) rows += '<tr>' + cells[i] + (cells[i + 1] || '<td></td>') + '</tr>'
        return (tag ? `<div class="opt-cap">${tag}</div>` : '') + `<table class="opt-table"><tbody>${rows}</tbody></table>`
      }
      const exp = (q) => {
        const keys = ['A', 'B', 'C', 'D'].filter((k) => q.exp.opts && q.exp.opts[k])
        return `<div class="ans" id="ans-${q.id}"><div class="ans-title"><span class="ans-qno">第 ${q.blank} 空</span>答案：<span class="ans-letter">${q.answer}</span><span class="ans-meta">${B.chapters.find((c) => c.id === q.chapter)?.name || ''}</span></div>` +
          `<div class="ans-concl">${mdBlock(q.exp.concl)}</div><div class="ans-opts">` +
          keys.map((k) => `<div class="opt-exp${k === q.answer ? ' right' : ''}"><b>(${k})</b>${mdBlock(q.exp.opts[k])}</div>`).join('') +
          `</div>${q.exp.note ? `<div class="ans-note"><b>💡 提示：</b>${mdBlock(q.exp.note)}</div>` : ''}</div>`
      }
      const bigSol = (q) => {
        const steps = (q.sol.steps || []).map((st) =>
          `<details class="sol-step" open><summary>${mdBlock(normSubNo(st.q))}</summary><div class="step-body">` +
          mdBlocks(st.body).map((b) => `<div class="step-line${b.t === 'table' ? ' step-table' : ''}">${b.html}</div>`).join('') +
          (st.fig ? `<figure class="figblock">${figureSvg(this.year, st.fig)}</figure>` : '') +
          (st.ans ? `<div class="step-ans">${mdBlock(st.ans)}</div>` : '') +
          `</div></details>`).join('')
        return `<div class="ans"><div class="ans-title">参考解析</div><div class="ans-concl">${mdBlock(q.sol.intro)}</div>${steps}` +
          `<div class="sol-summary"><b>答案汇总：</b>${mdBlock(q.sol.summary)}</div>` +
          (q.sol.pitfalls ? `<div class="ans-note"><b>💡 易错点：</b>${mdBlock(Array.isArray(q.sol.pitfalls) ? q.sol.pitfalls.join('\n') : q.sol.pitfalls)}</div>` : '') + `</div>`
      }
      const fig = (key) => `<figure class="figblock">${figureSvg(this.year, key)}</figure>`

      let html = ''
      const c0 = p.sections[0]
      // 每空分值不能写死：2017 是 36 空 × 1.5 分 = 54 分，写死「每题1分」会与总分自相矛盾。
      // 口径统一用「空」而不是「题」——2019/2021/2022/2024 存在「26 题 40/50 空」的情况，题≠空。
      const perBlank = c0.perBlank || 1
      html += `<div class="sec-title" id="sec-choice">一、${c0.name}（每空${perBlank}分，共${c0.score}分）</div>`
      html += `<div class="sec-intro">${escHtml(c0.intro)}</div>`
      const choice = p.questions.filter((q) => q.type === 'choice')
      let i = 0
      let gIdx = 0   // 卷面题号＝选择题组的序号
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
        // 题号：本组覆盖的题号（num）与空号（blank）分开算 —— 2017/2019/2021/2022/2024
        // 存在「一题多空」（num 重复、blank 递增），只写一个会把别处对不上。
        const nums = cluster.map((cq) => cq.num)
        const bs = cluster.map((cq) => cq.blank)
        // 卷面题号＝本组在选择题里的序号，不是 blank、也不是「1–4」这种范围：
        // 原卷是一题一段（2026 第 1 题带（1）~（4）四个空），题号只写一次。
        // 为什么不用 q.num：2018/2020/2023/2025/2026 的 num 记的是空号（题=空），
        // 而 2017/2019/2021/2022/2024 的 num 是真题号 —— 两种口径下「组序号」都等于原卷题号。
        const numLab = String(++gIdx)
        const blankLab = numRange(bs)
        // 覆盖多个空、或题号与空号不一致时，补一个「空 a–b」小标，读者才知道这段题干管几个空
        const extra = (bs.length > 1 || numLab !== blankLab) ? `<span class="qblk">空 ${blankLab}</span>` : ''
        // 行首写题号（悬挂缩进，折行后与正文左缘对齐），选项表前标空号——
        // 这样任取一段卷面都能读出「第几题、第几空」，不再靠范围徽标去猜
        html += `<div class="qgroup"><div class="qline qn"><span class="qnr">${numLab}．</span>${extra}${blank(g.stem || '')}</div>`
        const gfig = cluster.find((cq) => cq.fig)
        if (gfig) html += fig(gfig.fig)
        multi.forEach((o, k) => {
          // 优先用 oKey 反查这张表到底服务哪一空；查不到再按顺序/整组兜底
          const hit = cluster.filter((cq) => cq.oKey && g[cq.oKey] === o)
          const own = hit.length ? hit.map((cq) => cq.blank)
            : multi.length === cluster.length ? [cluster[k].blank] : bs
          // 一套选项服务多个空时写明「共用选项」：四张表连着排才分得清
          const tag = own.map((b) => `（${b}）`).join('') + (own.length > 1 ? '共用选项' : '选项')
          html += optTable(o, tag)
        })
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
        html += `<div class="bigq" id="q-${q.num}"><div class="qnum">${q.num}．<span class="pts">（${q.score}分）</span><a class="qanchor no-print" href="#q-${q.num}" title="复制/引用本题锚点">#</a></div>` +
          `<div class="stem">${blank(q.stem)}</div>`
        if (q.fig) html += fig(q.fig)
        if (q.subs && q.subs.length) html += subsHtml(q.subs, 'subs')
        html += bigSol(q) + `</div>`
      })
      return html
    }
  },
  mounted() {
    this.postRender()
    this.probePdf()
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
    pdfUrl(withAns) { return APP_BASE + 'api/pdf/' + this.year + (withAns ? '/ans' : '/paper') },
    // 静态托管（GitHub Pages）下没有后端，探测 /api/health 失败即降级为浏览器打印。
    // 失败是预期内的，静默处理，不弹 toast。
    async probePdf() {
      try {
        const r = await fetch(APP_BASE + 'api/health', { cache: 'no-store' })
        const j = await r.json()
        this.pdfReady = !!(r.ok && j && j.ok)
      } catch (e) {
        this.pdfReady = false
      }
    },
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
