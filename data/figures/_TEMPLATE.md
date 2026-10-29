# 图文件标准（SVG 为主 + 逐张截图可选覆盖）

> **2026-10-29 定稿：默认仍是 SVG 重绘**，规范见 `skills/bupt801/SKILL.md` 第 5 节（5.1~5.11）。
> **某一两张**换成原卷截图时，才把同名 png 放进 `data/images/<年>/`，标准见 [`../images/_TEMPLATE.md`](../images/_TEMPLATE.md)。
> 优先级：`data/images` > `assets/` > `.svg`——**有同名 png 就用 png，没有就回落 svg**，删掉 png 一秒钟复原。

## 一、这目录里都是什么

```
data/figures/<年>/<年>-<题号>-<key>.svg         题图（首行带 <!-- figureMeta {...} --> 注释）
data/figures/<年>/answer/<年>-<题号>-<key>.svg  解析配图
data/figures/<年>/assets/<key>.png              2026-10 的旧截图通道（仍兼容，优先级低于 data/images）
data/figures/<年>/_index.js                     自动生成的注册表（勿手改，emit 重建）
```

`figureMeta` 里的 `key` 必须等于题目数据里的 `fig:"key"`；`q` 是题号、`kind` 是 `paper|answer`、`desc` 一句话。

## 二、要改一张图怎么办

**默认改 svg**（新图照第 5 节画；老图可以在 Inkscape 里手调后直接存盘）。落盘只有两种写法：

```bash
node tools/emit_figures.mjs <年>              # 只重建注册表（补/删截图后跑这个）
node tools/emit_figures.mjs <年> --run-gen    # 改了生成器，要按 gen_figures_<年>.py 覆盖 .svg
```

- `--run-gen` 会把同名 `.svg` **整个覆盖**，Inkscape 手改过的图一跑就没（2021 出过事）——跑前先 commit。
- 只补截图时**别**加 `--run-gen`。

**只有照片型题图**（眼图、星座仪屏摄、实测谱）才裁一张截图盖过去：放 `data/images/<年>/`（解析图放 `answer/`），
跑 `node tools/emit_figures.mjs <年>` 即生效，`.svg` 原样留着当兜底；想退回矢量就删掉那张 png 再 emit。

## 三、矢量链路的口径（唯一）

- 收边：`tools/svgkit.py` 的 `tighten(svg, PAD=18)`，四边各 18px；验收 `node tools/check_figure_overlap.js <年>` 报 18/18/18/18（±2）。
- 生成器：`--run-gen` 会按 `tools/gen_figures_<年>.py` 输出覆盖 `.svg`；跑之前先 `git add` 一次，跑完 `git diff` 确认只有预期的那张变了。
- 生成器维护的图别手改（下次 `--run-gen` 会被覆盖）；要长期手改的 key 从生成器 `FIGS` 列表移除，并在文件头注释说明。
- 线型/字号/间距/图元画法：`skills/bupt801/SKILL.md` 5.2~5.8；2023/2024 仍是旧两步收边链路（`svg_fit` + `fit_figures_render`），动到就顺手改成 `tighten()`。
