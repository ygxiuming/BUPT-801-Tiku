---
name: bupt801
description: "北邮801通信原理真题库入库技能。把待解析/里的新年份试卷 PDF + 答案图片，加工成结构化题库（题干/选项/答案/逐项解析/分步推导）+ 位图图库（用户提供的原卷截图 PNG，缺图从页图裁剪或自绘后截图）+ 可打印试卷页，并跑通校验与页面实测。当用户说『解析20XX年801真题』『把新试卷入库』『加一年真题』『801真题解析』『这道题补一张图』『这张图用我给的截图』『检查/统一图件格式规范』『选择题要题号/大题小问要分行/图片显示太大』『题库校验/修复』『把格式整改写进规范』时使用。"
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
| 这题补一张图（用户没给的） | 从 300dpi 页图裁一张，或自绘后截图 → `data/images/<年>/<年>-<题号>-<key>.png` → `emit`（第 5 节） |
| 这张图用我给的截图 | 原样收进 `data/images/<年>/`（只许改名/垫白边）→ `emit`（第 5 节） |

**默认必须做的事**（用户不说也要做）：①每道题独立解题、答案自己反复验证；②每道题都有解析；③**图件一律位图 PNG**（用户提供为准，缺的从页图裁或自绘后截图，见第 5 节）；④每张图 Read 核对（不切字、不带正文、不糊）；⑤**卷面排版三条硬规则**（选择题行首题号 / 大题小问一条一行 / 图件按固有尺寸显示，见第 5.5 节）；⑥`node tools/validate_data.js` 零错误零警告 + `node tools/check_format.mjs` 零问题 + `audit_layout.mjs` 逐年 ✓；⑦页面冒烟通过 + `check_assets.mjs` 全绿（它会抓"图库引用的图片没进快照"）；⑧**追加 `解析日志.md`**；⑨**git 提交**。

> **图件红线**：**用户提供的 PNG 不许修改内容**——只许改名与垫白边（`tools/pad_png_margin.py`），
> 禁止压缩、裁剪、重画、美化。自裁/自绘的图不受此限，但同样不重画原卷。

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
data/images/<年>/           **图库唯一来源**：`<年>-<题号>-<key>.png` 位图 + `answer/` 解析配图
                            + `_meta.json`（可选，键序=显示序）+ `_index.js`（自动生成，勿手改）
data/questions/<年>/        paper.js（真题）+ answer.js（答案与解析）
tools/emit_figures.mjs      重建 _index.js（扫 data/images 位图 → 注册表）
tools/crop_orig.py          裁图：从 300dpi 页图裁出图区（用户没给的图用）
tools/pad_png_margin.py     **PNG 加白边**：每边垫到 ≥5% 图宽（幂等；用户说「图太贴边」就跑它）
tools/validate_data.js      数据+KaTeX+数值 校验
tools/check_format.mjs      **版式数据体检**：题号/空号/小问编号/选项齐全/图件尺寸（不渲染页面）
tools/audit_layout.mjs      **版式实测**：jsdom 渲染试卷页后核对题号、选项空号、小问分级、图件显示尺寸
tools/inspect_paper.mjs     人工排查用：把某年试卷页的「节 → 组/题 → 小问/选项」逐层打印出来
tools/smoke_pages.mjs       页面冒烟（jsdom + dist，无需浏览器/网络）
tools/check_assets.mjs      **快照资源自检**：资源在不在、悬空 key、引用的图片有没有进快照
tools/audit_site.mjs        全站审计（逐年 ×3 页 + 首页/统计/图库/复习/编辑器 + 21 条流程 + a11y）
tools/verify_2012.py        2012 数值复核样例（新年份照这个思路写独立验算）
解析日志.md                 每年入库/改题后追加，写完即提交
app/                        Vue3 前端（index.html 登记数据 script）
server/                     Express + Puppeteer（试卷 PDF 生成）
```

> **SVG 链路已退役（2026-11）**：`data/figures/` 目录、`gen_figures_*.py`、`svgkit.py`、
> `compare_figures.py`、`preview_figures.py`、`check_figure_overlap.js` 等全部删除。
> 见到旧文档提到它们，一律按本文件的位图流程办。

---

## 2. 十步流程

### ① 环境预检（30 秒）

```bash
cd ~/Desktop/北邮801-通信原理
ls 待解析/ 待解析/<年>答案/ 2>/dev/null
node -e "require('./server/node_modules/katex/dist/katex.min.js');console.log('katex ok')"
/home/xiuming/.workbuddy/binaries/python/envs/default/bin/python -c "import PIL;print('py ok')"
```

- **本机 Chrome 无头模式必崩（EXIT=133）**，别浪费时间在 puppeteer 截图上；页面验证走 jsdom 工具链。

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

### ⑤ 图件（全部位图，一张都不能少）

**来源只有三种，全部落成 PNG 进 `data/images/<年>/`**（规范详见第 5 节与 `data/images/_TEMPLATE.md`）：

1. **用户提供**（默认，优先用）：原样收进 `data/images/<年>/[answer/]`，按 `<年>-<题号>-<key>.png` 改名。
   **只许改名与垫白边，禁止改内容**（不压缩、不裁剪、不重画）。
2. **页图裁剪**（用户没给的卷面图）：从第 ② 步的 300dpi 页图上裁——

```bash
PY=/home/xiuming/.workbuddy/binaries/python/envs/default/bin/python
$PY tools/crop_orig.py /tmp/w801/<年>/p-3.png 210,640,1180,900 \
    --out data/images/<年>/<年>-三-q3recv.png      # 解析配图放 data/images/<年>/answer/
```

3. **自绘后截图**（卷面没有、解析确实需要的示意图）：画成图（HTML/PIL/matplotlib 均可）后**截图保存 PNG**，
   宽 900~1600px，命名同上；不保留矢量源文件，也不做"重绘 vs 原卷"对照（对照闭环已停用）。

收尾三步（每张图都要过）：

```bash
$PY tools/pad_png_margin.py data/images/<年>     # 四边垫白到 ≥5% 图宽（幂等；用户自备图也只做这一步加工）
node tools/emit_figures.mjs <年>                 # 重建该年注册表 _index.js（打印 N figures；不合规文件名会列出来）
```

- **命名就是 key**：`<年>-<题号>-<key>.png` 最后一个 `-` 后那段 = 数据里 `fig:"key"`。
  用户给的「年份-题号-3-1.png」这种名字，末段不是 key，**先按内容对回语义 key 再改名**（如 → `q3eye1.png`）。
- **一题多图**：都写成解析 body 里的 `[[fig:key]]`，`st.fig` 只保留其中一个（详见 5.4）。
- 每张图落库前 **Read 核对**：不切字、不带进相邻正文、图注/轴标签完整、不糊。
- 当前会话**读不了图片就停手告诉用户，禁止凭文字描述盲裁/盲画**——2015 年出过拓扑错误。

### ⑥ 校验

```bash
# a) 重建注册表（已含在 ⑤ 的 emit 里；补图后重跑即可）
node tools/emit_figures.mjs <年>    # 打印「N figures；位图 M 张；⚠ 文件名不合规范、未注册：…」

# b) 新年份才需要：app/index.html 加三行（图库注册表一行 + 题目两行）
#    <script src="/data/images/<年>/_index.js"></script>
#    <script src="/data/questions/<年>/paper.js"></script>
#    <script src="/data/questions/<年>/answer.js"></script>
#    改完必须 node tools/build-frontend.mjs（冒烟读的是 dist/index.html）

# c) tools/validate_data.js 两处登记
#    require('../data/images/<年>/_index.js');
#    require('../data/questions/<年>/paper.js'); require('../data/questions/<年>/answer.js');
#    EXPECT[<年>] = { choice: N, big: M, score: 150 }

# d) tools/check_format.mjs 的 ALL、tools/smoke_pages.mjs 的 ROUTES 也要加（手写年份表是最大漏检源）

node tools/validate_data.js    # 必须 0 错误 0 警告
```

校验器覆盖：题量/总分、编号连续、章节知识点存在、答案落在选项组内、组干含全部空号、`fig` 引用可解析、**每条 KaTeX 公式可渲染（含 `$$`）**、数值抽查。

**再加三道关**（数据层 + 渲染层 + 快照层各一遍，三条命令都返回 0 才算过）：

```bash
node tools/check_format.mjs                 # 全库：题号/空号/小问编号/选项齐全/图件尺寸
for y in 2011 2012 ... 2026; do node tools/audit_layout.mjs $y; done   # 逐年版式实测（可当门禁）
node tools/check_assets.mjs                 # 快照：资源在不在、**引用的截图有没有漏注册/漏下发**
```

`check_format.mjs` 查的是"数据有没有写错"；`audit_layout.mjs` 查的是"页面渲染出来对不对"（`.qnr` 有没有、
`.opt-cap` 有没有、`.sub-row` 是不是都以（n）开头、svg 有没有 width/height）。

**`check_assets.mjs` 是图件的命门**，它专抓两种静默失败：
1. **图没进快照**（`app/public`、`app/dist` 缺 `data/images/…`）→ 页面结构全对、只有那张图整块空白；
2. **图没进注册表**（新放的截图忘了跑 emit）→ 页面拿不到这个 key，图整块空白。
`smoke_pages` / `audit_site` 都直接读项目 `data/`，这两种它们一律绿灯抓不到。

**数值抽查的写法要求**：不要用"结果套结果"的恒等式（会自证）。用独立方法复核，例如 2026 第四题量化器就是在 `p(x)=(3-|x|)/9` 上做数值积分算 `E[X²]=3/2`、`E[XY]=29/18`、`E[Y²]=23/12`、噪声 `7/36`；第八题循环码直接程序化验算 `GHᵀ=0`、`dmin=3`、`s=(101)→ĉ=0001011`、8 个错误图样的重量分布。

### ⑦ 同步 public

```bash
cd ~/Desktop/北邮801-通信原理/app && npm run sync
```

`sync-data.mjs` 会重建注册表并把 `data/images/**`（位图 + `_index.js`）一起下发；
png 不进快照就等于图空白。生产 3000 不需要这步（`/data/**` 实时映射项目 data/）。

沙箱里 `sync-data.mjs` 可能 EPERM（`copyfile` 被拦），等价的兜底（**别忘 images**）：

```bash
cd ~/Desktop/北邮801-通信原理
for y in <年>; do
  mkdir -p "app/public/data/questions/$y" "app/public/data/images/$y/answer"
  cp -f "data/questions/$y/paper.js" "data/questions/$y/answer.js" "app/public/data/questions/$y/"
  cp -f "data/images/$y/_index.js" "app/public/data/images/$y/_index.js"
  /bin/cp -f "data/images/$y/"*.png "app/public/data/images/$y/" 2>/dev/null
  /bin/cp -f "data/images/$y/answer/"*.png "app/public/data/images/$y/answer/" 2>/dev/null
done
cp -f data/chapters.js app/public/data/chapters.js
```

> 本机 `cp` 是交互别名（`cp -i`），脚本里一律 `/bin/cp -f`，否则会卡在「是否覆盖」上并拖成超时。

### ⑧ 实测

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

### ⑨ 收尾：git 提交 + 写解析日志

**这两件事做完才算"弄完"**，缺一件都不算交付。

#### a) 解析日志（`解析日志.md`）

1. 在"总览"表尾加一行：年份 / 来源 / 选择 / 大题 / 总分 / 图 / 校验 / 完成日。
2. 追加一节 `## <年>`，五项必写：
   - **来源**：`待解析/` 里的原始 PDF（页数、dpi）、答案图片位置
   - **统计**：选择题空数、大题数（各子问分值）、总分、图张数（题图/解析图各几张）
   - **校验与实测**：`validate_data.js` 的错误/警告数、`smoke_pages.mjs` 的结论、`check_assets.mjs` 是否抓到漏注册
   - **与参考答案的分歧与纠错**：逐条写"参考答案怎么写 / 错在哪 / 本文取什么"。**自己算错返工的也要写**
   - **遗留**：没裁好的图、没跑通的、被沙箱挡住的、下次要先做的事
3. 旧内容只追加不改写；改题/换图也在对应年份下补一条带日期的短记录。

#### b) git

```bash
cd ~/Desktop/北邮801-通信原理
git rev-parse --git-dir 2>/dev/null || git init -b main   # 首次
git status --short
git add data/questions/<年> data/images/<年> app/index.html tools/ 解析日志.md
git commit -m "feat(<年>): 入库 <年> 真题（50 空 + 8 大题 + 16 张图）"
```

- **提交信息**：`<type>(<scope>): <主题>` —— `feat` 入库新年份、`fix` 纠错/换图、`docs` 文档与日志、`chore` 工具链。
- **粒度**：一个年份一个提交；换图、改答案单独成提交，方便 `git revert` 单点回滚。
- **截图要进仓库**（png 是内容，不是产物）。
- **别提交的东西**：`.gitignore` 已忽略 `node_modules/`、`app/dist/`、`app/public/`、`待解析/`。若发现 `git status` 里有这些，先修 `.gitignore` 再 add。
- 收尾前 `git status --short` 必须干净（或只剩明确的 `wip` 文件）。

---

## 3. 硬性验收清单

- [ ] 选择题 N 题 / 大题 M 题 / 总分 150（以原卷为准，同步 `sections` 分值）
- [ ] 每道选择题有 `concl + A~D 逐项 + note`；每道大题有 `intro + 分步 + 每问 ans + summary + pitfalls`
- [ ] 与参考答案不一致处，解析里写明差异和理由
- [ ] **图件全位图**：`data/images/<年>/[answer/]<年>-<题号>-<key>.png`，命名与 `fig:"key"` 一致；
      每张 Read 核过（不切字/不带正文/不糊）；四边留白 ≥5% 图宽（`pad_png_margin.py`）
- [ ] **用户提供的 PNG 内容未动**（只改名/垫边），自裁自绘图同样不重画原卷
- [ ] 有图的题 `fig:"key"` 与文件名 key 一致；`_meta.json` 键序按题号排全（要么不写，要么写全）
- [ ] 文字/数值与原卷不一致处已按 **PDF 为准** 改正（不是截个图去迁就文字）
- [ ] 选择题每题行首有题号（`1．`）、每张选项表标了空号（`（n）选项` / `共用选项`）
- [ ] 大题小问一条一行、行首（n）齐全、两级小问有 `sub-grp` 一级标题；stem 里没有编号小问
- [ ] 图件在正文里显示宽 320~680px（`audit_layout.mjs` 断言），点击放大后才看全尺寸
- [ ] `node tools/validate_data.js` → 0 错误 0 警告；`check_format.mjs` → 0 问题；`audit_layout.mjs <年>` → ✓；`check_assets.mjs` → ✓（截图都在快照里、都在注册表里）
- [ ] `app/index.html` / `validate_data.js` / `chapters.js` 登记齐全
- [ ] `public/data/` 与 `data/` 内容一致（**含 `images/<年>/**`**，否则页面图空白）
- [ ] 六个页面类型全部实测通过（`node tools/smoke_pages.mjs` 全绿）
- [ ] `解析日志.md` 已追加本年一节（含纠错与遗留）
- [ ] `git commit` 完成，`git status --short` 干净

## 4. 踩坑速查

| 现象 | 原因 / 解法 |
|---|---|
| **截图放进 data/images 了，页面还是没图/老图** | 没重建注册表：`node tools/emit_figures.mjs <年>`；server 在跑时丢图会自动重建，但 emit 手跑最稳 |
| **页面结构全对、就是图空白（快照漏 png）** | `app/public`、`app/dist` 里没有 `data/images/<年>/…`。`smoke_pages`/`audit_site` 抓不到，只有 `node tools/check_assets.mjs` 会报「快照里不存在」/「没注册」 |
| **文件名是「截图 2026-10-29 19-32-25.png」** | 截图工具默认名。emit 直接拒收（打印「文件名不合规范、未注册」）。改成 `<年>-<题号>-<key>.png`，key 只能用 ASCII 字母数字下划线 |
| **用户给的图文件名末段不是 key**（如 `2021-三-3-1.png`） | `keyFromImageName()` 只剥「年份-题号-」前缀，`3-1` 会注册成 key `3-1`——图进得去图库，但没题目引用（静默失败）。**先按内容对回语义 key 再改名**（`q3ht` / `q3eye1`）。自查：`check_assets.mjs` 该年「N引/M图」必须相等、无孤儿图 |
| 裁图把上一行正文/题号带进来了 | 框上沿太低；先 Read 页图估坐标，再 Read 裁片核对，偏了就调坐标重裁 |
| 裁图切掉了图注/坐标轴标签 | 框太紧；图注与轴标签必须包里（四周留白由 `pad_png_margin.py` 统一垫，别自己缩框） |
| 截图小字糊 | 页图分辨率不够：`pdftoppm -r 400` 重转，或裁完 `Image.resize` 放大到宽 1400（放大不会变清楚，优先重转） |
| 一张图白、一张图灰 | 两张裁自不同来源（PDF 页 vs 答案照片）。统一从 PDF 页裁 |
| 图在正文里大得离谱 | 不是图的问题：`inlineFigure()` 按固有尺寸夹到 320~680；若撑满栏宽，查这张图的注册 w/h 是不是丢了（重跑 emit） |
| 整年图库 `_index.js` 涨到几百 kB | 用了 base64 内联老方案；位图一律走 `src: '/data/images/…'` 外链 |
| 位图小字在放大镜里也糊 | 见上：`-r 400` 重转页图；≤250 kB 压不下时可降到 1200px 宽 |
| **改了 data/images 里的图，刷新还是旧的** | 浏览器缓存：生产 `/data/**` 已带 no-cache，强刷（Ctrl+Shift+R）即可；dev 快照要 `npm run sync` |
| 公式报 `katex-error` | JS 字符串反斜杠没双写，或被 `\t`/`\e` 转义吞掉（`\\alpha` 不是 `\alpha`） |
| 题干空号高亮错位 | 用了半角 `(1)`，必须全角 `（1）` |
| 选项只显示第一套 | 组上没写 `optionSets`，或题上没写 `oKey` |
| Bash 写 `.js` 被拦（EPERM） | Mimosa 安全 Hook；改用 Write 工具或项目内 node 脚本 |
| `require(app/...)` 报 ESM 错 | `app/` 是 `type:module`，KaTeX 一律从 `server/node_modules` require |
| Chrome 截图 EXIT=133 | 本机无 Chrome，页面对齐只能用 jsdom（`audit_layout` / `smoke_pages`） |
| 校验器 "数值抽查失败" | 先怀疑抽查公式本身错了，再用独立数值积分复核 |
| 数值抽查：带通采样"混叠"判据 | 不能用 fold 折叠镜像判等；要判谱副本（周期 fs 平移）两两不交，逐区间对 `a<d && c<b` |
| 数值抽查：哈夫曼平均码长 | L = 各次合并时子树概率之和；别给叶子预置深度再乘权 |
| `curl 127.0.0.1:3000` 返回 502 | 沙箱禁本地网络；改用 `node tools/smoke_pages.mjs` |
| `npm run sync` 报 `EPERM copyfile` | 同上，沙箱拦文件复制；走第 ⑦ 步的 `/bin/cp -f` 兜底 |
| `cp` 卡住/命令被转后台 | 本机 `cp` 是交互别名（`cp -i`）；一律 `/bin/cp -f` |
| 校验器报"空号不连续"但看不出来 | 一题多空时 `num` 必然重复（2024）。校验按去重题号查；若仍报，先看 `blank` 是否 1..N 连续 |
| `Math.erfc is not a function` | 本机 Node 没有 erfc。数值抽查改核 `d/σ` 比值或 `d/(σ√2)` 是否等于题设整数 |
| Vue 模板里 `xxx()` 报 `is not a function` | 模板里的裸标识符只解析到**组件实例**：`import { fn }` 之后还要在 `methods` 里挂一份（见 `BigSol.vue: normSubNo`） |
| 冒烟报"找不到 td[data-k]"、页面空白 | `openPage(route, tag)` 的 tag 命中 ESM 缓存、app 没重新挂载（脚本已自动加序号） |

## 5. 图件规范（唯一口径，全位图）

> 图件只有一条链路：**`data/images/<年>/` 下的 PNG**。判断标准一句话——**图就是原卷截图（或按原卷的忠实转录图），
> 不重画、不美化、不做"重绘 vs 原卷"对照**。

### 5.1 命名与目录

- `<年>-<题号>-<key>.png`；题图放年目录根，解析配图放 `answer/` 子目录。`key` = 文件名最后一个 `-` 后那段，
  必须等于数据里的 `fig:"key"`，只允许 `A-Za-z0-9_-`。
- `_meta.json`（可选）给 key 补 `{ q, kind, desc }` 并定图库显示序。**要么不写，要么把该年全部 key 按题号序写全**
  ——只写一个 key 会把其余全排到末尾（2021 的 `q3ht` 因此跑到图库第一位）。

### 5.2 来源与加工红线

1. **用户提供（默认）**：原样入库，**只许改名 + `pad_png_margin.py` 垫白边**；禁改内容/压缩/裁剪/重画。
2. **页图裁剪**：300dpi 页图（字小用 400）→ `crop_orig.py` → 宽 900~1600px、PNG、单张 ≤250 kB；
   含图注/轴标签/子图编号，**不含**题干正文与题号「三、」；不重画、不美化。
3. **自绘后截图**：卷面没有的示意图才画；画完截图存 PNG（宽 900~1600px），不留矢量源文件。
4. 有意改动（修正原卷笔误）不体现在图上——图永远照原卷，差异写进 `sol.pitfalls` 与解析日志。

### 5.3 留白与生效

- 四边垫白到 **≥5% 图宽**：`python tools/pad_png_margin.py data/images/<年>`（幂等；只加白不裁内容；
  原卷自带大纸边的那边自然不动）。垫完**必须重建注册表**（`emit <年>`，w/h 变了）。
- 生效链路：`emit_figures.mjs` 扫 `data/images/<年>/` → `_index.js` 注册 `{ src, w, h }` →
  前端 `figToSvg()` 包成 `<image>` 外壳 → 正文/图库/灯箱/版式审计全套照旧。
- 生产 3000：改图/放图后**刷新即生效**（server 监听 + no-cache）；dev 快照要 `npm run sync`。

### 5.4 一题多图与显示尺寸

- **一题多图**（同一小问要出两张）：都写成解析 body 里的 `[[fig:key]]`，`st.fig` 只保留其中一个。
  `BigSol.vue`/`PaperView` 的 `hasFig(st)` 一旦为真就不再在段末补 `st.fig`，所以**别只在 `fig` 字段上想办法**，
  否则要么少一张、要么出一对重复。图序 = `[[fig:]]` 在 body 里的先后。
- **正文显示尺寸（320~680px）**：`lib/render.js: inlineFigure()` 按注册 w/h 算固有尺寸，大图缩到 680、
  小图抬到 320、中间 1:1。调区间要跑 `node tools/audit_layout.mjs <年>`。**别在数据里写 `style="max-width:…"`。**
- 图库缩略图（`fitSvg(560,176)`）与放大弹窗（按视口算）是另一套，别混。

### 5.5 卷面排版：题号 / 小问 / 图件显示尺寸（三条硬规则）

> 这一节的毛病都出在**渲染层**，不要去改历史图、也不要去改历年题目数据。

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

- 根因：只有 viewBox、没有固有尺寸的图会被 `max-width:100%` 当成 `width:100%`，小图被放大数倍。
- 修法（唯一）：`lib/render.js` 的 `inlineFigure()` 按注册的 w/h 算固有尺寸，夹到 **320~680px** 再写死 `width/height`。
- 图库缩略图与放大弹窗是另一套尺寸逻辑，别混。

## 6. 多会话并行

本项目常有并行会话改同一批文件（如两年份同时入库）。改 `app/index.html`、`tools/validate_data.js`、
`app/src/lib/data.js`、`tools/fig_registry.js` 这类公共文件前**先重读**，冲突时以 `HANDOVER.md` 的格式约定为准对齐，
不要直接覆盖。
