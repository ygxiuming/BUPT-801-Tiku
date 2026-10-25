<template>
  <div class="wrap">
    <!-- ============ 吸顶工具条 ============ -->
    <div class="toolrow no-print" v-if="queue.length">
      <span class="tr-pos"><b>{{ pos + 1 }}</b> / {{ queue.length }}</span>
      <div class="tr-bar">
        <div class="pline"><i :style="{ width: answeredPct + '%' }"></i></div>
        <span class="tr-pct">{{ answeredN }} 已答 · {{ wrongSet.size }} 错</span>
      </div>
      <span class="sep"></span>
      <button class="btn sm ghost" @click="prev" :disabled="pos === 0" title="上一题 (←)">
        <Icon name="left" :size="15" />
      </button>
      <button class="btn sm ghost" @click="next" title="下一题 (→)">
        <Icon name="right" :size="15" />
      </button>
      <button class="btn sm" :class="{ soft: isStarred }" @click="star" title="收藏本题 (S)">
        <Icon name="star" :size="14" />{{ isStarred ? '已收藏' : '收藏' }}
      </button>
      <button class="btn sm primary mobile-only" @click="drawer = true">
        <Icon name="filter" :size="14" />筛选
      </button>
    </div>

    <div class="layout2">
      <!-- ============ 主区：题目 ============ -->
      <div>
        <div v-if="!queue.length" class="card pad empty">
          <div class="empty-ico"><Icon name="search" :size="28" /></div>
          没有匹配的题目，试试放宽筛选条件
          <div class="row" style="justify-content:center;margin-top:14px">
            <button class="btn sm soft" @click="resetFilters">重置筛选</button>
          </div>
        </div>

        <template v-else>
          <QuestionCard :item="cur" :pick="pick" :revealed="revealed" :locked="revealed" @pick="onPick">
            <div class="qactions">
              <template v-if="cur.q.type === 'choice'">
                <button class="btn primary" v-if="!recordRevealed" @click="reveal">
                  查看解析 <kbd>Enter</kbd>
                </button>
                <button class="btn sm" v-else-if="hideExp" @click="hideExp = false">显示解析</button>
                <button class="btn sm ghost" v-else @click="hideExp = true">隐藏解析</button>
                <span class="qhint" v-if="!revealed && !pick">先点击选项作答，再查看解析（选择后不会立即公布对错）</span>
                <span class="qhint" v-else-if="!revealed && pick">已选 ({{ pick }}) · 可修改，点「查看解析」结算</span>
              </template>
              <template v-else>
                <button class="btn primary" v-if="!recordRevealed" @click="reveal">查看解析</button>
                <button class="btn sm" v-else-if="hideExp" @click="hideExp = false">显示解析</button>
                <button class="btn sm ghost" v-else @click="hideExp = true">隐藏解析</button>
                <span class="qhint" v-if="!revealed">先自行推导，再看参考解析</span>
              </template>

              <template v-if="revealed && cur.q.type === 'big'">
                <span class="badge" :class="lastLevel === 1 ? 'ok' : lastLevel === 3 ? 'bad' : lastLevel === 2 ? 'warn' : 'gray'" v-if="lastLevel">
                  上次：{{ levelLabel(lastLevel) }}
                </span>
                <button class="btn ok" @click="judge(1)">会 <kbd>1</kbd></button>
                <button class="btn fuzzy" @click="judge(2)">模糊 <kbd>2</kbd></button>
                <button class="btn bad" @click="judge(3)">不会 <kbd>3</kbd></button>
              </template>

              <span class="spacer" style="flex:1"></span>
              <button class="btn ghost sm" @click="next">{{ pos === queue.length - 1 ? '重新开始' : '下一题' }} <Icon name="right" :size="14" /></button>
              <span class="qhint shortcuts">A~D 选项 · ← → 切题 · Enter 解析 · 1/2/3 自评 · S 收藏</span>
            </div>
          </QuestionCard>

          <!-- 相关题目 -->
          <div class="card pad" style="margin-top:16px" v-if="revealed && related.length">
            <h5 style="margin:0 0 10px;color:var(--muted);font-size:11px;letter-spacing:1.6px;font-weight:800">
              同知识点 · {{ cur.q.point }}
            </h5>
            <div class="chips">
              <span class="chip" v-for="it in related" :key="it.q.id" @click="jumpRelated(it)">
                {{ it.year }} · {{ shortTitle(it.q) }}
              </span>
            </div>
          </div>
        </template>
      </div>

      <!-- ============ 侧栏 ============ -->
      <aside class="side mobile-drawer" :class="{ open: drawer }" aria-label="筛选与答题卡">
        <div class="drawer-head">
          <b>筛选与进度</b>
          <button class="icon-btn drawer-close" @click="drawer = false" aria-label="关闭"><Icon name="x" :size="16" /></button>
        </div>

        <div class="card">
          <h5>筛选</h5>
          <div class="fgroup">
            <label>年份</label>
            <div class="chips">
              <span class="chip" v-for="y in yearList" :key="y" :class="{ on: fYears.has(y) }" @click="toggleYear(y)">{{ y }}</span>
            </div>
          </div>

          <div class="fgroup">
            <label>题型</label>
            <div class="seg">
              <span v-for="t in typeSegs" :key="t.v" :class="{ on: fType === t.v }" @click="fType = t.v; rebuild()">{{ t.n }}</span>
            </div>
          </div>

          <div class="fgroup">
            <label>章节 / 知识点</label>
            <select v-model="fChapter" @change="fPointPair = ''; rebuild()">
              <option value="">全部章节</option>
              <option v-for="c in chapters" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <select v-model="fPointPair" @change="rebuild()">
              <option value="">全部知识点</option>
              <template v-for="c in pointChapters" :key="c.id">
                <option v-for="pn in c.points" :key="c.id + '|' + pn" :value="c.id + '|' + pn">
                  {{ (fChapter ? '' : c.name + ' · ') + pn }}
                </option>
              </template>
            </select>
          </div>

          <div class="fgroup">
            <label>范围</label>
            <div class="seg">
              <span v-for="t in scopeSegs" :key="t.v" :class="{ on: fScope === t.v }" @click="fScope = t.v; rebuild()">{{ t.n }}</span>
            </div>
          </div>

          <details :open="fTags.size > 0">
            <summary>按易错点标签筛选（{{ tagList.length }}）</summary>
            <div class="chips" style="margin-top:8px">
              <span class="chip" v-for="t in tagList" :key="t" :class="{ on: fTags.has(t) }" @click="toggleTag(t)">{{ t }}</span>
            </div>
          </details>

          <div class="row" style="margin-top:14px;gap:8px">
            <button class="btn primary sm" style="flex:1" @click="rebuild()">开始 / 重置队列</button>
            <button class="btn sm" :class="{ soft: shuffleOn }" @click="shuffleOn = !shuffleOn; rebuild()" title="随机顺序">
              <Icon name="shuffle" :size="14" />
            </button>
            <button class="btn sm ghost" @click="clearAll" title="清空全部记录">
              <Icon name="trash" :size="14" />
            </button>
          </div>
        </div>

        <div class="card">
          <h5>题号面板</h5>
          <SheetPanel :items="queue" :current="pos" :answered-set="answeredSet" :wrong-set="wrongSet"
            @jump="(i) => { pos = i; scrollUp(); drawer = false }" />
          <div class="sheet-legend">
            <span>队列 <b>{{ queue.length }}</b></span>
            <span>已答 <b>{{ answeredN }}</b></span>
            <span>做错 <b>{{ wrongSet.size }}</b></span>
          </div>
        </div>
      </aside>
    </div>

    <transition name="fade">
      <div class="drawer-mask" v-if="drawer" @click="drawer = false"></div>
    </transition>
  </div>
</template>

<script>
import QuestionCard from '../components/QuestionCard.vue'
import SheetPanel from '../components/SheetPanel.vue'
import Icon from '../components/Icon.vue'
import { papers, chapters, allQuestions, allTags, optsOf, findItem, shortTitle } from '../lib/data.js'
import { rec, record, saveRec, setLevel, toggleStar, levelLabel, clearRec } from '../lib/records.js'
import { renderMathZones } from '../lib/render.js'
import { lightbox } from '../lib/lightbox.js'
import { toast } from '../lib/toast.js'

export default {
  name: 'PracticeView',
  components: { QuestionCard, SheetPanel, Icon },
  data() {
    const qs = new URLSearchParams(location.search)
    const fYears = new Set()
    if (qs.get('y')) fYears.add(qs.get('y'))
    const fScope = qs.get('wrong') === '1' ? 'wrong' : qs.get('star') === '1' ? 'star' : 'all'
    return {
      fYears, fType: qs.get('type') || 'all', fChapter: '', fPointPair: '', fTags: new Set(), fScope,
      shuffleOn: false, queue: [], pos: 0, hideExp: false, drawer: false,
      deepId: qs.get('id') || '',
      typeSegs: [{ v: 'all', n: '全部' }, { v: 'choice', n: '选择' }, { v: 'big', n: '综合' }],
      scopeSegs: [{ v: 'all', n: '全部' }, { v: 'new', n: '未做' }, { v: 'wrong', n: '做错' }, { v: 'star', n: '收藏' }]
    }
  },
  computed: {
    yearList() { return Object.keys(papers()).sort().reverse() },
    chapters() { return chapters() },
    pointChapters() { return chapters().filter((c) => !this.fChapter || c.id === this.fChapter) },
    tagList() { return allTags() },
    cur() { return this.queue[this.pos] },
    pick() { return this.cur ? (rec[this.cur.q.id] && rec[this.cur.q.id].pick) || '' : '' },
    // 已看过解析的题可随时再隐藏（hideExp 开关），避免解析常驻无法关闭
    recordRevealed() { return this.cur ? !!(rec[this.cur.q.id] && rec[this.cur.q.id].revealed) : false },
    revealed() { return this.recordRevealed && !this.hideExp },
    lastLevel() { return this.cur && rec[this.cur.q.id] ? rec[this.cur.q.id].level || 0 : 0 },
    isStarred() { return !!(this.cur && rec[this.cur.q.id] && rec[this.cur.q.id].star) },
    related() {
      if (!this.cur) return []
      const q = this.cur.q
      return allQuestions()
        .filter((it) => it.q.id !== q.id && it.q.point === q.point && it.q.chapter === q.chapter)
        .slice(0, 4)
    },
    answeredSet() {
      const m = {}
      this.queue.forEach((it) => {
        const r = rec[it.q.id]
        if (r && (r.pick || r.revealed)) m[it.q.id] = true
      })
      return m
    },
    answeredN() { return Object.keys(this.answeredSet).length },
    answeredPct() {
      return this.queue.length ? Math.round(this.answeredN / this.queue.length * 100) : 0
    },
    wrongSet() {
      const s = new Set()
      this.queue.forEach((it) => { if (rec[it.q.id] && rec[it.q.id].ok === false) s.add(it.q.id) })
      return s
    }
  },
  methods: {
    shortTitle,
    levelLabel,
    toggleYear(y) { this.fYears.has(y) ? this.fYears.delete(y) : this.fYears.add(y); this.rebuild() },
    toggleTag(t) { this.fTags.has(t) ? this.fTags.delete(t) : this.fTags.add(t); this.rebuild() },
    matched() {
      return allQuestions().filter((it) => {
        const q = it.q
        if (this.fYears.size && !this.fYears.has(String(it.year))) return false
        if (this.fType !== 'all' && q.type !== this.fType) return false
        if (this.fChapter && q.chapter !== this.fChapter) return false
        if (this.fPointPair && (q.chapter + '|' + q.point) !== this.fPointPair) return false
        if (this.fTags.size && !(q.tags || []).some((t) => this.fTags.has(t))) return false
        const r = rec[q.id]
        if (this.fScope === 'new' && r && (r.c || r.w)) return false
        if (this.fScope === 'wrong' && (!r || r.ok !== false)) return false
        if (this.fScope === 'star' && (!r || !r.star)) return false
        return true
      })
    },
    rebuild(keepPos) {
      const arr = this.matched().slice()
      if (this.shuffleOn && arr.length) {
        const rnd = new Uint32Array(arr.length)
        crypto.getRandomValues(rnd)
        for (let i = arr.length - 1; i > 0; i--) {
          const j = rnd[i] % (i + 1)
          const t = arr[i]; arr[i] = arr[j]; arr[j] = t
        }
      }
      this.queue = arr
      if (!keepPos) this.pos = 0
    },
    resetFilters() {
      this.fYears = new Set(); this.fType = 'all'; this.fChapter = ''; this.fPointPair = ''
      this.fTags = new Set(); this.fScope = 'all'; this.shuffleOn = false
      this.rebuild()
    },
    onPick(k) {
      const id = this.cur.q.id
      const r = rec[id] || { c: 0, w: 0 }
      r.pick = k; rec[id] = r; saveRec()
    },
    reveal() {
      const q = this.cur.q
      const r = rec[q.id] || { c: 0, w: 0 }
      r.revealed = true
      rec[q.id] = r
      if (q.type === 'choice' && r.pick) record(q.id, r.pick === q.answer)
      else saveRec()
    },
    selfJudge(ok) { record(this.cur.q.id, ok) },
    judge(level) {
      setLevel(this.cur.q.id, level)
      toast('已记录：' + levelLabel(level), level === 1 ? 'ok' : level === 3 ? 'bad' : 'info')
    },
    star() {
      toggleStar(this.cur.q.id)
      toast(this.isStarred ? '已取消收藏' : '已收藏本题', 'ok')
    },
    clearAll() {
      if (!confirm('确定清空全部做题记录（含错题本、收藏、模考进度）？')) return
      clearRec()
      try { localStorage.removeItem('bupt801-exam-v1') } catch (e) {}
      this.hideExp = false
      this.rebuild(true)
      toast('记录已清空', 'ok')
    },
    jumpRelated(it) {
      const idx = this.queue.findIndex((x) => x.q.id === it.q.id)
      if (idx >= 0) this.pos = idx
      else { this.queue.unshift(it); this.pos = 0 }
      this.scrollUp()
    },
    onKey(e) {
      if (lightbox.open) return
      const t = e.target
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
      if (!this.cur) return
      const k = e.key.toLowerCase()
      if (k === 'arrowleft') { this.prev(); e.preventDefault() }
      else if (k === 'arrowright') { this.next(); e.preventDefault() }
      else if (k === 'enter' || k === ' ') {
        if (!this.recordRevealed) { this.reveal(); e.preventDefault() }
      } else if (k === 's') this.star()
      else if (k === '1' || k === '2' || k === '3') {
        if (this.revealed && this.cur.q.type === 'big') this.judge(Number(k))
      } else if (k >= 'a' && k <= 'd') {
        const key = k.toUpperCase()
        const opts = optsOf(this.cur)
        if (this.cur.q.type === 'choice' && opts[key] !== undefined && !this.revealed) this.onPick(key)
      }
    },
    prev() { if (this.pos > 0) { this.pos--; this.scrollUp() } },
    next() {
      if (this.pos < this.queue.length - 1) { this.pos++; this.scrollUp() }
      else { this.rebuild(); this.scrollUp() }
    },
    scrollUp() { window.scrollTo({ top: 0, behavior: 'smooth' }) }
  },
  created() {
    this.rebuild()
    // 深链：/practice?id=<题目id>（首页「继续上次」、统计页错题/收藏直达）
    if (this.deepId) {
      const it = findItem(this.deepId)
      if (it) {
        const idx = this.queue.findIndex((x) => x.q.id === it.q.id)
        if (idx >= 0) this.pos = idx
        else { this.queue = [it].concat(this.queue); this.pos = 0 }
      }
    }
  },
  mounted() { window.addEventListener('keydown', this.onKey) },
  beforeUnmount() { window.removeEventListener('keydown', this.onKey) },
  watch: {
    cur: {
      immediate: true,
      handler() { this.$nextTick(() => renderMathZones(document)) }
    },
    revealed() { this.$nextTick(() => renderMathZones(document)) }
  }
}
</script>
