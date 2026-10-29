// 2023 图库注册表 —— 由 tools/emit_figures.mjs / server 启动同步自动生成；
// 源文件：data/images/2023/**（原卷截图，唯一维护对象）→ 优先级最高
//         data/figures/2023/**.svg（历史矢量，只读保留，没有同名截图时才用）
// 有截图的 key 注册为位图描述符 { src, w, h }，否则注册 svg 字符串；勿手改本文件
window.BUPT801 = window.BUPT801 || {};
window.BUPT801.figures = window.BUPT801.figures || {};
window.BUPT801.figureMeta = window.BUPT801.figureMeta || {};

(window.BUPT801.figures["2023"] = window.BUPT801.figures["2023"] || {}).q7spec = { src: '/data/images/2023/2023-一-q7spec.png', w: 702, h: 283 };
(window.BUPT801.figures["2023"] = window.BUPT801.figures["2023"] || {}).q2sys = { src: '/data/images/2023/2023-二-q2sys.png', w: 1017, h: 202 };
(window.BUPT801.figures["2023"] = window.BUPT801.figures["2023"] || {}).q2psd = { src: '/data/images/2023/answer/2023-二-q2psd.png', w: 873, h: 180 };
(window.BUPT801.figures["2023"] = window.BUPT801.figures["2023"] || {}).q4mf = { src: '/data/images/2023/answer/2023-四-q4mf.png', w: 745, h: 408 };
(window.BUPT801.figures["2023"] = window.BUPT801.figures["2023"] || {}).q5const = { src: '/data/images/2023/2023-五-q5const.png', w: 682, h: 384 };
(window.BUPT801.figures["2023"] = window.BUPT801.figures["2023"] || {}).q5dec = { src: '/data/images/2023/answer/2023-五-q5dec.png', w: 739, h: 396 };
(window.BUPT801.figures["2023"] = window.BUPT801.figures["2023"] || {}).q5vor = { src: '/data/images/2023/answer/2023-五-q5vor.png', w: 1030, h: 525 };
(window.BUPT801.figures["2023"] = window.BUPT801.figures["2023"] || {}).q6sys = { src: '/data/images/2023/2023-六-q6sys.png', w: 999, h: 247 };
(window.BUPT801.figures["2023"] = window.BUPT801.figures["2023"] || {}).q7enc = { src: '/data/images/2023/answer/2023-七-q7enc.png', w: 1311, h: 487 };
(window.BUPT801.figures["2023"] = window.BUPT801.figures["2023"] || {}).q7state = { src: '/data/images/2023/answer/2023-七-q7state.png', w: 1275, h: 466 };
(window.BUPT801.figures["2023"] = window.BUPT801.figures["2023"] || {}).q7trellis = { src: '/data/images/2023/answer/2023-七-q7trellis.png', w: 1353, h: 939 };
(window.BUPT801.figures["2023"] = window.BUPT801.figures["2023"] || {}).q8sys = { src: '/data/images/2023/2023-八-q8sys.png', w: 609, h: 126 };
(window.BUPT801.figures["2023"] = window.BUPT801.figures["2023"] || {}).q8huff = { src: '/data/images/2023/answer/2023-八-q8huff.png', w: 1347, h: 468 };
(window.BUPT801.figures["2023"] = window.BUPT801.figures["2023"] || {}).q9sys = { src: '/data/images/2023/2023-九-q9sys.png', w: 1009, h: 202 };
(window.BUPT801.figures["2023"] = window.BUPT801.figures["2023"] || {}).q9mod = { src: '/data/images/2023/answer/2023-九-q9mod.png', w: 1347, h: 468 };
(window.BUPT801.figures["2023"] = window.BUPT801.figures["2023"] || {}).q9demod = { src: '/data/images/2023/answer/2023-九-q9demod.png', w: 1338, h: 510 };
(window.BUPT801.figures["2023"] = window.BUPT801.figures["2023"] || {}).q9psd = { src: '/data/images/2023/answer/2023-九-q9psd.png', w: 1341, h: 520 };

(window.BUPT801.figureMeta["2023"] = window.BUPT801.figureMeta["2023"] || {}).q7spec = { q: "题一(7)", kind: "paper", desc: "第7题 基带系统梯形（升余弦滚降）功率谱" };
(window.BUPT801.figureMeta["2023"] = window.BUPT801.figureMeta["2023"] || {}).q2sys = { q: "题二", kind: "paper", desc: "窄带噪声→解析信号/复包络/正交分量框图" };
(window.BUPT801.figureMeta["2023"] = window.BUPT801.figureMeta["2023"] || {}).q2psd = { q: "题二", kind: "answer", desc: "z(t)、n_L(t)、n_c(t) 功率谱密度" };
(window.BUPT801.figureMeta["2023"] = window.BUPT801.figureMeta["2023"] || {}).q4mf = { q: "题四", kind: "answer", desc: "匹配滤波器 h(t)=g(T_b−t) 波形" };
(window.BUPT801.figureMeta["2023"] = window.BUPT801.figureMeta["2023"] || {}).q5const = { q: "题五", kind: "paper", desc: "八进制星座图（4 个全等正三角形）" };
(window.BUPT801.figureMeta["2023"] = window.BUPT801.figureMeta["2023"] || {}).q5dec = { q: "题五", kind: "answer", desc: "s1 的最佳判决域（右上开口楔形）" };
(window.BUPT801.figureMeta["2023"] = window.BUPT801.figureMeta["2023"] || {}).q5vor = { q: "题五", kind: "answer", desc: "8 点完整判决区域划分" };
(window.BUPT801.figureMeta["2023"] = window.BUPT801.figureMeta["2023"] || {}).q6sys = { q: "题六", kind: "paper", desc: "双信道分路传输与功率分配框图" };
(window.BUPT801.figureMeta["2023"] = window.BUPT801.figureMeta["2023"] || {}).q7enc = { q: "题七", kind: "answer", desc: "(2,1,3) 卷积码编码器框图" };
(window.BUPT801.figureMeta["2023"] = window.BUPT801.figureMeta["2023"] || {}).q7state = { q: "题七", kind: "answer", desc: "4 状态状态转移图（8 条支路）" };
(window.BUPT801.figureMeta["2023"] = window.BUPT801.figureMeta["2023"] || {}).q7trellis = { q: "题七", kind: "answer", desc: "输入 11 的累积度量更新（幸存/淘汰）" };
(window.BUPT801.figureMeta["2023"] = window.BUPT801.figureMeta["2023"] || {}).q8sys = { q: "题八", kind: "paper", desc: "量化与哈夫曼编码框图" };
(window.BUPT801.figureMeta["2023"] = window.BUPT801.figureMeta["2023"] || {}).q8huff = { q: "题八", kind: "answer", desc: "哈夫曼编码树（码字 0/10/110/111）" };
(window.BUPT801.figureMeta["2023"] = window.BUPT801.figureMeta["2023"] || {}).q9sys = { q: "题九", kind: "paper", desc: "采样—编码—复用—循环码—64QAM 链路框图" };
(window.BUPT801.figureMeta["2023"] = window.BUPT801.figureMeta["2023"] || {}).q9mod = { q: "题九", kind: "answer", desc: "64QAM 调制框图" };
(window.BUPT801.figureMeta["2023"] = window.BUPT801.figureMeta["2023"] || {}).q9demod = { q: "题九", kind: "answer", desc: "64QAM 相干解调框图" };
(window.BUPT801.figureMeta["2023"] = window.BUPT801.figureMeta["2023"] || {}).q9psd = { q: "题九", kind: "answer", desc: "E 点单边功率谱（平顶 15 kHz、滚降至 25 kHz）" };
