# 图件标准（位图唯一链路：原卷截图 PNG）

> 放在 `data/images/` 下；`_` 前缀文件不会被网站加载。
> **2026-11 定稿：图件只有位图，SVG 重绘已退役**（`data/figures/` 目录与整条矢量链路已删除）。
> 图的唯一来源是**用户提供的原卷截图**；用户没提供的图，从 300dpi 页图上裁（工具见第二节），
> 自绘图形（框图/谱图等）也先画成图再**截图保存为 PNG** 落进本目录。
> `_index.js` 注册表由 `tools/emit_figures.mjs` 自动生成，勿手改。

## 一、放哪里、叫什么名

```
data/images/<年>/<年>-<题号>-<key>.png           题图（卷面上的图）——数据里 q.fig = key
data/images/<年>/answer/<年>-<题号>-<key>.png    解析配图（只出现在解析里）——sol.steps[].fig = key
data/images/<年>/_meta.json                    可选：{ "<key>": { q, kind, desc } }，键序 = 图库显示序
data/images/<年>/_index.js                     自动生成的注册表（勿手改，emit / server 同步重建）
```

- **`key` 是文件名最后一个 `-` 之后那段**：`2026-三-q3recv.png` → `q3recv`。**key 改了 = 题目引用失效。**
- key 只允许 `A-Za-z0-9_-`。截图工具默认名（`截图 2026-10-29 19-32-25.png`）会被直接拒收，emit 会打印告警。
- 「年份-题号」前缀只是给人看的，题号用原卷中文数字（三、四、十二）；跨题共用的图写连号（`2018-三四五-q14xf`）。
- 根目录 = 题图，`answer/` = 解析配图。

## 二、图从哪来

| 来源 | 做法 |
|---|---|
| **用户提供**（默认） | 原样收进 `data/images/<年>/`，按命名规范改名即可。**只许改名与垫白边**（`tools/pad_png_margin.py`），不许改内容、不许压缩、不许重画 |
| 页图裁剪（用户没给的图） | `pdftoppm -r 300` 出页图 → `tools/crop_orig.py` 裁出图区 → 存 `data/images/<年>/[answer/]/` |
| 自绘图形 | 画成图后**截图/导出 PNG**（宽 900~1600px），命名同上；不再保留矢量源文件 |

裁剪命令：

```bash
PY=/home/xiuming/.workbuddy/binaries/python/envs/default/bin/python
pdftoppm -r 300 -png 待解析/<年>xxx.pdf /tmp/w801/<年>/p          # 先出页图
$PY tools/crop_orig.py /tmp/w801/<年>/p-03.png 830,220,1450,560 \
    --out data/images/<年>/<年>-三-q3recv.png                      # 坐标 = 左上 x,y + 宽高
$PY tools/crop_orig.py 页图.png 0.18,0.35,0.62,0.30 --norm --out ...  # 或按页面比例（先粗后精）
```

| 项 | 要求 |
|---|---|
| 来源 | `pdftoppm -r 300 -png` 的**原卷页图**（小字糊用 `-r 400`）；答案页只作补充，并在 `sol.pitfalls` 注明 |
| 宽 | 900~1600 px（灯箱按原尺寸放大，太窄会糊） |
| 格式 | **PNG**（JPEG 文字边缘会出彩噪） |
| 体积 | 单张 ≤250 kB（超了先降到 1200px 宽，别降质量；用户自备图除外——原样入库） |
| 框 | 含图注 / 轴标签 / 子图编号 (a)(b)；**不含**题干正文、题号「三、」、页眉页脚、相邻题 |
| 留白 | 四边垫到 ≥5% 图宽：`$PY tools/pad_png_margin.py data/images/<年>`（幂等，只加白不裁内容；垫完重建注册表） |
| 加工 | 不重画、不描线、不美化。原卷印错了也照原样，在解析里说明 |

**裁完必须 Read 裁片核对**：不切字（左右两侧的"输入/输出"最容易丢）、不带进上一行正文、不糊。
**不再做"重绘 vs 原卷"对照闭环**——没有重绘图，自然没有对照图；`待解析/crops/` 工作目录不再产出。

## 三、怎么生效

```bash
node tools/emit_figures.mjs <年>    # 扫 data/images/<年>/** → 重建该年 _index.js
node tools/check_assets.mjs         # 快照里有没有、注册表里有没有（两道静默失败）
```

- 注册表写在 `data/images/<年>/_index.js`（前端 `<script>` 引用这个路径），`rebuildIndex()` 会自动建目录。
- 每个 key 注册成 `{ src: '/data/images/<年>/…png', w, h }`；前端 `app/src/lib/render.js: figToSvg()`
  把描述符包成"只有一张 `<image>` 的 svg 外壳"，正文/试卷页/图库页/灯箱/版式审计都不用区分。
- server 在跑时（生产 3000）往 `data/images/<年>/` 丢图会**自动重建注册表**；dev 快照要 `npm run sync`（连 png 一起下发）。
- 新年份第一张图：另需在 `app/index.html` 加 `<script src="/data/images/<年>/_index.js">` 并 `node tools/build-frontend.mjs`。

## 四、自检命令

```bash
node tools/emit_figures.mjs <年>       # 注册表与图片一一对应
node tools/check_assets.mjs            # 截图漏进快照 / 漏注册 / 悬空 key
node tools/validate_data.js            # fig 引用可解析、公式可渲染
```
