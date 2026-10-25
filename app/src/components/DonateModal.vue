<template>
  <teleport to="body">
    <transition name="fade">
      <div class="modal-mask" v-if="donateOpen" @click.self="closeDonate">
        <div class="modal donate-modal" role="dialog" aria-modal="true" aria-label="请作者喝杯咖啡">
          <div class="modal-head">
            <div>
              <div class="eyebrow">SUPPORT</div>
              <h3>请作者喝杯咖啡</h3>
              <p class="modal-sub">题库免费，咖啡自费</p>
            </div>
            <button class="icon-btn" @click="closeDonate" aria-label="关闭"><Icon name="x" /></button>
          </div>

          <div class="donate-body">
            <p class="donate-lead">
              这个站点没有广告、没有登录、没有会员。7 个年份的真题要逐字转录、逐题推导、逐图重绘，
              外加跑校验、回 Issue，基本都是我一个人下班后肝出来的。
            </p>
            <p class="donate-lead">
              如果它帮你省下了一个对答案的晚上，欢迎请我喝杯咖啡，让我有理由继续肝下一年。
            </p>

            <div class="donate-qrs">
              <figure class="qr-card">
                <img :src="wechatSrc" alt="微信收款码" decoding="async">
                <figcaption><b>微信</b><span>扫码投喂</span></figcaption>
              </figure>
              <figure class="qr-card">
                <img :src="alipaySrc" alt="支付宝收款码" decoding="async">
                <figcaption><b>支付宝</b><span>扫码投喂</span></figcaption>
              </figure>
            </div>

            <p class="donate-note">钱会花在服务器与域名、扫描件整理，以及作者的咖啡因摄入。</p>
            <p class="donate-note">
              金额随意，一分也是爱；不捐也完全不影响使用，题库会一直免费开源。
              <a :href="repoUrl" target="_blank" rel="noopener">点个 Star 也是支持，而且免费</a>。
            </p>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
import Icon from './Icon.vue'
import { donateOpen, closeDonate } from '../lib/donate.js'
import { REPO_URL } from '../lib/site.js'

// 站点可能部署在子路径（GitHub Pages 的 /BUPT-801-Tiku/）。模板里的 /donate/... 不会被
// Vite 自动补 base，必须拼 BASE_URL，否则线上收款码 404。
const ASSET_BASE = import.meta.env.BASE_URL || '/'

export default {
  name: 'DonateModal',
  components: { Icon },
  data: () => ({ repoUrl: REPO_URL }),
  computed: {
    donateOpen() { return donateOpen.value },
    wechatSrc() { return ASSET_BASE + 'donate/wechat.png' },
    alipaySrc() { return ASSET_BASE + 'donate/alipay.jpg' }
  },
  watch: {
    donateOpen(v) {
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
    closeDonate,
    onKey(e) { if (e.key === 'Escape') closeDonate() }
  }
}
</script>
