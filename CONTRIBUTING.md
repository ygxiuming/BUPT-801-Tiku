# 贡献指南

这个仓库最需要两类人：**发现错误的人**，和**愿意把新年份录进来的人**。两者的入口不同。

## 一、发现错误 → 开 Issue

[新建 Issue](https://github.com/ygxiuming/BUPT-801-Tiku/issues/new/choose)，按模板选：

| 模板 | 什么时候用 | 必须提供 |
|---|---|---|
| 答案纠错 | 选项/数值算错、推导有跳步、和参考资料不一致 | 年份、题号、你的推导 |
| 题干 / 图件错误 | 抄错字、漏条件、框图与原卷不符 | 年份、题号、原卷截图 |
| 功能建议 | 刷题/复习流程不好用 | 你的使用场景 |

**为什么一定要走 Issue**：题库最怕"错在暗处"。私信说一句"2025 第 18 题好像不对"，我修了也没人知道修过什么；走 Issue 会留下记录、写进 CHANGELOG、别人搜得到。

## 二、改代码或数据 → 提 PR

```bash
git clone https://github.com/ygxiuming/BUPT-801-Tiku.git
cd BUPT-801-Tiku
git checkout -b fix/2025-q30-answer

# …改…

node tools/validate_data.js         # 0 错误 0 警告
node tools/smoke_pages.mjs          # 全部通过
node tools/audit_site.mjs           # 全部通过
node tools/check_figure_overlap.js 2025

git commit -m "fix(2025): 修正第 30 题答案与解析"
```

### 提交信息规范

用 [Conventional Commits](https://www.conventionalcommits.org/) —— release-please 靠它判版本号：

| 前缀 | 含义 | 版本影响 |
|---|---|---|
| `feat(2025):` | 新增内容（入库一年真题） | minor |
| `fix(2025):` | 修错（答案、题干、图件） | patch |
| `docs:` | 文档 | 不触发 |
| `chore:` / `ci:` / `test:` | 杂活 | 不触发 |
| `feat!:` 或 `BREAKING CHANGE:` | 破坏性变更 | major |

`(scope)` 用年份或模块名（`2025`、`front`、`figures`、`tools`），一眼能看出动了哪块。

### 数据改动的要求

1. **一个年份一个提交**。入库 2025 就只提交 2025 相关文件，别顺手夹带别的年份。
2. **改完必跑校验**，全绿再提。
3. **改答案必须有依据** —— 原卷、教材、或完整推导。PR 描述里写清楚。
4. **不要手改 `app/dist/`**，那是构建产物，已 gitignore。

## 三、新增年份

### 1. 准备输入

把原卷 PDF 与答案（PDF 或图片）放进 `待解析/`。

### 2. 按流水线做

详细步骤见 [`skills/bupt801/SKILL.md`](skills/bupt801/SKILL.md)，要点：

```
转录题干/选项  →  data/questions/<年>/paper.js
定答案（三路对账）→  data/questions/<年>/answer.js
重绘框图  →  data/figures/<年>/*.js（一图一文件，解析图放 answer/）
登记  →  app/index.html 增加 <script>
校验  →  validate + smoke + audit + figure_overlap
记录  →  解析日志.md 追加一节（来源、统计、纠错、遗留）
提交  →  git commit -m "feat(<年>): 入库 <年> 真题（N 空 + M 大题 + K 图）"
```

### 3. 数据格式

`paper.js` 只放题面，`answer.js` 按题目 id 索引答案与解析。拆开的目的是 diff 干净——改一道题只动几行。

```js
// paper.js
window.BUPT801.papers["2025"] = {
  year: 2025,
  sections: [{ id: 'choice', name: '单项选择题', score: 40 }, ...],
  questions: [{ id: '2025-12', num: '12', type: 'choice', stem: '…', opts: { A: '…', B: '…' } }]
}
```

公式写 KaTeX。**注意**：`\text{...}` 里不要用 `·`（U+00B7），KaTeX 会当成 `\cdotp` 报错，写 `\text{bit/(s}\cdot\text{Hz)}`。

### 4. 图件

用 `tools/svgkit.py` 的约定画：留白 18px、线型与色表统一、同类图互相对照。画完：

```bash
python tools/preview_figures.py 2025 --cols 3   # 整年网格预览
node tools/check_figure_overlap.js 2025          # 0 交叠
```

## 四、不接受的改动

- 把真题改成"更像标准答案"的改写（要改就对着原卷改）
- 未经核实的答案修改（"我觉得应该是 C"）
- 引入后端依赖的前端改动（本站的设计前提是纯静态可用）
- 把个人做题数据、浏览器缓存提交进仓库

## 五、代码风格

- Vue 3 选项式 API，组件用 `<script>` 不用 `<script setup>`（与现有代码保持一致）
- 样式全在 `app/src/styles/app.css`，改配色只动文件头的令牌区，不要在组件里写死颜色
- 工具脚本用 Node ESM，注释写"为什么这么做"，不写"这行在做什么"
