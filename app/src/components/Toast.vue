<template>
  <teleport to="body">
    <div class="toast-stack">
      <transition-group name="toast">
        <div class="toast" v-for="t in toasts" :key="t.id" :class="t.type" @click="dismissToast(t.id)">
          <Icon :name="t.type === 'ok' ? 'circleCheck' : t.type === 'bad' ? 'circleWarn' : 'bolt'" :size="16" />
          <span>{{ t.msg }}</span>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script>
import Icon from './Icon.vue'
import { toasts, dismissToast } from '../lib/toast.js'

export default {
  name: 'Toast',
  components: { Icon },
  computed: { toasts() { return toasts } },
  methods: { dismissToast }
}
</script>
