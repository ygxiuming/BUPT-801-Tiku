---
name: bupt801
description: "北邮801通信原理真题库入库技能。把待解析/里的新年份试卷 PDF + 答案图片，加工成结构化题库（题干/选项/答案/逐项解析/分步推导）+ SVG 重绘图库（个别题图可换成原卷截图，前端自动识别）+ 可打印试卷页，并跑通校验与页面实测。当用户说『解析20XX年801真题』『把新试卷入库』『加一年真题』『801真题解析』『重画这道题的图』『这张图换成原卷截图』『检查/统一图件格式规范』『选择题要题号/大题小问要分行/图片显示太大』『题库校验/修复』『把格式整改写进规范』时使用。"
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
| 重画 2025 第九题的图 | 改 `tools/gen_figures_2025.py` 的那个函数 → `emit --run-gen` → 预览核验（**矢量为准**） |
| 这题的图换一张 / 用原卷截图 | 从 300dpi 页图裁一张 → `data/images/<年>/<年>-<题号>-<key>.png` → `emit`（第 5.0 节，逐张可选） |

**默认必须做的事**（用户不说也要做）：①每道题独立解题、答案自己反复验证；②每道题都有解析；③**图件一律 SVG 重绘**，逐张按第 5.1~5.11 节规范统一（四边留白 18px、正文显示宽 320~680px）；④框图/线段自查遮挡（0 交叠）；⑤**卷面排版三条硬规则**（选择题行首题号 / 大题小问一条一行 / 图件按固有尺寸显示，见第 5.11 节）；⑥`node tools/validate_data.js` 零错误零警告 + `node tools/check_format.mjs` 零问题 + `audit_layout.mjs` 逐年 ✓；⑦页面冒烟通过 + `check_assets.mjs` 全绿（它会抓"图库引用的图片没进快照"）；⑧**追加 `解析日志.md`**；⑨**git 提交**。

> 唯一例外且**必须用户点名**：某一张图换成原卷截图（照片型题图——眼图、星座仪屏摄、实测谱，重绘必然失真）。那是逐张的可选项：图丢进 `data/images/<年>/<年>-<题号>-<key>.png` → `emit` 即生效，删掉即退回 SVG（第 5.0 节）。

> **矢量 `.svg` 是默认维护对象**：新图画成 svg、老图也在 svg 里；截图只是逐张的覆盖层，
> 删掉那张 png 就自动回落 svg（第 5.0 节）。所以「只补几张截图」不会让别的图消失。

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
data/figures/<年>/          **图库默认来源**：`<年>-<题号>-<key>.svg` 矢量真身 + `_index.js`（自动生成，勿手改）
data/figures/<年>/answer/   解析配图的 .svg，同命名
data/images/<年>/           **可选**：把某张图换成原卷截图时放这里（同名 key 优先于 svg，要提交）
data/images/<年>/answer/    解析配图同上；`_meta.json` 可给纯截图 key 补 q/kind/desc 与显示序
data/questions/<年>/        paper.js（真题）+ answer.js（答案与解析）
tools/emit_figures.mjs      重建 _index.js（默认只重建；`--run-gen` 才跑生成器覆盖 .svg）
tools/crop_orig.py          裁图：从 300dpi 页图裁出图区（换截图 / 对照原卷时用）
tools/preview_figures.py    预览：整年图件拼成带图名的网格（省上下文）
tools/compare_figures.py    **对照闭环**：左原卷裁图 / 右重绘，一张总表（第 ⑤ 步 5）
tools/validate_data.js      数据+KaTeX+数值 校验
tools/check_format.mjs      **版式数据体检**：题号/空号/小问编号/选项齐全/图件尺寸（不渲染页面）
tools/audit_layout.mjs      **版式实测**：jsdom 渲染试卷页后核对题号、选项空号、小问分级、图件显示尺寸
tools/inspect_paper.mjs     人工排查用：把某年试卷页的「节 → 组/题 → 小问/选项」逐层打印出来
tools/smoke_pages.mjs       页面冒烟（jsdom + dist，无需浏览器/网络）
tools/check_assets.mjs      **快照资源自检**：资源在不在、悬空 key、引用的图片有没有进快照
tools/audit_site.mjs        全站审计（逐年 ×3 页 + 首页/统计/图库/复习/编辑器 + 21 条流程 + a11y）
tools/svgkit.py             **统一收边** tighten(PAD=18)：2025 起每张新图都用（第 5.1 节）
tools/gen_figures_<年>.py    **SVG 生成器（默认画法）**：stdout 输出 `###FILE:` 分隔的多文件
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
/home/xiuming/.workbuddy/binaries/python/envs/default/bin/python -c "import cairosvg,PIL;print('py ok')"
```

- 没有 cairosvg → `/home/xiuming/.workbuddy/binaries/python/envs/default/bin/pip install cairosvg`（后台跑，前台易超时被 SIGTERM）。
- **本机 Chrome 无头模式必崩（EXIT=133）**，别浪费时间在 puppeteer 截图上。

### ② 试卷转图 + 转录

```bash
mkdir -p /tmp/w801/<年>
pdftoppm -r 300 -png "待解析/<年>xxx.pdf" /tmp/w801/<年>/p   # 300dpi 够认小字和下标
```

- 试卷是**双栏**：先看整页，再用 PIL 按中缝竖切，左右半页分别 Read。不要图省事对半 50% 切——栏宽不对称会把右栏切掉一截。
- 逐页 Read（图像输入）→ 转成结构化文本；公式先记成 `$...$` 草稿。
- **页图别删**：第 ⑤ 步裁图还要用同一批 300dpi 页图（`/tmp/w801/<年>/p-*.png`），裁不够清晰时用 `-r 400` 重转。
- 填空题式选择题：多个空共用一组 ABCD → `groups` 建模；**组干必须含本组全部空号的 `（n）` 全角标记**，前端靠它匹配。
- 空号统一 **全角 `（1）`**，公式里的 `g^{(1)}`、`(1011)` 不动。
- **一题多空（如 2024：20 题 × 2 空 = 40 空）**：`num` 写题号（1..20，同一题的两个空**重复**），`blank` 写空号（1..40），`id` 顺排 `2024-1..40`，两个空的 `oKey` 指同一个 `options`（共用 4 个选项）。校验器已支持这种卷面（题号去重后查连续 + `blank` 查连续），若新卷子是别种组合（3 空共享、部分题独占）先确认 `blank` 能连续排满。

### ③ 定答案（最关键，别抄）

1. 先看参考答案（手写潦草就逐题放大裁剪）。
2. **自己独立推导一遍**，不看参考答案。
3. 两边对不上 → 以严格推导为准，并在 `exp.note`（选择）/ `sol.pitfalls`（大题）里写明：参考答案怎么写的、错在哪、本文档取什么。
4. 大题每个子问都要有数值或表达式结果，能数值验算的一律验算（见第 ⑦ 步数值抽查）。

- **题号（`num`）与空号（`blank`）是两套编号**：`blank` 全卷连排（1..N），`num` 是原卷的题号。
  2017/2019/2021/2022/2024 记的是真题号（一题多空时重复）；2018/2020/2023/2025/2026 早期入库时
  把 `num` 直接写成了空号（历史欠账，页面靠「组序号」兜住，暂不改数据）。新入库时按原卷数题号：
  `pdftoppm` 出页图数「1. 2. 3.」而不是数（1）（2）（3）。

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
- 解析正文里**单独一行 `[[fig:key]]`** = 「图插在这里」，试卷页与解析正文都在原位渲染。

### ⑤ 画图（一张都不能省）

0. **先裁原卷留档，再动笔**：从第 ② 步转出的整页 PNG 里把本题图区域裁下来存
   `待解析/crops/<年>/<key>.png`，并 Read 一遍；对照时用 `--grid` 读相对位置（框宽比、标注离线比例）。
   **当前会话读不了图片就停手告诉用户，禁止凭文字描述盲画**——2015 年重绘因盲画出过拓扑错误，
   解析日志里"未经肉眼核对"的教训就是这条红线的出处。
1. 写 `tools/gen_figures_<年>.py`：从 `gen_figures_2026.py` 复制脚手架（`HEAD/marker/line/poly/text/dot/circle/rect/mul/adder` 画笔齐备）。**先 `grep` 去年的同类图函数，照抄它的框高/标签间距/字号**，不要从零拍坐标——两年的同类图必须长一个样。
2. 在 `FIGS = [(key, 题号, 是否解析图, 描述)]` 登记；输出走 stdout，用 `###FILE:<路径>` 分隔。
3. 落盘：

```bash
node tools/emit_figures.mjs <年> --run-gen     # 生成 data/figures/<年>/*.svg + answer/*.svg + 重建 _index.js
```

4. 收边**只有一种写法**（2025/2026 已是这个范式，新图照抄）：

```python
from svgkit import PAD, tighten          # tools/svgkit.py
...
SVGS = { 'q2psd': fig_q2psd(), ... }
SVGS = {k: tighten(v, PAD) for k, v in SVGS.items()}   # 四边各留 18px
```

- 画布尺寸随便给（`HEAD.format(w=..., h=...)`），只要内容装得下；**不要手调 viewBox，也不要用 `head_at()`**（已弃用：它要求所有坐标 ≥ x0，一不留神就左侧溢出）。
- 文件名 `年份-题号-图名.svg` 只给人看，数据里永远用 `fig:"key"` 引用。
- 上下标用 `text()` 的迷你标记：`x_c`、`T_{b}`、`u^2` → tspan 真上下标。**绝不写 `T_b`、`G₁` 这种字面下划线/Unicode 下标。**
- 颜色、线宽、虚线、字号、间距、框高**一律按下表第 5 节《图件格式规范》**，那张表是唯一口径，别在图里另发明写法。
5. **对照闭环（差异清零才算画完）**：emit 后跑

```bash
/home/xiuming/.workbuddy/binaries/python/envs/default/bin/python tools/compare_figures.py <年>
```

   Read 总表（`待解析/crops/<年>/_cmp-<年>.png`，一整张大图：每个卡片左原卷/右重绘），逐图列
   **差异清单：拓扑、器件顺序、箭头方向、标注文字、相对位置/比例**——改生成器 → 重新 emit → 重比，
   直到清单清零。有意改动（修正原卷笔误、参考解析画错）写进 `sol.pitfalls` 与解析日志，注明理由。

6. **例外：个别题图可换成原卷截图**（需用户点名，见第 5.0 节）。照片型题图（眼图、星座仪屏摄、实测谱）重绘只能画成"示意图"，必然失真。
   - 图存成 `data/images/<年>/<年>-<题号>-<key>.png`（解析配图放 `data/images/<年>/answer/`；300dpi 页图上裁，`tools/crop_orig.py` 帮裁）；
   - 跑 `node tools/emit_figures.mjs <年>`（默认只重建注册表）：同名 key **PNG 优先于 SVG**，注册表自动变成 `{ src, w, h }`，前端自动加载图片；
   - `.svg` 真身**不用删也不用改**（同名映射靠它、`_meta` 缺失时它还是 meta 载体），想退回 SVG 就把 `data/images/` 里那张删掉再 emit。

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
node tools/check_figure_overlap.js <年>     # 判过标准：硬交叠 0 + 四边留白 18±2（四边差 ≤4px）
```

输出分两档，别混淆：
- **硬交叠**（`<line>` 压字、字压字）——门槛，必须 0；
- **复核 / 净距预警**（全量 path/折线/方框边/圆 vs 文字、净距 <6px）——逐条看：状态节点圆内标号、
  Σ 加法器、星座点标签贴参考圆是设计意图，放过；明显脏的（标签穿框边、字贴 ⊗）回生成器改。

**收边走 `svgkit.tighten()` 一步到位，别手调 viewBox**：

- 生成器末尾 `SVGS = {k: tighten(v, PAD) for k, v in SVGS.items()}`，PAD=18（见第 5 节）。
- 它按 line/rect/circle/polygon/path/text 的包围盒收边：**先剥 `<defs>`**（箭头 marker 的 `M0,0` 不算墨迹），path 逐个命令取点（含小写相对命令）；文字盒口径（上 0.8em / 下 0.2em，CJK 1.0em、大写数字 0.62em）与 `check_figure_overlap.js` 完全一致，收边与检测不会互相打架。
- 收完四边必然是同一个数（18）。若 `check` 报出 8/30 这种不均匀值，说明这张图没走 `tighten()`，回去补，别去手调 margin。
- 中文在预览里要能画出来：`preview_figures.py` 会自动把根 `font-family` 换成 `Noto Sans CJK SC`，手写渲染命令时才需要自己记得。

> 2023/2024 还在旧两步（`svg_fit.fit_svg()` 粗收 + `fit_figures_render.py` 按墨迹精收，留白 6~23）。**只有维护这两年时才用旧链路**，动到它们就顺手改成 `svgkit.tighten()`，别再新增旧写法。

> cairosvg 的已知假象：`text-anchor='middle'` 的 tspan 会按 chunk 各自居中，下标被拉开成空隙（显示成 `2cos(2πf c t)`）。**浏览器正常，不要为这个改图。** 只看线条/方框是否真的相交。

### ⑦ 登记 + 校验

```bash
# a) 重建注册表（svg + 可选截图 → _index.js）
node tools/emit_figures.mjs <年> --rebuild     # 打印「N figures；截图 M 张；其中 K 张走位图：key…；⚠ 文件名不合规范、未注册：…」

# b) 新年份才需要：app/index.html 加三行（图库注册表一行 + 题目两行）
#    <script src="/data/figures/<年>/_index.js"></script>
#    <script src="/data/questions/<年>/paper.js"></script>
#    <script src="/data/questions/<年>/answer.js"></script>
#    改完必须 node tools/build-frontend.mjs（冒烟读的是 dist/index.html）
#    注意：注册表**仍然放在 data/figures/<年>/_index.js**，即使这年一张 svg 都没有

# c) tools/validate_data.js 两处登记
#    require('../data/figures/<年>/_index.js');
#    require('../data/questions/<年>/paper.js'); require('../data/questions/<年>/answer.js');
#    EXPECT[<年>] = { choice: N, big: M, score: 150 }

# d) tools/check_figure_overlap.js 的 switch 加一个 case '<年>'（它按年份手写分支，不加就报"未知年份"）
# e) tools/check_format.mjs 的 ALL、tools/smoke_pages.mjs 的 ROUTES 也要加（手写年份表是最大漏检源）

node tools/validate_data.js    # 必须 0 错误 0 警告
```

校验器覆盖：题量/总分、编号连续、章节知识点存在、答案落在选项组内、组干含全部空号、`fig` 引用可解析、**每条 KaTeX 公式可渲染（含 `$$`）**、数值抽查。

**再加三道关**（数据层 + 渲染层 + 快照层各一遍，三条命令都返回 0 才算过）：

```bash
node tools/check_format.mjs                 # 全库：题号/空号/小问编号/选项齐全/图件尺寸
for y in 2016 2017 ... 2026; do node tools/audit_layout.mjs $y; done   # 逐年版式实测（可当门禁）
node tools/check_assets.mjs                 # 快照：资源在不在、**引用的截图有没有漏注册/漏下发**
```

`check_format.mjs` 查的是"数据有没有写错"；`audit_layout.mjs` 查的是"页面渲染出来对不对"（`.qnr` 有没有、
`.opt-cap` 有没有、`.sub-row` 是不是都以（n）开头、svg 有没有 width/height）。

**`check_assets.mjs` 现在是图件的第二道命门**，它专抓两种静默失败：
1. **图没进快照**（`app/public`、`app/dist` 缺 `data/images/…`）→ 页面结构全对、只有那张图整块空白；
2. **图没进注册表**（新画的 `.svg` / 新换的截图忘了跑 emit）→ 页面拿不到这个 key，图整块空白（若是截图覆盖，则还会停在老 svg 上）。
`smoke_pages` / `audit_site` 都直接读项目 `data/`，这两种它们一律绿灯抓不到。

**数值抽查的写法要求**：不要用"结果套结果"的恒等式（会自证）。用独立方法复核，例如 2026 第四题量化器就是在 `p(x)=(3-|x|)/9` 上做数值积分算 `E[X²]=3/2`、`E[XY]=29/18`、`E[Y²]=23/12`、噪声 `7/36`；第八题循环码直接程序化验算 `GHᵀ=0`、`dmin=3`、`s=(101)→ĉ=0001011`、8 个错误图样的重量分布。

### ⑧ 同步 public

```bash
cd ~/Desktop/北邮801-通信原理/app && npm run sync
```

`sync-data.mjs` 会重建注册表并把 `data/images/**` 一起下发（截图是真实请求路径 `/data/images/<年>/…png`，
不进快照就等于图空白）；历史 `.svg` 真身仍然不下发（只下发 `_index.js`）。

沙箱里 `sync-data.mjs` 可能 EPERM（`copyfile` 被拦），等价的兜底（**别忘 images**）：

```bash
cd ~/Desktop/北邮801-通信原理
for y in <年>; do
  mkdir -p "app/public/data/questions/$y" "app/public/data/figures/$y"
  mkdir -p "app/public/data/images/$y/answer"
  cp -f "data/questions/$y/paper.js" "data/questions/$y/answer.js" "app/public/data/questions/$y/"
  cp -f "data/figures/$y/_index.js" "app/public/data/figures/$y/_index.js"
  /bin/cp -f "data/images/$y/"*.png "app/public/data/images/$y/" 2>/dev/null
  /bin/cp -f "data/images/$y/answer/"*.png "app/public/data/images/$y/answer/" 2>/dev/null
done
cp -f data/chapters.js app/public/data/chapters.js
```

> 本机 `cp` 是交互别名（`cp -i`），脚本里一律 `/bin/cp -f`，否则会卡在「是否覆盖」上并拖成超时。
> 别再把图库拼成 `app/public/data/figures/<年>.js` 单文件：页面引用的是 `_index.js`，那个合并文件无人引用。

### ⑨ 实测

**首选**（不依赖浏览器、不受沙箱网络限制）：

```bash
node tools/build-frontend.mjs      # 没改 app/src 可跳过
node tools/smoke_pages.mjs         # 全绿才算过（当前 14 条路由 + 4 个交互）
```

它用 jsdom 打开 `app/dist/index.html`，先 `window.eval` 所有数据脚本（**顺序不能反**，数据脚本必须早于 bundle），再 `import('dist/assets/app.js?r=N')` 让应用自己 mount，逐页断言"文字量正常 + `.katex-error` 为 0 + `window.__vueErrors` 为空"，最后跑三段交互。

**新入库的年份记得在 `ROUTES` 里加三条**（`/paper/<年>`、`/practice?y=<年>`、`/exam?y=<年>`），并给「练习页选选项→查看解析」再补一条该年份的交互。

> **`openPage(route, tag)` 的 tag 不用手工区分**：它被拼进 `import('app.js?tag=...')` 当缓存参数，ESM 模块只执行一次，tag 重复会让第二次调用拿到缓存的 bundle、app 不挂载，页面空白。脚本现在会自动追加递增序号。

> 沙箱内 `curl 127.0.0.1:3000` 返回 502、`npm run sync` 报 `EPERM copyfile`，**别指望起 dev server 用 curl 验**。

有浏览器时再看真页面：

```bash
cd app && npm run dev   # http://localhost:5173
```

过这六个页面：`/`、`/paper/<年>`、`/practice?y=<年>`、`/exam?y=<年>`、`/stats`、`/figures`。
核对：无 `.katex-error`（**选项和解析都要看**）、图片不模糊不裁切、判题正常、三档自评正常、图点击放大正常。

### ⑩ 收尾：git 提交 + 写解析日志

**这两件事做完才算"弄完"**，缺一件都不算交付。

#### a) 解析日志（`解析日志.md`）

1. 在"总览"表尾加一行：年份 / 来源 / 选择 / 大题 / 总分 / 图 / 校验 / 完成日。
2. 追加一节 `## <年>`，五项必写：
   - **来源**：`待解析/` 里的原始 PDF（页数、dpi）、答案图片位置
   - **统计**：选择题空数、大题数（各子问分值）、总分、图张数（题图/解析图各几张，其中截图几张、仍是 svg 的几张）
   - **校验与实测**：`validate_data.js` 的错误/警告数、`smoke_pages.mjs` 的结论、`check_assets.mjs` 是否抓到漏注册
   - **与参考答案的分歧与纠错**：逐条写"参考答案怎么写 / 错在哪 / 本文取什么"。**自己算错返工的也要写**
   - **遗留**：没裁好的图、没跑通的、被沙箱挡住的、下次要先做的事
3. 旧内容只追加不改写；改题/换图也在对应年份下补一条带日期的短记录。

#### b) git

```bash
cd ~/Desktop/北邮801-通信原理
git rev-parse --git-dir 2>/dev/null || git init -b main   # 首次
git status --short
git add data/questions/<年> data/images/<年> data/figures/<年>/_index.js app/index.html tools/ 解析日志.md
git commit -m "feat(<年>): 入库 <年> 真题（50 空 + 8 大题 + 16 张图）"
```

- **提交信息**：`<type>(<scope>): <主题>` —— `feat` 入库新年份、`fix` 纠错/换图、`docs` 文档与日志、`chore` 工具链。
- **粒度**：一个年份一个提交；换图、改答案单独成提交，方便 `git revert` 单点回滚。
- **截图要进仓库**（png 是内容，不是产物）；`.svg` 是唯一维护对象，别顺手删、也别整批重生成。
- **改这年图件时**：只补截图 → `emit <年>`（不带参数）；改了生成器 → `emit <年> --run-gen`。两者搞反，要么图不更新，要么把 Inkscape 手改的 svg 冲掉（2021 出过事）。
- **别提交的东西**：`.gitignore` 已忽略 `node_modules/`、`app/dist/`、`app/public/`。若发现 `git status` 里有这仨，先修 `.gitignore` 再 add。
- 收尾前 `git status --short` 必须干净（或只剩明确的 `wip` 文件）。

---

## 3. 硬性验收清单

- [ ] 选择题 N 题 / 大题 M 题 / 总分 150（以原卷为准，同步 `sections` 分值）
- [ ] 每道选择题有 `concl + A~D 逐项 + note`；每道大题有 `intro + 分步 + 每问 ans + summary + pitfalls`
- [ ] 与参考答案不一致处，解析里写明差异和理由
- [ ] **图件以 SVG 重绘为准**（`data/figures/<年>/[answer/]<年>-<题号>-<key>.svg`）：`preview_figures.py` 网格逐张核过遮挡/留白，`compare_figures.py` 与原卷总表比对，拓扑/器件/标注差异清零
- [ ] 用户点名的少数几张可换原卷截图：放 `data/images/<年>/[answer/]` 同名 key，`_index.js` 里该 key 是 `{ src, w, h }`（删掉 png 再 emit 即退回 SVG）
- [ ] 有图的题 `fig:"key"` 与文件名 key 一致；`.svg` 四边留白 `18/18/18/18`、硬交叠 0（`check_figure_overlap.js`）
- [ ] 文字/数值与原卷不一致处已按 **PDF 为准** 改正（不是截个图去迁就文字）
- [ ] 选择题每题行首有题号（`1．`）、每张选项表标了空号（`（n）选项` / `共用选项`）
- [ ] 大题小问一条一行、行首（n）齐全、两级小问有 `sub-grp` 一级标题；stem 里没有编号小问
- [ ] 图件在正文里显示宽 320~680px（`audit_layout.mjs` 断言），点击放大后才看全尺寸
- [ ] `node tools/validate_data.js` → 0 错误 0 警告；`check_format.mjs` → 0 问题；`audit_layout.mjs <年>` → ✓；`check_assets.mjs` → ✓（截图都在快照里、都在注册表里）
- [ ] `app/index.html` / `validate_data.js` / `check_figure_overlap.js`(case) / `chapters.js` 登记齐全
- [ ] `public/data/` 与 `data/` 内容一致（**含 `images/<年>/**`**，否则页面图空白）
- [ ] 六个页面类型全部实测通过（`node tools/smoke_pages.mjs` 全绿）
- [ ] `解析日志.md` 已追加本年一节（含纠错与遗留）
- [ ] `git commit` 完成，`git status --short` 干净

## 4. 踩坑速查

| 现象 | 原因 / 解法 |
|---|---|
| **截图放进 data/images 了，页面还是老图** | 没重建注册表：`node tools/emit_figures.mjs <年> --rebuild`；server 在跑时丢图会自动重建，但 emit 手跑最稳 |
| **页面结构全对、就是图空白（快照漏 png）** | `app/public`、`app/dist` 里没有 `data/images/<年>/…`。`smoke_pages`/`audit_site` 抓不到，只有 `node tools/check_assets.mjs` 会报「快照里不存在」/「没注册」 |
| **文件名是「截图 2026-10-29 19-32-25.png」** | 截图工具默认名。emit 直接拒收（打印「文件名不合规范、未注册」）。改成 `<年>-<题号>-<key>.png`，key 只能用 ASCII 字母数字下划线 |
| 裁图把上一行正文/题号带进来了 | 框上沿太低；先 Read 页图估坐标，再 Read 裁片核对，偏了就调坐标重裁 |
| 裁图切掉了图注/坐标轴标签 | 框太紧；图注与轴标签必须包里（18px 留白由外壳补，别自己缩框也别自己加白边） |
| 截图小字糊 | 页图分辨率不够：`pdftoppm -r 400` 重转，或裁完 `Image.resize` 放大到宽 1400（放大不会变清楚，优先重转） |
| 一张图白、一张图灰 | 两张裁自不同来源（PDF 页 vs 答案照片）。统一从 PDF 页裁 |
| 图在正文里大得离谱 | 不是截图的问题：`inlineFigure()` 按 viewBox 夹到 320~680，若撑满栏宽说明这张图走了老 svg 且没有 width/height（`audit_layout.mjs` 会报） |
| 图里文字是矢量时代画的、和原卷不一样 | 这年还是老 svg。裁一张同名截图放进去就自动覆盖（第 5.0 节），**不用删 svg** |
| **改了 `gen_figures_<年>.py`，图一点没变** | `emit` 默认**只重建注册表**。要真正重画必须 `node tools/emit_figures.mjs <年> --run-gen`。反过来：只想补截图时**别**加 `--run-gen`，否则会把 Inkscape 手改过的 svg 覆盖掉（2021 出过事） |
| 新画的 svg 在页面上不出现 | 忘了跑 `emit`，注册表里没有这个 key → 图整块空白；`check_assets.mjs` 会报 |
| 整年图库 `_index.js` 涨到几百 kB | 用了 base64 内联老方案；截图一律走 `src: '/data/images/…'` 外链 |
| `check_figure_overlap` 报「无法解析出任何图元」 | 位图描述符的 w/h 丢了（注册表里成了 `{}`）；重跑 emit |
| `check_figure_overlap.js` 报"未知年份" | 它的 `switch (year)` 是手写分支，新年份必须加 `case '<年>'` |
| 公式报 `katex-error` | JS 字符串反斜杠没双写，或被 `\t`/`\e` 转义吞掉（`\\alpha` 不是 `\alpha`） |
| 题干空号高亮错位 | 用了半角 `(1)`，必须全角 `（1）` |
| 选项只显示第一套 | 组上没写 `optionSets`，或题上没写 `oKey` |
| 位图小字在放大镜里也糊 | 见上：`-r 400` 重转页图；≤250 kB 压不下时可降到 1200px 宽 |
| Bash 写 `.js` 被拦（EPERM） | Mimosa 安全 Hook；改用 Write 工具或项目内 node 脚本 |
| `require(app/...)` 报 ESM 错 | `app/` 是 `type:module`，KaTeX 一律从 `server/node_modules` require |
| Chrome 截图 EXIT=133 | 本机无 Chrome，页面对齐只能用 jsdom（`audit_layout` / `smoke_pages`） |
| 校验器 "数值抽查失败" | 先怀疑抽查公式本身错了，再用独立数值积分复核 |
| 数值抽查：带通采样"混叠"判据 | 不能用 fold 折叠镜像判等；要判谱副本（周期 fs 平移）两两不交，逐区间对 `a<d && c<b` |
| 数值抽查：哈夫曼平均码长 | L = 各次合并时子树概率之和；别给叶子预置深度再乘权 |
| `curl 127.0.0.1:3000` 返回 502 | 沙箱禁本地网络；改用 `node tools/smoke_pages.mjs` |
| `npm run sync` 报 `EPERM copyfile` | 同上，沙箱拦文件复制；走第 ⑧ 步的 `/bin/cp -f` 兜底 |
| `cp` 卡住/命令被转后台 | 本机 `cp` 是交互别名（`cp -i`）；一律 `/bin/cp -f` |
| 校验器报"空号不连续"但看不出来 | 一题多空时 `num` 必然重复（2024）。校验按去重题号查；若仍报，先看 `blank` 是否 1..N 连续 |
| `Math.erfc is not a function` | 本机 Node 没有 erfc。数值抽查改核 `d/σ` 比值或 `d/(σ√2)` 是否等于题设整数 |
| Vue 模板里 `xxx()` 报 `is not a function` | 模板里的裸标识符只解析到**组件实例**：`import { fn }` 之后还要在 `methods` 里挂一份（见 `BigSol.vue: normSubNo`） |
| 冒烟报"找不到 td[data-k]"、页面空白 | `openPage(route, tag)` 的 tag 命中 ESM 缓存、app 没重新挂载（脚本已自动加序号） |
| 改了公共画笔/工具，怕波及其它图 | 重跑 `emit --sync-all` 后看 `git status --short data/figures`：应当只剩 `_index.js` 头部注释；有 svg 改动就 `git diff` 看清是哪张 |

## 5. 图件规范（唯一口径）

> 主线是**矢量重绘**：5.1~5.11 是硬规范，新图照抄；判断标准一句话——**两年的同类型图摆一起，看不出是分两次做的**。
> 5.0 是**逐张可选的位图替换**：照片型题图（眼图、星座仪屏摄、实测谱）允许直接放原卷截图，前端自动认、图库混排不用改渲染。

### 5.0 位图替换（可选通道：把某一张图换成原卷截图）

**触发**：用户点名"这张图用原卷截图"，或原图本身就是照片/仪器屏摄（重绘只能画成"示意图"，必然失真）。
**做法**（只有两步，别改 `.svg`、别手改注册表）：

```bash
PY=/home/xiuming/.workbuddy/binaries/python/envs/default/bin/python
$PY tools/crop_orig.py /tmp/w801/<年>/p-3.png 210,640,1180,900 \
    --out data/images/<年>/<年>-<三>-q3recv.png     # 300dpi 页图上裁；解析配图放 data/images/<年>/answer/
node tools/emit_figures.mjs <年>                    # 默认只重建注册表 → 该 key 变成 { src, w, h }
```

- **优先级：`data/images/<年>/` > `figures/<年>/assets/` > `figures/<年>/*.svg`**，同一 key 取最高优先级那个
  —— 也就是「这张换成图片了就用图片」。判定在 `tools/fig_registry.js: rebuildIndex()`，前端
  `app/src/lib/render.js: figToSvg()` 把描述符包成"只有一张 `<image>` 的 svg 外壳"。
- 命名必须 `<年>-<题号>-<key>.png`（key = 数据里 `fig:"key"` 那段）。**截图工具默认名
  （如 `截图 2026-10-29 19-32-25.png`）不会注册**，emit 会打印"文件名不合规范"清单。
- **退回 SVG**：删掉 `data/images/` 里那张再 emit，一秒钟复原——`.svg` 真身从没被改过。
- 裁图规格：源 300dpi 页图（字小用 400）→ 宽 900~1600px、PNG（不用 JPEG）、单张 ≤250 kB；
  含图注 / 轴标签 / 子图编号 (a)(b)，**不含**题干正文与题号「三、」；不重画、不美化。
- 只有截图、没有 `.svg` 的 key：在 `data/images/<年>/_meta.json` 里写 `{ "<key>": { q, kind, desc } }`。
- **用户给的「年份-大题号-小题号-第几张图」这种文件名，末段不是 key**：`keyFromImageName()` 只剥「年份-题号-」前缀，
  `2021-三-3-1.png` 会注册成 key `3-1` —— 图进得去图库，但没题目引用，卷面上还是老 svg（静默失败）。
  **先按内容对回语义 key 再改名**：`2021-三-3-1.png` → `2021-三-q3ht.png`、`2021-三-3-2.png` → `2021-三-q3eye1.png`。
  自查口径：`check_assets.mjs` 该年「N引/M图」必须相等，且不出现「孤儿图」。
- **一题多图**（同一小问要出两张）：把它们都写成 body 里的 `[[fig:key]]`，`st.fig` 只保留其中一个。
  `BigSol.vue`/`PaperView` 的 `hasFig(st)` 一旦为真就不再在段末补 `st.fig`，所以**别只在 `fig` 字段上想办法**，
  否则要么少一张、要么出一对重复。图序 = `[[fig:]]` 在 body 里的先后。
- **`_meta.json` 要么不写，要么把该年全部 key 按题号序写全**：`rebuildIndex()` 的排序 hint 优先级是
  `orderHint > _meta.json 键序 > 旧 _index.js`，只写一个 key 会把其余全排到末尾（2021 的 `q3ht` 因此跑到图库第一位）。
- 提交：png 一起 commit，并 `npm run sync`（`sync-data.mjs` 会下发 `data/images/`；`check_assets.mjs` 抓"引用了但快照里没有"）。

**前端兼容层（混合排布，页面不区分）**：注册表 `_index.js` 两种值都合法——`'<svg …>'` 与 `{ src, w, h }`；
`figToSvg()` 统一成外壳后，正文/试卷页/图库页/灯箱/`audit_layout`/`check_format`/`check_figure_overlap` 全都只认外壳。
**不要再往注册表里塞 base64**（老 `embed_figure_images.mjs` 已停用：体积大 3 倍）。

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

### 5.6 题图/解答图必须对着原卷逐张核（2018 踩过的坑）

把 `pdftoppm -r 300` 的题图页和参考答案页裁出来，**一张一张比**，肉眼过一遍下面这份清单。2018 一轮返工里六张图全栽在这几条：

- **框图不能少器件**：相加器 ⊕ / 乘法器 ⊗ 一个都不能省。2018 二（SSB 解调）把噪声单独带通后再并到 s(t) 上，漏了 ⊕，与题面 `r(t)=s(t)+n_w(t)` 直接矛盾；A 点该标在带通输出而不是合并点。
- **每路是否各有独立模块**：2018 五（PCM-TDM-16QAM）原卷是 4 路各一个 PCM 框，画成 2 个 PCM 各带两路就错；框内名称照抄原卷（写「TDM」不写「复接」），末级「信道」框别丢。
- **判决域的边界由"缺哪个点"决定**：2018 四(3) 8 点星座没有 (0,−1)，s1 与 s6/s3 的边界是两条 45° 线、交于 (0,−1)，判决域是**下面收尖的盾形**，不是正方形。凡是"某个点不存在"，就要重算 Voronoi 边。
- **树图的码字必须和解析正文一致**：同一棵树换 0/1 约定码字全变。2018 六(2) 解析写 Ac→00、其余 010/011/100/101/110、Ca/Db→1110/1111，图就必须这么排；图注里的平均码长要自己数一遍 Σp·len（1/4×2+5×1/8×3+2×1/16×4=23/8）再写，别抄。
- **编码器的抽头线别挤在 8px 里**：抽头分上/下两条母线、生成多项式写在加法器**外侧**、输出标签右置；D 盒之间的主路要分段画（`box1` 的 rect 是 `fill='none'`，长线穿盒而过很难看）。

两条工具坑：

- 改生成器里的函数时，用 `src.index('def fig_x():')` 找起点后，终点**必须从起点之后再找**（`src.index(end_marker, a + 1)`）。终点落在起点之前时，`s[:a] + new + s[b:]` 会把整段函数复制一遍，后定义的旧版覆盖新版，症状是"改了没生效、渲染还是老图"。
- `check_figure_overlap.js` 报的「线交叠」是**线段穿过文字包围盒**，不是线线相交。树图用斜线连接时 0/1 标签必被穿，要么改正交折线（标签放竖直段一侧 9px），要么认这条告警。

### 5.7 图里不要出现"靠字形才成立"的符号

- **根号**：`√`（U+221A）的横线是字形的一部分，缩到 12px 基本看不见，换字体/换渲染器更短——用户会连续反馈"根号上面的横线不见了"。用 `_sqrt_label()`（`gen_figures_2018.py`）画矢量根号：折线出尖脚与长斜，再用直线把横线拉到被开方数字末尾，横线长度随数字宽度算。
- 同类问题：`·`（中点）、`′`（撇）、`→`（箭头）在 SVG `<text>` 里都不稳，标注优先用图形（`line`/`poly`）或纯 ASCII。
- `<tspan dy>` 做的上下标在 cairosvg 预览里会错位（浏览器正常），只含一两处上下标的标注直接写 `D³`、`g1(D)`、`fc`。

### 5.8 同类图对照表（写新图前先打开对应函数）

| 图型 | 参照实现 | 要抄的参数 |
|---|---|---|
| 系统框图 / 接收机 | `gen_figures_2026.py: fig_q3recv`、`fig_q6block` | 框高 48、`mul/adder` r=13~14、支路起止留 24~30 |
| 单边/双边幅度谱 | `fig_q2psd`（2026 / 2025） | 谱线 1.8、脉冲三角 4px、f=0 细线 `#999/1.1` |
| 星座 + 判决域 | `fig_q5const`（2026）、`fig_psk8/psk8new`（2025） | 点距 U、边界 `#888/5,4`、点标签偏移 `(dx,dy,anchor)` |
| 量化特性 / PDF | `fig_q7quant`、`fig_ookpdf`（2025） | 电平标签统一"电平线上方 4px"、门限红色一处 |
| 编码器 / 延迟线 | `fig_encoder`（2025） | ⊕ 悬在 D₁/D₂ 之间正上方、三路抽头从左/下/右入（⊕ 十字 0.77r）；输出从 ⊕ 顶部上折再右出；`G`/`G₂` 两个虚线框左上角标名、穿框实线留缺口 |

### 5.9 每年入库后的巡检（3 步）

```bash
node tools/emit_figures.mjs <年>
node tools/check_figure_overlap.js <年>      # 硬交叠 0 + 18/18/18/18
/home/xiuming/.workbuddy/binaries/python/envs/default/bin/python \
  tools/preview_figures.py <年> <往年> --cols 3 --cell 520x400
# 网格图里并排比"同类图是否一个模子"，可疑的用 --only 单张放大
/home/xiuming/.workbuddy/binaries/python/envs/default/bin/python tools/compare_figures.py <年>
# 有裁图的年份跑：总表里逐图核对与原卷的拓扑/标注/布局（没裁图的先补裁）
```

发现"同类图长得不一样"→ 改图，不改规范。发现"与原卷不符"→ 改图并补一条解析日志。

**只动了工具、没打算改图时**，多跑一步回归：`node tools/emit_figures.mjs <年>` 之后
`git status --short data/figures` 必须是**空**——非空说明你的改动改变了既有图件的收边，
先 `git diff` 看清是哪张、再把行为改回去，别顺手把 16 张图的 viewBox 一起换掉。

### 5.10 正文显示尺寸（320~680px）

- 大图（>680px 固有宽）缩到 680，点击放大看细节；小图（<320px）抬到 320 免得看不清；中间 1:1。
  实现只有一处：`lib/render.js: inlineFigure()`（`FIG_INLINE`）。**别在数据里写 `style="max-width:…"`。**
- 调这个区间要跑 `node tools/audit_layout.mjs <年>`：它打「显示宽 min~max」并断言 ≤690。
- 截图外壳的 viewBox = 「图宽+36 × 图高+36」（四边 18 留白），所以 `check_figure_overlap` 的四边留白永远是 18。

### 5.11 卷面排版：题号 / 小问 / 图件显示尺寸（三条硬规则）

> 这一节的毛病都出在**渲染层**，不要去改 130 张历史图、也不要去改 11 年的题目数据。

#### ① 选择题：每道题都要在行首有自己的题号

- 卷面上写 `1．`（悬挂缩进，折行后与正文左缘对齐）。**题号 = 该组在选择题里的序号**，不是
  `blank`、也不是区间 `1–4`：原卷就是「一题一段」（2026 第 1 题带（1）~（4）四个空，题号只写一次，
  实测原卷 17 题覆盖 40 空）。为什么不用 `q.num`：**2018/2020/2023/2025/2026 的 `num` 记的是空号**
  （题=空），而 2017/2019/2021/2022/2024 的 `num` 才是真题号 —— 两种口径下「组序号」都等于原卷题号。
- 一组覆盖多个空（或题号≠空号）时，题号后面补 `空 a–b` 小标，读者才知道这段题干管几个空。
- 每张选项表前必须有空号标注：`（5）选项`；一套选项服务多个空时写 `（1）（2）（3）共用选项`。
- 实现只在 `PaperView.vue` 的 `bodyHtml` 里（`.qline.qn` + `.qnr` + `.qblk`）。

#### ② 大题：一个小问一行，两级要缩进

- `subs` 数组一行一条，**不许把（1）（2）（3）写进 stem 排成一段**（历史 bug，2016 修过一次）。
- 行首编号渲染时统一成全角 `（1）`（数据里写半角 `(1)` 也认，`normSubNo()` 收口）。
- 版式：`padding-left + 负 text-indent` 的悬挂缩进，编号加粗，行间 9px。
- **两级小问**（2019 第八题：`1、` 带自己的 `（1）（2）（3）`）：`1、` 那行是 `sub-grp`（不缩进、加粗），
  它下面的 `（n）` 行自动带 `lv2` 多缩一级。判定在 `lib/data.js: subRow()/subsRows()/subsHtml()`。

#### ③ 图件：正文里按固有尺寸显示，不许撑满整栏

- 根因：只有 `viewBox`、没有 `width/height` 的 svg 会被 `max-width:100%` 当成 `width:100%`，小图被放大 3.5 倍。
- 修法（唯一）：`lib/render.js` 的 `inlineFigure()` 按 viewBox 算固有尺寸，夹到 **320~680px** 再写死 `width/height`。
  截图走同一函数（外壳的 viewBox 就是像素尺寸），所以截图在正文里也是 320~680。
- 图库缩略图（`fitSvg(560,176)`）与放大弹窗（按视口算）是另一套，别混。

## 6. 多会话并行

本项目常有并行会话改同一批文件（如两年份同时入库）。改 `app/index.html`、`tools/validate_data.js`、
`app/src/lib/data.js`、`tools/fig_registry.js` 这类公共文件前**先重读**，冲突时以 `HANDOVER.md` 的格式约定为准对齐，
不要直接覆盖。
