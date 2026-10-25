<template>
  <table class="opt-table" :class="{ locked }">
    <tbody>
      <tr v-for="k in keys" :key="k">
        <td :data-k="k" :class="cls(k)" @click="onPick(k)">
          <span class="optkey">({{ k }})</span><span class="math-zone" v-html="esc(options[k])"></span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { escHtml } from '../lib/data.js'

export default {
  name: 'OptTable',
  props: {
    options: { type: Object, required: true },
    pick: { type: String, default: '' },
    locked: { type: Boolean, default: false },
    answer: { type: String, default: '' },
    // locked 且已选时：标出对错；locked 未选时：亮出正确项
    reveal: { type: Boolean, default: false }
  },
  emits: ['pick'],
  computed: {
    keys() { return ['A', 'B', 'C', 'D'].filter((k) => this.options[k] !== undefined) }
  },
  methods: {
    esc: escHtml,
    onPick(k) {
      if (this.locked) return
      this.$emit('pick', k)
    },
    cls(k) {
      if (!this.locked || !this.reveal) return ''
      if (this.pick === k) return k === this.answer ? 'sel-right' : 'sel-wrong'
      if (k === this.answer) return 'reveal'
      return ''
    }
  }
}
</script>
