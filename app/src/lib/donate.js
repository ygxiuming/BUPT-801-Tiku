// 捐赠弹窗开关：页脚与首页支持卡片共用
import { ref } from 'vue'

export const donateOpen = ref(false)

export function openDonate() { donateOpen.value = true }
export function closeDonate() { donateOpen.value = false }
