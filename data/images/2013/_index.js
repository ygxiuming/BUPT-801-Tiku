// 2013 图库注册表 —— 由 tools/emit_figures.mjs / server 启动同步自动生成；
// 源文件：data/images/2013/**（原卷截图，唯一维护对象）；勿手改本文件
// 每个 key 注册为位图描述符 { src, w, h }，前端 figToSvg() 包成 svg 外壳显示
window.BUPT801 = window.BUPT801 || {};
window.BUPT801.figures = window.BUPT801.figures || {};
window.BUPT801.figureMeta = window.BUPT801.figureMeta || {};

(window.BUPT801.figures["2013"] = window.BUPT801.figures["2013"] || {}).q1bpf = { src: '/data/images/2013/2013-21-q1bpf.png', w: 1846, h: 661 };
(window.BUPT801.figures["2013"] = window.BUPT801.figures["2013"] || {}).q3gt = { src: '/data/images/2013/2013-三-q3gt.png', w: 1454, h: 1039 };
(window.BUPT801.figures["2013"] = window.BUPT801.figures["2013"] || {}).q4mqam = { src: '/data/images/2013/2013-四-q4mqam.png', w: 1812, h: 666 };
(window.BUPT801.figures["2013"] = window.BUPT801.figures["2013"] || {}).q5rect = { src: '/data/images/2013/2013-五-q5rect.png', w: 1845, h: 568 };
(window.BUPT801.figures["2013"] = window.BUPT801.figures["2013"] || {}).q6fig = { src: '/data/images/2013/2013-六-q6fig.png', w: 1774, h: 1296 };
(window.BUPT801.figures["2013"] = window.BUPT801.figures["2013"] || {}).q10mt = { src: '/data/images/2013/2013-十-q10mt.png', w: 1644, h: 1180 };
(window.BUPT801.figures["2013"] = window.BUPT801.figures["2013"] || {}).a4psd = { src: '/data/images/2013/answer/2013-四-a4psd.png', w: 1800, h: 688 };
(window.BUPT801.figures["2013"] = window.BUPT801.figures["2013"] || {}).a9enc = { src: '/data/images/2013/answer/2013-九-a9enc.png', w: 1818, h: 578 };
(window.BUPT801.figures["2013"] = window.BUPT801.figures["2013"] || {}).a9state = { src: '/data/images/2013/answer/2013-九-a9state.png', w: 1828, h: 815 };
(window.BUPT801.figures["2013"] = window.BUPT801.figures["2013"] || {}).a10recv = { src: '/data/images/2013/answer/2013-十-a10recv.png', w: 1818, h: 518 };

(window.BUPT801.figureMeta["2013"] = window.BUPT801.figureMeta["2013"] || {}).q1bpf = { q: "题21", kind: "paper", desc: "带通滤波器功率传递函数 |H(f)|²：±f₀ 处 V 形零陷、f=0 处为 1，右瓣带宽 B" };
(window.BUPT801.figureMeta["2013"] = window.BUPT801.figureMeta["2013"] || {}).q3gt = { q: "题三", kind: "paper", desc: "题三 g(t) 波形：[0,T] 幅度 A 的矩形波门" };
(window.BUPT801.figureMeta["2013"] = window.BUPT801.figureMeta["2013"] || {}).q4mqam = { q: "题四", kind: "paper", desc: "MQAM 发送框图：R_b→串并变换→两路 D/A→根升余弦脉冲成型→⊗cos2πf_ct / −sin2πf_ct→Σ→s(t)" };
(window.BUPT801.figureMeta["2013"] = window.BUPT801.figureMeta["2013"] || {}).q5rect = { q: "题五", kind: "paper", desc: "三个正交矩形波 f₁/f₂/f₃：±1/2 电平，[0,4] 区间（f₁ 在 t=2 翻转、f₃ 每秒翻转）" };
(window.BUPT801.figureMeta["2013"] = window.BUPT801.figureMeta["2013"] || {}).q6fig = { q: "题六", kind: "paper", desc: "(a) s₁(t)、s₂(t) 波形（s₂ 在 T₁ 处由 +A 翻到 −A）；(b) 相关接收机：⊗s_i→∫₀^T(·)dt→t=T 抽样→选取最大相关度量→输出" };
(window.BUPT801.figureMeta["2013"] = window.BUPT801.figureMeta["2013"] || {}).q10mt = { q: "题十", kind: "paper", desc: "m(t) 波形：−1 持续 τ、+5 持续 T−τ（均值零 ⟹ τ=5T/6）" };
(window.BUPT801.figureMeta["2013"] = window.BUPT801.figureMeta["2013"] || {}).a4psd = { q: "题四(2)", kind: "answer", desc: "P_S(f)：以 f_c 为中心的升余弦滚降谱，平坦区 |f−f_c|<1.5 MHz、滚降边缘 ±4.5 MHz（刻度 ±1.5/±3/±4.5）" };
(window.BUPT801.figureMeta["2013"] = window.BUPT801.figureMeta["2013"] || {}).a9enc = { q: "题九(2)", kind: "answer", desc: "(3,1,3) 卷积码编码器：两级 D，c₁ 输入直引、c₂=b_i⊕b_{i-2}、c₃=b_i⊕b_{i-1}⊕b_{i-2}，转换开关串行输出" };
(window.BUPT801.figureMeta["2013"] = window.BUPT801.figureMeta["2013"] || {}).a9state = { q: "题九(3)", kind: "answer", desc: "4 状态状态图：a(00)/b(10)/c(01)/d(11)，8 条转移按 输出(输入) 标注（111(1) 等）" };
(window.BUPT801.figureMeta["2013"] = window.BUPT801.figureMeta["2013"] || {}).a10recv = { q: "题十(3)", kind: "answer", desc: "超外差接收机：混频器(本振 1575kHz)→BPF 445~465kHz→NBF 455kHz 提载波→⊗→LPF 0~10kHz→隔直流→输出" };
