<template>
  <div class="ans">
    <div class="ans-title">参考解析 <span class="ans-meta">{{ label }}</span></div>
    <div class="ans-concl math-zone" v-html="esc(q.sol.intro)"></div>
    <details class="sol-step" v-for="(st, i) in q.sol.steps" :key="i" :open="openSteps">
      <summary class="math-zone" v-html="esc(st.q)"></summary>
      <div class="step-body">
        <div class="step-line math-zone" v-for="(p, j) in st.body" :key="j" v-html="esc(p)"></div>
        <FigBlock v-if="st.fig" :year="year" :fig-key="st.fig" />
        <div class="step-ans math-zone" v-if="st.ans" v-html="esc(st.ans)"></div>
      </div>
    </details>
    <div class="sol-summary" v-if="q.sol.summary"><b>答案汇总：</b><span class="math-zone" v-html="esc(q.sol.summary)"></span></div>
    <div class="ans-note" v-if="q.sol.pitfalls"><b>💡 易错点：</b><span class="math-zone" v-html="esc(q.sol.pitfalls)"></span></div>
  </div>
</template>

<script>
import FigBlock from './FigBlock.vue'
import { chapterLabel, escHtml } from '../lib/data.js'

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
  methods: { esc: escHtml }
}
</script>
