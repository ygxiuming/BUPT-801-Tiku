---
name: bupt801
description: "北邮801通信原理真题库入库技能。把待解析/里的新年份试卷 PDF + 答案图片，加工成结构化题库（题干/选项/答案/逐项解析/分步推导）+ 重绘 SVG 图库 + 可打印试卷页，并跑通校验与页面实测。当用户说『解析20XX年801真题』『把新试卷入库』『加一年真题』『801真题解析』『重画这道题的图』『检查/统一图件格式规范』『题库校验/修复』时使用。"
agent_created: true
---

# 北邮 801 真题入库

## 0. 触发语（用户只需说这一句）

> **「解析 2027 年 801 真题，试卷和答案在 待解析/」**

更省事的说法（信息不全时按默认值补齐，不要追问）：

| 用户说 | 默认理解为 |
|---|---|
| 解析 2027 年 801 真题 | 年份=2027，输入=`待解析/2027*.pdf` + `待解析/2027答案/`，全流程走完（含图、校验、实测） |
| 只解析 2027 的试卷 | 只做转录 + groups + paper.js，不写答案 |
| 2027 的答案到了，补解析 | 已有 paper.js，只补 answer.js |
| 重画 2025 第九题的图 | 只改 `tools/gen_figures_2025.py` + emit + 预览核验 |

**默认必须做的事**（用户不说也要做）：①每道题独立解题、答案自己反复验证；②每道题都有解析；③图片全部 SVG 重绘并按第 5 节格式规范统一（四边留白 18px）；④框图/线段自查遮挡（0 交叠）；⑤`node tools/validate_data.js` 零错误零警告；⑥页面冒烟通过；⑦**追加 `解析日志.md`**；⑧**git 提交**。

---

## 1. 项目根

```
~/Desktop/北邮801-通信原理
```
不在当前 workspace 里，所有命令先 `cd` 过去。开工前读一遍 `HANDOVER.md`（数据格式/踩坑）——它是本文档的配套速查。

```
待解析/<年>*.pdf            输入：试卷
待解析/<年>答案/*.jpg       输入：答案（可能是手写批注或详细解析图片）
data/chapters.js            两级章节→知识点（筛选维度，先读，复用已有知识点名）
data/figures/<年>/          图库：单图一文件 + _index.js + answer/ 子目录
data/questions/<年>/        paper.js（真题）+ answer.js（答案与解析）
tools/gen_figures_<年>.py   SVG 生成器（stdout 输出 ###FILE: 分隔的多文件）
tools/emit_figures.mjs      把生成器输出落盘
tools/validate_data.js      数据+KaTeX+数值 校验
tools/smoke_pages.mjs       页面冒烟（jsdom + dist，无需浏览器/网络）
tools/svgkit.py             **统一收边**：tighten(svg, PAD=18)，2025/2026 起每张图必用
tools/preview_figures.py    **预览**：整年图件渲染并拼成带图名的网格（省上下文）
tools/svg_fit.py            旧方案：viewBox 粗收（2023/2024 的生成器在用，新图不要再用）
tools/fit_figures_render.py 旧方案：按渲染墨迹精收（emit 后调用，2023/2024 在用）
解析日志.md                 每年入库/改题后追加，写完即提交
app/                        Vue3 前端（index.html 登记数据 script）
server/                     Express + Puppeteer（试卷 PDF 生成）
```

---

## 2. 十步流程

### ① 环境预检（30 秒）

```bash
cd ~/Desktop/北邮801-通信原理
ls 待解析/ 待解析/<年>答案/ 2>/dev/null
node -e "require('./server/node_modules/katex/dist/katex.min.js');console.log('katex ok')"
/home/xiuming/.workbuddy/binaries/python/envs/default/bin/python -c "import cairosvg;print('cairosvg ok')"
```

- 没有 cairosvg → `/home/xiuming/.workbuddy/binaries/python/envs/default/bin/pip install cairosvg`（后台跑，前台易超时被 SIGTERM）。
- **本机 Chrome 无头模式必崩（EXIT=133）**，别浪费时间在 puppeteer 截图上，走第 ⑥ 步的 cairosvg 预览。

### ② 试卷转图 + 转录

```bash
mkdir -p /tmp/w801/<年>
pdftoppm -r 300 -png "待解析/<年>xxx.pdf" /tmp/w801/<年>/p   # 300dpi 够认小字和下标
```

- 试卷是**双栏**：先看整页，再用 PIL 按中缝竖切，左右半页分别 Read。不要图省事对半 50% 切——栏宽不对称会把右栏切掉一截。
- 逐页 Read（图像输入）→ 转成结构化文本；公式先记成 `$...$` 草稿。
- 填空题式选择题：多个空共用一组 ABCD → `groups` 建模；**组干必须含本组全部空号的 `（n）` 全角标记**，前端靠它匹配。
- 空号统一 **全角 `（1）`**，公式里的 `g^{(1)}`、`(1011)` 不动。
- **一题多空（如 2024：20 题 × 2 空 = 40 空）**：`num` 写题号（1..20，同一题的两个空**重复**），`blank` 写空号（1..40），`id` 顺排 `2024-1..40`，两个空的 `oKey` 指同一个 `options`（共用 4 个选项）。校验器已支持这种卷面（题号去重后查连续 + `blank` 查连续），若新卷子是别种组合（3 空共享、部分题独占）先确认 `blank` 能连续排满。

### ③ 定答案（最关键，别抄）

1. 先看参考答案（手写潦草就逐题放大裁剪）。
2. **自己独立推导一遍**，不看参考答案。
3. 两边对不上 → 以严格推导为准，并在 `exp.note`（选择）/ `sol.pitfalls`（大题）里写明：参考答案怎么写的、错在哪、本文档取什么。
4. 大题每个子问都要有数值或表达式结果，能数值验算的一律验算（见第 ⑦ 步数值抽查）。

> 已发生过的真实分歧：2026 第二题解析把 `-2A sin(2120πt)` 写成了 cos；第七题把带宽和噪声同时翻倍自相矛盾；第六题把 `E[xx]` 算成 `E[xx*]`。**参考解析错得很正常，必须自己算。**

### ④ 写数据

新试卷**直接写两个文件**（不要走 split，split 只用于旧格式 `<年>.js/-b.js/-big.js`）：

- `data/questions/<年>/paper.js`：`sections` + `groups` + `questions`（**不含** answer/exp/sol）
- `data/questions/<年>/answer.js`：`{ "<题目id>": { answer?, exp?, sol? } }`

```js
// paper.js 选择题
{ id:"<年>-1", num:1, type:"choice", group:"g1", blank:1, oKey:"options5",
  stem:"…（1）", chapter:"ch2", point:"复用chapters.js里的名称", tags:["易错"] }
// paper.js 大题
{ id:"<年>-二", num:"二", type:"big", score:15, stem, subs:[], fig:"key"|null,
  chapter, point, tags }
// answer.js
"<年>-1": { answer:"B", exp:{ concl:"…", opts:{A:"…",B:"…",C:"…",D:"…"}, note:"易错点" } }
"<年>-二": { sol:{ intro:"…", steps:[{q:"（1）…", body:["…","$$…$$"], ans:"…", fig:"key"}],
                 summary:"…", pitfalls:["与参考解析差异：…"] } }
```

- **一组多套选项**：组上 `optionSets:["options5","options6"]` 定顺序，题上 `oKey` 指用哪套；老约定 `options12/13/25/26` 仍兼容。
- **KaTeX 反斜杠双写**：`\\frac`、`\\int`。写字符串时警惕 `\\text`/`\\end` 被单反斜杠吞掉。
- 公式里的裸 `<` 会被 innerHTML 当标签吞，数据层已统一 `escHtml`，但别自己再拼 HTML。

### ⑤ 画图（一张都不能省）

1. 写 `tools/gen_figures_<年>.py`：从 `gen_figures_2026.py` 复制脚手架（`HEAD/marker/line/poly/text/dot/circle/rect/mul/adder` 画笔齐备）。**先 `grep` 去年的同类图函数，照抄它的框高/标签间距/字号**，不要从零拍坐标——两年的同类图必须长一个样。
2. 在 `FIGS = [(key, 题号, 是否解析图, 描述)]` 登记；输出走 stdout，用 `###FILE:<路径>` 分隔。
3. 落盘：

```bash
node tools/emit_figures.mjs <年>     # 生成 data/figures/<年>/*.js + answer/*.js + _index.js
```

4. 收边**只有一种写法**（2025/2026 已是这个范式，新图照抄）：

```python
from svgkit import PAD, tighten          # tools/svgkit.py
...
SVGS = { 'q2psd': fig_q2psd(), ... }
SVGS = {k: tighten(v, PAD) for k, v in SVGS.items()}   # 四边各留 18px
```

- 画布尺寸随便给（`HEAD.format(w=..., h=...)`），只要内容装得下；**不要手调 viewBox，也不要用 `head_at()`**（已弃用：它要求所有坐标 ≥ x0，一不留神就左侧溢出）。
- 文件名 `年份-题号-图名.js` 只给人看，数据里永远用 `fig:"key"` 引用。
- 上下标用 `text()` 的迷你标记：`x_c`、`T_{b}`、`u^2` → tspan 真上下标。**绝不写 `T_b`、`G₁` 这种字面下划线/Unicode 下标。**
- 颜色、线宽、虚线、字号、间距、框高**一律按下表第 5 节《图件格式规范》**，那张表是唯一口径，别在图里另发明写法。

### ⑥ 自查遮挡（必做，不能只靠肉眼扫一眼）

```bash
PY=/home/xiuming/.workbuddy/binaries/python/envs/default/bin/python
$PY tools/preview_figures.py <年> --cols 3 --cell 520x400       # -> /tmp/w801/figures-<年>.png
$PY tools/preview_figures.py <年> --only q7quant,psk8new --cell 760x470 --out /tmp/x.png   # 可疑的单看
```

一条命令搞定"导出 SVG（自动换 `Noto Sans CJK SC`）→ cairosvg 渲染 → PIL 拼带图名的网格"。
**整年一次 Read 网格图，不要逐张 Read**（11 张图逐张看=11 次图像输入，够把上下文吃掉一半）；只有格子太小看不清的才用 `--only` 单独放大。

**重点看四件事**：
- 标签压线 / 压在箭头头上（文字包围盒到线的净距 < 6px 就算危险）
- 抽头竖线穿过方框里的文字（如 `G₂`）
- 圆加号画成"圆圈里再一个 ⊕"双重圆（应该只画 `<circle>` + 一竖一横两条短线）
- 内容溢出画布 / 四边留白不均（四边差 > 4px 就说明这张图没走统一收边）

再跑几何自查（文字包围盒 vs 线段 vs viewBox）：

```bash
node tools/check_figure_overlap.js <年>     # 判过标准：0 线交叠 + 0 字交叠 + 四边留白 18±2（四边差 ≤4px）
```

**收边走 `svgkit.tighten()` 一步到位，别手调 viewBox**：

- 生成器末尾 `SVGS = {k: tighten(v, PAD) for k, v in SVGS.items()}`，PAD=18（见第 5 节）。
- 它按 line/rect/circle/polygon/path/text 的包围盒收边：**先剥 `<defs>`**（箭头 marker 的 `M0,0` 不算墨迹），path 逐个命令取点（含小写相对命令）；文字盒口径（上 0.8em / 下 0.2em，CJK 1.0em、大写数字 0.62em）与 `check_figure_overlap.js` 完全一致，收边与检测不会互相打架。
- 收完四边必然是同一个数（18）。若 `check` 报出 8/30 这种不均匀值，说明这张图没走 `tighten()`，回去补，别去手调 margin。
- 中文在预览里要能画出来：`preview_figures.py` 会自动把根 `font-family` 换成 `Noto Sans CJK SC`，手写渲染命令时才需要自己记得。

> 2023/2024 还在旧两步（`svg_fit.fit_svg()` 粗收 + `fit_figures_render.py` 按墨迹精收，留白 6~23）。**只有维护这两年时才用旧链路**，动到它们就顺手改成 `svgkit.tighten()`，别再新增旧写法。

> cairosvg 的已知假象：`text-anchor='middle'` 的 tspan 会按 chunk 各自居中，下标被拉开成空隙（显示成 `2cos(2πf c t)`）。**浏览器正常，不要为这个改图。** 只看线条/方框是否真的相交。

### ⑦ 登记 + 校验

```bash
# a) app/index.html 加三行（图库 bundle 一行 + 题目两行）
#    <script src="/data/figures/<年>.js"></script>
#    <script src="/data/questions/<年>/paper.js"></script>
#    <script src="/data/questions/<年>/answer.js"></script>

# b) tools/validate_data.js 两处登记
#    require('../data/figures/<年>/_index.js');
#    require('../data/questions/<年>/paper.js'); require('../data/questions/<年>/answer.js');
#    EXPECT[<年>] = { choice: N, big: M, score: 150 }

node tools/validate_data.js    # 必须 0 错误 0 警告
```

校验器覆盖：题量/总分、编号连续、章节知识点存在、答案落在选项组内、组干含全部空号、`fig` 引用可解析、**每条 KaTeX 公式可渲染（含 `$$`）**、数值抽查。

**数值抽查的写法要求**：不要用"结果套结果"的恒等式（会自证）。用独立方法复核，例如 2026 第四题量化器就是在 `p(x)=(3-|x|)/9` 上做数值积分算 `E[X²]=3/2`、`E[XY]=29/18`、`E[Y²]=23/12`、噪声 `7/36`；第八题循环码直接程序化验算 `GHᵀ=0`、`dmin=3`、`s=(101)→ĉ=0001011`、8 个错误图样的重量分布。

### ⑧ 同步 public

```bash
cd ~/Desktop/北邮801-通信原理/app && npm run sync
```
沙箱里 `sync-data.mjs` 可能 EPERM，等价的兜底：

```bash
cd ~/Desktop/北邮801-通信原理
for y in <年>; do
  mkdir -p "app/public/data/questions/$y"
  cp -f "data/questions/$y/paper.js" "data/questions/$y/answer.js" "app/public/data/questions/$y/"
  { printf 'window.BUPT801 = window.BUPT801 || {};\nwindow.BUPT801.figures = window.BUPT801.figures || {};\n'
    find "data/figures/$y" -name '*.js' ! -name '_*' | sort | while read -r f; do cat "$f"; echo; done
  } > "app/public/data/figures/$y.js"
done
cp -f data/chapters.js app/public/data/chapters.js
```
注意：`find` 必须排除 `_*`（`_index.js` 是 Node 端静态索引，进浏览器会重复注册/污染）。

### ⑨ 实测

**首选**（不依赖浏览器、不受沙箱网络限制）：

```bash
node tools/build-frontend.mjs      # 没改 app/src 可跳过
node tools/smoke_pages.mjs         # 全绿才算过（当前 14 条路由 + 4 个交互）
```

它用 jsdom 打开 `app/dist/index.html`，先 `window.eval` 所有数据脚本（**顺序不能反**，数据脚本必须早于 bundle），再 `import('dist/assets/app.js?r=N')` 让应用自己 mount，逐页断言"文字量正常 + `.katex-error` 为 0 + `window.__vueErrors` 为空"，最后跑三段交互：首页→试卷页、考试页点「开始考试」、练习页选选项→查看解析。新增/改版的页面要在 `ROUTES` 和交互块里补断言。

**新入库的年份记得在 `ROUTES` 里加三条**（`/paper/<年>`、`/practice?y=<年>`、`/exam?y=<年>`），并给「练习页选选项→查看解析」再补一条该年份的交互（老年份那条保留）——否则新数据只被 `validate_data.js` 覆盖，前端渲染问题会漏过去。改了 `app/index.html` 后必须先 `node tools/build-frontend.mjs`，冒烟读的是 `dist/index.html` 里的 script 清单。

> **`openPage(route, tag)` 的 tag 不用手工区分**：它被拼进 `import('app.js?tag=...')` 当缓存参数，ESM 模块只执行一次，tag 重复会让第二次调用拿到缓存的 bundle、app 不挂载，页面空白（表现为"找不到 td[data-k]"这种假失败）。脚本现在会自动追加递增序号，加交互步骤时直接写可读前缀即可。

> 沙箱内 `curl 127.0.0.1:3000` 返回 502、`npm run sync` 报 `EPERM copyfile`，**别指望起 dev server 用 curl 验**。

有浏览器时再看真页面：

```bash
cd app && npm run dev   # http://localhost:5173
```

过这六个页面：`/`、`/paper/<年>`、`/practice?y=<年>`、`/exam?y=<年>`、`/stats`、`/figures`。
核对：无 `.katex-error`（**选项和解析都要看**）、SVG 不重叠不裁切、判题正常、三档自评正常、图点击放大正常。

### ⑩ 收尾：git 提交 + 写解析日志

**这两件事做完才算"弄完"**，缺一件都不算交付。

#### a) 解析日志（`解析日志.md`）

1. 在"总览"表尾加一行：年份 / 来源 / 选择 / 大题 / 总分 / 图 / 校验 / 完成日。
2. 追加一节 `## <年>`，五项必写：
   - **来源**：`待解析/` 里的原始 PDF（页数、dpi）、答案图片位置
   - **统计**：选择题空数、大题数（各子问分值）、总分、SVG 张数（题图/解析图各几张）
   - **校验与实测**：`validate_data.js` 的错误/警告数、`smoke_pages.mjs` 的结论（公式数、状态）
   - **与参考答案的分歧与纠错**：逐条写"参考答案怎么写 / 错在哪 / 本文取什么"。**自己算错返工的也要写**（例：2023 五(2) 判决域折点笔误）
   - **遗留**：没跑通的、被沙箱挡住的、下次要先做的事
3. 旧内容只追加不改写；改题/重画图也在对应年份下补一条带日期的短记录。

#### b) git

```bash
cd ~/Desktop/北邮801-通信原理
git rev-parse --git-dir 2>/dev/null || git init -b main   # 首次
git status --short
git add data/questions/<年> data/figures/<年> app/index.html tools/ 解析日志.md
git commit -m "feat(<年>): 入库 <年> 真题（50 空 + 8 大题 + 16 图）"
```

- **提交信息**：`<type>(<scope>): <主题>` —— `feat` 入库新年份、`fix` 纠错/重画图、`docs` 文档与日志、`chore` 工具链。
  正文写清题量、校验结果、动过的公共文件（`app/index.html`、`validate_data.js` 这类多会话共用文件要点名）。
- **粒度**：一个年份一个提交；改图、改答案单独成提交，方便 `git revert` 单点回滚。
- **中间态**：没校验通过也可以提交，但主题必须写 `wip(<年>): …`，别让"0 错 0 警"的记录和仓库实际状态对不上。
- **别提交的东西**：`.gitignore` 已忽略 `node_modules/`、`app/dist/`、`app/public/`（都可再生成，进仓库只会让 diff 变噪音）。若发现 `git status` 里有这仨，先修 `.gitignore` 再 add。
- 收尾前 `git status --short` 必须干净（或只剩明确的 `wip` 文件）。

---

## 3. 硬性验收清单

- [ ] 选择题 N 题 / 大题 M 题 / 总分 150（以原卷为准，同步 `sections` 分值）
- [ ] 每道选择题有 `concl + A~D 逐项 + note`；每道大题有 `intro + 分步 + 每问 ans + summary + pitfalls`
- [ ] 与参考答案不一致处，解析里写明差异和理由
- [ ] 全部图片 SVG 重绘，逐张 PNG 目视核过遮挡，`check_figure_overlap.js <年>` 0 交叠、**四边留白 18/18/18/18（±2）**，版式符合第 5 节规范
- [ ] `node tools/validate_data.js` → 0 错误 0 警告
- [ ] `app/index.html` / `validate_data.js` / `chapters.js` 三处登记齐全
- [ ] `public/data/` 与 `data/` 内容一致（`diff` 过，或确认走 server 实时映射不需要快照）
- [ ] 六个页面类型全部实测通过（`node tools/smoke_pages.mjs` 全绿，`ROUTES` 已含新年份三条）
- [ ] `解析日志.md` 已追加本年一节（含纠错与遗留）
- [ ] `git commit` 完成，`git status --short` 干净

## 4. 踩坑速查

| 现象 | 原因 / 解法 |
|---|---|
| 中文在预览图里是空白 | cairosvg 只取第一个 font-family；预览时整体替换成 `Noto Sans CJK SC` |
| 预览里下标出现空隙 | cairosvg 对 `text-anchor='middle'` + tspan 的 bug，浏览器正常，别改图 |
| 公式报 `katex-error` | JS 字符串反斜杠没双写，或被 `\t`/`\e` 转义吞掉 |
| 题干空号高亮错位 | 用了半角 `(1)`，必须全角 `（1）` |
| 选项只显示第一套 | 组上没写 `optionSets`，或题上没写 `oKey` |
| 图里出现 `f_c` 字面下划线 | `text()` 没走迷你标记（`x_c` → tspan） |
| 图整体偏左/被裁 | 没走统一收边（见第 5.1 节）：`tighten(v, PAD)` 收完四边必是 18；若仍偏，看内容是否溢出画布 |
| Bash 写 `.js` 被拦（EPERM） | Mimosa 安全 Hook；改用 Write 工具或项目内 node 脚本 |
| `require(app/...)` 报 ESM 错 | `app/` 是 `type:module`，KaTeX 一律从 `server/node_modules` require |
| Chrome 截图 EXIT=133 | 本机无 Chrome，走 cairosvg |
| 校验器 "数值抽查失败" | 先怀疑抽查公式本身错了，再用独立数值积分复核 |
| 图裁完中文标签没了 | 量墨迹时中文没画（cairosvg 只取第一个字体名），换 `Noto Sans CJK SC` 再量 |
| 图怎么裁都贴不到边 | `<defs>` 里 marker 路径的 `M0,0` 被当成墨迹，`svg_fit.py` 负责剔除 |
| `curl 127.0.0.1:3000` 返回 502 | 沙箱禁本地网络；改用 `node tools/smoke_pages.mjs` |
| `npm run sync` 报 `EPERM copyfile` | 同上，沙箱拦文件复制；走 server 实时映射，或本地再 sync |
| `cp` 卡住/命令被转后台 | 本机 `cp` 是交互别名（`cp -i`），会停在"是否覆盖？"；一律用 `/bin/cp -f` |
| 校验器报"空号不连续"但看不出来 | 一题多空时 `num` 必然重复（2024）。校验现在按去重题号查；若仍报，先看 `blank` 是否 1..N 连续 |
| `Math.erfc is not a function` | 本机 Node 没有 erfc。数值抽查别直接算 erfc/Q，改核 `d/σ` 比值或 `d/(σ√2)` 是否等于题设整数 |
| 图件报"留白 L=-1xx"（左侧溢出） | 旧写法 `head_at(w,h,x0,y0)` 会把 viewBox 原点搬到 `x0`，元素坐标写到 `x0` 左侧就溢出。**已弃用**：改 `HEAD.format` + `tighten` |
| 四边留白 8/30 不均、图看着偏左 | 这张图没走 `svgkit.tighten()`，或还在用 `svg_fit`/`fit_figures_render` 旧链路；新图统一 `tighten(v, PAD)` |
| 收紧留白后标签与箭头贴住 | 文字盒是"上 0.8em / 下 0.2em"，箭头起点必须落在文字盒之外 ≥6px；垂直箭头别让文字居中压在箭线上，改成右对齐/左对齐到线侧 |
| 框里两行字贴框底 | 框高 30 只够单行。双行文字用框高 38、行基线间距 14~15、距上下边各 ≥4px |
| 同类元素三种画法（`#666`/`#bbb`、`6,4`/`2,3`） | 按第 5 节色表/线型表统一，别在图里自创；改动时用 `grep -n "color='#"` 一次性扫平 |
| 冒烟报"找不到 td[data-k]"、页面空白 | `openPage(route, tag)` 的 tag 命中 ESM 缓存、app 没重新挂载（见第 ⑨ 步，已自动加序号） |
| 留白 L/T 30+、R/B 18（图明显偏右下） | 包围盒扫到了 `<defs>` 里箭头 marker 的 `M0,0 L7,3`；`svgkit.content_bbox` 必须先剥 `<defs>` |
| 收边后闭合折线/箭头被裁掉一截 | path 的 `d` 带小写相对命令（`l9,-4`）或 `Z` 结尾被漏算；`_path_points` 已按相对位移累加 |
| 改了 `svgkit.py` 或公共画笔，怕波及其它图 | 重新 emit 后看 `git status --short data/figures`：**应当零改动**；有改动就 `git diff` 确认是哪张图、为什么变 |

## 5. 图件格式规范（唯一口径）

> 硬约束：新图照抄这张表，改图按这张表对齐。判断标准一句话——**两年的同类型图摆一起，看不出是分两次画的**。

### 5.1 画布与留白

- 每张图末尾统一 `SVGS = {k: tighten(v, PAD) for k, v in SVGS.items()}`（`tools/svgkit.py`，PAD=18），四边各留 18px。
- 不自调 viewBox，不用 `head_at()`，不用 `svg_fit` / `fit_figures_render`（那两个是 2023/2024 的历史链路）。
- 画布尺寸只为布局服务，装得下就行；不要为了让"图看着大"去改 margin。
- 验收：`check_figure_overlap.js` 报 `18/18/18/18`（±2，且四边差 ≤4）。
- `svgkit.py` 与生成器同在 `tools/`，`emit_figures.mjs` 用 `python3 <绝对路径>` 调用、`sys.path[0]` 就是 `tools/`，所以 `from svgkit import PAD, tighten` 直接可用（手动 `python3 tools/gen_figures_<年>.py` 同样成立）。
- `content_bbox` 的两条硬规矩（改这个文件时别退回去）：
  1. **先剔除 `<defs>`**——箭头 marker 的 `M0,0 L7,3 L0,6 z` 是图形定义不是墨迹，混进来会把包围盒拉到原点，收边等于没做（表现为留白 L/T 30+、R/B 18）。
  2. **path 的 `d` 要按命令解析**，小写 `l/c/q` 是相对位移、`Z` 是闭合；只抓 `M` 后那串数字会漏掉折线拐点和箭头三角，导致收完边把图裁掉一块。

### 5.2 线型与颜色

| 元素 | 颜色 | 线宽 | 虚线 |
|---|---|---|---|
| 信号线 / 方框 / 坐标轴 / 箭头 | `#1a1a1a` | 1.6 | — |
| 判决域、区间边界、星座分区 | `#888` | 1.2 | `5,4` |
| 分组虚框（`G`／`G₂` 这类模块边界，包住子框图） | `#1a1a1a` | 1.2 | `5,4`（穿框的实线处留 8px 缺口） |
| 参考虚线（抽样时刻、电平参考、辅助网格） | `#999` | 1.1 | `3,4` |
| 幅度谱 f=0 竖直细线（**不带箭头**） | `#999` | 1.1 | 实线 |
| 域标签 `D₁…`、次级标注 | `#555` | — | — |
| 图注 / 说明文字 | `#666` | — | — |
| 强调数值（判决门限、错误概率） | `#c00` | — | — |

- **禁用**：`#666`/`#bbb` 画边界线；dash 写成 `2,3` / `4,5` / `6,4` / `5 4`（统一用逗号：`5,4`、`3,4`）。
- 红色只用于"一处关键数值"，同图不超过一处。

### 5.3 字号

- 14（默认正文/框内文字）、13（公式标注，如 `cos(2πf_c t)`）、12（坐标刻度、比特标签）、11（密集星座点标签）。
- 同图同类元素同字号；跨年份同类图同字号。
- 上下标只走 `text()` 迷你标记（`x_c` / `T_{b}` / `u^2`），不写 `T_b`、`G₁`。

### 5.4 间距（按文字包围盒算：上 0.8em、下 0.2em）

- 标签在线上方：`y_text ≤ y_line − 0.2*size − 6`。
- 垂直箭头：**别让文字居中压在箭线上**，把标签右对齐/左对齐到线的侧边（`anchor='end'/'start'`），水平净距 ≥6px。
- 标签与箭头三角：净距 ≥6px。
- 框内单行：框高 ≥30；两行：框高 38，行基线差 14~15，距上下边各 ≥4px。
- 框宽 ≥ 文字宽 + 12；相邻框图元水平净距 ≥24（留得下支路标签）。

### 5.5 图元画法

- 乘法器 ⊗ = `circle` + 两条斜线（0.71r）；加法器 ⊕ = `circle` + 十字（0.77r）。**不用 unicode 字符**，也不会出现"圆里再套一个 ⊕"。
- 幅度谱 f=0 的细灰线不带箭头（否则被读成谱线）。
- 星座判决域必须按几何真值画（Voronoi 中垂线），边界淡于信号线。
- 阶跃/量化特性用折线自身的竖直段表达跳变，**不再叠一条贯穿全高的虚线**（重复且脏）。
- 分组虚框（`G`/`G₂` 这类"某一级的整体"）：名称标在**框内左上角**，框与内部元素留 ≥15px；信号线穿框处的框边断开 8px，别让实线压在虚线上（几何自查会把交叉记成"线交叠"）。

### 5.6 同类图对照表（写新图前先打开对应函数）

| 图型 | 参照实现 | 要抄的参数 |
|---|---|---|
| 系统框图 / 接收机 | `gen_figures_2026.py: fig_q3recv`、`fig_q6block` | 框高 48、`mul/adder` r=13~14、支路起止留 24~30 |
| 单边/双边幅度谱 | `fig_q2psd`（2026 / 2025） | 谱线 1.8、脉冲三角 4px、f=0 细线 `#999/1.1` |
| 星座 + 判决域 | `fig_q5const`（2026）、`fig_psk8/psk8new`（2025） | 点距 U、边界 `#888/5,4`、点标签偏移 `(dx,dy,anchor)` |
| 量化特性 / PDF | `fig_q7quant`、`fig_ookpdf`（2025） | 电平标签统一"电平线上方 4px"、门限红色一处 |
| 编码器 / 延迟线 | `fig_encoder`（2025） | ⊕ 悬在 D₁/D₂ 之间正上方、三路抽头从左/下/右入（⊕ 十字 0.77r）；输出从 ⊕ 顶部上折再右出；`G`/`G₂` 两个虚线框左上角标名、穿框实线留缺口 |

### 5.7 每年入库后的巡检（3 步）

```bash
node tools/emit_figures.mjs <年>
node tools/check_figure_overlap.js <年>      # 0 交叠 + 18/18/18/18
/home/xiuming/.workbuddy/binaries/python/envs/default/bin/python \
  tools/preview_figures.py <年> <往年> --cols 3 --cell 520x400
# 网格图里并排比"同类图是否一个模子"，可疑的用 --only 单张放大
```

发现"同类图长得不一样"→ 改图，不改规范。

**只动了工具、没打算改图时**，多跑一步回归：`node tools/emit_figures.mjs <年>` 之后
`git status --short data/figures` 必须是**空**——非空说明你的改动改变了既有图件的收边，
先 `git diff` 看清是哪张、再把行为改回去，别顺手把 16 张图的 viewBox 一起换掉。

## 6. 多会话并行

本项目常有并行会话改同一批文件（如两年份同时入库）。改 `app/index.html`、`tools/validate_data.js`、`app/src/lib/data.js` 这类公共文件前**先重读**，冲突时以 `HANDOVER.md` 的格式约定为准对齐，不要直接覆盖。
