# 项目长期记忆

## 工作流约定（2026-10-25 起生效）

- **每完成一份试卷/一次改题/一批重画图，必须做两件事**：①在 `解析日志.md` 追加一节（来源、统计、校验与实测结论、与参考答案的分歧与自纠、遗留）；②`git commit`。
- **git 粒度**：一个年份一个提交，信息格式 `<type>(<scope>): <主题>`（feat/fix/docs/chore，未校验的中间态写 `wip(<年>):`）。收尾前 `git status --short` 要干净。
- `.gitignore` 已忽略 `node_modules/`、`app/dist/`、`app/public/`、`.mimosa/`（都能再生成或纯噪音）。
- 仓库身份是本地配置：`user.name=xiuming`、`user.email=xiuming@localhost`（要改自行 `git config`）。

## 验收口径

零错误零警告（`tools/validate_data.js`）+ 页面冒烟全绿（`tools/smoke_pages.mjs`）+ 图件 0 交叠留白≤30（`tools/check_figure_overlap.js <年>`）+ 日志与提交。

## 环境限制

- 沙箱内禁本地网络（`curl 127.0.0.1` 返回 502）、禁 `copyFileSync`（`npm run sync` 报 EPERM），所以验证走 jsdom、同步交回本地执行。
- 本机无 Chrome（headless EXIT=133），SVG 预览用 cairosvg（`~/.workbuddy/binaries/python/envs/default`），预览/量墨迹前都要把 font-family 换成 `Noto Sans CJK SC`。
