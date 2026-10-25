# 交接文档 · 北邮801真题库

> 数据格式、加载链路、工具链与已知坑的速查手册。配合 `skills/bupt801/SKILL.md`（入库流程）与 `README.md`（使用说明）阅读。
> 最后更新：2026-10-25

## 一、data/ 目录格式（2025-10-25 定稿）

```
data/
├── chapters.js                    # 全站筛选维度：[{ id, name, points: [知识点...] }]
├── figures/
│   └── <年>/                      # 每年一个目录，单图一文件
│       ├── <年>-<题号>-<图名>.js   # 题目原图（试卷卷面上的框图）
│       ├── _index.js              # Node 端静态索引（require 各单图文件；不进浏览器）
│       └── answer/                # 解析配图（只出现在解析里的图）
│           └── <年>-<题号>-<图名>.js
└── questions/
    └── <年>/
        ├── paper.js               # 真题：试卷元数据 + groups(选项组) + 题目（题干/选项/章节/标签，无答案无解析）
        └── answer.js              # 答案与解析：{ "<题目id>": { answer?, exp?, sol? } }，按题目 id 索引
```

### 关键约定

- **题目与答案分离**：paper.js 不含 `answer/exp/sol`；answer.js 按题目 id 存答案与解析。加载后由 `hydrateAnswers()` 就地合并回题目对象（前端 `app/src/lib/data.js`，server `server/lib/load-data.js`，校验器 `tools/validate_data.js` 三处同逻辑）。
- **图文件名与引用解耦**：题目数据里 `fig: "key"`（q.fig 题图 / sol.steps[].fig 解析图），文件名 `年份-题号-图名` 只为人看；每个图文件注册 `figures["年"][key]` 和 `figureMeta["年"][key] = { q, kind: "paper"|"answer", desc }`。
- **选项组多套选项**：2026 起组内可声明 `optionSets: ["options5","options6"]` 且题目用 `oKey` 指定用哪套；2025 旧约定（`options12/13/25/26` 按 blank 号）继续兼容。渲染端（PaperView / print-html.js）先看 optionSets 再回退旧键。
- **公式**：`$...$` / `$$...$$`（KaTeX）；JS 字符串里反斜杠双写。渲染层统一做 HTML 转义（公式里的裸 `<` 会被 innerHTML 当标签吞掉）。
- **数据一律是挂 `window.BUPT801` 的 .js**（不用 fetch/json）。

## 二、加载链路（2025-10-25 二改：单文件引用 + 生产实时映射）

**页面只持引用**：`app/index.html` 逐文件 `<script src="/data/figures/<年>/<文件>.js">`、`/data/questions/<年>/(paper|answer).js`，**无合并 bundle**。

| 端 | 数据来源 | 改数据后的生效方式 |
|---|---|---|
| 生产（server:3000） | `server/index.js` 用 `express.static` 把项目 `data/` 实时映射到 `/data/**` | **改文件 → 刷新浏览器即生效**（无需 sync/build/重启） |
| 开发（vite dev） | `public/data/` 快照（`npm run sync` 逐文件拷贝） | `cd app && npm run sync` 后刷新 |
| Node（PDF/校验器） | 直接 require `data/`（图库走 `_index.js`，题目 paper+answer 后 hydrateAnswers 合并） | 重启 server / 重跑校验器 |

注意：**新增/删除/改名图文件**后要同步改 `app/index.html` 的 `<script>` 列表并重新 build（引用列表在 dist 的 index.html 里）；**已引用文件的内容修改**则实时生效。

## 三、工具链

| 工具 | 作用 |
|---|---|
| `tools/gen_figures_<年>.py` | 画 SVG，按 `FIGS = [(key, 题号, 是否解析图, 描述)]` 输出 `###FILE:` 分隔的单图文件 + `_index.js` |
| `node tools/emit_figures.mjs <年>` | 解析生成器输出并落盘到 data/figures/<年>/（含 answer/ 与 _index.js） |
| `node tools/split_questions.mjs <年>` | 旧格式 `<年>.js/-b.js/-big.js` → `<年>/paper.js + answer.js`（用后删旧文件） |
| `node tools/validate_data.js` | 结构/引用/公式/数值抽查校验；新年份在文件头 require 区和 EXPECT 里各登记一次 |
| `cd app && npm run sync` | data → public 逐文件拷贝（开发快照；生产不需要）；dev/build 前自动跑 |
| `node tools/build-frontend.mjs` | **回退构建**：esbuild + compiler-sfc 生成 `app/dist`（vite 在受限环境因 wasm 起不来时用） |
| `node tools/smoke_pages.mjs` | **页面冒烟**（jsdom + dist，不需要浏览器/网络）：6 条路由逐页断言"非空 + KaTeX 零报错 + Vue 零错误"，再跑"首页→试卷页""考试页开始作答""练习页选答→看解析"三个交互 |
| `tools/svg_fit.py` | 生成器里调用的瘦身函数：按墨迹包围盒（line/rect/circle/poly/path/text，剔除 `<defs>` 里的 marker）收紧 viewBox，只改 viewBox 不动坐标 |
| `tools/fit_figures_render.py <年>` | emit 之后跑：cairosvg 1:1 渲染 + PIL 量非白像素，按真实字形边界再收紧一次 viewBox（比字符宽度估算准），要求 cairosvg/pillow（在 envs/default 里） |
| `cd server && npm start` | 托管 app/dist + `/data/**` 实时映射项目 data/ + `/api/pdf/<年>/(paper|ans)` Puppeteer 排版（每年份自动注册路由） |

## 四、已知坑（重要）

1. **viewBox 要贴内容边界**（各边留白 ≤30px）：viewBox-only 的 SVG 全宽渲染，画布右侧留白会让图"看起来靠左"；内容超出画布会被裁切。做法是生成器末尾 `svg_fit.fit_svg()` 先粗收，emit 后再跑 `tools/fit_figures_render.py <年>` 按渲染像素精收；改完在 `/figures` 图库页肉眼核对。**注意别裁掉中文标签**：cairosvg 量墨迹时必须先换 CJK 字体（见第 8 条），否则中文整段不画、包围盒偏小，会把左边的"输入"这类标签裁掉。
2. **公式里的 `<`**：数据必须经 `escHtml`（前端）/`esc`（server）转义再进 innerHTML，否则如 `$H\le L<H+1$` 的 `<H+1$…>` 整段被浏览器吞成标签。
3. **Lightbox 里的 SVG**：只有 viewBox 无固有尺寸会塌缩成小白块，打开时按宽高比显式注入 width/height（Lightbox.vue figSvg）。
4. **KaTeX 渲染范围**：只对 `.math-zone` / v-html 容器跑 auto-render；对 Vue 管理的节点整体渲染会破坏 vdom 锚点导致视图冻结。
5. **Mimosa 安全 Hook**：Bash 重定向/cp 写 .js 会被拦（用 Write 工具或项目内 node 工具）；动态 `require(变量)` 会被误报命令注入（用静态字符串，新年份加一行）。
6. **app/ 是 ESM 包**（package.json type:module）：Node 端 require app/ 下的 .js 会按 ESM 加载失败，KaTeX 一律从 `server/node_modules` require。
7. **并行会话**：本项目常有多个会话同时改数据（如 2026 入库），改公共文件（index.html、校验器、data.js）前先重读，冲突时以数据格式约定（本文档）为准对齐。
8. **本机没有 Chrome**（headless 一律 EXIT=133），方案是"SVG → PNG 预览"目视核对遮挡：`cairosvg` 装在本机 Python venv（`~/.workbuddy/binaries/python/envs/default`）。**预览时必须把 `font-family` 整个替换成 `Noto Sans CJK SC`**——若列表里留 `Helvetica`，cairosvg 只取第一个字体、中文直接渲染成空白（看起来像"漏画了字"）。浏览器里不存在这个问题。另：cairosvg 对 `text-anchor='middle'` 的 tspan 会按"每个 chunk 各自居中"，预览里下标会被拉开成空隙（如 `2cos(2πf c t)`）；这是预览器的老 bug，Chrome/Safari 按 SVG 规范整段居中、显示正常，**不要为此改图**。要判断几何遮挡只看线条与方框。
9. **主题色一律走 CSS 变量**（`app/src/styles/app.css` 第 1 节）。组件里不要写死 `#fff` / `#eef3ff`，否则深色主题下会白底白字。卷面 `.paper-sheet` 内部已锁定一套浅色令牌（`--ink/--surface/--line…` 局部覆盖），所以在白纸上渲染解析块时不用另写颜色。
10. **组件不写 `<style scoped>`**：样式统一放 `app.css`。一是便于主题令牌复用，二是本机沙箱内 `vite build` 不可用（rollup 内置 wasm 在 4GB 虚拟内存上限下无法实例化），临时产物由 esbuild + `@vue/compiler-sfc` 生成，不处理 scoped 样式。
11. **沙箱里连不上 127.0.0.1**：`curl http://127.0.0.1:3000` 返回 502、`npm run sync` 报 `EPERM copyfile`（被文件策略拦）。所以页面验证走 `node tools/smoke_pages.mjs`：读 `app/dist/index.html` → 在 jsdom 里 `window.eval` 所有数据脚本（数据脚本必须早于 bundle）→ 动态 `import('dist/assets/app.js?r=N')` 让它自己 mount，全程只用文件通道。esbuild 写文件走原生二进制，不受该策略影响。

## 六、前端结构（2025-10-25 界面改版）

```
app/src/
├── styles/app.css        # 设计系统：设计令牌（浅/深）→ 基础排版 → 顶栏 → 通用组件 → 各页 → 响应式 → 打印
├── App.vue               # 顶栏（导航/已刷题数/主题切换/帮助）+ 路由过渡 + 页脚 + Lightbox/Help/Toast
├── router.js             # 5 条路由
├── views/
│   ├── HomeView.vue      # Hero + 继续上次 + 逐年进度卡 + 考点覆盖 + 工具入口
│   ├── PaperView.vue     # 卷面（v-html 拼装）+ 目录（滚动高亮）+ 工具栏（解析开关/打印/PDF）
│   ├── PracticeView.vue  # 吸顶工具条 + 题目卡 + 侧栏筛选/题号面板（窄屏→抽屉）+ 深链 ?id=
│   ├── ExamView.vue      # setup / run / result（得分环）/ review（只看错题）
│   ├── StatsView.vue     # KPI + 掌握度环 + 14 天活跃度 + 分章正确率 + 错题/收藏
│   └── FiguresView.vue   # 图库（按年/类型分组 + 关键词搜索）
├── components/           # QuestionCard / OptTable / ChoiceExp / BigSol / FigBlock / SheetPanel /
│                         # Lightbox / Icon / ProgressRing / Toast / HelpModal
└── lib/                  # data（题库访问+汇总）/ records（记录+派生统计）/ render（KaTeX、SVG 适配）/
                          # lightbox / theme（主题持久化）/ toast
```

关键约定：
- **KaTeX 只渲染 `.math-zone`**（见坑 4），新写 `v-html` 容器记得加这个类。
- **图块 `.figblock` 永远白底**：SVG 线条是深色，深色主题下不给白底会"消失"。
- 记录相关的派生统计（进度、正确率、近 14 天活跃、最近一次作答）都在 `lib/records.js`，视图只消费。
- 题目深链 `/practice?id=<题目id>`：首页「继续上次」与统计页错题/收藏都走这个入口。

## 五、待办 / 已知问题

- [x] 2026 数值抽查 2 项失败 —— 定位为**校验器公式写错**（量化噪声不等于 `E[X²]-E[Y²]`，须用 `E[X²]-2E[XY]+E[Y²]`）。已改为数值积分独立复核：p(x)=(3-|x|)/9 上直接算 E[X²]=3/2、E[XY]=29/18、E[Y²]=23/12、7/36 全部命中；另补 (7,4) 循环码 G·Hᵀ=0 / dmin=3 / s=(101) / 8 个错误图样重量分布 1·3重+3·2重+4·4重 的程序化验算。
- [x] 2026 图库 5 张 viewBox 已复核并收边：q3recv → `0 56 470 126`、q5const → `20 0 440 450`；其余三张留白已在 30px 内。另修 q2psd 的幅度轴（f=0 处细灰线不带箭头，避免被误读成谱线）。
- [x] SVG 文本下标：`gen_figures_<年>.py` 的 `text()` 支持 `x_c` / `T_{b}` / `y^2` 迷你标记（用 tspan 排上下标），不再出现 `T_b`、`V_T` 这种下划线写法。
- [ ] **2024 数据是半成品**：`data/questions/2024/{paper,answer}.js` 已写完（51 个 id、9 段 `sol`），`data/figures/2024/` 10 张图且被题目全部引用，但 `app/index.html` 与 `tools/validate_data.js` 都没登记 2024 —— 未校验、未冒烟。补登记后跑 `validate_data.js` + `smoke_pages.mjs` 即可收尾（详见 `解析日志.md` 待办）。
- [ ] `待解析/` 里 2020、2021 两份 PDF 未入库（2022 已于 2026-10-25 入库，见 `解析日志.md`）。

## 七、版本管理（2026-10-25 起）

**一个年份一个提交，提交前先补日志**：

```bash
cd ~/Desktop/北邮801-通信原理
git add data/questions/<年> data/figures/<年> app/index.html tools/ 解析日志.md
git commit -m "feat(<年>): 入库 <年> 真题（50 空 + 8 大题 + 16 图）"
```

- 提交类型：`feat` 入库新年份 / `fix` 纠错与重画图 / `docs` 文档与日志 / `chore` 工具链；没校验过的中间态写 `wip(<年>): …`。
- `解析日志.md` 是"当时怎么算的"唯一留痕：来源、统计、校验与实测结论、**与参考答案的分歧与自纠**、遗留。只追加不改写。
- `.gitignore` 忽略 `node_modules/`、`app/dist/`、`app/public/`（皆可再生，避免 diff 噪音）。
