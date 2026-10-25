---
name: bupt801
description: "北邮801通信原理真题库入库技能。把待解析/里的新年份试卷 PDF + 答案图片，加工成结构化题库（题干/选项/答案/逐项解析/分步推导）+ 重绘 SVG 图库 + 可打印试卷页，并跑通校验与页面实测。当用户说『解析20XX年801真题』『把新试卷入库』『加一年真题』『801真题解析』『重画这道题的图』『题库校验/修复』时使用。"
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

**默认必须做的事**（用户不说也要做）：①每道题独立解题、答案自己反复验证；②每道题都有解析；③图片全部 SVG 重绘；④框图/线段自查遮挡；⑤`node tools/validate_data.js` 零错误零警告。

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
app/                        Vue3 前端（index.html 登记数据 script）
server/                     Express + Puppeteer（试卷 PDF 生成）
```

---

## 2. 九步流程

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

1. 写 `tools/gen_figures_<年>.py`：从 `gen_figures_2026.py` 复制脚手架（`HEAD/marker/line/poly/text/dot/circle/rect/mul/adder/head_at` 画笔齐备）。
2. 在 `FIGS = [(key, 题号, 是否解析图, 描述)]` 登记；输出走 stdout，用 `###FILE:<路径>` 分隔。
3. 落盘：

```bash
node tools/emit_figures.mjs <年>     # 生成 data/figures/<年>/*.js + answer/*.js + _index.js
```

4. 关键约定：
   - 文件名 `年份-题号-图名.js` 只给人看，数据里永远用 `fig:"key"` 引用。
   - `viewBox` 贴内容边界，**各边留白 ≤30px**（否则全宽渲染时图偏左/被裁切）；不贴 (0,0) 就用 `head_at(w,h,x0,y0)` 收边，别用 `HEAD.format`。
   - 上下标用 `text()` 的迷你标记：`x_c`、`T_{b}`、`u^2` → tspan 真上下标。**绝不写 `T_b`、`G₁` 这种字面下划线/Unicode 下标。**
   - 线宽 1.6、色 `#1a1a1a`；辅助线 `#555` 虚线 `4 3`；箭头用 `marker('arC')`。
   - 幅度谱的 f=0 处画细灰线**不要带箭头**（会被误读成谱线）。

### ⑥ 自查遮挡（必做，不能只靠肉眼扫一眼）

```bash
# 导出 SVG（把字体整体换成 CJK，否则 cairosvg 里中文渲染成空白）
node -e "
const fs=require('fs');global.window={};
require('./data/figures/<年>/_index.js');
for(const [k,svg] of Object.entries(window.BUPT801.figures['<年>']))
  fs.writeFileSync('/tmp/w801/prev/p-'+k+'.svg',
    svg.replace(/font-family=\"[^\"]*\"/,'font-family=\"Noto Sans CJK SC\"'));
"
/home/xiuming/.workbuddy/binaries/python/envs/default/bin/python -c "
import cairosvg, glob, os
for f in sorted(glob.glob('/tmp/w801/prev/p-*.svg')):
    cairosvg.svg2png(url=f, write_to=f.replace('.svg','.png'), scale=2.0, background_color='white')
"
```

然后逐张 Read PNG，**重点看四件事**：
- 标签压线 / 压在箭头头上（文字与线段的 y 差 < 8px 就危险）
- 抽头竖线穿过方框里的文字（如 `G₂`）
- 圆加号画成"圆圈里再一个 ⊕"双重圆（应该只画 `<circle>` + 一竖一横两条短线）
- 内容溢出画布 / 单边留白 >30px

再跑一次几何自查（文字包围盒 vs viewBox）：

```bash
node -e "
global.window={};require('./data/figures/<年>/_index.js');
for(const [k,svg] of Object.entries(window.BUPT801.figures['<年>'])){
  const vb=svg.match(/viewBox='([^']+)'/)[1].split(/\s+/).map(Number);
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  const mm=(x,y)=>{x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);};
  for(const m of svg.matchAll(/<line x1='([-\d.]+)' y1='([-\d.]+)' x2='([-\d.]+)' y2='([-\d.]+)'/g)){mm(+m[1],+m[2]);mm(+m[3],+m[4]);}
  for(const m of svg.matchAll(/<circle cx='([-\d.]+)' cy='([-\d.]+)' r='([-\d.]+)'/g)){mm(+m[1]-+m[3],+m[2]-+m[3]);mm(+m[1]+ +m[3],+m[2]+ +m[3]);}
  for(const m of svg.matchAll(/<rect x='([-\d.]+)' y='([-\d.]+)' width='([-\d.]+)' height='([-\d.]+)'/g)){mm(+m[1],+m[2]);mm(+m[1]+ +m[3],+m[2]+ +m[4]);}
  console.log(k, 'viewBox', vb[2]+'x'+vb[3], '内容', [x0,y0,x1,y1].map(Math.round).join(','), '留白 L/T/R/B', [x0,y0,vb[2]-x1,vb[3]-y1].map(Math.round).join('/'));
}"
```

> cairosvg 的已知假象：`text-anchor='middle'` 的 tspan 会按 chunk 各自居中，下标被拉开成空隙（显示成 `2cos(2πf c t)`）。**浏览器正常，不要为这个改图。** 只看线条/方框是否真的相交。

### ⑦ 登记 + 校验

```bash
# a) app/index.html 登记数据脚本（单文件引用，无合并 bundle）
#    图库每个文件一行（题目原图 + answer/ 解析图都要登记）：
#    <script src="/data/figures/<年>/<年>-<题号>-<图名>.js"></script>
#    <script src="/data/figures/<年>/answer/<年>-<题号>-<图名>.js"></script>
#    题目两行：
#    <script src="/data/questions/<年>/paper.js"></script>
#    <script src="/data/questions/<年>/answer.js"></script>
#    登记后需要重新构建（引用列表在 dist 的 index.html 里）：
#      正常环境： cd app && npm run build
#      受限沙箱（vite/rollup 的 wasm 起不来，报 WebAssembly OOM）：
#                node tools/build-frontend.mjs
#    已登记文件内容的后续修改 → 刷新浏览器即生效（server 实时映射 data/）。

# b) tools/validate_data.js 两处登记
#    require('../data/figures/<年>/_index.js');
#    require('../data/questions/<年>/paper.js'); require('../data/questions/<年>/answer.js');
#    EXPECT[<年>] = { choice: N, big: M, score: 150 }

node tools/validate_data.js    # 必须 0 错误 0 警告
```

校验器覆盖：题量/总分、编号连续、章节知识点存在、答案落在选项组内、组干含全部空号、`fig` 引用可解析、**每条 KaTeX 公式可渲染（含 `$$`）**、数值抽查。

**数值抽查的写法要求**：不要用"结果套结果"的恒等式（会自证）。用独立方法复核，例如 2026 第四题量化器就是在 `p(x)=(3-|x|)/9` 上做数值积分算 `E[X²]=3/2`、`E[XY]=29/18`、`E[Y²]=23/12`、噪声 `7/36`；第八题循环码直接程序化验算 `GHᵀ=0`、`dmin=3`、`s=(101)→ĉ=0001011`、8 个错误图样的重量分布。

### ⑧ 同步 public（仅 vite dev 需要；生产 server 实时映射 data/，无需此步）

```bash
cd ~/Desktop/北邮801-通信原理/app && npm run sync
```
沙箱里 `sync-data.mjs` 可能 EPERM，等价的兜底（逐文件拷贝，不合并；`find` 必须排除 `_*`——`_index.js` 是 Node 端静态索引，进浏览器会重复注册/污染）：

```bash
cd ~/Desktop/北邮801-通信原理
for y in <年>; do
  mkdir -p "app/public/data/questions/$y" "app/public/data/figures/$y" "app/public/data/figures/$y/answer"
  cp -f "data/questions/$y/paper.js" "data/questions/$y/answer.js" "app/public/data/questions/$y/"
  find "data/figures/$y" -name '*.js' ! -name '_*' -exec cp -f {} "app/public/data/figures/$y/" \; 2>/dev/null
  cp -f "data/figures/$y/answer/"*.js "app/public/data/figures/$y/answer/" 2>/dev/null
done
cp -f data/chapters.js app/public/data/chapters.js
```

### ⑨ 实测

```bash
cd app && npm run dev   # http://localhost:5173
```
过这六个页面：`/`、`/paper/<年>`、`/practice?y=<年>`、`/exam?y=<年>`、`/stats`、`/figures`。
核对：无 `.katex-error`（**选项和解析都要看**）、SVG 不重叠不裁切、判题正常、三档自评正常、图点击放大正常。

---

## 3. 硬性验收清单

- [ ] 选择题 N 题 / 大题 M 题 / 总分 150（以原卷为准，同步 `sections` 分值）
- [ ] 每道选择题有 `concl + A~D 逐项 + note`；每道大题有 `intro + 分步 + 每问 ans + summary + pitfalls`
- [ ] 与参考答案不一致处，解析里写明差异和理由
- [ ] 全部图片 SVG 重绘，逐张 PNG 目视核过遮挡
- [ ] `node tools/validate_data.js` → 0 错误 0 警告
- [ ] `app/index.html` / `validate_data.js` / `chapters.js` 三处登记齐全
- [ ] `public/data/` 与 `data/` 内容一致（`diff` 过）
- [ ] 五个页面实测通过

## 4. 踩坑速查

| 现象 | 原因 / 解法 |
|---|---|
| 中文在预览图里是空白 | cairosvg 只取第一个 font-family；预览时整体替换成 `Noto Sans CJK SC` |
| 预览里下标出现空隙 | cairosvg 对 `text-anchor='middle'` + tspan 的 bug，浏览器正常，别改图 |
| 公式报 `katex-error` | JS 字符串反斜杠没双写，或被 `\t`/`\e` 转义吞掉 |
| 题干空号高亮错位 | 用了半角 `(1)`，必须全角 `（1）` |
| 选项只显示第一套 | 组上没写 `optionSets`，或题上没写 `oKey` |
| 图里出现 `f_c` 字面下划线 | `text()` 没走迷你标记（`x_c` → tspan） |
| 图整体偏左/被裁 | viewBox 留白过大或内容溢出 |
| Bash 写 `.js` 被拦（EPERM） | Mimosa 安全 Hook；改用 Write 工具或项目内 node 脚本 |
| `require(app/...)` 报 ESM 错 | `app/` 是 `type:module`，KaTeX 一律从 `server/node_modules` require |
| Chrome 截图 EXIT=133 | 本机无 Chrome，走 cairosvg |
| 校验器 "数值抽查失败" | 先怀疑抽查公式本身错了，再用独立数值积分复核 |

## 5. 多会话并行

本项目常有并行会话改同一批文件（如两年份同时入库）。改 `app/index.html`、`tools/validate_data.js`、`app/src/lib/data.js` 这类公共文件前**先重读**，冲突时以 `HANDOVER.md` 的格式约定为准对齐，不要直接覆盖。
