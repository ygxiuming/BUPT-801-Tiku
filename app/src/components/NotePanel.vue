<template>
  <div class="note-panel">
    <div class="note-head">
      <Icon name="book" :size="15" />
      <b>我的笔记</b>
      <span class="note-state" v-if="dirty">未保存…</span>
      <span class="note-state ok" v-else-if="savedAt">已保存 · {{ savedText }}</span>
      <span class="spacer"></span>
      <span class="note-count">{{ text.length }} 字</span>
      <button class="btn sm ghost" @click="togglePreview">{{ preview ? '继续编辑' : '预览' }}</button>
      <button class="btn sm ghost" v-if="text" @click="remove">清空</button>
    </div>

    <textarea v-if="!preview" v-model="text" class="note-area" :aria-label="'笔记：' + label"
      placeholder="记下这题的思路、卡在哪、和哪道题像……支持 $公式$、**加粗**、`代码`"
      @input="onInput" @blur="flush"></textarea>
    <div v-else class="note-preview math-zone" v-html="mdHtml"></div>
  </div>
</template>

<script>
import Icon from './Icon.vue'
import { noteOf, setNote, clearNote } from '../lib/notes.js'
import { escHtml } from '../lib/data.js'
import { renderMath } from '../lib/render.js'
import { relTime } from '../lib/format.js'

export default {
  name: 'NotePanel',
  components: { Icon },
  props: {
    id: { type: String, required: true },
    label: { type: String, default: '' }
  },
  data: () => ({ text: '', preview: false, dirty: false, savedAt: 0, timer: null, curId: '' }),
  computed: {
    savedText() { return relTime(this.savedAt) }
  },
  watch: {
    id: {
      immediate: true,
      handler(v) {
        this.flush()               // 先把上一题的草稿写到「上一题的 id」
        this.curId = v
        this.text = noteOf(v)
        this.savedAt = this.text ? Date.now() : 0
        this.dirty = false
        this.preview = false
      }
    },
    preview(v) {
      if (v) this.$nextTick(this.renderPreview)
    }
  },
  beforeUnmount() { this.flush(); clearTimeout(this.timer) },
  methods: {
    renderPreview() {
      const el = this.$el.querySelector('.note-preview')
      if (el) renderMath(el)
    },
    onInput() {
      this.dirty = true
      clearTimeout(this.timer)
      this.timer = setTimeout(this.flush, 600)
    },
    flush() {
      if (!this.dirty || !this.curId) return
      clearTimeout(this.timer)
      setNote(this.curId, this.text)
      this.dirty = false
      this.savedAt = Date.now()
    },
    remove() {
      clearNote(this.id)
      this.text = ''
      this.dirty = false
      this.savedAt = 0
      this.$emit('changed')
    },
    togglePreview() {
      this.flush()
      this.preview = !this.preview
    },
    // 极简 Markdown：只支持 **加粗**、`代码`、- 列表、换行；公式交给 KaTeX
    mdHtml() {
      let s = escHtml(this.text || '') || '<span style="color:var(--faint)">（还没有笔记）</span>'
      s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>')
      s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      s = s.replace(/^[-*]\s+(.+)$/gm, '<span class="md-li">· $1</span>')
      s = s.replace(/\n/g, '<br>')
      return s
    }
  }
}
</script>
