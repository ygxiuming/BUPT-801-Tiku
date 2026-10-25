<template>
  <teleport to="body">
    <transition name="fade">
      <div class="modal-mask" v-if="open" @click.self="$emit('close')">
        <div class="modal help-modal" role="dialog" aria-modal="true" aria-label="使用说明与快捷键">
          <div class="modal-head">
            <div>
              <h3>使用说明 · 快捷键</h3>
              <p class="modal-sub">刷题、模考、看卷的键盘操作都在这里</p>
            </div>
            <button class="icon-btn" @click="$emit('close')" aria-label="关闭"><Icon name="x" /></button>
          </div>

          <div class="help-cols">
            <section class="help-sec">
              <h4><Icon name="target" :size="15" /> 刷题模式</h4>
              <dl class="keylist">
                <dt><kbd>A</kbd><kbd>B</kbd><kbd>C</kbd><kbd>D</kbd></dt><dd>选择选项</dd>
                <dt><kbd>Enter</kbd> / <kbd>Space</kbd></dt><dd>查看解析</dd>
                <dt><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd></dt><dd>综合题自评：会 / 模糊 / 不会</dd>
                <dt><kbd>S</kbd></dt><dd>收藏 / 取消收藏</dd>
                <dt><kbd>←</kbd><kbd>→</kbd></dt><dd>上一题 / 下一题</dd>
              </dl>
              <p class="help-tip">选择题点选后不立即判分，点「查看解析」才结算，可反复修改；答错自动进入错题本。</p>
            </section>

            <section class="help-sec">
              <h4><Icon name="timer" :size="15" /> 模拟测试</h4>
              <dl class="keylist">
                <dt><kbd>A</kbd>~<kbd>D</kbd></dt><dd>作答</dd>
                <dt><kbd>M</kbd></dt><dd>标记存疑</dd>
                <dt><kbd>←</kbd><kbd>→</kbd></dt><dd>切题</dd>
              </dl>
              <p class="help-tip">作答进度每 15 秒自动保存，误关页面后可继续；选择题自动判分，综合题按分值自评。</p>
            </section>

            <section class="help-sec">
              <h4><Icon name="image" :size="15" /> 看图</h4>
              <dl class="keylist">
                <dt><kbd>+</kbd> / <kbd>-</kbd></dt><dd>放大 / 缩小</dd>
                <dt><kbd>0</kbd></dt><dd>复位</dd>
                <dt><kbd>Esc</kbd></dt><dd>关闭</dd>
                <dt>滚轮 / 拖拽</dt><dd>缩放 / 平移（支持双指捏合）</dd>
              </dl>
              <p class="help-tip">页面上任意框图（含解析配图）点击即可全屏放大。</p>
            </section>

            <section class="help-sec">
              <h4><Icon name="layers" :size="15" /> 数据与记录</h4>
              <ul class="help-list">
                <li>做题记录、收藏、模考进度全部存在浏览器本地（键 <code>bupt801-records-v1</code>），不上传服务器。</li>
                <li>换浏览器或清缓存会丢失，可用「做题统计 → 清空记录」重置。</li>
                <li>答案与解析经 AI 独立推导 + 参考解析 + 手写批注三重核对；与参考资料不一致处以严格推导为准并注明。</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
import Icon from './Icon.vue'

export default {
  name: 'HelpModal',
  components: { Icon },
  props: { open: { type: Boolean, default: false } },
  emits: ['close'],
  watch: {
    open(v) {
      if (v) {
        document.body.style.overflow = 'hidden'
        document.addEventListener('keydown', this.onKey)
      } else {
        document.body.style.overflow = ''
        document.removeEventListener('keydown', this.onKey)
      }
    }
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onKey)
    document.body.style.overflow = ''
  },
  methods: {
    onKey(e) { if (e.key === 'Escape') this.$emit('close') }
  }
}
</script>
