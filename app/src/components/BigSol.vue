<template>
  <div class="ans">
    <div class="ans-title">参考解析 <span class="ans-meta">{{ label }}</span></div>
    <div class="ans-concl math-zone" v-html="md(q.sol.intro)"></div>
    <details class="sol-step" v-for="(st, i) in q.sol.steps" :key="i" :open="openSteps">
      <summary class="math-zone" v-html="md(st.q)"></summary>
      <div class="step-body">
        <div
          class="step-line math-zone"
          :class="{ 'step-table': p.t === 'table' }"
          v-for="(p, j) in blocks(st.body)"
          :key="j"
          v-html="p.html"
        ></div>
        <FigBlock v-if="st.fig" :year="year" :fig-key="st.fig" />
        <div class="step-ans math-zone" v-if="st.ans" v-html="md(st.ans)"></div>
      </div>
    </details>
    <div class="sol-summary" v-if="q.sol.summary"><b>答案汇总：</b><span class="math-zone" v-html="md(q.sol.summary)"></span></div>
    <div class="ans-note" v-if="q.sol.pitfalls"><b>💡 易错点：</b><span class="math-zone" v-html="md(blockText(q.sol.pitfalls))"></span></div>
  </div>
</template>

<script>
import FigBlock from './FigBlock.vue'
import { chapterLabel, mdBlock, mdBlocks } from '../lib/data.js'

export default {
  name: 'BigSol',
  components: { FigBlock },
  props: {
    q: { type: Object, required: true },
    year: [String, Number],
    openSteps: { type: Boolean, default: true }
  },
  computed: {
    label() { return chapterLabel(this.q) }
  },
  methods: {
    md: mdBlock,
    blocks(body) { return mdBlocks(body) },
    // pitfalls 有的是数组、有的是字符串，统一成一段文本
    blockText(v) { return Array.isArray(v) ? v.join('\n') : v }
  }
}
</script>
