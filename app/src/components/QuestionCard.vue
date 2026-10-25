<template>
  <div class="qcard" ref="rootEl">
    <div class="qhead">
      <span class="badge brand" v-if="q.type === 'choice'">选择题 {{ q.num }}</span>
      <span class="badge brand" v-else>综合题 {{ q.num }}</span>
      <span class="badge gray">{{ item.year }} 年</span>
      <span class="badge gray" v-if="q.type === 'big'">{{ q.score }} 分</span>
      <span class="qhint" style="font-size:12.5px">{{ label }}</span>
      <span class="tags">
        <span class="chip" v-for="t in (q.tags || [])" :key="t" style="cursor:default">{{ t }}</span>
      </span>
    </div>

    <div class="qstem math-zone" v-html="stemHtml"></div>
    <FigBlock v-if="q.fig" :year="item.year" :fig-key="q.fig" />
    <div class="qsubs" v-if="q.subs && q.subs.length">
      <div class="math-zone" v-for="(s, i) in q.subs" :key="i" v-html="blank(s)"></div>
    </div>

    <template v-if="q.type === 'choice'">
      <OptTable :options="opts" :pick="pick" :locked="locked" :answer="q.answer" :reveal="revealed" @pick="$emit('pick', $event)" />
      <slot></slot>
      <ChoiceExp v-if="revealed" :q="q" :pick="pick" />
    </template>

    <template v-else>
      <slot></slot>
      <BigSol v-if="revealed" :q="q" :year="item.year" />
    </template>
  </div>
</template>

<script>
import OptTable from './OptTable.vue'
import ChoiceExp from './ChoiceExp.vue'
import BigSol from './BigSol.vue'
import FigBlock from './FigBlock.vue'
import { stemOf, optsOf, chapterLabel, boldBlanks } from '../lib/data.js'

export default {
  name: 'QuestionCard',
  components: { OptTable, ChoiceExp, BigSol, FigBlock },
  props: {
    item: { type: Object, required: true },   // {year,q,p}
    pick: { type: String, default: '' },      // 当前选择（选择题型）
    revealed: { type: Boolean, default: false },
    locked: { type: Boolean, default: false }
  },
  emits: ['pick'],
  computed: {
    q() { return this.item.q },
    stemHtml() { return boldBlanks(stemOf(this.item)) },
    opts() { return optsOf(this.item) },
    label() { return chapterLabel(this.q) }
  },
  methods: { blank: boldBlanks }
}
</script>
