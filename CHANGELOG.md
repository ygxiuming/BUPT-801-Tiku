# Changelog

## [2.2.0](https://github.com/ygxiuming/BUPT-801-Tiku/compare/bupt-801-tiku-v2.1.0...bupt-801-tiku-v2.2.0) (2026-10-25)


### 新功能

* **site:** 顶栏、首页与页脚加入 GitHub Star 和赞助入口 ([f88e0e1](https://github.com/ygxiuming/BUPT-801-Tiku/commit/f88e0e11a0a555fd0e8f55e11dc7ce183c19b239))


### 修复

* **2020:** 参照原卷重画第三、八题框图 ([53565f6](https://github.com/ygxiuming/BUPT-801-Tiku/commit/53565f653e5060ec51a22056cdeaa94a22caaf9a))
* **ci:** Release 附件改在同一 workflow 内打包 ([f075f03](https://github.com/ygxiuming/BUPT-801-Tiku/commit/f075f03a1621987bc5910ca1794b2bdf02824302))
* **ci:** 冒烟与审计不再把模块入口当经典脚本执行 ([dcf64a2](https://github.com/ygxiuming/BUPT-801-Tiku/commit/dcf64a269eab1f07524e51fe0ff1c290ca682052))


### 文档

* README 重写为图文版，补充截图巡览与赞助说明 ([8526106](https://github.com/ygxiuming/BUPT-801-Tiku/commit/852610655a7368edbc8be5329a6b6c784d9c62ed))

## [2.1.0](https://github.com/ygxiuming/BUPT-801-Tiku/compare/bupt-801-tiku-v2.0.0...bupt-801-tiku-v2.1.0) (2026-10-25)


### 新功能

* **2020:** 入库 2020 真题（40 空 + 8 大题 110 分 + 11 图） ([49de90d](https://github.com/ygxiuming/BUPT-801-Tiku/commit/49de90d70661efcc7e79687f7b33dcb6b7605147))
* **2021:** 入库 2021 真题（40 空 + 7 大题 + 12 图） ([9e3b3ff](https://github.com/ygxiuming/BUPT-801-Tiku/commit/9e3b3ffb1caf963963a5dac2c7504cc59ca67fb8))
* **2022:** 解析并入库 2022 年 801 真题与答案 ([9a6bc15](https://github.com/ygxiuming/BUPT-801-Tiku/commit/9a6bc15a526bf0db6204178fac0aea04d6566a96))
* **2024:** 入库 2024 真题并打通校验与页面实测 ([a9106f5](https://github.com/ygxiuming/BUPT-801-Tiku/commit/a9106f5c6d24fd7174ccf076006a003efc9fd891))
* **front:** 间隔复习 / ⌘K 全站搜索 / 录入编辑器 / 备份恢复 / 统计图表 ([3c23092](https://github.com/ygxiuming/BUPT-801-Tiku/commit/3c2309286132283b5e19170bb67b1c0b1bb5c2fd))
* **web:** 支持子路径部署，静态托管下自动降级在线 PDF ([026a49a](https://github.com/ygxiuming/BUPT-801-Tiku/commit/026a49a38ab821c95b6c3603ebd4e2324f7a3f24))


### 修复

* **2020:** 去掉第八题框图脚本的重复登记 ([7d8e8e7](https://github.com/ygxiuming/BUPT-801-Tiku/commit/7d8e8e7f510b0e3d8a29672839d1572af9ac0339))
* **2020:** 题干与 11 张图按原卷逐张复核并重绘 ([fe94ba7](https://github.com/ygxiuming/BUPT-801-Tiku/commit/fe94ba773e7c7f01391c3120afb06552c51fcf11))
* **2021:** 14 题升余弦谱按原卷像素实测重画（平顶 8~12、半幅虚线落 7/13），解析依据同步修正 ([bf50a72](https://github.com/ygxiuming/BUPT-801-Tiku/commit/bf50a724002aceb946e2922e3685edd844af9128))
* **2021:** 五张题图逐张对照原卷返工（噪声标签字序/A·B·C端点与位置/采样开关原卷画法/积分框内文/删P(f)与采样字样） ([e4a5aa0](https://github.com/ygxiuming/BUPT-801-Tiku/commit/e4a5aa017d3a13ce3bb55f6dc0ad439acfaffd4b))
* **2022:** 七题框图按原卷实测比例重排，变量改衬线斜体 ([dc47e23](https://github.com/ygxiuming/BUPT-801-Tiku/commit/dc47e23305766527db19760dc3a0f2b14931a4c2))
* **2022:** 七题量化器框图补中段箭头、W 上移对齐原卷 ([9543000](https://github.com/ygxiuming/BUPT-801-Tiku/commit/9543000a14e135125544ac3890118910afae1b30))
* **2022:** 全量复核并重绘图件，对齐原卷与图件规范 ([4558bcc](https://github.com/ygxiuming/BUPT-801-Tiku/commit/4558bccc2c3b4ae43b08ec5d24baebdd0beda4df))
* **2025:** 全年图件美观巡检（pam框宽/psk8new标签分层/q7quant虚线/q8chan与ookpdf去红统一色表） ([90d16a7](https://github.com/ygxiuming/BUPT-801-Tiku/commit/90d16a73f629a100ba621408e2347f9e5998fe89))
* **2025:** 重画题九编码器框图（对照原卷重排比例，加大 ⊕ 与 D 框） ([32979d9](https://github.com/ygxiuming/BUPT-801-Tiku/commit/32979d96eee4c7250fd0122376ada18935909a3e))
* **ci:** 冒烟与审计从 index.html 解析入口 bundle，不再硬编码 assets/app.js ([713033d](https://github.com/ygxiuming/BUPT-801-Tiku/commit/713033d576b8517ab66a535638176745c1c865e5))
* **ci:** 补齐 MutationObserver 等浏览器 Observer 桩 ([f961d1f](https://github.com/ygxiuming/BUPT-801-Tiku/commit/f961d1f0569440d5d8927e1762d877845b38aa61))
* **figures:** 2025 第九题编码器框图按原卷重绘（7:1 扁条 → 4.5:1） ([585f9d2](https://github.com/ygxiuming/BUPT-801-Tiku/commit/585f9d2d240bbcc96c2be9324d1623122541c219))
* **figures:** 统一 2025/2026 图件收边与版式（留白 18px、0 交叠） ([d1e6d7a](https://github.com/ygxiuming/BUPT-801-Tiku/commit/d1e6d7a6951d9e580cd5eee21663688b768b8e6f))
* **pdf:** 打印页与前端统一用 scopeIds 消除图件 DOM id 重复 ([f7d6e89](https://github.com/ygxiuming/BUPT-801-Tiku/commit/f7d6e89975d218b08c74df734841d5fda28753e2))
* **ui:** 顶栏高度变量化、品牌标题排版修正；gitignore 排除编辑器私有目录 ([24cb12c](https://github.com/ygxiuming/BUPT-801-Tiku/commit/24cb12c46887c908d918d40767215e4455beb56f))


### 文档

* **2022:** 交接文档待办去掉已入库的 2022 ([7b8e4c9](https://github.com/ygxiuming/BUPT-801-Tiku/commit/7b8e4c914acb14e0795f6c650d6036610fdc3243))
* **skill:** 图件格式规范收进技能（留白 18、线型色表、间距、同类图对照） ([f6f28c4](https://github.com/ygxiuming/BUPT-801-Tiku/commit/f6f28c48ddc0a9eb02a0d1b6cd1c2c574b34d7c8))
* **skill:** 补 svgkit 两条硬规矩与预览脚本用法（同步用户级技能） ([56a0435](https://github.com/ygxiuming/BUPT-801-Tiku/commit/56a04359e33a87eadae6adeea9d355d318e1fcce))
* **skill:** 补一题多空卷面、head_at 原点、/bin/cp、Math.erfc、冒烟路由五处踩坑 ([fc20559](https://github.com/ygxiuming/BUPT-801-Tiku/commit/fc2055998e494215ba86a715123d1d84c43f941a))
* 入库流程补 git 与解析日志环节 ([16913d9](https://github.com/ygxiuming/BUPT-801-Tiku/commit/16913d9bc8a2f06b67ef7b7929941cbaf769d4ac))
* 新增解析日志（2023 入库记录 + 记录规则） ([6546fa2](https://github.com/ygxiuming/BUPT-801-Tiku/commit/6546fa2d3424655f3951c3fa4c678f1c9c1744fa))
* 站点审核报告 + 文档更新 + 解析日志 ([5ca3749](https://github.com/ygxiuming/BUPT-801-Tiku/commit/5ca37492554c35fa3d81ba45bee4a9827a45b9f6))
* 补项目记忆（git 与日志制度、验收口径、2024 半成品待办） ([a1e6bf9](https://github.com/ygxiuming/BUPT-801-Tiku/commit/a1e6bf9c8be7e108d36ef3d42cc918283213fded))
* 重写 README 并补齐开源配套（贡献指南、issue 模板、许可） ([fa4a821](https://github.com/ygxiuming/BUPT-801-Tiku/commit/fa4a8219e3fb9186d3d33e23d76d5a1c3202076e))
