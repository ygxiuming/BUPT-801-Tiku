import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router.js'
import { initTheme } from './lib/theme.js'
import './styles/app.css'

initTheme()

const app = createApp(App)
// 全局错误上报（渲染错误不会进 window.onerror，挂到 window 便于排查）
app.config.errorHandler = function (err, instance, info) {
  window.__vueErrors = window.__vueErrors || []
  window.__vueErrors.push(String((err && err.message) || err) + ' @ ' + info)
  // 保留堆栈，便于在无浏览器环境下定位到具体组件/计算属性
  window.__vueStacks = window.__vueStacks || []
  window.__vueStacks.push(String((err && err.stack) || err))
  console.error(err)
}
app.use(router).mount('#app')

