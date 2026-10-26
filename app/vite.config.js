import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 部署基路径：GitHub Pages 走 /<Repo>/，本地开发与 nginx 根部署走 /
// 由构建环境注入，例如 VITE_BASE=/BUPT-801-Tiku/
const base = process.env.VITE_BASE || '/'

// index.html 里的 data/、vendor/ 是 public 目录资源（题库数据与 KaTeX），vite
// 对 / 开头的这类引用不会自动补 base，子路径部署会 404，所以在构建末尾统一重写。
// 同一套规则在 tools/build-frontend.mjs（esbuild 回退构建）里各有一份，改一处要改两处。
function publicBaseRewrite() {
  return {
    name: 'public-base-rewrite',
    transformIndexHtml(html) {
      if (base === '/') return html
      return html.replace(/(href|src)="\/(data|vendor)\//g, (_m, attr, dir) => `${attr}="${base}${dir}/`)
    }
  }
}

// dev 模式下 public/ 的静态文件（尤其 data/figures/<年>/_index.js，server 监听 svg 变化
// 自动重建的那个）会被浏览器启发式缓存卡住，出现"改了 svg 刷新还是旧的"——强制每次校验。
// 生产（server:3000）的对称修复在 server/index.js 的 /data 静态配置里。
function dataNoCache() {
  return {
    name: 'data-no-cache',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/data/')) res.setHeader('Cache-Control', 'no-cache')
        next()
      })
    }
  }
}

export default defineConfig({
  base,
  plugins: [vue(), publicBaseRewrite(), dataNoCache()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:3000', changeOrigin: true }
    }
  },
  build: { outDir: 'dist', assetsInlineLimit: 1024 }
})
