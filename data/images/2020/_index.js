// 2020 图库注册表 —— 由 tools/emit_figures.mjs / server 启动同步自动生成；
// 源文件：data/images/2020/**（原卷截图，唯一维护对象）；勿手改本文件
// 每个 key 注册为位图描述符 { src, w, h }，前端 figToSvg() 包成 svg 外壳显示
window.BUPT801 = window.BUPT801 || {};
window.BUPT801.figures = window.BUPT801.figures || {};
window.BUPT801.figureMeta = window.BUPT801.figureMeta || {};

(window.BUPT801.figures["2020"] = window.BUPT801.figures["2020"] || {}).q3block = { src: '/data/images/2020/2020-三-q3block.png', w: 1416, h: 504 };
(window.BUPT801.figures["2020"] = window.BUPT801.figures["2020"] || {}).q3psdA = { src: '/data/images/2020/answer/2020-三-q3psdA.png', w: 1431, h: 516 };
(window.BUPT801.figures["2020"] = window.BUPT801.figures["2020"] || {}).q3psdB = { src: '/data/images/2020/answer/2020-三-q3psdB.png', w: 1390, h: 638 };
(window.BUPT801.figures["2020"] = window.BUPT801.figures["2020"] || {}).q4rx = { src: '/data/images/2020/2020-四-q4rx.png', w: 1344, h: 401 };
(window.BUPT801.figures["2020"] = window.BUPT801.figures["2020"] || {}).q5const = { src: '/data/images/2020/answer/2020-五-q5const.png', w: 1383, h: 1155 };
(window.BUPT801.figures["2020"] = window.BUPT801.figures["2020"] || {}).q5region = { src: '/data/images/2020/answer/2020-五-q5region.png', w: 1202, h: 962 };
(window.BUPT801.figures["2020"] = window.BUPT801.figures["2020"] || {}).q5gray = { src: '/data/images/2020/answer/2020-五-q5gray.png', w: 872, h: 702 };
(window.BUPT801.figures["2020"] = window.BUPT801.figures["2020"] || {}).q7pdf = { src: '/data/images/2020/2020-七-q7pdf.png', w: 1380, h: 486 };
(window.BUPT801.figures["2020"] = window.BUPT801.figures["2020"] || {}).q7huf = { src: '/data/images/2020/answer/2020-七-q7huf.png', w: 1291, h: 636 };
(window.BUPT801.figures["2020"] = window.BUPT801.figures["2020"] || {}).q8enc = { src: '/data/images/2020/2020-八-q8enc.png', w: 1911, h: 823 };
(window.BUPT801.figures["2020"] = window.BUPT801.figures["2020"] || {}).q8state = { src: '/data/images/2020/answer/2020-八-q8state.png', w: 1295, h: 595 };
(window.BUPT801.figures["2020"] = window.BUPT801.figures["2020"] || {}).q9psd = { src: '/data/images/2020/answer/2020-九-q9psd.png', w: 1240, h: 530 };

(window.BUPT801.figureMeta["2020"] = window.BUPT801.figureMeta["2020"] || {}).q3block = { q: "题三", kind: "paper", desc: "SSB 调制与相干解调接收机框图（希尔伯特变换→合成→BPF→乘 2cos→LPF）" };
(window.BUPT801.figureMeta["2020"] = window.BUPT801.figureMeta["2020"] || {}).q3psdA = { q: "题三", kind: "answer", desc: "A 点（BPF 后）噪声功率谱：±[900,1200] Hz 上高度 N0/2" };
(window.BUPT801.figureMeta["2020"] = window.BUPT801.figureMeta["2020"] || {}).q3psdB = { q: "题三", kind: "answer", desc: "B 点（LPF 后）噪声功率谱：|f|≤100 高度 N0、100~200 高度 N0/2" };
(window.BUPT801.figureMeta["2020"] = window.BUPT801.figureMeta["2020"] || {}).q4rx = { q: "题四", kind: "paper", desc: "匹配滤波器接收机框图（两路匹配滤波→t0 采样→加减→判决）" };
(window.BUPT801.figureMeta["2020"] = window.BUPT801.figureMeta["2020"] || {}).q5const = { q: "题五", kind: "answer", desc: "16QAM 星座：2x+y 铺满 {±1,±3}×{±1,±3}" };
(window.BUPT801.figureMeta["2020"] = window.BUPT801.figureMeta["2020"] || {}).q5region = { q: "题五", kind: "answer", desc: "s=−3−3j 的 ML 判决域：Re≤−2 且 Im≤−2 的 1/4 平面（阴影）" };
(window.BUPT801.figureMeta["2020"] = window.BUPT801.figureMeta["2020"] || {}).q5gray = { q: "题五", kind: "answer", desc: "格雷编码标注（(−3,−3)=0001，相邻点恰差 1 位，不唯一）" };
(window.BUPT801.figureMeta["2020"] = window.BUPT801.figureMeta["2020"] || {}).q7pdf = { q: "题七", kind: "paper", desc: "量化器输入概率密度 p(x)：1/8、1/12、1/24 阶梯" };
(window.BUPT801.figureMeta["2020"] = window.BUPT801.figureMeta["2020"] || {}).q7huf = { q: "题七", kind: "answer", desc: "六电平哈夫曼编码树：码字 01/10/11/000/0010/0011，平均码长 5/2" };
(window.BUPT801.figureMeta["2020"] = window.BUPT801.figureMeta["2020"] || {}).q8enc = { q: "题八", kind: "paper", desc: "(8,4) 卷积码编码器框图：两级移位寄存器，c1 三抽头、c2 两抽头" };
(window.BUPT801.figureMeta["2020"] = window.BUPT801.figureMeta["2020"] || {}).q8state = { q: "题八", kind: "answer", desc: "状态转移图：a=00、b=10、c=01、d=11，标注 输出(输入)" };
(window.BUPT801.figureMeta["2020"] = window.BUPT801.figureMeta["2020"] || {}).q9psd = { q: "题九", kind: "answer", desc: "发送功率谱：升余弦平顶至 ±2 kHz、滚降止于 ±4 kHz" };
