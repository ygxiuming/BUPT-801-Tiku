<template>
  <div>
    <div class="sheet" :class="{ compact: items.length > 40 }">
      <template v-for="(it, i) in items" :key="it.q.id">
        <div class="sheet-year" v-if="showYearSep && (i === 0 || items[i - 1].year !== it.year)">{{ it.year }}年</div>
        <button type="button"
          :class="{ answered: isAnswered(it), wronged: isWronged(it), current: i === current }"
          :title="it.year + '年 · ' + labelOf(it, i)"
          @click="$emit('jump', i)">
          {{ labelOf(it, i) }}
          <span class="flag" v-if="marked && marked.has(it.q.id)">🚩</span>
        </button>
      </template>
    </div>
    <div class="sheet-legend">
      <span><i class="sw answered"></i>已作答</span>
      <span><i class="sw wrong"></i>答错</span>
      <span><i class="sw none"></i>未答</span>
      <span v-if="showMark"><i>🚩</i>标记存疑</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SheetPanel',
  props: {
    items: { type: Array, required: true },   // [{year,q,p}]
    current: { type: Number, default: -1 },
    answeredSet: { type: Object, required: true },  // Map qid -> truthy
    wrongSet: { type: Object, required: true },     // Set qid
    marked: { type: Object, default: null },        // Set qid（可选）
    showMark: { type: Boolean, default: false }
  },
  emits: ['jump'],
  computed: {
    // 多年份混刷时显示年份分隔条
    showYearSep() {
      return this.items.length > 1 && this.items.some((it, i) => i > 0 && this.items[i - 1].year !== it.year)
    }
  },
  methods: {
    labelOf(it, i) {
      return it.q.type === 'choice' ? it.q.num : (i + 1)
    },
    isAnswered(it) { return !!this.answeredSet[it.q.id] },
    isWronged(it) { return this.wrongSet.has(it.q.id) }
  }
}
</script>
