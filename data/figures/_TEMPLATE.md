# SVG 图文件标准（手工编写 / AI 生成通用）

> 放在 `data/figures/` 下供人查阅；`_` 前缀文件不会被网站加载。
> **存储形态（2026-10-26 起）**：每张图是一个纯 `.svg` 文件（真身，可直接 Inkscape 打开/手改），
> 首行带 `figureMeta` JSON 注释；`_index.js` 注册表由 `tools/emit_figures.mjs` 自动生成，勿手改。
> 改**内容**后重跑 emit 即生效（生产 server 实时映射 data/）。

## 一、文件骨架（复制即用）

`data/figures/<年>/<年>-<题号>-<图名>.svg`（解析配图放 `answer/` 子目录）：

```svg
<!-- figureMeta {"key":"ssb","q":"题三","kind":"paper","desc":"SSB相干解调框图"} -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 220">
  <!-- 这里放 SVG 内容：line / rect / circle / text / path ... -->
</svg>
```

登记/生效：

```bash
node tools/emit_figures.mjs <年> --from-svg   # 由现有 .svg 重建 _index.js（保序）
node tools/check_figs.mjs                     # 自检
```

## 二、五条硬性规则（违反任何一条图就不显示）

1. **首行必须是 `<!-- figureMeta {...} -->` 注释且为合法 JSON**：`key`（小写英文/数字/下划线）、
   `q`（"题三"）、`kind`（`"paper"` 题目原图 / `"answer"` 解析配图）、`desc` 一句话。emit 靠它注册。
2. **key 必须与题目数据里的引用一致**：题目 `fig: "ssb"` → 文件名与 meta 注释里都是 `ssb`。
   **改 key = 题目引用失效**。
3. **viewBox 四边留白统一 18px**（`tools/svgkit.py` 的 tighten 口径，±2）。留白过大→图显得靠左；
   内容超出→被裁切。画完跑 `node tools/check_figure_overlap.js <年>` 核对。
4. **上下标用 tspan**（`x_c` / `T_{b}` → `<tspan dy=...>`），不写 `T_b`、`G₁` 这种字面写法。
5. **文字与线净距 ≥6px**；线型色值按 `skills/bupt801/SKILL.md` 第 5.2 节色表
   （信号线 `#1a1a1a`/1.6，判决域 `#888`/1.2/`5,4`，参考虚线 `#999`/1.1/`3,4`）。

## 三、放置位置与登记

| 类型 | 路径 | 额外操作 |
|---|---|---|
| 题目原图（卷面框图） | `data/figures/<年>/<年>-<题号>-<图名>.svg` | 见下面的生效方式 |
| 解析配图 | `data/figures/<年>/answer/<年>-<题号>-<图名>.svg` | 同上 |

**生效方式**（`_index.js` 是自动缓存，唯一维护对象是 .svg）：
- **server 在跑（生产 3000 端口）**：改完 .svg 直接存盘——server 监听 svg 变化自动重建注册表，刷新浏览器即生效；
- **没起 server**：`node tools/emit_figures.mjs <年> --from-svg` 手动重建；
- **新年份**第一张图：另需在 `app/index.html` 加一行 `<script src="/data/figures/<年>/_index.js">`
  并 `node tools/build-frontend.mjs`；已有年份加图不需要动 index.html。
- **由生成器维护的图**别手改 `.svg`（下次 emit 会被生成器输出覆盖）；要长期手改的 key 从生成器
  `FIGS` 列表移除，并在文件头注释说明"手绘维护"。

## 四、给 AI 的生成提示词（复制粘贴，替换尖括号部分）

> 请为北邮801通信原理真题库生成一个 SVG 图文件，严格按以下格式输出**一个完整 .svg 文件**的内容，
> 不要任何解释：
>
> 1. 首行注释（合法 JSON）：`<!-- figureMeta {"key":"<图名key>","q":"题<中文题号>","kind":"<paper|answer>","desc":"<一句话>"} -->`
> 2. 根元素 `<svg xmlns="http://www.w3.org/2000/svg" viewBox="...">`，只给 viewBox（四边留白 18px，不写 width/height）。
> 3. 图形要求：线宽 1.6、黑色 `#1a1a1a`；判决域/分区线 `#888` 1.2 虚线 `5,4`；参考虚线 `#999` 1.1 `3,4`；
>    箭头用 `<marker>`；文字与线净距 ≥6px；上下标用 tspan；内容不超出 viewBox。
> 4. 图示内容：<一句话描述，例如"SSB相干解调框图：s(t)→信道→BPF→与 2cos(2πf_ct) 相乘→LPF→m(t)/2，本振从下方接入乘法器">
>
> 生成后放到 `data/figures/<年>/`，然后运行 `node tools/emit_figures.mjs <年> --from-svg` 注册。

## 五、本次踩坑记录（2026-10-25）

手写 `2025-三-ssb.js` 时模板占位符 `"YEAR"` 未替换 → 注册进错误命名空间，图消失。教训（在新格式下
对应为）：**meta 注释里的年份由所在目录决定、key 必须真实**；写完先跑 `node tools/check_figs.mjs`，
或浏览器控制台执行 `window.BUPT801.figures["<年>"].<key>` 确认返回 svg 字符串。
