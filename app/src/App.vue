<template>
  <a class="skip-link" href="#main">跳到主内容</a>

  <header class="topbar">
    <div class="topbar-inner">
      <router-link class="brand" to="/" title="返回首页">
        <span class="logo">801</span>
        <span class="brand-text">
          <span class="brand-title">北邮<em>801</em>真题库</span>
          <small>BUPT · 通信原理</small>
        </span>
      </router-link>

      <nav class="topnav" aria-label="主导航">
        <router-link v-for="n in nav" :key="n.to" :to="n.to">
          <Icon :name="n.ico" :size="16" />{{ n.name }}
          <span class="nav-dot" v-if="n.to === '/review' && due > 0" :title="due + ' 题待复习'">{{ due }}</span>
        </router-link>
      </nav>

      <div class="topbar-right">
        <span class="count-pill" title="本地记录的已作答题目数">
          <Icon name="check" :size="14" />已刷 <b>{{ answered }}</b> 题
        </span>
        <button class="icon-btn" @click="toggleTheme" :title="theme === 'dark' ? '切换到浅色' : '切换到深色'">
          <Icon :name="theme === 'dark' ? 'sun' : 'moon'" :size="17" />
        </button>
        <button class="icon-btn" @click="help = true" title="使用说明与快捷键">
          <Icon name="help" :size="17" />
        </button>
        <button class="icon-btn search-btn" @click="palette = true" title="全站搜索（Ctrl / ⌘ + K）">
          <Icon name="search" :size="17" />
          <span class="kbd-hint">⌘K</span>
        </button>
      </div>
    </div>
  </header>

  <main class="app-main" id="main">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>

  <footer class="site-foot no-print">
    <div class="inner">
      <span>北邮801通信原理真题库 · 结构化题库 + 在线刷题 + 考场模拟</span>
      <span class="sep"></span>
      <router-link to="/editor">录入编辑器</router-link>
      <span>·</span>
      <button class="btn ghost sm" @click="help = true">
        <Icon name="keyboard" :size="14" />快捷键
      </button>
    </div>
  </footer>

  <Lightbox />
  <CommandPalette :open="palette" @close="palette = false" />
  <HelpModal :open="help" @close="help = false" />
  <Toast />
</template>

<script>
import { rec, touchedIds } from './lib/records.js'
import { dueIds } from './lib/srs.js'
import { theme, toggleTheme } from './lib/theme.js'
import Lightbox from './components/Lightbox.vue'
import CommandPalette from './components/CommandPalette.vue'
import HelpModal from './components/HelpModal.vue'
import Toast from './components/Toast.vue'
import Icon from './components/Icon.vue'
import { openLightbox } from './lib/lightbox.js'

export default {
  name: 'App',
  components: { Lightbox, CommandPalette, HelpModal, Toast, Icon },
  data: () => ({ help: false, palette: false, tick: 0 }),
  computed: {
    theme() { return theme.value },
    nav() {
      return [
        { to: '/', name: '真题试卷', ico: 'paper' },
        { to: '/practice', name: '刷题模式', ico: 'target' },
        { to: '/review', name: '间隔复习', ico: 'refresh' },
        { to: '/exam', name: '模拟测试', ico: 'timer' },
        { to: '/stats', name: '做题统计', ico: 'chart' },
        { to: '/figures', name: '图库', ico: 'image' }
      ]
    },
    answered() { this.tick; return touchedIds().length },
    due() { this.tick; return dueIds(rec, Date.now()).length }
  },
  methods: {
    toggleTheme,
    onKey(e) {
      const k = (e.key || '').toLowerCase()
      if ((e.metaKey || e.ctrlKey) && k === 'k') {
        e.preventDefault()
        this.palette = !this.palette
      }
    }
  },
  mounted() {
    // 事件委托：站内所有 .figblock（组件渲染与 v-html 内联）点击即放大
    document.addEventListener('click', (e) => {
      const fig = e.target.closest && e.target.closest('.figblock')
      if (!fig) return
      const svg = fig.querySelector('svg')
      if (svg) openLightbox(svg.outerHTML)
    })
    window.addEventListener('keydown', this.onKey)
    // 待复习角标每分钟刷新一次（跨天/跨场次也能更新）
    this.timer = setInterval(() => { this.tick++ }, 60000)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKey)
    clearInterval(this.timer)
  }
}
</script>
