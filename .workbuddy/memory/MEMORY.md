# 项目长期记忆

## 工作流约定（2026-10-25 起生效）

- **每完成一份试卷/一次改题/一批重画图，必须做两件事**：①在 `解析日志.md` 追加一节（来源、统计、校验与实测结论、与参考答案的分歧与自纠、遗留）；②`git commit`。
- **git 粒度**：一个年份一个提交，信息格式 `<type>(<scope>): <主题>`（feat/fix/docs/chore，未校验的中间态写 `wip(<年>):`）。收尾前 `git status --short` 要干净。
- `.gitignore` 已忽略 `node_modules/`、`app/dist/`、`app/public/`、`.mimosa/`（都能再生成或纯噪音）。
- 仓库身份是本地配置：`user.name=xiuming`、`user.email=xiuming@localhost`（要改自行 `git config`）。

## 验收口径

零错误零警告（`tools/validate_data.js`）+ 页面冒烟全绿（`tools/smoke_pages.mjs`）+ 图件 0 交叠、四边留白 18/18/18/18（`tools/check_figure_overlap.js <年>`）+ 日志与提交。

图件的唯一口径在 `~/.workbuddy/skills/bupt801/SKILL.md` 第 5 节（留白/线型色表/字号/间距/同类图参照）。渲染预览走 `tools/preview_figures.py <年> --cols 3`（整年网格一次看完），收边只走 `svgkit.tighten()`，不改 viewBox。

改前端/改版时再加一条：`node tools/audit_site.mjs`（全站审计：逐年×3 页 + 首页/统计/图库/复习/编辑器、21 条完整流程、a11y 扫描，`--json` 可接 CI）。它比 smoke 深一层，能抓住"页面能打开但序号错/流程走不通"的问题——会核对大题序号与数据一致、目录锚点、DOM id 重复、图件空块。

## 环境限制

- 沙箱内禁本地网络（`curl 127.0.0.1` 返回 502）、禁 `copyFileSync`（`npm run sync` 报 EPERM），所以验证走 jsdom、同步交回本地执行。
- **jsdom 测试桩必须补的全局**（缺了会把应用 bug 和环境 bug 搞混，症状很有迷惑性）：
  - `Document` / `ShadowRoot`：Vue 的 `vModelText.beforeUpdate` 里有 `getRootNode() instanceof Document`，
    缺了会让**所有含 v-model 的页面**抛 `ReferenceError`，且报错位置在 Vue 内部函数里。
  - `URL`（用 jsdom 那份）：Node 内置 `URL.createObjectURL` 不认 jsdom 的 `Blob`，会让导出被自己的 try/catch 吞掉。
  - 键盘事件要派到真正的监听目标：⌘K→`window`、↑↓/Enter→`input`、Esc→`document`，一律往 window 发会假失败。
  - `HTMLAnchorElement.prototype.click` 打桩记录 `download`，否则 jsdom 会刷「导航未实现」。
  - 桩在 `smoke_pages.mjs globalsFor()` 与 `audit_site.mjs bindGlobals()` 各一份，改一处要改两处。
- 本机无 Chrome（headless EXIT=133），SVG 预览用 cairosvg（`~/.workbuddy/binaries/python/envs/default`），预览/量墨迹前都要把 font-family 换成 `Noto Sans CJK SC`。
- 沙箱内 `vite build` 会 Wasm OOM（`WebAssembly.instantiate(): Out of memory`）。只改 `app/index.html` 的静态 `<script>` 清单时，可直接把这些标签同步插入 `app/dist/index.html`（vite 原样保留），不必重新构建；改了 `app/src` 才必须本地重跑 `npm run build`。

## 已收录年份的口径差异

| 年 | 选择空数 | 大题 | 总分 | 备注 |
|---|---|---|---|---|
| 2022 | 40 | 8 | **146** | 原卷就是这样标的（40+106），不是 150 |
| 2023 | 50 | 8 | 150 | |
| 2024 | 40 | 9 | 150 | 20 题 × 2 空 |
| 2025 | 30 | 8 | 150 | |
| 2026 | 40 | 7 | 150 | |

## 数据写作踩坑

- KaTeX 不认 `\text{...·...}`：`·`（U+00B7）会被当成 `\cdotp` 报 "Undefined control sequence"。单位一律写 `\text{bit/(s}\cdot\text{Hz)}`；纯文本语境（不在 `$...$` 里）写 `bit/(s·Hz)` 不受影响。校验器会抓这个，跑 `validate_data.js` 就能发现。
- `validate_data.js` 的数值抽查要用**独立于解析的第二种方法**复核（GF(2) 高斯消元、穷举陪集、跑一遍 Viterbi），否则只是把同一套算错的逻辑抄两遍。
