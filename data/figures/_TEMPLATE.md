# 图文件标准（历史矢量图，只读保留）

> **2026-10-29 起，图库改为「原卷截图」维护**：新图一律裁截图放到 `data/images/<年>/`，
> 标准见 [`../images/_TEMPLATE.md`](../images/_TEMPLATE.md)。
> 本目录只保留 2026-10 之前画的矢量图：**不再新增、不再手改、不再写生成器**，
> 作用是没有同名截图时兜底（优先级：`data/images` > `assets/` > `.svg`）。

## 一、这目录里都是什么

```
data/figures/<年>/<年>-<题号>-<key>.svg         题图（首行带 <!-- figureMeta {...} --> 注释）
data/figures/<年>/answer/<年>-<题号>-<key>.svg  解析配图
data/figures/<年>/assets/<key>.png              2026-10 的旧截图通道（仍兼容，优先级低于 data/images）
data/figures/<年>/_index.js                     自动生成的注册表（勿手改，emit 重建）
```

`figureMeta` 里的 `key` 必须等于题目数据里的 `fig:"key"`；`q` 是题号、`kind` 是 `paper|answer`、`desc` 一句话。

## 二、要改一张老图怎么办

**不要改 svg。** 裁一张同名截图放进 `data/images/<年>/`（解析图放 `answer/`），跑

```bash
node tools/emit_figures.mjs <年> --rebuild
```

就生效，svg 原样留着当兜底。改 svg 本身只在极少数情况下有意义（比如给一张没人用的图补 figureMeta），
而且要同时管收边、遮挡、id 作用域三件事，成本远高于裁图。

## 三、如果一定要动矢量链路（仅限旧年份维护）

- 收边：`tools/svgkit.py` 的 `tighten(svg, PAD=18)`，四边各 18px；验收 `node tools/check_figure_overlap.js <年>` 报 18/18/18/18（±2）。
- 生成器：`node tools/emit_figures.mjs <年> --run-gen` 会按 `tools/gen_figures_<年>.py` 输出**覆盖** `.svg`；
  跑之前先 `git add` 一次，跑完 `git diff` 确认只有预期的那张变了。
- 生成器维护的图别手改（下次 emit 会被覆盖）；要长期手改的 key 从生成器 `FIGS` 列表移除，并在文件头注释说明。
- 线型/字号/间距口径见 `skills/bupt801/SKILL.md` 第 5.6 节（已归档，不再对入库任务生效）。
