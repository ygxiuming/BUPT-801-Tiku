<template>
  <div class="wrap">
    <!-- ============ Hero ============ -->
    <section class="hero">
      <div class="hero-inner">
        <div class="eyebrow">BUPT · 801 通信原理</div>
        <h1>把每一道真题<span class="thin">，拆成看得懂的一步步</span></h1>
        <p class="hero-sub">
          北京邮电大学硕士研究生招生考试 801 通信原理 —— 标准版式真题、逐选项解析、分步推导，
          配考场级模拟与学习统计。所有框图重绘为矢量图，缩放不失真。
        </p>
        <div class="hero-cta">
          <button class="btn lg light" @click="$router.push('/practice')">
            <Icon name="play" :size="16" />开始刷题
          </button>
          <button class="btn lg outline" @click="$router.push('/exam')">
            <Icon name="timer" :size="16" />模拟测试
          </button>
          <button class="btn lg outline" @click="scrollToYears">浏览历年试卷</button>
        </div>
        <div class="hero-stats">
          <div class="stat"><b>{{ qTotal }}</b><span>真题题目</span></div>
          <div class="stat"><b>{{ years.length }}</b><span>收录年份</span></div>
          <div class="stat"><b>{{ chapters.length }}</b><span>考点章节</span></div>
          <div class="stat"><b>{{ pointTotal }}</b><span>知识点</span></div>
        </div>
      </div>
    </section>

    <!-- ============ 继续上次 ============ -->
    <div class="resume" v-if="resumeItem">
      <div class="r-ico"><Icon name="refresh" :size="19" /></div>
      <div class="r-main">
        <b>继续上次 · {{ resumeItem.year }} 年 {{ shortTitle(resumeItem.q) }}</b>
        <p>{{ chapterLabel(resumeItem.q) }} · 最近作答 {{ fromNow(lastTouched.t) }}</p>
      </div>
      <router-link class="btn sm primary" :to="{ path: '/practice', query: { id: resumeItem.q.id } }">
        接着做 <Icon name="arrowRight" :size="14" />
      </router-link>
    </div>

    <!-- ============ 历年真题 ============ -->
    <div class="section-head" id="years">
      <div>
        <div class="eyebrow">PAST PAPERS</div>
        <h2>历年真题</h2>
      </div>
      <span class="desc">每份 150 分 · 附完整解析</span>
      <span class="spacer"></span>
      <span class="badge gray">{{ answeredAll }} / {{ qTotal }} 题已刷</span>
    </div>

    <div class="year-grid">
      <div class="year-card" v-for="y in years" :key="y">
        <div class="yc-year">{{ y }}</div>
        <h4>{{ y }} 年真题</h4>
        <div class="yc-meta">
          单项选择题 {{ statOf(y).choice }} 题 · 综合题 {{ statOf(y).big }} 题 · 满分 150
        </div>
        <div class="yc-line">
          <span>我的进度</span>
          <div class="pline thin"><i :style="{ width: progOf(y).pct + '%' }"></i></div>
          <span>{{ progOf(y).done }}/{{ progOf(y).total }}</span>
        </div>
        <div class="yc-actions">
          <router-link class="btn sm primary" :to="'/paper/' + y">
            <Icon name="paper" :size="14" />查看试卷
          </router-link>
          <router-link class="btn sm" :to="'/practice?y=' + y">刷这份卷</router-link>
          <router-link class="btn sm ghost" :to="'/exam?y=' + y">
            <Icon name="timer" :size="14" />模拟
          </router-link>
        </div>
      </div>

      <div class="year-card" style="display:flex;flex-direction:column;justify-content:center">
        <div class="yc-year">＋</div>
        <h4>更多年份</h4>
        <div class="yc-meta">新年份按 <code>skills/bupt801/SKILL.md</code> 的流程入库：转录 → 定答案 → 写解析 → 重绘 SVG → 校验。</div>
        <div class="yc-actions">
          <router-link class="btn sm ghost" to="/figures"><Icon name="image" :size="14" />看图库</router-link>
          <router-link class="btn sm ghost" to="/stats">看统计</router-link>
        </div>
      </div>
    </div>

    <!-- ============ 考点覆盖 ============ -->
    <div class="section-head">
      <div>
        <div class="eyebrow">SYLLABUS</div>
        <h2>考点覆盖</h2>
      </div>
      <span class="desc">题目在各章的分部，找出薄弱环节</span>
      <span class="spacer"></span>
      <router-link class="btn sm ghost" to="/practice">按章节刷题 <Icon name="arrowRight" :size="14" /></router-link>
    </div>

    <div class="card cover-card">
      <div class="cover-bars">
        <div class="cover-row" v-for="c in coverage" :key="c.id">
          <span class="cl" :title="c.name">{{ c.name }}</span>
          <div class="pline thin"><i :style="{ width: (c.n / maxCover * 100) + '%' }"></i></div>
          <span class="cv">{{ c.n }}</span>
        </div>
      </div>
    </div>

    <!-- ============ 功能入口 ============ -->
    <div class="section-head">
      <div>
        <div class="eyebrow">TOOLS</div>
        <h2>学习工具</h2>
      </div>
    </div>

    <div class="feature-grid">
      <router-link class="feature-card" to="/practice">
        <div class="feature-ico"><Icon name="target" :size="19" /></div>
        <h4>刷题模式</h4>
        <p>年份 / 题型 / 章节 / 易错点 / 收藏多维筛选</p>
        <p>选择不立即判分，解析可随时收起</p>
        <span class="go">进入刷题 <Icon name="arrowRight" :size="13" /></span>
      </router-link>

      <router-link class="feature-card" to="/exam">
        <div class="feature-ico"><Icon name="timer" :size="19" /></div>
        <h4>模拟测试</h4>
        <p>倒计时、答题卡、标记存疑，还原考场节奏</p>
        <p>交卷自动判分，中断自动保存可续考</p>
        <span class="go">开始模考 <Icon name="arrowRight" :size="13" /></span>
      </router-link>

      <router-link class="feature-card" to="/stats">
        <div class="feature-ico"><Icon name="chart" :size="19" /></div>
        <h4>做题统计</h4>
        <p>总正确率、分章正确率、掌握度分布</p>
        <p>错题本与收藏清单一键重练</p>
        <span class="go">查看数据 <Icon name="arrowRight" :size="13" /></span>
      </router-link>

      <router-link class="feature-card" to="/figures">
        <div class="feature-ico"><Icon name="image" :size="19" /></div>
        <h4>矢量图库</h4>
        <p>试卷原图与解析配图，全部 SVG 重绘</p>
        <p>点击放大、滚轮缩放、拖拽平移</p>
        <span class="go">打开图库 <Icon name="arrowRight" :size="13" /></span>
      </router-link>
    </div>
  </div>
</template>

<script>
import Icon from '../components/Icon.vue'
import { papers, chapters, chapterLabel, paperStat, chapterCoverage, totalPoints, shortTitle, findItem } from '../lib/data.js'
import { progressOf, touchedIds, lastTouched } from '../lib/records.js'

export default {
  name: 'HomeView',
  components: { Icon },
  computed: {
    years() { return Object.keys(papers()).sort().reverse() },
    chapters() { return chapters() },
    pointTotal() { return totalPoints() },
    qTotal() {
      return Object.values(papers()).reduce((s, p) => s + p.questions.length, 0)
    },
    answeredAll() { return touchedIds().length },
    coverage() { return chapterCoverage() },
    maxCover() { return Math.max(1, ...this.coverage.map((c) => c.n)) },
    lastTouched() { return lastTouched() },
    resumeItem() {
      const l = this.lastTouched
      if (!l) return null
      const it = findItem(l.id)
      if (!it) return null
      return Object.assign({}, it, { t: l.t })
    }
  },
  methods: {
    chapterLabel,
    shortTitle,
    statOf(y) { return paperStat(papers()[y]) },
    progOf(y) {
      const p = papers()[y]
      return progressOf(p.questions.map((q) => ({ year: p.year, q, p })))
    },
    fromNow(ts) {
      const diff = Date.now() - ts
      const m = Math.floor(diff / 60000)
      if (m < 1) return '刚刚'
      if (m < 60) return m + ' 分钟前'
      const h = Math.floor(m / 60)
      if (h < 24) return h + ' 小时前'
      const d = Math.floor(h / 24)
      return d === 1 ? '昨天' : d + ' 天前'
    },
    scrollToYears() {
      const el = document.getElementById('years')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}
</script>
