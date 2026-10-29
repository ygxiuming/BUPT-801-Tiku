// 2021 图库注册表 —— 由 tools/emit_figures.mjs / server 启动同步自动生成；
// 源文件：data/images/2021/**（原卷截图，唯一维护对象）→ 优先级最高
//         data/figures/2021/**.svg（历史矢量，只读保留，没有同名截图时才用）
// 有截图的 key 注册为位图描述符 { src, w, h }，否则注册 svg 字符串；勿手改本文件
window.BUPT801 = window.BUPT801 || {};
window.BUPT801.figures = window.BUPT801.figures || {};
window.BUPT801.figureMeta = window.BUPT801.figureMeta || {};

(window.BUPT801.figures["2021"] = window.BUPT801.figures["2021"] || {}).q14rc = { src: '/data/images/2021/2021-一-q14rc.png', w: 1243, h: 322 };
(window.BUPT801.figures["2021"] = window.BUPT801.figures["2021"] || {}).q2block = { src: '/data/images/2021/2021-二-q2block.png', w: 1180, h: 250 };
(window.BUPT801.figures["2021"] = window.BUPT801.figures["2021"] || {}).q2psd2 = { src: '/data/images/2021/answer/2021-二-q2psd2.png', w: 2170, h: 725 };
(window.BUPT801.figures["2021"] = window.BUPT801.figures["2021"] || {}).q2psd3 = { src: '/data/images/2021/answer/2021-二-q2psd3.png', w: 1878, h: 378 };
(window.BUPT801.figures["2021"] = window.BUPT801.figures["2021"] || {}).q3block = { src: '/data/images/2021/2021-三-q3block.png', w: 1179, h: 199 };
(window.BUPT801.figures["2021"] = window.BUPT801.figures["2021"] || {}).q3ht = { src: '/data/images/2021/answer/2021-三-q3ht.png', w: 1278, h: 394 };
(window.BUPT801.figures["2021"] = window.BUPT801.figures["2021"] || {}).q3eye1 = { src: '/data/images/2021/answer/2021-三-q3eye1.png', w: 553, h: 411 };
(window.BUPT801.figures["2021"] = window.BUPT801.figures["2021"] || {}).q3eye2 = { src: '/data/images/2021/answer/2021-三-q3eye2.png', w: 558, h: 444 };
(window.BUPT801.figures["2021"] = window.BUPT801.figures["2021"] || {}).q4rx = { src: '/data/images/2021/2021-四-q4rx.png', w: 1057, h: 205 };
(window.BUPT801.figures["2021"] = window.BUPT801.figures["2021"] || {}).q5stem = { src: '/data/images/2021/2021-五-q5stem.png', w: 1311, h: 1200 };
(window.BUPT801.figures["2021"] = window.BUPT801.figures["2021"] || {}).q5region = { src: '/data/images/2021/answer/2021-五-q5region.png', w: 699, h: 753 };
(window.BUPT801.figures["2021"] = window.BUPT801.figures["2021"] || {}).q6pdf = { src: '/data/images/2021/answer/2021-六-q6pdf.png', w: 1342, h: 695 };
(window.BUPT801.figures["2021"] = window.BUPT801.figures["2021"] || {}).q7enc = { src: '/data/images/2021/answer/2021-七-q7enc.png', w: 1165, h: 708 };

(window.BUPT801.figureMeta["2021"] = window.BUPT801.figureMeta["2021"] || {}).q14rc = { q: "题一", kind: "paper", desc: "升余弦滚降功率谱" };
(window.BUPT801.figureMeta["2021"] = window.BUPT801.figureMeta["2021"] || {}).q2block = { q: "题二", kind: "paper", desc: "SSB 相干解调框图" };
(window.BUPT801.figureMeta["2021"] = window.BUPT801.figureMeta["2021"] || {}).q2psd2 = { q: "题二", kind: "answer", desc: "BPF 1000~1100 Hz 时 A/B 点噪声谱" };
(window.BUPT801.figureMeta["2021"] = window.BUPT801.figureMeta["2021"] || {}).q2psd3 = { q: "题二", kind: "answer", desc: "BPF 950~1100 Hz 时 A/B 点噪声谱" };
(window.BUPT801.figureMeta["2021"] = window.BUPT801.figureMeta["2021"] || {}).q3block = { q: "题三", kind: "paper", desc: "双极性 PAM 传输系统框图" };
(window.BUPT801.figureMeta["2021"] = window.BUPT801.figureMeta["2021"] || {}).q3ht = { q: "题三", kind: "answer", desc: "收发总响应 h(t)=sinc(t) 波形" };
(window.BUPT801.figureMeta["2021"] = window.BUPT801.figureMeta["2021"] || {}).q3eye1 = { q: "题三", kind: "answer", desc: "T_b=1 s 眼图" };
(window.BUPT801.figureMeta["2021"] = window.BUPT801.figureMeta["2021"] || {}).q3eye2 = { q: "题三", kind: "answer", desc: "T_b=0.5 s 眼图" };
(window.BUPT801.figureMeta["2021"] = window.BUPT801.figureMeta["2021"] || {}).q4rx = { q: "题四", kind: "paper", desc: "2PSK 相关接收框图" };
(window.BUPT801.figureMeta["2021"] = window.BUPT801.figureMeta["2021"] || {}).q5stem = { q: "题五", kind: "paper", desc: "12 进制星座图" };
(window.BUPT801.figureMeta["2021"] = window.BUPT801.figureMeta["2021"] || {}).q5region = { q: "题五", kind: "answer", desc: "12 进制最佳判决域" };
(window.BUPT801.figureMeta["2021"] = window.BUPT801.figureMeta["2021"] || {}).q6pdf = { q: "题六", kind: "answer", desc: "量化器输出概率密度" };
(window.BUPT801.figureMeta["2021"] = window.BUPT801.figureMeta["2021"] || {}).q7enc = { q: "题七", kind: "answer", desc: "(3,1,4) 卷积码编码器框图" };
