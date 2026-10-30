<template>
  <div class="qcard" ref="rootEl">
    <div class="qhead">
      <!-- 徽标用「空号」而不是 num：2017/2019/2021/2022/2024 存在 num≠blank（多空共用一题），
           写 num 会与题干里的（N）对不上，练习时找不到是哪一空。 -->
      <span class="badge brand" v-if="q.type === 'choice'" :title="'原卷第 ' + groupNo + ' 题 · 第 ' + q.blank + ' 空'">选择题 {{ q.blank }}</span>
      <span class="badge brand" v-else>综合题 {{ q.num }}</span>
      <span class="badge gray">{{ item.year }} 年</span>
      <span class="badge gray" v-if="q.type === 'big'">{{ q.score }} 分</span>
      <!-- 同一段题干被几个空共用时必须点明，否则练习时只答其中一空会以为漏题 -->
      <span class="badge warn" v-if="siblingBlanks.length" :title="'本段题干还含空 ' + siblingBlanks.join('、')">
        本段题干共 {{ siblingBlanks.length + 1 }} 空
      </span>
      <span class="qhint" style="font-size:12.5px">{{ label }}</span>
      <span class="tags">
        <span class="chip" v-for="t in (q.tags || [])" :key="t" style="cursor:default">{{ t }}</span>
      </span>
    </div>

    <div class="qstem math-zone" v-html="stemHtml"></div>
    <FigBlock v-if="q.fig" :year="item.year" :fig-key="q.fig" />
    <div class="qsubs-wrap math-zone" v-if="q.subs && q.subs.length" v-html="subsBody"></div>

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
import { stemOf, optsOf, chapterLabel, stemHtml as stemWithTable, boldBlanks, subsHtml, papers } from '../lib/data.js'

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
    stemHtml() { return stemWithTable(stemOf(this.item)) },
    opts() { return optsOf(this.item) },
    label() { return chapterLabel(this.q) },
    subsBody() { return subsHtml(this.q.subs, 'qsubs') },
    // 原卷题号＝本组在选择题里的序号（一张卷常有「一题多空」，题≠空）。
    // 不能直接用 q.num：2018/2020/2023/2025/2026 的 num 记的就是空号。
    groupNo() {
      const q = this.q
      if (q.type !== 'choice' || !q.group) return q.num
      const p = this.item.p || papers()[this.item.year]
      const choice = ((p && p.questions) || []).filter((x) => x.type === 'choice')
      const groups = [...new Set(choice.map((x) => x.group))]
      const i = groups.indexOf(q.group)
      return i >= 0 ? i + 1 : q.num
    },
    // 同一段题干常被几个空共用（2017/2019/2021/2022/2024/2025/2026 都有），
    // 练习时只答其中一空，得让用户知道「这段题干还含着别的空」，否则会以为漏题
    siblingBlanks() {
      const q = this.q
      if (q.type !== 'choice' || !q.group) return []
      const p = this.item.p || papers()[this.item.year]
      const all = (p && p.questions) || []
      return all
        .filter((x) => x.type === 'choice' && x.group === q.group && x.blank !== q.blank)
        .map((x) => x.blank)
    }
  },
  methods: { blank: boldBlanks }
}
</script>
