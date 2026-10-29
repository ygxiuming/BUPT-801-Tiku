// 2025 图库注册表 —— 由 tools/emit_figures.mjs / server 启动同步自动生成；
// 源文件：data/images/2025/**（原卷截图，唯一维护对象）→ 优先级最高
//         data/figures/2025/**.svg（历史矢量，只读保留，没有同名截图时才用）
// 有截图的 key 注册为位图描述符 { src, w, h }，否则注册 svg 字符串；勿手改本文件
window.BUPT801 = window.BUPT801 || {};
window.BUPT801.figures = window.BUPT801.figures || {};
window.BUPT801.figureMeta = window.BUPT801.figureMeta || {};

(window.BUPT801.figures["2025"] = window.BUPT801.figures["2025"] || {}).q2psd = { src: '/data/images/2025/answer/2025-二-q2psd.png', w: 1431, h: 678 };
(window.BUPT801.figures["2025"] = window.BUPT801.figures["2025"] || {}).ssb = { src: '/data/images/2025/2025-三-ssb.png', w: 920, h: 230 };
(window.BUPT801.figures["2025"] = window.BUPT801.figures["2025"] || {}).q3psd = { src: '/data/images/2025/answer/2025-三-q3psd.png', w: 1485, h: 371 };
(window.BUPT801.figures["2025"] = window.BUPT801.figures["2025"] || {}).pam = { src: '/data/images/2025/2025-四-pam.png', w: 1063, h: 295 };
(window.BUPT801.figures["2025"] = window.BUPT801.figures["2025"] || {}).q4x = { src: '/data/images/2025/answer/2025-四-q4x.png', w: 1495, h: 502 };
(window.BUPT801.figures["2025"] = window.BUPT801.figures["2025"] || {}).ookpdf = { src: '/data/images/2025/answer/2025-五-ookpdf.png', w: 1492, h: 603 };
(window.BUPT801.figures["2025"] = window.BUPT801.figures["2025"] || {}).psk8 = { src: '/data/images/2025/answer/2025-六-psk8.png', w: 1427, h: 1379 };
(window.BUPT801.figures["2025"] = window.BUPT801.figures["2025"] || {}).psk8new = { src: '/data/images/2025/answer/2025-六-psk8new.png', w: 1406, h: 1522 };
(window.BUPT801.figures["2025"] = window.BUPT801.figures["2025"] || {}).q7quant = { src: '/data/images/2025/answer/2025-七-q7quant.png', w: 1523, h: 435 };
(window.BUPT801.figures["2025"] = window.BUPT801.figures["2025"] || {}).q8chan = { src: '/data/images/2025/answer/2025-八-q8chan.png', w: 1462, h: 823 };
(window.BUPT801.figures["2025"] = window.BUPT801.figures["2025"] || {}).encoder = { src: '/data/images/2025/2025-九-encoder.png', w: 1011, h: 295 };

(window.BUPT801.figureMeta["2025"] = window.BUPT801.figureMeta["2025"] || {}).q2psd = { q: "题二", kind: "answer", desc: "带限白噪声功率谱：高 N0/2、宽 2B 的矩形" };
(window.BUPT801.figureMeta["2025"] = window.BUPT801.figureMeta["2025"] || {}).ssb = { q: "题三", kind: "paper", desc: "SSB 相干解调接收机框图（信道→BPF→乘 2cos→LPF）" };
(window.BUPT801.figureMeta["2025"] = window.BUPT801.figureMeta["2025"] || {}).q3psd = { q: "题三", kind: "answer", desc: "m(t) 功率谱：±400（幅度1）与 ±900（幅度1/4）四条谱线" };
(window.BUPT801.figureMeta["2025"] = window.BUPT801.figureMeta["2025"] || {}).pam = { q: "题四", kind: "paper", desc: "PAM 传输系统框图（A→B 总体 X(f),x(t)，C 点采样）" };
(window.BUPT801.figureMeta["2025"] = window.BUPT801.figureMeta["2025"] || {}).q4x = { q: "题四", kind: "answer", desc: "A→B 总体冲激响应 x(t)=sinc(t/Ts)−sinc((t−2Ts)/Ts)" };
(window.BUPT801.figureMeta["2025"] = window.BUPT801.figureMeta["2025"] || {}).ookpdf = { q: "题五", kind: "answer", desc: "两个条件 PDF 与最佳门限 VT=E1/2" };
(window.BUPT801.figureMeta["2025"] = window.BUPT801.figureMeta["2025"] || {}).psk8 = { q: "题六", kind: "answer", desc: "8PSK 星座、ML 判决域（8×45° 扇区）与格雷映射" };
(window.BUPT801.figureMeta["2025"] = window.BUPT801.figureMeta["2025"] || {}).psk8new = { q: "题六", kind: "answer", desc: "新星座 Ω′（内点 r=1/2）的 ML 判决域：楔形边界不过原点" };
(window.BUPT801.figureMeta["2025"] = window.BUPT801.figureMeta["2025"] || {}).q7quant = { q: "题七", kind: "answer", desc: "三角分布 p(x)=(4−|x|)/16 与四电平量化特性 Y=Q(x)" };
(window.BUPT801.figureMeta["2025"] = window.BUPT801.figureMeta["2025"] || {}).q8chan = { q: "题八", kind: "answer", desc: "信道转移图：各以 1/2 概率直通或打成 3" };
(window.BUPT801.figureMeta["2025"] = window.BUPT801.figureMeta["2025"] || {}).encoder = { q: "题九", kind: "paper", desc: "两级 (7,4) 编码器框图（u→G1→b→g 卷积→c）" };
