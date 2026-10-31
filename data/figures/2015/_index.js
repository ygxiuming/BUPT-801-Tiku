// 2015 图库注册表 —— 由 tools/emit_figures.mjs / server 启动同步自动生成；
// 源文件：data/images/2015/**（原卷截图，唯一维护对象）→ 优先级最高
//         data/figures/2015/**.svg（历史矢量，只读保留，没有同名截图时才用）
// 有截图的 key 注册为位图描述符 { src, w, h }，否则注册 svg 字符串；勿手改本文件
window.BUPT801 = window.BUPT801 || {};
window.BUPT801.figures = window.BUPT801.figures || {};
window.BUPT801.figureMeta = window.BUPT801.figureMeta || {};

(window.BUPT801.figures["2015"] = window.BUPT801.figures["2015"] || {}).p3ssb = { src: '/data/images/2015/2015-三-p3ssb.png', w: 966, h: 259 };
(window.BUPT801.figures["2015"] = window.BUPT801.figures["2015"] || {}).p6base = { src: '/data/images/2015/2015-六-p6base.png', w: 1369, h: 346 };
(window.BUPT801.figures["2015"] = window.BUPT801.figures["2015"] || {}).p8recv = { src: '/data/images/2015/2015-八-p8recv.png', w: 1388, h: 351 };
(window.BUPT801.figures["2015"] = window.BUPT801.figures["2015"] || {}).p9const = { src: '/data/images/2015/2015-九-p9const.png', w: 1092, h: 646 };
(window.BUPT801.figures["2015"] = window.BUPT801.figures["2015"] || {}).p10pdf = { src: '/data/images/2015/2015-十-p10pdf.png', w: 1434, h: 643 };
(window.BUPT801.figures["2015"] = window.BUPT801.figures["2015"] || {}).p12chan = { src: '/data/images/2015/2015-十二-p12chan.png', w: 1362, h: 493 };
(window.BUPT801.figures["2015"] = window.BUPT801.figures["2015"] || {}).a3ps = { src: '/data/images/2015/answer/2015-三-a3ps.png', w: 1465, h: 498 };
(window.BUPT801.figures["2015"] = window.BUPT801.figures["2015"] || {}).a4tx = { src: '/data/images/2015/answer/2015-四-a4tx.png', w: 1439, h: 644 };
(window.BUPT801.figures["2015"] = window.BUPT801.figures["2015"] || {}).a4rx = { src: '/data/images/2015/answer/2015-四-a4rx.png', w: 1444, h: 630 };
(window.BUPT801.figures["2015"] = window.BUPT801.figures["2015"] || {}).a5ps = { src: '/data/images/2015/answer/2015-五-a5ps.png', w: 1382, h: 490 };
(window.BUPT801.figures["2015"] = window.BUPT801.figures["2015"] || {}).a7enc = { src: '/data/images/2015/answer/2015-七-a7enc.png', w: 1435, h: 612 };
(window.BUPT801.figures["2015"] = window.BUPT801.figures["2015"] || {}).a9region = { src: '/data/images/2015/answer/2015-九-a9region.png', w: 1369, h: 1025 };

(window.BUPT801.figureMeta["2015"] = window.BUPT801.figureMeta["2015"] || {}).p3ssb = { q: "题三", kind: "paper", desc: "上边带 SSB 相干解调系统：m(t)→上边带SSB调制(cos2πf_c t)→s(t)→⊕n_w(t)→BPF→⊗2cos2πf_c t→LPF" };
(window.BUPT801.figureMeta["2015"] = window.BUPT801.figureMeta["2015"] || {}).p6base = { q: "题六", kind: "paper", desc: "数字基带系统：d(t)=Σa_nδ(t−nT_s)→发送滤波器 G_T(f)→s(t)→接收滤波器 G_R(f)→y(t)→t=nT_s 抽样；总特性 X(f)=G_T·G_R" };
(window.BUPT801.figureMeta["2015"] = window.BUPT801.figureMeta["2015"] || {}).p8recv = { q: "题八", kind: "paper", desc: "相关接收机：s_1/s_2→⊕n_w(t)→⊗2cos2πf_c t→(1/T_b)∫₀^{T_b}( )dt→y→判决" };
(window.BUPT801.figureMeta["2015"] = window.BUPT801.figureMeta["2015"] || {}).p9const = { q: "题九", kind: "paper", desc: "四进制星座：s_1 在原点，s_2/s_3/s_4 为重心在原点的正三角形顶点，归一化正交基 f_1(t)/f_2(t)" };
(window.BUPT801.figureMeta["2015"] = window.BUPT801.figureMeta["2015"] || {}).p10pdf = { q: "题十", kind: "paper", desc: "X 的阶梯密度 p(x)：[−0.5,0) 高 1、[0,0.25] 高 2，横轴标注量化电平 b、a" };
(window.BUPT801.figureMeta["2015"] = window.BUPT801.figureMeta["2015"] || {}).p12chan = { q: "题十二", kind: "paper", desc: "级联加法信道：X→Σ(+Z_1)→Σ(+Z_2)→Y，三个独立等概 ±1 符号相加" };
(window.BUPT801.figureMeta["2015"] = window.BUPT801.figureMeta["2015"] || {}).a3ps = { q: "题三(2)", kind: "answer", desc: "s(t) 功率谱：±f_c 侧 sin² 拱形，正频瓣位于 [f_c, f_c+1000]、峰值 1/100，左右对称" };
(window.BUPT801.figureMeta["2015"] = window.BUPT801.figureMeta["2015"] || {}).a4tx = { q: "题四(2)", kind: "answer", desc: "16QAM 发送框图：串并转换→两路 2/4 电平变换→α=0.25 根升余弦成型→cos/−sin 正交载波相乘→Σ 相加输出 s_QAM(t)" };
(window.BUPT801.figureMeta["2015"] = window.BUPT801.figureMeta["2015"] || {}).a4rx = { q: "题四(3)", kind: "answer", desc: "16QAM 接收框图：r(t)→cos/−sin 相干乘解→α=0.25 根升余弦匹配→抽样→两路四进制判决→并串转换" };
(window.BUPT801.figureMeta["2015"] = window.BUPT801.figureMeta["2015"] || {}).a5ps = { q: "题五(3)", kind: "answer", desc: "单频角调制功率谱示意：以 ±f_c 为中心的线谱族（虚线拱包络），有效占宽 f_c±10 kHz" };
(window.BUPT801.figureMeta["2015"] = window.BUPT801.figureMeta["2015"] || {}).a7enc = { q: "题七(3)", kind: "answer", desc: "(2,1,3) 卷积码编码器：两级移存 D_0→D_1，上 ⊕ 出 c^1=u⊕D_0⊕D_1、下 ⊕ 出 c^2=D_0⊕D_1，开关串行输出" };
(window.BUPT801.figureMeta["2015"] = window.BUPT801.figureMeta["2015"] || {}).a9region = { q: "题九(2)", kind: "answer", desc: "s_1 最佳判决域：三条中垂线围成的倒置等边三角形（与星座三角形拼成六角星），含虚线外接圆与边界延长线" };
