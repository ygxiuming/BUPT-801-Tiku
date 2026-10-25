#!/usr/bin/env node
/**
 * 前端产物回退构建（esbuild + @vue/compiler-sfc）
 *
 * 为什么需要它：本机部分受限环境里 `vite build` 会失败 —— rollup 内置的
 * xxhash wasm 需要预留较大地址空间，而进程虚拟内存被限制在 4GB 时会抛
 * `WebAssembly.instantiate(): Out of memory`。构建链路本身不需要网络/浏览器，
 * 这里用 esbuild（原生二进制，无 wasm）+ compiler-sfc 复刻等价产物。
 *
 * 用法：node tools/build-frontend.mjs
 * 产物：app/dist/index.html（引用 /assets/app.js）+ app/dist/assets/app.{js,css}
 *
 * 约束：本脚本不处理 <style scoped>（当前所有组件样式都在 app.css，无 scoped 块）。
 *       正常环境仍可用 `cd app && npm run build`（vite），两者产物语义一致。
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const APP = path.join(ROOT, 'app')
const require = createRequire(path.join(APP, 'package.json'))
const esbuild = require('esbuild')
const sfc = require('@vue/compiler-sfc')

const hashId = (p) => 'data-v-' + Buffer.from(p).toString('hex').slice(-8)

const vuePlugin = {
  name: 'vue-sfc',
  setup(build) {
    build.onResolve({ filter: /^vue$/ }, () => ({
      path: require.resolve('vue/dist/vue.runtime.esm-bundler.js')
    }))
    build.onResolve({ filter: /\.vue$/ }, (args) => ({
      path: path.resolve(args.resolveDir, args.path),
      namespace: 'vue-sfc'
    }))
    build.onLoad({ filter: /.*/, namespace: 'vue-sfc' }, (args) => {
      const src = fs.readFileSync(args.path, 'utf8')
      const id = hashId(args.path)
      const { descriptor, errors } = sfc.parse(src, { filename: args.path })
      if (errors.length) {
        return { errors: errors.map((e) => ({ text: String(e.message || e) })) }
      }
      let script = (descriptor.script || descriptor.scriptSetup)
        ? sfc.compileScript(descriptor, { id }).content
        : 'const __sfc__ = {}'
      if (/export default/.test(script)) {
        script = script.replace(/export default/, 'const __sfc__ =')
      } else {
        script += '\nconst __sfc__ = {}'
      }
      let tpl = 'function render() { return null }'
      if (descriptor.template) {
        const t = sfc.compileTemplate({
          source: descriptor.template.content,
          filename: args.path,
          id,
          compilerOptions: {}
        })
        if (t.errors.length) {
          return { errors: t.errors.map((e) => ({ text: String(e.message || e) })) }
        }
        tpl = t.code
      }
      return {
        contents: [
          script,
          tpl,
          '__sfc__.render = render',
          '__sfc__.__file = ' + JSON.stringify(path.basename(args.path)),
          'export default __sfc__',
          ''
        ].join('\n'),
        loader: 'js',
        resolveDir: path.dirname(args.path)
      }
    })
  }
}

const OUT = path.join(APP, 'dist', 'assets')
fs.mkdirSync(OUT, { recursive: true })
for (const f of fs.readdirSync(OUT)) fs.unlinkSync(path.join(OUT, f))

const res = await esbuild.build({
  entryPoints: [path.join(APP, 'src/main.js')],
  bundle: true,
  format: 'esm',
  target: ['es2020'],
  outdir: OUT,
  entryNames: 'app',
  assetNames: 'app-[name]',
  minify: true,
  sourcemap: false,
  legalComments: 'none',
  logLevel: 'info',
  plugins: [vuePlugin],
  define: {
    // 与 vite.config.js 的 base 同源：GitHub Pages 子路径部署由 VITE_BASE 注入
    'import.meta.env.BASE_URL': JSON.stringify(process.env.VITE_BASE || '/'),
    __VUE_OPTIONS_API__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
  },
  loader: { '.css': 'css' }
})
if (res.errors.length) {
  console.error(res.errors)
  process.exit(1)
}

// dist/index.html 由 app/index.html 派生：数据脚本列表始终与源文件一致，
// 只把入口换成打包产物并补上样式表。
const rawHtml = fs.readFileSync(path.join(APP, 'index.html'), 'utf8')
  .replace('</head>', '  <link rel="stylesheet" href="/assets/app.css">\n</head>')
  .replace('<script type="module" src="/src/main.js"></script>',
    '<script type="module" src="/assets/app.js"></script>')
// 子路径部署（GitHub Pages）时，public 资源与打包产物的绝对路径要补上 base。
// 规则与 app/vite.config.js 的 publicBaseRewrite 保持一致，改一处要改两处。
const base = process.env.VITE_BASE || '/'
const html = base === '/'
  ? rawHtml
  : rawHtml.replace(/(href|src)="\/(data|vendor|assets)\//g, (_m, attr, dir) => `${attr}="${base}${dir}/`)
fs.writeFileSync(path.join(APP, 'dist', 'index.html'), html, 'utf8')

console.log('前端产物已更新：app/dist/index.html + app/dist/assets/app.{js,css}')
