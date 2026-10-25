<template>
  <figure class="figblock" v-if="svg">
    <div v-html="svg"></div>
    <figcaption v-if="caption">{{ caption }}</figcaption>
  </figure>
</template>

<script>
import { figureSvg } from '../lib/render.js'

export default {
  name: 'FigBlock',
  props: { year: [String, Number], figKey: String, caption: String },
  computed: {
    svg() { return figureSvg(this.year, this.figKey) }
  }
}
</script>
