# 多阶段构建：Node 里打包 Vue 前端，产物交给 nginx 托管（纯静态，无 Node 运行时）
FROM node:20-alpine AS builder

WORKDIR /src

# 先装依赖再拷源码，改动源码时这一层可以命中缓存
COPY server/package*.json ./server/
RUN cd server && npm ci

COPY app/package*.json ./app/
RUN cd app && npm ci

COPY app ./app
COPY data ./data
COPY server ./server

# npm run build = npm run sync（同步题库数据 + KaTeX 到 public） + vite build
# 部署在域名根路径下时不设 VITE_BASE；要挂在子路径下加 --build-arg 即可
ARG VITE_BASE=/
ENV VITE_BASE=${VITE_BASE}
RUN cd app && npm run build

FROM nginx:1.27-alpine

# 站点配置：SPA 回退、长缓存、压缩
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /src/app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1/index.html >/dev/null || exit 1
