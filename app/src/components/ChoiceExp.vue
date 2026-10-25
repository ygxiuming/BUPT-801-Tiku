<template>
  <div class="ans">
    <div class="ans-title">
      答案：<span class="ans-letter">{{ q.answer }}</span>
      <span class="badge" :class="pick === q.answer ? 'ok' : 'bad'" v-if="pick">
        {{ pick === q.answer ? '回答正确' : '回答错误 · 你的选择 ' + pick }}
      </span>
      <span class="ans-meta">{{ label }}</span>
    </div>
    <div class="ans-concl math-zone" v-html="esc(q.exp.concl)"></div>
    <div class="ans-opts">
      <div v-for="k in keys" :key="k" class="opt-exp math-zone" :class="{ right: k === q.answer }">
        <b>({{ k }})</b><span class="math-zone" v-html="esc(q.exp.opts[k])"></span>
      </div>
    </div>
    <div class="ans-note" v-if="q.exp.note"><b>💡 提示：</b><span class="math-zone" v-html="esc(q.exp.note)"></span></div>
  </div>
</template>

<script>
import { chapterLabel, escHtml } from '../lib/data.js'

export default {
  name: 'ChoiceExp',
  props: { q: { type: Object, required: true }, pick: { type: String, default: '' } },
  computed: {
    keys() { return ['A', 'B', 'C', 'D'].filter((k) => this.q.exp.opts && this.q.exp.opts[k]) },
    label() { return chapterLabel(this.q) }
  },
  methods: { esc: escHtml }
}
</script>
