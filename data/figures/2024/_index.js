// 2024 图库注册表 —— 由 tools/emit_figures.mjs / server 启动同步自动生成；
// 源文件：data/images/2024/**（原卷截图，唯一维护对象）→ 优先级最高
//         data/figures/2024/**.svg（历史矢量，只读保留，没有同名截图时才用）
// 有截图的 key 注册为位图描述符 { src, w, h }，否则注册 svg 字符串；勿手改本文件
window.BUPT801 = window.BUPT801 || {};
window.BUPT801.figures = window.BUPT801.figures || {};
window.BUPT801.figureMeta = window.BUPT801.figureMeta || {};

(window.BUPT801.figures["2024"] = window.BUPT801.figures["2024"] || {}).q3tx = { src: '/data/images/2024/answer/2024-三-q3tx.png', w: 1336, h: 409 };
(window.BUPT801.figures["2024"] = window.BUPT801.figures["2024"] || {}).q3block = { src: '/data/images/2024/answer/2024-三-q3block.png', w: 1366, h: 424 };
(window.BUPT801.figures["2024"] = window.BUPT801.figures["2024"] || {}).q4recv = { src: '/data/images/2024/2024-四-q4recv.png', w: 1249, h: 255 };
(window.BUPT801.figures["2024"] = window.BUPT801.figures["2024"] || {}).q6const = { src: '/data/images/2024/answer/2024-六-q6const.png', w: 1063, h: 882 };
(window.BUPT801.figures["2024"] = window.BUPT801.figures["2024"] || {}).q6voronoi = { src: '/data/images/2024/answer/2024-六-q6voronoi.png', w: 1231, h: 978 };
(window.BUPT801.figures["2024"] = window.BUPT801.figures["2024"] || {}).q8state = { src: '/data/images/2024/2024-八-q8state.png', w: 1339, h: 640 };
(window.BUPT801.figures["2024"] = window.BUPT801.figures["2024"] || {}).q8enc = { src: '/data/images/2024/answer/2024-八-q8enc.png', w: 1251, h: 520 };
(window.BUPT801.figures["2024"] = window.BUPT801.figures["2024"] || {}).q8trellis = { src: '/data/images/2024/answer/2024-八-q8trellis.png', w: 1335, h: 1383 };
(window.BUPT801.figures["2024"] = window.BUPT801.figures["2024"] || {}).q9recv = { src: '/data/images/2024/2024-九-q9recv.png', w: 1357, h: 264 };
(window.BUPT801.figures["2024"] = window.BUPT801.figures["2024"] || {}).q10quant = { src: '/data/images/2024/answer/2024-十-q10quant.png', w: 1242, h: 639 };

(window.BUPT801.figureMeta["2024"] = window.BUPT801.figureMeta["2024"] || {}).q3tx = { q: "题三", kind: "answer", desc: "16QAM 发送框图（α=1/7 根升余弦成形）" };
(window.BUPT801.figureMeta["2024"] = window.BUPT801.figureMeta["2024"] || {}).q3block = { q: "题三", kind: "answer", desc: "16QAM 相干接收框图（根升余弦匹配滤波+四进制判决）" };
(window.BUPT801.figureMeta["2024"] = window.BUPT801.figureMeta["2024"] || {}).q4recv = { q: "题四", kind: "paper", desc: "DSB-SC 相干解调接收机框图" };
(window.BUPT801.figureMeta["2024"] = window.BUPT801.figureMeta["2024"] || {}).q6const = { q: "题六", kind: "answer", desc: "8 点星座图（s1~s8 位置）" };
(window.BUPT801.figureMeta["2024"] = window.BUPT801.figureMeta["2024"] || {}).q6voronoi = { q: "题六", kind: "answer", desc: "最大似然判决域（Voronoi 胞）" };
(window.BUPT801.figureMeta["2024"] = window.BUPT801.figureMeta["2024"] || {}).q8state = { q: "题八", kind: "paper", desc: "(3,1,3) 卷积码状态转移图" };
(window.BUPT801.figureMeta["2024"] = window.BUPT801.figureMeta["2024"] || {}).q8enc = { q: "题八", kind: "answer", desc: "卷积码编码器原理框图（3 级移位寄存器）" };
(window.BUPT801.figureMeta["2024"] = window.BUPT801.figureMeta["2024"] || {}).q8trellis = { q: "题八", kind: "answer", desc: "维特比网格图与幸存路径（收码 11111111）" };
(window.BUPT801.figureMeta["2024"] = window.BUPT801.figureMeta["2024"] || {}).q9recv = { q: "题九", kind: "paper", desc: "二进制反极性波形相关接收机框图" };
(window.BUPT801.figureMeta["2024"] = window.BUPT801.figureMeta["2024"] || {}).q10quant = { q: "题十", kind: "answer", desc: "量化器输入概率密度 p(x)=x/2 与量化区间" };
