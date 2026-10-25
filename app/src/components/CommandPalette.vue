<template>
  <teleport to="body">
    <transition name="fade">
      <div class="cmdk-mask" v-if="open" @click.self="close">
        <div class="cmdk" role="dialog" aria-modal="true" aria-label="全站搜索">
          <div class="cmdk-input">
            <Icon name="search" :size="17" />
            <input ref="input" v-model="kw" type="text" autocomplete="off" spellcheck="false"
              placeholder="搜题目 / 知识点 / 标签 / 图，如 HDB3、卡森公式、2024 眼图"
              aria-label="搜索关键词" @keydown="onKey" />
            <kbd>Esc</kbd>
          </div>

          <template v-if="kw.trim()">
            <div class="cmdk-body" ref="listEl">
              <div class="cmdk-group" v-if="qs.length">题目<span>{{ qs.length }}</span></div>
              <button v-for="(r, i) in qs" :key="'q' + r.id" class="cmdk-row"
                :class="{ on: active === i }" @mouseenter="active = i" @click="go(r)">
                <span class="cmdk-badge">{{ r.year }}</span>
                <span class="cmdk-main">
                  <span class="cmdk-title" v-html="hl(r.title, r.tokens)"></span>
                  <span class="cmdk-sub">{{ r.point || r.chapter }}</span>
                  <span class="cmdk-snip" v-html="hl(r.snippet, r.tokens)"></span>
                </span>
                <span class="cmdk-go"><Icon name="arrowRight" :size="14" /></span>
              </button>

              <div class="cmdk-group" v-if="figs.length">图库<span>{{ figs.length }}</span></div>
              <button v-for="(r, i) in figs" :key="'f' + r.id" class="cmdk-row"
                :class="{ on: active === qs.length + i }" @mouseenter="active = qs.length + i" @click="go(r)">
                <span class="cmdk-badge fig"><Icon name="image" :size="12" /></span>
                <span class="cmdk-main">
                  <span class="cmdk-title" v-html="hl(r.title, r.tokens)"></span>
                  <span class="cmdk-snip" v-html="hl(r.snippet, r.tokens)"></span>
                </span>
                <span class="cmdk-go"><Icon name="arrowRight" :size="14" /></span>
              </button>

              <div class="cmdk-empty" v-if="!all.length">
                没有匹配「{{ kw }}」。试试更短的关键词，或者按 <kbd>Esc</kbd> 换一个。
              </div>
            </div>
          </template>

          <div class="cmdk-body" v-else>
            <div class="cmdk-group">快捷入口</div>
            <button v-for="(s, i) in shortcuts" :key="s.to + s.name" class="cmdk-row"
              :class="{ on: active === i }" @mouseenter="active = i" @click="goShortcut(s)">
              <span class="cmdk-badge fig"><Icon :name="s.ico" :size="12" /></span>
              <span class="cmdk-main">
                <span class="cmdk-title">{{ s.name }}</span>
                <span class="cmdk-snip">{{ s.desc }}</span>
              </span>
            </button>
            <div class="cmdk-group">试试搜</div>
            <div class="chips" style="padding:0 14px 12px">
              <button class="chip" v-for="w in samples" :key="w" @click="kw = w">{{ w }}</button>
            </div>
          </div>

          <div class="cmdk-foot">
            <span><kbd>↑</kbd><kbd>↓</kbd> 选择</span>
            <span><kbd>Enter</kbd> 打开</span>
            <span><kbd>Esc</kbd> 关闭</span>
            <span class="sep"></span>
            <span v-if="kw.trim()">{{ all.length }} 条结果</span>
            <span v-else>共 {{ indexTotal }} 条索引</span>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
import Icon from './Icon.vue'
import { search, highlight, indexSize } from '../lib/search.js'

export default {
  name: 'CommandPalette',
  components: { Icon },
  props: { open: { type: Boolean, default: false } },
  emits: ['close'],
  data: () => ({
    kw: '',
    active: 0,
    qs: [],
    figs: [],
    shortcuts: [
      { to: '/review', name: '今日复习', desc: '按遗忘曲线排好的到期题目', ico: 'refresh' },
      { to: '/stats', name: '学习数据 · 考点热度', desc: '章 × 年题量矩阵、成绩趋势、节奏分析', ico: 'chart' },
      { to: '/practice?wrong=1', name: '错题重练', desc: '最近做错的题，按时间倒序', ico: 'target' },
      { to: '/editor', name: '录入编辑器', desc: '新增题目并导出 paper.js / answer.js', ico: 'layers' }
    ],
    samples: ['HDB3', '卡森公式', '眼图', '循环码', '2024']
  }),
  computed: {
    all() { return this.qs.concat(this.figs) },
    indexTotal() { try { return indexSize() } catch (e) { return 0 } }
  },
  watch: {
    open(v) {
      if (v) {
        this.kw = ''
        this.active = 0
        this.qs = []
        this.figs = []
        document.body.style.overflow = 'hidden'
        document.addEventListener('keydown', this.onDocKey)
        this.$nextTick(() => { if (this.$refs.input) this.$refs.input.focus() })
      } else {
        document.body.style.overflow = ''
        document.removeEventListener('keydown', this.onDocKey)
      }
    },
    kw(v) {
      this.active = 0
      const res = v.trim() ? search(v, 16) : []
      this.qs = res.filter((r) => r.kind === 'q')
      this.figs = res.filter((r) => r.kind === 'fig')
    }
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onDocKey)
    document.body.style.overflow = ''
  },
  methods: {
    hl: highlight,
    close() { this.$emit('close') },
    onDocKey(e) {
      if (e.key === 'Escape' && this.open) { e.preventDefault(); this.close() }
    },
    onKey(e) {
      const n = this.kw.trim() ? this.all.length : this.shortcuts.length
      if (e.key === 'ArrowDown') { e.preventDefault(); this.active = (this.active + 1) % Math.max(1, n) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); this.active = (this.active - 1 + n) % Math.max(1, n) }
      else if (e.key === 'Enter') {
        e.preventDefault()
        if (!this.kw.trim()) {
          const s = this.shortcuts[this.active]
          if (s) this.goShortcut(s)
          return
        }
        const r = this.all[this.active]
        if (r) this.go(r)
      } else if (e.key === 'Escape') { e.preventDefault(); this.close() }
    },
    go(r) {
      this.close()
      if (r.kind === 'fig') this.$router.push({ path: '/figures', query: { y: r.year, q: r.key } })
      else this.$router.push({ path: '/practice', query: { id: r.id } })
    },
    goShortcut(s) {
      this.close()
      this.$router.push(s.to)
    }
  }
}
</script>
