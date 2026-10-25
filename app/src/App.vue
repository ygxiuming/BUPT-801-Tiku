<template>
  <header class="topbar">
    <div class="topbar-inner">
      <router-link class="brand" to="/" title="返回首页">
        <span class="logo">801</span>
        <span class="brand-text">
          北邮<em>801</em>真题库
          <small>BUPT · 通信原理</small>
        </span>
      </router-link>

      <nav class="topnav">
        <router-link v-for="n in nav" :key="n.to" :to="n.to">
          <Icon :name="n.ico" :size="16" />{{ n.name }}
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
      </div>
    </div>
  </header>

  <main class="app-main">
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
      <span>答案与解析经 AI 推导、参考资料、手写批注三重交叉验证</span>
      <span>·</span>
      <button class="btn ghost sm" @click="help = true">
        <Icon name="keyboard" :size="14" />快捷键
      </button>
    </div>
  </footer>

  <Lightbox />
  <HelpModal :open="help" @close="help = false" />
  <Toast />
</template>

<script>
import { rec } from './lib/records.js'
import { theme, toggleTheme } from './lib/theme.js'
import Lightbox from './components/Lightbox.vue'
import HelpModal from './components/HelpModal.vue'
import Toast from './components/Toast.vue'
import Icon from './components/Icon.vue'
import { openLightbox } from './lib/lightbox.js'

export default {
  name: 'App',
  components: { Lightbox, HelpModal, Toast, Icon },
  data: () => ({ help: false }),
  computed: {
    theme() { return theme.value },
    nav() {
      return [
        { to: '/', name: '真题试卷', ico: 'paper' },
        { to: '/practice', name: '刷题模式', ico: 'target' },
        { to: '/exam', name: '模拟测试', ico: 'timer' },
        { to: '/stats', name: '做题统计', ico: 'chart' },
        { to: '/figures', name: '图库', ico: 'image' }
      ]
    },
    // 已作答（看过解析或选过项）的题目数
    answered() {
      return Object.keys(rec).filter((k) => rec[k] && (rec[k].c || rec[k].w || rec[k].revealed)).length
    }
  },
  methods: { toggleTheme },
  mounted() {
    // 事件委托：站内所有 .figblock（组件渲染与 v-html 内联）点击即放大
    document.addEventListener('click', (e) => {
      const fig = e.target.closest && e.target.closest('.figblock')
      if (!fig) return
      const svg = fig.querySelector('svg')
      if (svg) openLightbox(svg.outerHTML)
    })
  }
}
</script>
