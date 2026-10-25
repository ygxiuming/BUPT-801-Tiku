# 北邮801刷题网站：渲染bug修复 + 图片放大弹窗 + 功能完善

## 已确认的结论
- `web/` 文件夹已删除，无需处理；但根目录 `README.md` 和 `skills/bupt801/SKILL.md` 仍描述旧的 `web/` 静态站结构，需同步更新为新架构（`app/` Vue + `server/` Node）。
- 所有渲染问题根因已逐一在代码中定位（见下），都可精准修复。
- 部署形态：维持 Node 服务器（Express + Puppeteer 在线生成PDF），补浏览器打印按钮作备选。

## 一、渲染 bug 修复（必做，均已在代码中定位根因）
1. **【最严重】试卷页路由未开 props，年份传不进去**：`router.js:12` 路由 `/paper/:year` 缺 `props: true`，`PaperView.vue:32` 声明的 `year` prop 恒为 `undefined` → `figureSvg(undefined, key)` 查不到图 → **试卷页所有 SVG 题图不显示**；`pdfUrl()` 生成 `/api/pdf/undefined/...` → **PDF 下载也是坏的**；试卷内容靠兜底 `|| 第一份卷子` 碰巧能看，多年份时会静默显示错年份。修复：路由加 `props: true`，并对无效年份显示明确错误而不是静默兜底。
2. **选择题选项公式不渲染**：`OptTable.vue:6` 选项 `v-html` 的 span 缺 `math-zone` class，`renderMathZones()` 扫不到 → 刷题/考试模式下含 `$...$` 的选项（数据里大量存在，如 `$1+x^3$`）显示原始 LaTeX。修复：加 `math-zone` class。
3. **大题解析步骤标题公式不渲染**：`BigSol.vue:5` `<summary>{{ st.q }}</summary>` 是纯文本插值且不在 math-zone → 步骤标题（如「(1) $g(t)$ 的能量谱密度」）显示原始 LaTeX。修复：改 `v-html` + `math-zone`。
4. **考试「回顾全卷」阶段公式全不渲染**：`ExamView.vue` 从成绩页进入 review 阶段时无人调用 `renderMathZones`。修复：watch `stage`，变化后 `$nextTick` 渲染。
5. **PaperView 危险渲染范围**：对整个 `.paper-sheet`（含 Vue 管理的插值节点）跑 KaTeX auto-render，一旦标题/note 含 `$` 就会破坏 vdom 冻结视图。修复：只对 v-html 容器 `bodyEl` 渲染。
6. **错题本入口不带筛选**：`StatsView.vue` 错题条目链到 `/practice` 无参数。修复：改 `/practice?wrong=1`。
7. **路由无兜底**：未知路径白屏，加 catch-all 重定向到 `/`。
8. **移动端适配**：`.paper-sheet` 62px 边距、顶栏导航窄屏溢出等，加 media query。

## 二、图片放大弹窗（核心需求）
新建 `Lightbox.vue` + `lib/lightbox.js`（reactive store），挂载在 `App.vue`：
- **捕获方式**：document 级点击事件委托，命中 `.figblock` 即打开——一套机制同时覆盖 FigBlock 组件（题图/解析步骤图）和 PaperView 的 v-html 内联图。
- **弹窗交互**：全屏遮罩 + 居中大图（SVG 带 viewBox，`transform: scale/translate` 无损缩放）；**滚轮缩放**（以鼠标位置为缩放锚点）；拖拽平移；缩放比例实时显示；双击/按钮复位；**右上角 × 关闭**，另支持 Esc、点遮罩关闭。
- **入口提示**：题图 hover 显示 `zoom-in` 光标 + 「点击放大」角标。

## 三、增强功能（已确认全做，参考真题墙）
1. **三档掌握度**：`records.js` 扩展 `level`（会/模糊/不会）与模糊计数；PracticeView 自评升级三档；StatsView 增加三档统计。
2. **题目收藏**：QuestionCard 加 ☆/★ 星标（`rec[id].star`）；PracticeView 筛选加「只看收藏」；StatsView 加收藏清单。
3. **键盘快捷键**（刷题+考试页）：`A~D` 选项、`←/→` 切题、`Enter/Space` 查看解析、`1/2/3` 三档自评、`S` 收藏、`Esc` 关弹窗；卡片显示快捷键提示。
4. **相关题目推荐**：解析展开后列出同知识点其他真题（≤4条，年份+题号），点击跳转作答（在当前队列内跳，不在队列则插入队首跳转）。
5. **模考中断恢复**：进行中的考试状态（设置、答题卡、标记、自评、剩余时间）实时写 localStorage，重开时提示「继续上次考试 / 重新开始」，交卷/重置后清除。
6. **试卷页打印按钮**：`window.print()` + `@media print` 样式（隐藏顶栏/按钮、A4 化），作为在线 PDF 之外的备选。

## 四、文档同步
- 重写 `README.md`：新架构（app/server/data）、启动命令（`npm run dev` / `build` / `server npm start`）、功能清单。
- 更新项目内 `skills/bupt801/SKILL.md`：目录结构与浏览器实测步骤同步为 Vue 版。

## 实施与验证顺序
1. 修 bug（一）→ 2. Lightbox（二）→ 3. 增强功能（三）→ 4. 文档（四）→ 5. `npm run build` + 启动 server，浏览器实测：首页/试卷页（重点核对 SVG 图显示与 PDF 链接）/刷题全流程/考试全流程（含中断恢复）/统计页逐页截图核对，确认全站无 `.katex-error`、无残留原始 `$...$`；图片弹窗（滚轮/拖拽/关闭）、快捷键、收藏、掌握度、相关题目逐项操作验证；窄屏截图检查响应式。