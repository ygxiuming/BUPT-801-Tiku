<template>
  <div class="wrap" style="max-width:1180px">
    <h1 class="sr-only">题目录入编辑器</h1>

    <div class="section-head" style="margin-top:6px">
      <div>
        <div class="eyebrow">QUESTION EDITOR</div>
        <h2>录入编辑器</h2>
      </div>
      <span class="desc">填表 → 实时预览 → 一键导出 paper.js / answer.js 片段</span>
      <span class="spacer"></span>
      <span class="badge gray">本地工具 · 不写服务器</span>
    </div>

    <div class="editor-grid">
      <!-- ============ 表单 ============ -->
      <div>
        <div class="card pad">
          <div class="fgroup">
            <label for="ed-year">年份</label>
            <div class="row">
              <select id="ed-year" v-model="year" style="max-width:160px" aria-label="年份">
                <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
                <option value="2027">2027（新）</option>
              </select>
              <div class="seg" style="max-width:260px">
                <span :class="{ on: mode === 'choice' }" @click="mode = 'choice'">选择题</span>
                <span :class="{ on: mode === 'big' }" @click="mode = 'big'">综合题</span>
              </div>
              <button class="btn sm ghost" @click="loadSample">填入示例</button>
            </div>
            <p class="qhint" style="margin:6px 0 0;font-size:12px">
              正文支持 KaTeX：行内 <code>$x^2$</code>、行间 <code>$$…$$</code>；空号统一写成 <code>（12）</code>，导出时会自动加粗。
            </p>
          </div>
        </div>

        <!-- ---------- 选择题 ---------- -->
        <div class="card pad" style="margin-top:14px" v-if="mode === 'choice'">
          <h5 class="ed-h">① 组干与选项</h5>
          <div class="fgroup">
            <label for="ed-gid">组 id</label>
            <input id="ed-gid" v-model="group.id" class="ed-input" placeholder="g21" />
          </div>
          <div class="fgroup">
            <label for="ed-stem">组干（同一组多空共用，必须包含每个空的（n）标记）</label>
            <textarea id="ed-stem" v-model="group.stem" class="ed-textarea" rows="4"></textarea>
          </div>

          <div class="ed-sets">
            <div class="ed-set" v-for="(s, si) in group.sets" :key="si">
              <div class="ed-set-head">
                <b>选项集 {{ si + 1 }}</b>
                <input v-model="s.key" class="ed-input mono" style="max-width:180px" aria-label="选项集键名" />
                <span class="spacer"></span>
                <button class="btn sm ghost" v-if="group.sets.length > 1" @click="group.sets.splice(si, 1)">删除</button>
              </div>
              <div class="ed-opts">
                <div v-for="k in LETTERS" :key="k" class="ed-opt">
                  <span class="ed-key">{{ k }}</span>
                  <input v-model="s.cells[k]" class="ed-input" :aria-label="'选项 ' + k" />
                </div>
              </div>
            </div>
            <button class="btn sm" @click="addSet">+ 再加一套选项（同组不同空用不同选项时）</button>
          </div>

          <h5 class="ed-h" style="margin-top:20px">② 每个空 ×{{ blks.length }}</h5>
          <div class="ed-blank" v-for="(b, bi) in blks" :key="bi">
            <div class="ed-blank-head">
              <b>空（{{ b.blank }}）</b>
              <span class="qhint">id {{ year }}-{{ b.blank }}</span>
              <span class="spacer"></span>
              <button class="btn sm ghost" v-if="blks.length > 1" @click="blks.splice(bi, 1)">删除</button>
            </div>
            <!-- 这些 id 带上了空的下标 bi：同一页可能同时编辑多个空，写死 id 会重复 -->
            <div class="ed-row3">
              <div class="fgroup">
                <label :for="'ed-num-' + bi">题号 num</label>
                <input :id="'ed-num-' + bi" v-model.number="b.num" type="number" class="ed-input" />
              </div>
              <div class="fgroup">
                <label :for="'ed-okey-' + bi">用哪套选项</label>
                <select :id="'ed-okey-' + bi" v-model="b.oKey">
                  <option v-for="s in group.sets" :key="s.key" :value="s.key">{{ s.key }}</option>
                </select>
              </div>
              <div class="fgroup">
                <label :for="'ed-ans-' + bi">答案</label>
                <select :id="'ed-ans-' + bi" v-model="b.answer">
                  <option v-for="k in LETTERS" :key="k" :value="k">{{ k }}</option>
                </select>
              </div>
            </div>
            <div class="ed-row2">
              <div class="fgroup">
                <label :for="'ed-ch-' + bi">章节</label>
                <select :id="'ed-ch-' + bi" v-model="b.chapter">
                  <option v-for="c in chapters" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div class="fgroup">
                <label :for="'ed-pt-' + bi">知识点</label>
                <select :id="'ed-pt-' + bi" v-model="b.point">
                  <option value="">（未标注）</option>
                  <option v-for="p in pointsOf(b.chapter)" :key="p" :value="p">{{ p }}</option>
                </select>
              </div>
            </div>
            <div class="fgroup">
              <label :for="'ed-tags-' + bi">易错点标签（逗号分隔）</label>
              <input :id="'ed-tags-' + bi" v-model="b.tagsText" class="ed-input" placeholder="FM, 调制指数" />
            </div>
            <div class="fgroup">
              <label :for="'ed-concl-' + bi">解析结论（必填）</label>
              <textarea :id="'ed-concl-' + bi" v-model="b.concl" class="ed-textarea" rows="2"></textarea>
            </div>
            <details class="ed-more">
              <summary>逐选项解析（强烈建议填写，选择题的主要价值在这里）</summary>
              <div class="fgroup" v-for="k in LETTERS" :key="k">
                <label :for="'ed-o-' + bi + '-' + k">{{ k }} 项说明 <span class="qhint" v-if="k === b.answer">（正确项，必填）</span></label>
                <input :id="'ed-o-' + bi + '-' + k" v-model="b.opts[k]" class="ed-input" />
              </div>
              <div class="fgroup">
                <label :for="'ed-note-' + bi">提示 / 易错点 note</label>
                <textarea :id="'ed-note-' + bi" v-model="b.note" class="ed-textarea" rows="2"></textarea>
              </div>
            </details>
          </div>
          <button class="btn sm" @click="addBlank">+ 再加一个空</button>
        </div>

        <!-- ---------- 综合题 ---------- -->
        <div class="card pad" style="margin-top:14px" v-else>
          <h5 class="ed-h">① 题面</h5>
          <div class="ed-row3">
            <div class="fgroup">
              <label for="ed-bnum">大题号</label>
              <input id="ed-bnum" v-model="big.num" class="ed-input" placeholder="二" />
            </div>
            <div class="fgroup">
              <label for="ed-bscore">分值</label>
              <input id="ed-bscore" v-model.number="big.score" type="number" class="ed-input" />
            </div>
            <div class="fgroup">
              <label for="ed-bfig">配图 key（可选）</label>
              <input id="ed-bfig" v-model="big.fig" class="ed-input mono" placeholder="2027-二-q2sys" />
            </div>
          </div>
          <div class="fgroup">
            <label for="ed-bstem">题干</label>
            <textarea id="ed-bstem" v-model="big.stem" class="ed-textarea" rows="4"></textarea>
          </div>
          <div class="fgroup">
            <label for="ed-bsubs">小问（每行一条，含 (1)(2) 编号）</label>
            <textarea id="ed-bsubs" v-model="big.subsText" class="ed-textarea mono" rows="4"></textarea>
          </div>
          <div class="ed-row2">
            <div class="fgroup">
              <label for="ed-bch">章节</label>
              <select id="ed-bch" v-model="big.chapter">
                <option v-for="c in chapters" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="fgroup">
              <label for="ed-bpt">知识点</label>
              <select id="ed-bpt" v-model="big.point">
                <option value="">（未标注）</option>
                <option v-for="p in pointsOf(big.chapter)" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>
          </div>
          <div class="fgroup">
            <label for="ed-btags">易错点标签（逗号分隔）</label>
            <input id="ed-btags" v-model="big.tagsText" class="ed-input" />
          </div>

          <h5 class="ed-h" style="margin-top:20px">② 分步解析</h5>
          <div class="fgroup">
            <label for="ed-bintro">解析引言 sol.intro</label>
            <textarea id="ed-bintro" v-model="big.solIntro" class="ed-textarea" rows="2"></textarea>
          </div>
          <div class="ed-blank" v-for="(s, si) in big.steps" :key="si">
            <div class="ed-blank-head">
              <b>步骤 {{ si + 1 }}</b><span class="spacer"></span>
              <button class="btn sm ghost" v-if="big.steps.length > 1" @click="big.steps.splice(si, 1)">删除</button>
            </div>
            <div class="fgroup">
              <label :for="'ed-sq-' + si">小问标题（对应 (1)(2)，也是折叠标题）</label>
              <input :id="'ed-sq-' + si" v-model="s.q" class="ed-input" />
            </div>
            <div class="fgroup">
              <label :for="'ed-sb-' + si">推导（每行一条，公式用 $…$）</label>
              <textarea :id="'ed-sb-' + si" v-model="s.bodyText" class="ed-textarea mono" rows="4"></textarea>
            </div>
            <div class="ed-row2">
              <div class="fgroup">
                <label :for="'ed-sa-' + si">该小问结论</label>
                <input :id="'ed-sa-' + si" v-model="s.ans" class="ed-input" />
              </div>
              <div class="fgroup">
                <label :for="'ed-sf-' + si">步骤配图 key</label>
                <input :id="'ed-sf-' + si" v-model="s.fig" class="ed-input mono" />
              </div>
            </div>
          </div>
          <button class="btn sm" @click="addStep">+ 再加一步</button>

          <div class="fgroup" style="margin-top:16px">
            <label for="ed-bsum">答案汇总 sol.summary（必填）</label>
            <textarea id="ed-bsum" v-model="big.summary" class="ed-textarea" rows="2"></textarea>
          </div>
          <div class="fgroup">
            <label for="ed-bpit">易错点 sol.pitfalls</label>
            <textarea id="ed-bpit" v-model="big.pitfalls" class="ed-textarea" rows="2"></textarea>
          </div>
        </div>

        <!-- 校验 -->
        <div class="card pad" style="margin-top:14px">
          <div class="row" style="justify-content:space-between">
            <h5 class="ed-h" style="margin:0">③ 校验</h5>
            <span class="badge" :class="errors.length ? 'bad' : 'ok'">{{ errors.length ? errors.length + ' 处待修' : '通过' }}</span>
          </div>
          <ul class="ed-issues" v-if="errors.length">
            <li v-for="(e, i) in errors" :key="i" class="bad-ink">{{ e }}</li>
          </ul>
          <ul class="ed-issues warns" v-if="warns.length">
            <li v-for="(w, i) in warns" :key="i" class="warn-ink">{{ w }}</li>
          </ul>
          <p class="qhint" style="margin:8px 0 0;font-size:12px" v-if="!errors.length && !warns.length">
            结构检查通过。别忘了导出后跑一次 <code>node tools/validate_data.js</code>。
          </p>
        </div>
      </div>

      <!-- ============ 预览 + 导出 ============ -->
      <aside class="ed-side">
        <div class="card pad">
          <h5>实时预览</h5>
          <div class="ed-preview math-zone" v-html="previewHtml"></div>
        </div>

        <div class="card pad" style="margin-top:14px">
          <h5>导出</h5>
          <div class="row">
            <button class="btn sm primary" @click="copy('paper')"><Icon name="download" :size="14" />复制 paper 片段</button>
            <button class="btn sm" @click="copy('answer')"><Icon name="download" :size="14" />复制 answer 片段</button>
          </div>
          <div class="row" style="margin-top:8px">
            <button class="btn sm ghost" @click="download('paper')">下载 paper.js</button>
            <button class="btn sm ghost" @click="download('answer')">下载 answer.js</button>
          </div>
          <p class="qhint" style="margin:10px 0 0;font-size:12px">
            片段粘到 <code>data/questions/{{ year }}/paper.js</code> 与 <code>answer.js</code>；
            新年份还要在 <code>app/index.html</code> 加两个 <code>&lt;script&gt;</code>，
            再在 <code>tools/validate_data.js</code> 的 EXPECT 登记题量。
          </p>
        </div>

        <div class="card pad" style="margin-top:14px">
          <h5>paper 片段</h5>
          <pre class="ed-code">{{ paperSnippet }}</pre>
        </div>
        <div class="card pad" style="margin-top:14px">
          <h5>answer 片段</h5>
          <pre class="ed-code">{{ answerSnippet }}</pre>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import Icon from '../components/Icon.vue'
import { papers, chapters, escHtml, boldBlanks } from '../lib/data.js'
import { renderMath } from '../lib/render.js'
import { toast } from '../lib/toast.js'

const LETTERS = ['A', 'B', 'C', 'D']

function emptyCells() { return { A: '', B: '', C: '', D: '' } }

export default {
  name: 'EditorView',
  components: { Icon },
  data() {
    const years = Object.keys(papers()).sort().reverse()
    const year = years[0] || '2026'
    return {
      years,
      year,
      mode: 'choice',
      LETTERS,
      group: {
        id: 'g' + ((Object.keys((papers()[year] || {}).groups || {}).length) + 1),
        stem: '',
        sets: [{ key: 'options', cells: emptyCells() }]
      },
      blks: [],
      big: this.emptyBig()
    }
  },
  computed: {
    chapters() { return chapters() || [] },
    nextBlank() {
      const p = papers()[this.year]
      const used = p ? p.questions.filter((q) => q.type === 'choice').map((q) => q.blank) : []
      return used.length ? Math.max(...used) + 1 : 1
    },
    nextNum() {
      const p = papers()[this.year]
      const used = p ? p.questions.filter((q) => q.type === 'choice').map((q) => q.num) : []
      return used.length ? Math.max(...used) + 1 : 1
    },
    choiceQuestions() {
      return this.blks.map((b) => {
        const q = {
          id: this.year + '-' + b.blank,
          num: b.num,
          type: 'choice',
          group: this.group.id,
          blank: b.blank,
          oKey: b.oKey,
          chapter: b.chapter
        }
        if (b.point) q.point = b.point
        const tags = this.splitTags(b.tagsText)
        if (tags.length) q.tags = tags
        return q
      })
    },
    bigQuestion() {
      const q = {
        id: this.year + '-' + (this.big.num || '二'),
        num: this.big.num,
        type: 'big',
        score: this.big.score,
        stem: this.big.stem,
        chapter: this.big.chapter
      }
      const subs = this.big.subsText.split('\n').map((s) => s.trim()).filter(Boolean)
      if (subs.length) q.subs = subs
      if (this.big.fig) q.fig = this.big.fig
      if (this.big.point) q.point = this.big.point
      const tags = this.splitTags(this.big.tagsText)
      if (tags.length) q.tags = tags
      return q
    },
    groupObj() {
      const g = { stem: this.group.stem }
      const keys = this.group.sets.map((s) => s.key)
      if (keys.length > 1) g.optionSets = keys
      this.group.sets.forEach((s) => {
        const cells = {}
        LETTERS.forEach((k) => { if (String(s.cells[k] || '').trim()) cells[k] = s.cells[k] })
        g[s.key] = cells
      })
      return g
    },
    answerMap() {
      const out = {}
      if (this.mode === 'choice') {
        this.blks.forEach((b) => {
          const opts = {}
          LETTERS.forEach((k) => { if (String(b.opts[k] || '').trim()) opts[k] = b.opts[k] })
          const exp = { concl: b.concl }
          if (Object.keys(opts).length) exp.opts = opts
          if (b.note) exp.note = b.note
          out[this.year + '-' + b.blank] = { answer: b.answer, exp }
        })
      } else {
        out[this.bigQuestion.id] = {
          sol: {
            intro: this.big.solIntro,
            steps: this.big.steps.map((s) => {
              const st = { q: s.q }
              const body = s.bodyText.split('\n').map((x) => x.trim()).filter(Boolean)
              if (body.length) st.body = body
              if (s.ans) st.ans = s.ans
              if (s.fig) st.fig = s.fig
              return st
            }),
            summary: this.big.summary
          }
        }
        if (this.big.pitfalls) out[this.bigQuestion.id].sol.pitfalls = this.big.pitfalls
      }
      return out
    },
    paperSnippet() {
      if (this.mode === 'choice') {
        return '// ① 粘到 paper.js 的 groups：\n' + JSON.stringify({ [this.group.id]: this.groupObj }, null, 2) +
          '\n\n// ② 粘到 paper.js 的 questions 数组：\n' + JSON.stringify(this.choiceQuestions, null, 2)
      }
      return '// 粘到 paper.js 的 questions 数组：\n' + JSON.stringify(this.bigQuestion, null, 2)
    },
    answerSnippet() {
      const head = '// 粘到 answer.js 的 ' + this.year + ' 对象里：\n'
      return head + JSON.stringify(this.answerMap, null, 2)
    },
    errors() {
      const out = []
      if (this.mode === 'choice') {
        if (!this.group.stem.trim()) out.push('组干不能为空')
        const keys = this.group.sets.map((s) => s.key)
        if (new Set(keys).size !== keys.length) out.push('选项集键名重复')
        this.group.sets.forEach((s, i) => {
          if (!/^options[\w]*$/.test(s.key)) out.push('选项集键名建议用 options / options12 这类命名（第 ' + (i + 1) + ' 套）')
          if (!LETTERS.some((k) => String(s.cells[k] || '').trim())) out.push('第 ' + (i + 1) + ' 套选项全为空')
        })
        const blanks = this.blks.map((b) => b.blank)
        if (new Set(blanks).size !== blanks.length) out.push('空号重复')
        this.blks.forEach((b) => {
          const tag = '空（' + b.blank + '）'
          if (!this.group.stem.includes('（' + b.blank + '）')) out.push(tag + '：组干里没有 （' + b.blank + '） 标记')
          const set = this.group.sets.find((s) => s.key === b.oKey) || this.group.sets[0]
          if (!set || !String(set.cells[b.answer] || '').trim()) out.push(tag + '：答案 ' + b.answer + ' 在该选项集里没有内容')
          if (!b.concl.trim()) out.push(tag + '：缺少解析结论')
          if (!b.chapter) out.push(tag + '：未选章节')
        })
      } else {
        if (!this.big.stem.trim()) out.push('题干不能为空')
        if (!(this.big.score > 0)) out.push('分值必须大于 0')
        if (!this.big.summary.trim()) out.push('缺少答案汇总 sol.summary')
        if (!this.big.steps.some((s) => String(s.q || '').trim())) out.push('至少要有一步解析的小问标题')
        this.big.steps.forEach((s, i) => {
          if (!String(s.q || '').trim()) out.push('步骤 ' + (i + 1) + '：缺少小问标题')
        })
      }
      // $ 配对（KaTeX 的最常见录入错误）
      this.allStrings().forEach(([where, s]) => {
        if (!s || s.indexOf('$') < 0) return
        const n = (s.match(/\$/g) || []).length
        if (n % 2) out.push(where + '：$ 没有配对')
      })
      return out
    },
    warns() {
      const out = []
      if (this.mode === 'choice') {
        this.blks.forEach((b) => {
          if (!String(b.opts[b.answer] || '').trim()) out.push('空（' + b.blank + '）：正确项没有写说明（validate 会给警告）')
          LETTERS.forEach((k) => { if (!String(b.opts[k] || '').trim()) out.push('空（' + b.blank + '）：' + k + ' 项缺少说明') })
          if (!b.point) out.push('空（' + b.blank + '）：没有关联知识点，统计与复习会漏掉')
        })
        if (this.blks.length && this.blks[0].blank !== this.nextBlank) {
          out.push('起始空号是 ' + this.blks[0].blank + '，该年份现有最大空号 +1 = ' + this.nextBlank + '（如非故意，建议顺延）')
        }
      } else {
        this.big.steps.forEach((s, i) => { if (!String(s.ans || '').trim()) out.push('步骤 ' + (i + 1) + '：缺少该小问结论 st.ans') })
        if (!this.big.pitfalls.trim()) out.push('建议补一句易错点 sol.pitfalls')
      }
      return out.slice(0, 12)
    },
    previewHtml() {
      if (this.mode === 'choice') {
        const set = this.group.sets[0] || { cells: {} }
        const opts = LETTERS.filter((k) => String(set.cells[k] || '').trim())
        const rows = []
        for (let i = 0; i < opts.length; i += 2) {
          rows.push('<tr><td><span class="optkey">(' + opts[i] + ')</span>' + escHtml(set.cells[opts[i]]) + '</td>' +
            (opts[i + 1] ? '<td><span class="optkey">(' + opts[i + 1] + ')</span>' + escHtml(set.cells[opts[i + 1]]) + '</td>' : '<td></td>') + '</tr>')
        }
        const b = this.blks[0]
        return '<div class="qstem">' + boldBlanks(this.group.stem || '（组干）') + '</div>' +
          '<table class="opt-table"><tbody>' + rows.join('') + '</tbody></table>' +
          (b ? '<div class="ans"><div class="ans-title">答案：<span class="ans-letter">' + b.answer + '</span></div>' +
            '<div class="ans-concl">' + escHtml(b.concl) + '</div></div>' : '')
      }
      const subs = this.big.subsText.split('\n').map((s) => s.trim()).filter(Boolean)
      const steps = this.big.steps.map((s) =>
        '<details class="sol-step" open><summary>' + escHtml(s.q) + '</summary><div class="step-body">' +
        s.bodyText.split('\n').map((x) => '<div class="step-line">' + escHtml(x) + '</div>').join('') +
        (s.ans ? '<div class="step-ans">' + escHtml(s.ans) + '</div>' : '') + '</div></details>').join('')
      return '<div class="bigq"><div class="qnum">' + (this.big.num || '二') + '．（' + (this.big.score || 0) + '分）</div>' +
        '<div class="stem qstem">' + boldBlanks(this.big.stem || '（题干）') + '</div>' +
        (subs.length ? '<div class="qsubs">' + subs.map((s) => '<div>' + boldBlanks(s) + '</div>').join('') + '</div>' : '') +
        '<div class="ans"><div class="ans-title">参考解析</div>' + steps +
        '<div class="sol-summary"><b>答案汇总：</b>' + escHtml(this.big.summary) + '</div></div></div>'
    }
  },
  watch: {
    previewHtml() { this.$nextTick(this.rerender) },
    mode() { this.$nextTick(this.rerender) },
    year(v) {
      const p = papers()[v]
      const used = p ? p.questions.filter((q) => q.type === 'choice').map((q) => q.blank) : []
      const next = used.length ? Math.max(...used) + 1 : 1
      this.blks.forEach((b, i) => { b.blank = next + i })
      const nums = p ? p.questions.filter((q) => q.type === 'choice').map((q) => q.num) : []
      const nn = nums.length ? Math.max(...nums) + 1 : 1
      this.blks.forEach((b) => { b.num = nn })
      this.group.id = 'g' + ((p && Object.keys(p.groups || {}).length ? Object.keys(p.groups).length : 0) + 1)
    }
  },
  created() {
    this.resetBlanks()
  },
  mounted() { this.$nextTick(this.rerender) },
  methods: {
    emptyBig() {
      return {
        num: '二', score: 12, stem: '', subsText: '', fig: '', chapter: 'ch1', point: '', tagsText: '',
        solIntro: '', steps: [{ q: '(1)', bodyText: '', ans: '', fig: '' }], summary: '', pitfalls: ''
      }
    },
    resetBlanks() {
      const b = this.nextBlank
      const n = this.nextNum
      this.blks = [{
        blank: b, num: n, oKey: 'options', answer: 'A',
        chapter: 'ch1', point: '', tagsText: '',
        concl: '', opts: emptyCells(), note: ''
      }]
    },
    addBlank() {
      const prev = this.blks[this.blks.length - 1]
      this.blks.push({
        blank: (prev ? prev.blank : this.nextBlank - 1) + 1,
        num: prev ? prev.num : this.nextNum,
        oKey: prev ? prev.oKey : 'options',
        answer: 'A',
        chapter: prev ? prev.chapter : 'ch1',
        point: prev ? prev.point : '',
        tagsText: prev ? prev.tagsText : '',
        concl: '', opts: emptyCells(), note: ''
      })
    },
    addSet() {
      const n = this.group.sets.length + 1
      this.group.sets.push({ key: 'options' + n, cells: emptyCells() })
    },
    addStep() {
      const n = this.big.steps.length + 1
      this.big.steps.push({ q: '(' + n + ')', bodyText: '', ans: '', fig: '' })
    },
    pointsOf(chId) {
      const c = this.chapters.find((x) => x.id === chId)
      return c ? c.points : []
    },
    splitTags(s) {
      return String(s || '').split(/[,，、\s]+/).map((x) => x.trim()).filter(Boolean)
    },
    allStrings() {
      const out = []
      if (this.mode === 'choice') {
        out.push(['组干', this.group.stem])
        this.group.sets.forEach((s, i) => LETTERS.forEach((k) => out.push(['选项集 ' + (i + 1) + ' ' + k, s.cells[k]])))
        this.blks.forEach((b, i) => {
          out.push(['空（' + b.blank + '）解析', b.concl])
          LETTERS.forEach((k) => out.push(['空（' + b.blank + '）' + k, b.opts[k]]))
          out.push(['空（' + b.blank + '）note', b.note])
        })
      } else {
        out.push(['题干', this.big.stem], ['小问', this.big.subsText], ['解析引言', this.big.solIntro], ['答案汇总', this.big.summary])
        this.big.steps.forEach((s, i) => {
          out.push(['步骤 ' + (i + 1) + ' 标题', s.q])
          out.push(['步骤 ' + (i + 1) + ' 推导', s.bodyText])
          out.push(['步骤 ' + (i + 1) + ' 结论', s.ans])
        })
      }
      return out
    },
    rerender() {
      const el = this.$el.querySelector('.ed-preview')
      if (el) renderMath(el)
    },
    async copy(which) {
      const text = which === 'paper' ? this.paperSnippet : this.answerSnippet
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text)
        } else {
          const ta = document.createElement('textarea')
          ta.value = text
          document.body.appendChild(ta)
          ta.select()
          document.execCommand('copy')
          document.body.removeChild(ta)
        }
        toast('已复制 ' + which + ' 片段', 'ok')
      } catch (e) {
        toast('复制失败，请手动从下方代码块选取', 'bad')
      }
    },
    download(which) {
      const text = which === 'paper' ? this.paperSnippet : this.answerSnippet
      try {
        const blob = new Blob([text], { type: 'text/javascript' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = which + '-' + this.year + '-snippet.js'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        toast('已下载片段', 'ok')
      } catch (e) {
        toast('当前环境不支持下载，请复制代码块', 'bad')
      }
    },
    loadSample() {
      if (this.mode === 'choice') {
        // 空号必须用当前年份推出来的真实编号，示例里写死 41/99 会让「组干没有（n）标记」的校验直接报红
        const n = this.nextBlank
        this.group.id = 'g' + (Object.keys((papers()[this.year] || {}).groups || {}).length + 1)
        this.group.stem = '某二进制基带信号采用 $\\mathrm{HDB3}$ 码传输。关于 4 连 0 的处理，下列说法正确的是（' + n + '）。'
        this.group.sets = [{
          key: 'options',
          cells: {
            A: '直接保留 4 个连 0，靠极性交替即可恢复定时',
            B: '用 $000\\mathrm{V}$ 或 $\\mathrm{B}00\\mathrm{V}$ 取代，故意破坏极性交替',
            C: '把连 0 全部改判为 "+1" 电平',
            D: '先加扰码再做 AMI 编码'
          }
        }]
        this.blks = [{
          blank: n, num: this.nextNum, oKey: 'options', answer: 'B',
          chapter: 'ch3', point: '基带码型（AMI/HDB3等）', tagsText: 'HDB3, 码型',
          concl: '选 B。HDB3 用 $000\\mathrm{V}$ 或 $\\mathrm{B}00\\mathrm{V}$ 取代 4 连 0，正是靠破坏极性交替来携带定时信息。',
          opts: {
            A: '错。长连 0 会让定时恢复失效，HDB3 正是为消除它而设计的。',
            B: '正确。取代节故意违反交替规律，接收端据此识别并还原。',
            C: '错。改判电平会引入直流分量，也破坏了码型功率谱。',
            D: '错。加扰 + AMI 是另一条路线，不属于 HDB3 的编码规则。'
          },
          note: '先数连 0 个数，再判极性交替是否被破坏。'
        }]
      } else {
        this.big = {
          num: '二', score: 12,
          stem: '设 $s(t)=\\sum\\limits_n a_n g(t-nT_s)$，其中 $g(t)$ 是宽为 $T_s$ 的矩形脉冲，$\\{a_n\\}$ 独立等概取 $\\pm1$。',
          subsText: '(1) 求 $s(t)$ 的功率谱密度。\n(2) 若改为双极性码，谱有何变化？',
          fig: '', chapter: 'ch1', point: '随机过程通过线性系统', tagsText: '功率谱密度, 基带',
          solIntro: '先求 $g(t)$ 的频谱，再用随机序列的功率谱公式。',
          steps: [
            { q: '(1)', bodyText: '$G(f)=T_s\\,\\mathrm{sinc}(fT_s)\\mathrm{e}^{-\\mathrm{j}\\pi fT_s}$\n$P_s(f)=\\dfrac{|G(f)|^2}{T_s}=T_s\\,\\mathrm{sinc}^2(fT_s)$', ans: '$T_s\\,\\mathrm{sinc}^2(fT_s)$', fig: '' },
            { q: '(2)', bodyText: '双极性码均值为 0，连续谱相同但无离散线谱。', ans: '离散谱消失', fig: '' }
          ],
          summary: '$P_s(f)=T_s\\,\\mathrm{sinc}^2(fT_s)$；双极性时离散谱为 0。',
          pitfalls: '别把 $|G(f)|^2/T_s$ 写成 $|G(f)|^2$，量纲要检查。'
        }
      }
      toast('已填入示例，可直接改数字练手', 'ok')
    }
  }
}
</script>
