// 2011 图库注册表 —— 由 tools/emit_figures.mjs / server 启动同步自动生成；
// 源文件：data/images/2011/**（原卷截图，唯一维护对象）；勿手改本文件
// 每个 key 注册为位图描述符 { src, w, h }，前端 figToSvg() 包成 svg 外壳显示
window.BUPT801 = window.BUPT801 || {};
window.BUPT801.figures = window.BUPT801.figures || {};
window.BUPT801.figureMeta = window.BUPT801.figureMeta || {};

(window.BUPT801.figures["2011"] = window.BUPT801.figures["2011"] || {}).q3s12 = { src: '/data/images/2011/2011-三-q3s12.png', w: 2560, h: 797 };
(window.BUPT801.figures["2011"] = window.BUPT801.figures["2011"] || {}).q4gt = { src: '/data/images/2011/2011-四-q4gt.png', w: 2033, h: 830 };
(window.BUPT801.figures["2011"] = window.BUPT801.figures["2011"] || {}).q10rake = { src: '/data/images/2011/2011-十-q10rake.png', w: 2186, h: 1375 };
(window.BUPT801.figures["2011"] = window.BUPT801.figures["2011"] || {}).a3recv = { src: '/data/images/2011/answer/2011-三-a3recv.png', w: 1972, h: 460 };
(window.BUPT801.figures["2011"] = window.BUPT801.figures["2011"] || {}).a3ht = { src: '/data/images/2011/answer/2011-三-a3ht.png', w: 419, h: 281 };
(window.BUPT801.figures["2011"] = window.BUPT801.figures["2011"] || {}).a3y = { src: '/data/images/2011/answer/2011-三-a3y.png', w: 2099, h: 731 };
(window.BUPT801.figures["2011"] = window.BUPT801.figures["2011"] || {}).a4psd1 = { src: '/data/images/2011/answer/2011-四-a4psd1.png', w: 2001, h: 990 };
(window.BUPT801.figures["2011"] = window.BUPT801.figures["2011"] || {}).a4psd2 = { src: '/data/images/2011/answer/2011-四-a4psd2.png', w: 1813, h: 734 };
(window.BUPT801.figures["2011"] = window.BUPT801.figures["2011"] || {}).a8block = { src: '/data/images/2011/answer/2011-八-a8block.png', w: 1902, h: 649 };
(window.BUPT801.figures["2011"] = window.BUPT801.figures["2011"] || {}).a8psd = { src: '/data/images/2011/answer/2011-八-a8psd.png', w: 1672, h: 732 };

(window.BUPT801.figureMeta["2011"] = window.BUPT801.figureMeta["2011"] || {}).q3s12 = { q: "题三", kind: "paper", desc: "题三 s₁(t)、s₂(t) 波形：s₁ 在 [0,T/2] 为 A、s₂ 在 [T/2,T] 为 A，等能量二元码元" };
(window.BUPT801.figureMeta["2011"] = window.BUPT801.figureMeta["2011"] || {}).q4gt = { q: "题四", kind: "paper", desc: "题四 g(t) 波形：(a) 幅度 A 宽度 T 的矩形脉冲；(b) 升余弦脉冲（首尾为零、T/2 处峰值 A）" };
(window.BUPT801.figureMeta["2011"] = window.BUPT801.figureMeta["2011"] || {}).q10rake = { q: "题十", kind: "paper", desc: "题十 Rake 接收机：扩频码×载波→相关电路1（r(t) 直入）/延时τ→相关电路2，输出经开关 K₁/K₂ 进求和电路→采样判决" };
(window.BUPT801.figureMeta["2011"] = window.BUPT801.figureMeta["2011"] || {}).a3recv = { q: "题三(1)", kind: "answer", desc: "匹配滤波器形式最佳接收机：r(t)→匹配滤波器 h(t)→t=T 抽样开关→y→判决→输出" };
(window.BUPT801.figureMeta["2011"] = window.BUPT801.figureMeta["2011"] || {}).a3ht = { q: "题三(2)", kind: "answer", desc: "h(t)=s(T−t) 波形：[0,T/2] 为 −A、[T/2,T] 为 +A" };
(window.BUPT801.figureMeta["2011"] = window.BUPT801.figureMeta["2011"] || {}).a3y = { q: "题三(3)", kind: "answer", desc: "匹配滤波器两种输出波形：y₁ 谷 −A²T/2 在 T/2、峰 +A²T/2 在 T；y₂ 整体右移 T/2（谷在 T、峰在 3T/2）" };
(window.BUPT801.figureMeta["2011"] = window.BUPT801.figureMeta["2011"] || {}).a4psd1 = { q: "题四(1)", kind: "answer", desc: "矩形脉冲功率谱：σa²A²T·sinc²(fT) 连续谱 + f=0 处 mₐ²A² 冲激线，±1/T 处为零" };
(window.BUPT801.figureMeta["2011"] = window.BUPT801.figureMeta["2011"] || {}).a4psd2 = { q: "题四(2)", kind: "answer", desc: "升余弦脉冲功率谱：连续谱峰值 a=σa²A²T/4，直流线 b=mₐ²A²/4，±1/T 处谱线 c=mₐ²A²/16" };
(window.BUPT801.figureMeta["2011"] = window.BUPT801.figureMeta["2011"] || {}).a8block = { q: "题八(2)", kind: "answer", desc: "卷积编码+QPSK 框图：D₀D₁D₂ 移存，g₁ 两 ⊕/g₂ 三 ⊕，双路 ±1 映射→α=1 根升余弦→⊗cos / ⊗−sin→⊕→s(t)" };
(window.BUPT801.figureMeta["2011"] = window.BUPT801.figureMeta["2011"] || {}).a8psd = { q: "题八(3)", kind: "answer", desc: "QPSK 已调功率谱：以 f_c 为中心的升余弦滚降主瓣，边缘 fc±0.64 MHz" };
