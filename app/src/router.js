import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import PaperView from './views/PaperView.vue'
import PracticeView from './views/PracticeView.vue'
import ReviewView from './views/ReviewView.vue'
import ExamView from './views/ExamView.vue'
import StatsView from './views/StatsView.vue'
import FiguresView from './views/FiguresView.vue'
import EditorView from './views/EditorView.vue'

const routes = [
  { path: '/', component: HomeView, meta: { title: '真题试卷' } },
  { path: '/paper/:year', component: PaperView, props: true, meta: { title: '试卷' } },
  { path: '/practice', component: PracticeView, meta: { title: '刷题' } },
  { path: '/review', component: ReviewView, meta: { title: '间隔复习' } },
  { path: '/exam', component: ExamView, meta: { title: '模拟测试' } },
  { path: '/stats', component: StatsView, meta: { title: '做题统计' } },
  { path: '/figures', component: FiguresView, meta: { title: '图库' } },
  { path: '/editor', component: EditorView, meta: { title: '录入编辑器' } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

// 部署基路径：跟随构建时的 base（GitHub Pages 部署在 /<Repo>/ 下；本地与 nginx 根部署为 /）
// 名字与文件末尾的标题常量 BASE 区分开
export const APP_BASE = import.meta.env.BASE_URL || '/'

export const router = createRouter({
  history: createWebHistory(APP_BASE),
  routes,
  scrollBehavior() { return { top: 0 } }
})

const BASE = '北邮801通信原理 · 真题库'

// SPA 标题随路由变化（读屏与多标签页依赖它区分页面）
router.afterEach((to) => {
  const t = to.meta && to.meta.title
  document.title = t ? t + ' · ' + BASE : BASE
})
