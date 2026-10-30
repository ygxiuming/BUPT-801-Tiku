// 2018 图库注册表 —— 由 tools/emit_figures.mjs / server 启动同步自动生成；
// 源文件：data/images/2018/**（原卷截图，唯一维护对象）→ 优先级最高
//         data/figures/2018/**.svg（历史矢量，只读保留，没有同名截图时才用）
// 有截图的 key 注册为位图描述符 { src, w, h }，否则注册 svg 字符串；勿手改本文件
window.BUPT801 = window.BUPT801 || {};
window.BUPT801.figures = window.BUPT801.figures || {};
window.BUPT801.figureMeta = window.BUPT801.figureMeta || {};

(window.BUPT801.figures["2018"] = window.BUPT801.figures["2018"] || {}).q14xf = { src: '/data/images/2018/2018-一-q14xf.png', w: 1072, h: 552 };
(window.BUPT801.figures["2018"] = window.BUPT801.figures["2018"] || {}).q17eye = { src: '/data/images/2018/2018-一-q17eye.png', w: 1075, h: 595 };
(window.BUPT801.figures["2018"] = window.BUPT801.figures["2018"] || {}).q28cw = { src: '/data/images/2018/2018-一-q28cw.png', w: 1104, h: 410 };
(window.BUPT801.figures["2018"] = window.BUPT801.figures["2018"] || {}).q2demod = { src: '/data/images/2018/2018-二-q2demod.png', w: 1467, h: 367 };
(window.BUPT801.figures["2018"] = window.BUPT801.figures["2018"] || {}).q2psd = { src: '/data/images/2018/answer/2018-二-q2psd.png', w: 721, h: 320 };
(window.BUPT801.figures["2018"] = window.BUPT801.figures["2018"] || {}).q3g = { src: '/data/images/2018/2018-三-q3g.png', w: 817, h: 534 };
(window.BUPT801.figures["2018"] = window.BUPT801.figures["2018"] || {}).q3h = { src: '/data/images/2018/answer/2018-三-q3h.png', w: 474, h: 290 };
(window.BUPT801.figures["2018"] = window.BUPT801.figures["2018"] || {}).q4const = { src: '/data/images/2018/answer/2018-四-q4const.png', w: 371, h: 279 };
(window.BUPT801.figures["2018"] = window.BUPT801.figures["2018"] || {}).q4s5 = { src: '/data/images/2018/answer/2018-四-q4s5.png', w: 430, h: 274 };
(window.BUPT801.figures["2018"] = window.BUPT801.figures["2018"] || {}).q4reg1 = { src: '/data/images/2018/answer/2018-四-q4reg1.png', w: 1533, h: 1188 };
(window.BUPT801.figures["2018"] = window.BUPT801.figures["2018"] || {}).q4reg2 = { src: '/data/images/2018/answer/2018-四-q4reg2.png', w: 1608, h: 1128 };
(window.BUPT801.figures["2018"] = window.BUPT801.figures["2018"] || {}).q5sys = { src: '/data/images/2018/2018-五-q5sys.png', w: 1089, h: 445 };
(window.BUPT801.figures["2018"] = window.BUPT801.figures["2018"] || {}).q5psd = { src: '/data/images/2018/answer/2018-五-q5psd.png', w: 530, h: 269 };
(window.BUPT801.figures["2018"] = window.BUPT801.figures["2018"] || {}).q5mod = { src: '/data/images/2018/answer/2018-五-q5mod.png', w: 2392, h: 820 };
(window.BUPT801.figures["2018"] = window.BUPT801.figures["2018"] || {}).q5dem = { src: '/data/images/2018/answer/2018-五-q5dem.png', w: 2380, h: 891 };
(window.BUPT801.figures["2018"] = window.BUPT801.figures["2018"] || {}).q6huf = { src: '/data/images/2018/answer/2018-六-q6huf.png', w: 2043, h: 953 };
(window.BUPT801.figures["2018"] = window.BUPT801.figures["2018"] || {}).q7pdf = { src: '/data/images/2018/2018-七-q7pdf.png', w: 844, h: 451 };
(window.BUPT801.figures["2018"] = window.BUPT801.figures["2018"] || {}).q8enc = { src: '/data/images/2018/answer/2018-八-q8enc.png', w: 2114, h: 911 };

(window.BUPT801.figureMeta["2018"] = window.BUPT801.figureMeta["2018"] || {}).q14xf = { q: "题一(14)~(16)", kind: "paper", desc: "基带系统总体传递函数 X(f) 四幅：A/B 矩形（±100/±200 Hz）、C 梯形（平顶 ±100 滚降到 ±200）、D 三角形（±200）" };
(window.BUPT801.figureMeta["2018"] = window.BUPT801.figureMeta["2018"] || {}).q17eye = { q: "题一(17)", kind: "paper", desc: "四幅眼图 A~D：A 抽样时刻轨迹重合眼闭合，B 张开，C 多电平，D 噪声大" };
(window.BUPT801.figureMeta["2018"] = window.BUPT801.figureMeta["2018"] || {}).q28cw = { q: "题一(28)", kind: "paper", desc: "载波提取四方式：A 平方→窄带滤波/锁相环、B 平方、C 窄带滤波/锁相环、D 窄带滤波→平方" };
(window.BUPT801.figureMeta["2018"] = window.BUPT801.figureMeta["2018"] || {}).q2demod = { q: "题二", kind: "paper", desc: "SSB 解调框图：s(t)⊕n_w(t)→带通 19k~26kHz→A→⊗2cos(2πf_ct)→低通 5kHz→B→y(t)" };
(window.BUPT801.figureMeta["2018"] = window.BUPT801.figureMeta["2018"] || {}).q2psd = { q: "题二(3)", kind: "answer", desc: "P_nc(f)：|f|≤1 kHz 台地高 N0、1~6 kHz 台阶高 N0/2（通带对 f_c 不对称的折叠谱）" };
(window.BUPT801.figureMeta["2018"] = window.BUPT801.figureMeta["2018"] || {}).q3g = { q: "题三", kind: "paper", desc: "g(t) 阶梯波：0~1 为 2/√5、1~2 为 1/√5，T_b=2 s" };
(window.BUPT801.figureMeta["2018"] = window.BUPT801.figureMeta["2018"] || {}).q3h = { q: "题三(2)", kind: "answer", desc: "匹配滤波器 h(t)=g(2−t)：0~1 为 1/√5、1~2 为 2/√5（先低后高）" };
(window.BUPT801.figureMeta["2018"] = window.BUPT801.figureMeta["2018"] || {}).q4const = { q: "题四(1)", kind: "answer", desc: "8 点星座：s1 在原点，其余 7 点布满 {±1,0,1}² 格点（f₁/f₂ 轴）" };
(window.BUPT801.figureMeta["2018"] = window.BUPT801.figureMeta["2018"] || {}).q4s5 = { q: "题四(2)", kind: "answer", desc: "s5(t)=f1+f2=2（0≤t≤1/2），其余为 0，E5=2 J" };
(window.BUPT801.figureMeta["2018"] = window.BUPT801.figureMeta["2018"] || {}).q4reg1 = { q: "题四(3)", kind: "answer", desc: "s1 的最佳判决域：上边 y=1/2、左右 x=±1/2、下方两条 45° 线交于 (0,−1) 的盾形（星座无 (0,−1) 点）" };
(window.BUPT801.figureMeta["2018"] = window.BUPT801.figureMeta["2018"] || {}).q4reg2 = { q: "题四(4)", kind: "answer", desc: "P(s7)=0 时 s1 的判决域：顶点 (±1/2,±1/2)、(0,±1) 的六边形" };
(window.BUPT801.figureMeta["2018"] = window.BUPT801.figureMeta["2018"] || {}).q5sys = { q: "题五", kind: "paper", desc: "四路各一个 PCM→TDM→16QAM(fc=2MHz)→信道；B 标在 m3 路 PCM 后，C 在 TDM 后、D 在 16QAM 后" };
(window.BUPT801.figureMeta["2018"] = window.BUPT801.figureMeta["2018"] || {}).q5psd = { q: "题五(2)", kind: "answer", desc: "D 点功率谱 P_D(f)：f−fc ∈ [−48,48] kHz 的升余弦钟形（α=1 无平顶）" };
(window.BUPT801.figureMeta["2018"] = window.BUPT801.figureMeta["2018"] || {}).q5mod = { q: "题五(3)", kind: "answer", desc: "16QAM 调制框图：RC→串并变换→两路 D/A→根升余弦频谱成形(α=1)→正交乘载波(fc=2MHz)→相加" };
(window.BUPT801.figureMeta["2018"] = window.BUPT801.figureMeta["2018"] || {}).q5dem = { q: "题五(3)", kind: "answer", desc: "16QAM 解调框图：相干乘→载波恢复→根号升余弦匹配滤波(α=1)→抽样→4 进制判决→并串转换" };
(window.BUPT801.figureMeta["2018"] = window.BUPT801.figureMeta["2018"] || {}).q6huf = { q: "题六(2)", kind: "answer", desc: "8 联合符号哈夫曼树：码字 10/010/011/000/001/110/1110/1111，平均码长 23/8 bit" };
(window.BUPT801.figureMeta["2018"] = window.BUPT801.figureMeta["2018"] || {}).q7pdf = { q: "题七", kind: "paper", desc: "量化器输入概率密度 p(x)：峰 0.5、支撑 [−2,2] 的三角形" };
(window.BUPT801.figureMeta["2018"] = window.BUPT801.figureMeta["2018"] || {}).q8enc = { q: "题八(5)", kind: "answer", desc: "1/2 卷积码编码器：4 级 D 串联，上⊕抽 u/u₃/u₄（g⁽¹⁾=1+D³+D⁴）、下⊕抽 u/u₁/u₄（g⁽²⁾=1+D+D⁴），末端双触点转换开关" };
