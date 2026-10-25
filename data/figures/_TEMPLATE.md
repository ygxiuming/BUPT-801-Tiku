# SVG 图文件标准（手工编写 / AI 生成通用）

> 放在 `data/figures/` 下供人查阅；`_` 前缀文件不会被网站加载。
> 每个 .js 文件 = 一张图。改**内容**后刷新浏览器即生效（生产 server 实时映射 data/）。

## 一、文件骨架（复制即用）

```js
// <年> · 题<题号> <题目原图|解析配图> · <一句话描述>
window.BUPT801 = window.BUPT801 || {};
window.BUPT801.figures = window.BUPT801.figures || {};
(window.BUPT801.figures["2025"] = window.BUPT801.figures["2025"] || {}).ssb = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 220">
  <!-- 这里放 SVG 内容：line / rect / circle / text / path ... -->
</svg>
`;

window.BUPT801.figureMeta = window.BUPT801.figureMeta || {};
(window.BUPT801.figureMeta["2025"] = window.BUPT801.figureMeta["2025"] || {}).ssb =
  { q: "题三", kind: "paper", desc: "SSB相干解调框图" };
```

## 二、五条硬性规则（违反任何一条图就不显示）

1. **年份必须是真实年份字符串**：`"2025"` / `"2026"`，不要写 `"YEAR"` 占位符。
2. **图名 key 必须与题目数据里的引用一致**：题目 `fig: "ssb"` → 文件里两处 `.ssb`（figures 和 figureMeta）。key 用小写英文（如 `ssb`、`pam`、`encoder`、`q2psd`）。**改 key = 题目引用失效**。
3. **SVG 字符串推荐用反引号模板串**（如骨架所示，可多行、无需转义引号）。限制：SVG 内容里不能出现反引号 `` ` `` 和 `${`。若用单引号包裹，则内部所有单引号必须写成 `\'`（生成器的输出就是这种）。
4. **figureMeta 两处也要写对**：`q` 是中文题号（"题三"），`kind` 是 `"paper"`（题目原图）或 `"answer"`（解析配图），图库页靠它分组显示。
5. **viewBox 贴内容边界**：四边留白各 ≤30px。留白过大→图显得靠左；内容超出→被裁切。画完到网站 `/figures` 图库页肉眼核对。

## 三、放置位置与登记

| 类型 | 路径 | 额外操作 |
|---|---|---|
| 题目原图（卷面框图） | `data/figures/<年>/<年>-<题号>-<图名>.js` | 新增文件要在 `app/index.html` 加一行 `<script src="/data/figures/...">` 并 `cd app && npm run build` |
| 解析配图 | `data/figures/<年>/answer/<年>-<题号>-<图名>.js` | 同上 |

已有文件的**内容修改**：什么都不用做，刷新浏览器即生效。
**不要**手改 `tools/gen_figures_<年>.py` 生成器输出的文件之外又重跑生成器——手改内容会被覆盖；手改的文件建议在文件头注释加"手绘，勿由生成器覆盖"并从生成器 FIGS 列表移除该 key。

## 四、给 AI 的生成提示词（复制粘贴，替换尖括号部分）

> 请为北邮801通信原理真题库生成一个 SVG 图文件，严格按以下格式输出**一个完整 .js 文件**的内容，不要任何解释：
>
> 1. 第一行注释：`// <年份> · 题<题号> <题目原图|解析配图> · <一句话描述>`
> 2. 注册语句（两行 guard 后用反引号模板串包 SVG）：
>    `(window.BUPT801.figures["<年份>"] = window.BUPT801.figures["<年份>"] || {}).<图名key> = \`<svg ...>...\``
> 3. 末尾注册元信息：
>    `(window.BUPT801.figureMeta["<年份>"] = window.BUPT801.figureMeta["<年份>"] || {}).<图名key> = { q: "题<中文题号>", kind: "<paper|answer>", desc: "<描述>" };`
> 4. 图名 key 用小写英文且必须等于题目数据里 fig 引用的 key（这里是 `<key>`）。
> 5. SVG 要求：`xmlns` 必写；只给 `viewBox`（四边留白≤30px，不要写 width/height）；线宽 1.6、黑色 `#1a1a1a`，辅助线 `#555` 虚线；箭头用 `<marker>`；文字不要压线（与线保持 ≥8px 间距）；内容不要超出 viewBox。
> 6. 图示内容：<这里用一句话描述要画什么，例如"SSB相干解调框图：s(t)→信道→BPF→与 2cos(2πf_ct) 相乘→LPF→m(t)/2，本振从下方接入乘法器">

## 五、本次踩坑记录（2026-10-25）

`2025-三-ssb.js` 手工重写后图消失：模板占位符 `"YEAR"` / `.FIGURE_NAME` / `q: "题号"` 未替换成真实值 → 注册进了错误的命名空间，题目按 `figures["2025"].ssb` 找不到。教训：**写完先在浏览器控制台执行 `window.BUPT801.figures["<年>"].<key>` 确认返回 svg 字符串**。
