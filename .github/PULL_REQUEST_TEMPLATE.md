## 这个 PR 做了什么

<!-- 一句话说清。改题目的话写「2025 年第 30 题：答案 B → C，理由见下」 -->

## 依据

<!-- 改数据必须写依据：原卷截图 / 教材页码 / 你的推导过程。没有依据的答案改动不会合 -->

## 影响范围

- [ ] 只改题库内容（`data/questions/`）
- [ ] 只改图件（`data/figures/`）
- [ ] 改了前端（`app/src/`）
- [ ] 改了工具或流水线（`tools/`、`.github/`、`deploy/`）
- [ ] 新增年份

## 跑过的校验

<!-- 勾上实际跑过的，没跑的请说明原因 -->

- [ ] `node tools/validate_data.js` — 0 错误 0 警告
- [ ] `node tools/smoke_pages.mjs` — 全部通过
- [ ] `node tools/audit_site.mjs` — 全部通过
- [ ] `node tools/check_figure_overlap.js <年>` — 0 交叠

## 提交信息

<!-- 必须是 Conventional Commits：feat / fix / docs / chore …
     release-please 靠它判版本号，写成「update」会被忽略，也不会出现在 CHANGELOG 里 -->
