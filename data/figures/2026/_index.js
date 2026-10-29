// 2026 图库注册表 —— 由 tools/emit_figures.mjs / server 启动同步自动生成；
// 源文件：data/images/2026/**（原卷截图，唯一维护对象）→ 优先级最高
//         data/figures/2026/**.svg（历史矢量，只读保留，没有同名截图时才用）
// 有截图的 key 注册为位图描述符 { src, w, h }，否则注册 svg 字符串；勿手改本文件
window.BUPT801 = window.BUPT801 || {};
window.BUPT801.figures = window.BUPT801.figures || {};
window.BUPT801.figureMeta = window.BUPT801.figureMeta || {};

(window.BUPT801.figures["2026"] = window.BUPT801.figures["2026"] || {}).q2psd = { src: '/data/images/2026/answer/2026-二-q2psd.png', w: 1512, h: 322 };
(window.BUPT801.figures["2026"] = window.BUPT801.figures["2026"] || {}).q3recv = { src: '/data/images/2026/2026-三-q3recv.png', w: 1362, h: 387 };
(window.BUPT801.figures["2026"] = window.BUPT801.figures["2026"] || {}).q5stem = { src: '/data/images/2026/2026-五-q5stem.png', w: 1273, h: 1114 };
(window.BUPT801.figures["2026"] = window.BUPT801.figures["2026"] || {}).q5const = { src: '/data/images/2026/answer/2026-五-q5const.png', w: 1350, h: 1120 };
(window.BUPT801.figures["2026"] = window.BUPT801.figures["2026"] || {}).q6block = { src: '/data/images/2026/2026-六-q6block.png', w: 1411, h: 649 };

(window.BUPT801.figureMeta["2026"] = window.BUPT801.figureMeta["2026"] || {}).q2psd = { q: "题二", kind: "answer", desc: "功率谱" };
(window.BUPT801.figureMeta["2026"] = window.BUPT801.figureMeta["2026"] || {}).q3recv = { q: "题三", kind: "paper", desc: "相关接收机框图" };
(window.BUPT801.figureMeta["2026"] = window.BUPT801.figureMeta["2026"] || {}).q5stem = { q: "题五", kind: "paper", desc: "16QAM 星座题图" };
(window.BUPT801.figureMeta["2026"] = window.BUPT801.figureMeta["2026"] || {}).q5const = { q: "题五", kind: "answer", desc: "格雷映射与判决域" };
(window.BUPT801.figureMeta["2026"] = window.BUPT801.figureMeta["2026"] || {}).q6block = { q: "题六", kind: "paper", desc: "调制框图" };
