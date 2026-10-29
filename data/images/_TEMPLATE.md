# 图件标准（可选通道：原卷截图）

> 放在 `data/images/` 下供人查阅；`_` 前缀文件不会被网站加载。
> **默认画法仍是 SVG 重绘**（见 `data/figures/_TEMPLATE.md` 与 SKILL.md 第 5.1~5.11 节）。
> 本目录只用来放**某几张**换成原卷截图的图（照片型题图：眼图、星座仪屏摄、实测谱——重绘必然失真）：
> 同名 key 的截图优先于 `.svg`，不想要了就删掉它，自动回落矢量图（见第四节）。
> `_index.js` 注册表由 `tools/emit_figures.mjs` 自动生成，勿手改。

## 一、放哪里、叫什么名

```
data/images/<年>/<年>-<题号>-<key>.png           题图（卷面上的图）——数据里 q.fig = key
data/images/<年>/answer/<年>-<题号>-<key>.png    解析配图（只出现在解析里）——sol.steps[].fig = key
data/images/<年>/_meta.json                    可选：{ "<key>": { q, kind, desc } }，键序 = 图库显示序
```

- **`key` 是文件名最后一个 `-` 之后那段**：`2026-三-q3recv.png` → `q3recv`。**key 改了 = 题目引用失效。**
- key 只允许 `A-Za-z0-9_-`。截图工具默认名（`截图 2026-10-29 19-32-25.png`）会被直接拒收，emit 会打印告警。
- 「年份-题号」前缀只是给人看的，题号用原卷中文数字（三、四、十二）；跨题共用的图写连号（`2018-三四五-q14xf`）。
- 目录格式与 `data/figures/` 完全一致：根目录 = 题图，`answer/` = 解析配图。

## 二、怎么裁

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
| 体积 | 单张 ≤250 kB（超了先降到 1200px 宽，别降质量） |
| 框 | 含图注 / 轴标签 / 子图编号 (a)(b)；**不含**题干正文、题号「三、」、页眉页脚、相邻题 |
| 留白 | 框贴内容即可，外壳统一补 18px；**不要自己裁出白边，也不要自己加白边** |
| 加工 | 不重画、不描线、不美化。原卷印错了也照原样，在解析里说明 |

**裁完必须 Read 裁片核对**：不切字（左右两侧的"输入/输出"最容易丢）、不带进上一行正文、不糊。

## 三、怎么生效

```bash
node tools/emit_figures.mjs <年> --rebuild    # 扫 data/images + data/figures → 重建 _index.js
node tools/check_assets.mjs                   # 快照里有没有、注册表里有没有（两道静默失败）
```

- 注册表永远写在 `data/figures/<年>/_index.js`（前端 `<script>` 引用这个路径），**纯截图年份也一样**，
  `rebuildIndex()` 会自动建目录。
- 有截图的 key 注册成 `{ src: '/data/images/<年>/…png', w, h }`；没有的注册老 svg 字符串。两种形态可混排。
- 前端 `app/src/lib/render.js: figToSvg()` 把描述符包成"只有一张 `<image>` 的 svg 外壳"，
  所以正文/试卷页/图库页/灯箱/版式审计全都不用区分形态。
- server 在跑时（生产 3000）往 `data/images/<年>/` 丢图会**自动重建注册表**；dev 快照要 `npm run sync`（连 png 一起下发）。
- 新年份第一张图：另需在 `app/index.html` 加 `<script src="/data/figures/<年>/_index.js">` 并 `node tools/build-frontend.mjs`。

## 四、和矢量图什么关系

- **`.svg` 是默认来源与唯一维护对象**：新题照 SKILL.md 第 5.1~5.11 节画图（`gen_figures_<年>.py` + `emit`），
  正常流程根本不碰本目录。
- **优先级**：`data/images/<年>/` > `figures/<年>/assets/` > `figures/<年>/*.svg`，同一 key 取最高优先级那个。
- 想让某张图改用截图：裁一张**同名** png 放进来，不用删 svg（`.svg` 还是 meta 的载体）。
- 想退回矢量：删掉那张截图，`emit --rebuild` 复原（`.svg` 从来没被改过）。
- 只有截图、没有 `.svg` 的 key 也能注册：用 `_meta.json` 补 `q/kind/desc`（`rebuildIndex()` 会自己建 `figures/<年>/`）。

## 五、自检命令

```bash
PY=/home/xiuming/.workbuddy/binaries/python/envs/default/bin/python
node tools/emit_figures.mjs <年> --rebuild
$PY tools/preview_figures.py <年> --cols 3 --cell 520x400     # 整年网格，一次 Read 看完
node tools/check_figure_overlap.js <年>                       # 截图只核留白/溢出（0 交叠 + 18/18/18/18）
node tools/check_assets.mjs                                   # 截图漏进快照 / 漏注册
```
