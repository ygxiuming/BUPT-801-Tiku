// 2017 图库注册表 —— 由 tools/emit_figures.mjs / server 启动同步自动生成；
// 源文件：data/images/2017/**（原卷截图，唯一维护对象）→ 优先级最高
//         data/figures/2017/**.svg（历史矢量，只读保留，没有同名截图时才用）
// 有截图的 key 注册为位图描述符 { src, w, h }，否则注册 svg 字符串；勿手改本文件
window.BUPT801 = window.BUPT801 || {};
window.BUPT801.figures = window.BUPT801.figures || {};
window.BUPT801.figureMeta = window.BUPT801.figureMeta || {};

(window.BUPT801.figures["2017"] = window.BUPT801.figures["2017"] || {}).q2sys = { src: '/data/images/2017/2017-二-q2sys.png', w: 1776, h: 1329 };
(window.BUPT801.figures["2017"] = window.BUPT801.figures["2017"] || {}).q3sys = { src: '/data/images/2017/2017-三-q3sys.png', w: 4808, h: 1303 };
(window.BUPT801.figures["2017"] = window.BUPT801.figures["2017"] || {}).q6sys = { src: '/data/images/2017/2017-六-q6sys.png', w: 3738, h: 1456 };
(window.BUPT801.figures["2017"] = window.BUPT801.figures["2017"] || {}).q2nc = { src: '/data/images/2017/answer/2017-二-q2nc.png', w: 3145, h: 1583 };
(window.BUPT801.figures["2017"] = window.BUPT801.figures["2017"] || {}).q6psd = { src: '/data/images/2017/answer/2017-六-q6psd.png', w: 4101, h: 1435 };
(window.BUPT801.figures["2017"] = window.BUPT801.figures["2017"] || {}).q6mod = { src: '/data/images/2017/answer/2017-六-q6mod.png', w: 3767, h: 1490 };
(window.BUPT801.figures["2017"] = window.BUPT801.figures["2017"] || {}).q6mseq = { src: '/data/images/2017/answer/2017-六-q6mseq.png', w: 4292, h: 1372 };
(window.BUPT801.figures["2017"] = window.BUPT801.figures["2017"] || {}).q6state = { src: '/data/images/2017/answer/2017-六-q6state.png', w: 2088, h: 888 };
(window.BUPT801.figures["2017"] = window.BUPT801.figures["2017"] || {}).q7h = { src: '/data/images/2017/answer/2017-七-q7h.png', w: 2943, h: 1669 };
(window.BUPT801.figures["2017"] = window.BUPT801.figures["2017"] || {}).q8const = { src: '/data/images/2017/answer/2017-八-q8const.png', w: 2558, h: 1828 };
(window.BUPT801.figures["2017"] = window.BUPT801.figures["2017"] || {}).q8dom = { src: '/data/images/2017/answer/2017-八-q8dom.png', w: 2463, h: 1858 };

(window.BUPT801.figureMeta["2017"] = window.BUPT801.figureMeta["2017"] || {}).q2sys = { q: "题二", kind: "paper", desc: "(a) SSB 相干解调框图：r(t) 分两支各乘 2cos/2sin 2πf_ct 经 LPF(2 kHz)，下支路再 −90° 移相，输出 y₁/y₂；(b) 窄带噪声谱 Pₙ(f)：4~7 kHz 双三角、峰 1/1000 W/kHz" };
(window.BUPT801.figureMeta["2017"] = window.BUPT801.figureMeta["2017"] || {}).q3sys = { q: "题三", kind: "paper", desc: "(a) 双极性波形 s(t)：0~2 为 +1、2~4 为 −1；(b) 接收机 y(t)→h(t)→t=t₀ 开关抽样→判决（V_T=0）" };
(window.BUPT801.figureMeta["2017"] = window.BUPT801.figureMeta["2017"] || {}).q6sys = { q: "题六", kind: "paper", desc: "m 序列发生器 → 卷积码编码器（3 级 D，b₁ 直通、b₂=u⊕s₂⊕s₃、b₃=u⊕s₁⊕s₃）→ 8PSK 调制" };
(window.BUPT801.figureMeta["2017"] = window.BUPT801.figureMeta["2017"] || {}).q2nc = { q: "题二(4)", kind: "answer", desc: "n_c(t) 功率谱：峰 1/500（f=0），|f|=1 处 1/2000 台阶，|f|=2 归零，支撑 ±2 kHz" };
(window.BUPT801.figureMeta["2017"] = window.BUPT801.figureMeta["2017"] || {}).q6psd = { q: "题六(1)", kind: "answer", desc: "8PSK 功率谱 Pₛ(f)：平坦段 ±20 kHz、滚降段 20~30 kHz（α=0.5）" };
(window.BUPT801.figureMeta["2017"] = window.BUPT801.figureMeta["2017"] || {}).q6mod = { q: "题六(1)", kind: "answer", desc: "8PSK 调制框图：三比特变换 a_ic/a_is → 两路 α=0.5 根升余弦 → cos/−sin 正交载波 → 相加" };
(window.BUPT801.figureMeta["2017"] = window.BUPT801.figureMeta["2017"] || {}).q6mseq = { q: "题六(2)", kind: "answer", desc: "m 序列发生器：3 级 D 级联，D₂⊕D₃ 反馈入 D₁，输出取 D₃（周期 7）" };
(window.BUPT801.figureMeta["2017"] = window.BUPT801.figureMeta["2017"] || {}).q6state = { q: "题六(3)", kind: "answer", desc: "卷积码状态转移图：8 状态椭圆环，16 条边 + 2 自环，边标「输出 b₁b₂b₃ / 输入 u」" };
(window.BUPT801.figureMeta["2017"] = window.BUPT801.figureMeta["2017"] || {}).q7h = { q: "题七(1)", kind: "answer", desc: "二元熵函数 H(p₁) 曲线：关于 p₁=1/2 对称的拱形，两端 0、顶点 1" };
(window.BUPT801.figureMeta["2017"] = window.BUPT801.figureMeta["2017"] || {}).q8const = { q: "题八(1)", kind: "answer", desc: "星座图：s₁=(1,1)、s₂=(−1,−1) 两点，虚线引导到 ±1 刻度" };
(window.BUPT801.figureMeta["2017"] = window.BUPT801.figureMeta["2017"] || {}).q8dom = { q: "题八(3)", kind: "answer", desc: "最大似然判决域：过原点斜率 −1 的虚线 r₁+r₂=0，右上判 s₁、左下判 s₂" };
