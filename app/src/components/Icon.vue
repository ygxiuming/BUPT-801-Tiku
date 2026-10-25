<template>
  <svg class="ico" :width="size" :height="size" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" :stroke-width="width" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" v-html="body"></svg>
</template>

<script>
// 统一线性图标（24×24 grid，stroke 走 currentColor），避免全站 emoji 风格不一
const PATHS = {
  paper: ['M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z', 'M13 3v6h6', 'M9 13h6', 'M9 17h4'],
  target: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'M12 11.4a.6.6 0 1 0 0 1.2.6.6 0 0 0 0-1.2z'],
  timer: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 8v5l3 2'],
  chart: ['M4 19h16', 'M7 19v-6', 'M12 19V8', 'M17 19v-8'],
  image: ['M4 5h16v14H4z', 'M4 15.5l4.2-4.2 3.6 3.6 3-3L20 17', 'M9 9.5a1 1 0 1 0 0 .01'],
  star: ['M12 3.7l2.6 5.27 5.8.85-4.2 4.1.99 5.78L12 16.97 6.81 19.7l.99-5.78-4.2-4.1 5.8-.85z'],
  sun: ['M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z', 'M12 2v2', 'M12 20v2', 'M2 12h2', 'M20 12h2', 'M5 5l1.4 1.4', 'M17.6 17.6L19 19', 'M19 5l-1.4 1.4', 'M6.4 17.6L5 19'],
  moon: ['M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z'],
  help: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M9.6 9.5a2.4 2.4 0 1 1 3.5 2.2c-.7.4-1.1 1-1.1 1.8', 'M12 17.2h.01'],
  check: ['M5 13l4 4L19 7'],
  x: ['M6 6l12 12', 'M18 6L6 18'],
  left: ['M14.5 6l-6 6 6 6'],
  right: ['M9.5 6l6 6-6 6'],
  down: ['M6 9.5l6 6 6-6'],
  filter: ['M4 6h16', 'M7.5 12h9', 'M10.5 18h3'],
  shuffle: ['M16 4h4v4', 'M20 4l-6.2 6.2', 'M4 20L20 4', 'M4 4l4.6 4.6', 'M16 20h4v-4', 'M14.2 14.2L20 20'],
  trash: ['M4 7h16', 'M9.5 7V4.8h5V7', 'M6.5 7l1 13h9l1-13', 'M10 11v5', 'M14 11v5'],
  print: ['M7.5 9.5V4h9v5.5', 'M5 9.5h14v6.5h-3V20H8v-4H5z'],
  download: ['M12 4v10', 'M8 11l4 4 4-4', 'M5 20h14'],
  flag: ['M6 4v16', 'M6 4.8h11.2l-2 4 2 4H6'],
  search: ['M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z', 'M16.4 16.4L21 21'],
  bolt: ['M13.2 3L5 14h6l-1 7 8-11h-6z'],
  layers: ['M12 3.6l8.2 4.1-8.2 4.1L3.8 7.7z', 'M3.8 12.2L12 16.3l8.2-4.1', 'M3.8 16.6L12 20.7l8.2-4.1'],
  grid: ['M4 4h7v7H4z', 'M13 4h7v7h-7z', 'M4 13h7v7H4z', 'M13 13h7v7h-7z'],
  clock: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 7.5V12l3 1.8'],
  arrowRight: ['M4 12h15', 'M13.5 6.5L20 12l-6.5 5.5'],
  arrowLeft: ['M20 12H5', 'M10.5 6.5L4 12l6.5 5.5'],
  circleCheck: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M8.2 12.2l2.6 2.6 5-5.2'],
  circleWarn: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 8v4.6', 'M12 16.3h.01'],
  book: ['M4 5.5A2 2 0 0 1 6 3.5h13v17H6a2 2 0 0 1-2-2z', 'M4 17.5h15'],
  keyboard: ['M3 7h18v10H3z', 'M7 11h.01', 'M11 11h.01', 'M15 11h.01', 'M8 14h8'],
  refresh: ['M20 12a8 8 0 1 1-2.4-5.7', 'M20 4.5V10h-5.4'],
  play: ['M8 5.5l11 6.5-11 6.5z'],
  coffee: ['M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z', 'M16 9h2.5a2.5 2.5 0 0 1 0 5H16', 'M6 3.5c0 .8-.8 1-.8 1.8', 'M10 3.5c0 .8-.8 1-.8 1.8', 'M3.5 21h13']
}

export default {
  name: 'Icon',
  props: {
    name: { type: String, required: true },
    size: { type: [Number, String], default: 18 },
    width: { type: [Number, String], default: 1.7 }
  },
  computed: {
    body() {
      const arr = PATHS[this.name] || []
      return arr.map((d) => '<path d="' + d + '"/>').join('')
    }
  }
}
</script>
