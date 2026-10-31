// 2019 图库注册表 —— 由 tools/emit_figures.mjs / server 启动同步自动生成；
// 源文件：data/images/2019/**（原卷截图，唯一维护对象）；勿手改本文件
// 每个 key 注册为位图描述符 { src, w, h }，前端 figToSvg() 包成 svg 外壳显示
window.BUPT801 = window.BUPT801 || {};
window.BUPT801.figures = window.BUPT801.figures || {};
window.BUPT801.figureMeta = window.BUPT801.figureMeta || {};

(window.BUPT801.figures["2019"] = window.BUPT801.figures["2019"] || {}).c2spec = { src: '/data/images/2019/2019-一-c2spec.png', w: 1066, h: 529 };
(window.BUPT801.figures["2019"] = window.BUPT801.figures["2019"] || {}).q2block = { src: '/data/images/2019/2019-二-q2block.png', w: 1284, h: 244 };
(window.BUPT801.figures["2019"] = window.BUPT801.figures["2019"] || {}).q3g3 = { src: '/data/images/2019/answer/2019-三-q3g3.png', w: 1832, h: 859 };
(window.BUPT801.figures["2019"] = window.BUPT801.figures["2019"] || {}).q3ps1 = { src: '/data/images/2019/answer/2019-三-q3ps1.png', w: 1891, h: 832 };
(window.BUPT801.figures["2019"] = window.BUPT801.figures["2019"] || {}).q3g4sq = { src: '/data/images/2019/answer/2019-三-q3g4sq.png', w: 1423, h: 601 };
(window.BUPT801.figures["2019"] = window.BUPT801.figures["2019"] || {}).q3ps2 = { src: '/data/images/2019/answer/2019-三-q3ps2.png', w: 745, h: 301 };
(window.BUPT801.figures["2019"] = window.BUPT801.figures["2019"] || {}).q4h = { src: '/data/images/2019/answer/2019-四-q4h.png', w: 678, h: 322 };
(window.BUPT801.figures["2019"] = window.BUPT801.figures["2019"] || {}).q5const = { src: '/data/images/2019/answer/2019-五-q5const.png', w: 613, h: 378 };
(window.BUPT801.figures["2019"] = window.BUPT801.figures["2019"] || {}).q5region = { src: '/data/images/2019/answer/2019-五-q5region.png', w: 1377, h: 1142 };
(window.BUPT801.figures["2019"] = window.BUPT801.figures["2019"] || {}).q8enc = { src: '/data/images/2019/answer/2019-八-q8enc.png', w: 1969, h: 799 };

(window.BUPT801.figureMeta["2019"] = window.BUPT801.figureMeta["2019"] || {}).c2spec = { q: "题一(2)", kind: "paper", desc: "基带系统总体传输函数 X(f) 三角谱（±2000 Hz，空3-4共用）" };
(window.BUPT801.figureMeta["2019"] = window.BUPT801.figureMeta["2019"] || {}).q2block = { q: "题二", kind: "paper", desc: "DSB 相干解调框图（⊕噪声→理想带通→⊗2cos(2πf_c t)→理想低通→s_o/n_o）" };
(window.BUPT801.figureMeta["2019"] = window.BUPT801.figureMeta["2019"] || {}).q3g3 = { q: "题三(3)", kind: "answer", desc: "G₃(f)：中段 +T/2、两肩 −T/2（|f|≤1/T，分界 ±1/2T）" };
(window.BUPT801.figureMeta["2019"] = window.BUPT801.figureMeta["2019"] || {}).q3ps1 = { q: "题三(3)", kind: "answer", desc: "P_{s1}(f)=（T/4）矩形谱（|f|≤1/T）" };
(window.BUPT801.figureMeta["2019"] = window.BUPT801.figureMeta["2019"] || {}).q3g4sq = { q: "题三(4)", kind: "answer", desc: "|G₄(f)|² 阶梯：中段 5T²/4、两肩 T²/4" };
(window.BUPT801.figureMeta["2019"] = window.BUPT801.figureMeta["2019"] || {}).q3ps2 = { q: "题三(4)", kind: "answer", desc: "P_{s2}(f) 阶梯：中段 5T/4、两肩 T/4" };
(window.BUPT801.figureMeta["2019"] = window.BUPT801.figureMeta["2019"] || {}).q4h = { q: "题四(1)", kind: "answer", desc: "匹配滤波器 h(t)=−sin(2πt/T) 波形（先负后正，T 归零）" };
(window.BUPT801.figureMeta["2019"] = window.BUPT801.figureMeta["2019"] || {}).q5const = { q: "题五(3)", kind: "answer", desc: "星座图：s₁(√3/2,1/2)、s₂(√3/2,−1/2)、s₃(√3,0)、s₄(0,1)" };
(window.BUPT801.figureMeta["2019"] = window.BUPT801.figureMeta["2019"] || {}).q5region = { q: "题五(3)", kind: "answer", desc: "s₃ 的最佳判决域：s₃–s₁ 与 s₃–s₂ 垂直平分线围成的右开口楔形" };
(window.BUPT801.figureMeta["2019"] = window.BUPT801.figureMeta["2019"] || {}).q8enc = { q: "题八 2(1)", kind: "answer", desc: "卷积码编码器：3×D 串联，上⊕抽 x⁰/x¹/x³、下⊕抽 x²/x³，末端双触点转换开关" };
