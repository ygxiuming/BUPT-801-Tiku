// 2022 · 真题（试卷元数据 + groups + 题干/选项）—— 答案与解析在同目录 answer.js
window.BUPT801 = window.BUPT801 || {};
window.BUPT801.papers = window.BUPT801.papers || {};
window.BUPT801.papers["2022"] = {
  "year": 2022,
  "title": "北京邮电大学2022年硕士研究生入学考试试题",
  "subject": "801 通信原理",
  "note": "请考生注意：(1) 所有答案一律写在答题纸上，否则不计成绩；(2) 不允许使用计算器。",
  "duration": 180,
  "sections": [
    {
      "id": "choice",
      "name": "单项选择题",
      "score": 40,
      "intro": "本大题共 26 题、40 个空，每空 1 分，满分 40 分。"
    },
    {
      "id": "big",
      "name": "计算题",
      "score": 106,
      "intro": "本大题共 8 题，分值依次为 12、16、12、14、12、12、12、16 分，共 106 分（原卷标注如此，与第一卷合计 146 分）。"
    }
  ],
  "groups": {
    "g1": {
      "stem": "若信号 $s_1(t)$ 和 $s_2(t)$ 的能量分别是 1 和 4，则它们的欧氏距离至多是（1）。",
      "options": {
        "A": "1",
        "B": "2",
        "C": "3",
        "D": "4"
      }
    },
    "g2": {
      "stem": "设 $n(t)=n_c(t)\\cos(2\\pi f_ct)-n_s(t)\\sin(2\\pi f_ct)$ 是零均值窄带平稳高斯过程，其同相分量 $n_c(t)$ 与正交分量 $n_s(t)$ 满足（2）。",
      "options": {
        "A": "$E[n_c(t)n_s(t)]=0,\\ \\forall t\\in(-\\infty,\\infty)$",
        "B": "$n_c(t)=n_s(t),\\ \\forall t\\in(-\\infty,\\infty)$",
        "C": "$E[n_c(t_1)n_s(t_2)]=0,\\ \\forall t_1,t_2\\in(-\\infty,\\infty)$",
        "D": "$n_s(t)$ 是 $n_c(t)$ 的希尔伯特变换"
      }
    },
    "g3": {
      "stem": "已知某线性分组码用于纠错时可以保证纠正所有 4 位及 4 位以内的错，该码的最小码距至少是（3），其校验矩阵 $\\boldsymbol H$ 的秩至少是（4）。",
      "options": {
        "A": "6",
        "B": "7",
        "C": "8",
        "D": "9"
      }
    },
    "g4": {
      "stem": "设有离散信源 $X\\in\\{a_1,a_2,\\cdots,a_6\\}$，其出现概率依次是 $\\dfrac12,\\dfrac14,\\dfrac18,\\dfrac1{16},\\dfrac1{32},\\dfrac1{32}$。对 $X$ 进行哈夫曼编码后码字的平均码长是（5） bit/symbol。",
      "options": {
        "A": "$\\dfrac78$",
        "B": "$\\dfrac{31}{16}$",
        "C": "$\\dfrac{127}{64}$",
        "D": "$\\dfrac{39}{16}$"
      }
    },
    "g5": {
      "stem": "设有带通信号 $s(t)=m_1(t)\\cos(2\\pi f_ct)-m_2(t)\\sin(2\\pi f_ct)$，其中 $m_1(t)$ 是带宽为 2 kHz 的零均值平稳过程。若 $m_2(t)=0$，则 $s(t)$ 的带宽是（6） kHz；若 $m_2(t)$ 是 $m_1(t)$ 的希尔伯特变换，则 $s(t)$ 的带宽是（7） kHz。",
      "options": {
        "A": "$\\dfrac12$",
        "B": "1",
        "C": "2",
        "D": "4"
      }
    },
    "g6": {
      "stem": "调频信号 $s(t)=2\\cos\\left(2\\pi\\times10^{6}t+4\\cos2000\\pi t\\right)$ 的带宽近似是（8） kHz。",
      "options": {
        "A": "5",
        "B": "10",
        "C": "15",
        "D": "20"
      }
    },
    "g7": {
      "stem": "设带宽为 5 kHz 的模拟基带信号按奈奎斯特速率采样，经 A 律十三折线量化编码后的速率是（9） kbit/s；将 6 路这样的数据与一路速率为 60 kbit/s 的控制信息时分复用，总速率是（10） kbit/s；若以二进制方式基带传输，所需的信道带宽最小是（11） kHz。",
      "options": {
        "A": "1080",
        "B": "540",
        "C": "270",
        "D": "80"
      }
    },
    "g8": {
      "stem": "若 64QAM 系统的数据速率为 9600 bit/s，则其符号速率是（12） Baud；当基带采用矩形脉冲成形时，发送信号的主瓣带宽为（13） Hz；当基带采用滚降因子为 $1/2$ 的根升余弦频谱成形时，发送信号的带宽为（14） Hz。",
      "options": {
        "A": "1600",
        "B": "2400",
        "C": "3200",
        "D": "4800"
      }
    },
    "g9": {
      "stem": "信道的相干时间很小，说明信道的（15）很大。",
      "options": {
        "A": "时延扩展",
        "B": "群时延",
        "C": "多普勒扩展",
        "D": "等效矩形带宽"
      }
    },
    "g10": {
      "stem": "下列技术中，（16）通过引入人为的符号间干扰来提高频带利用率；（17）通过扩展频带来对抗窄带干扰；（18）主要用于对抗信道中的平坦型衰落；（19）可用于减小接收信号中存在的符号间干扰。",
      "options": {
        "A": "时域均衡",
        "B": "分集接收",
        "C": "直接序列扩频",
        "D": "部分响应"
      }
    },
    "g11": {
      "stem": "与单极性 RZ 码相比，AMI 码的优点是（20）；与 AMI 码相比，HDB3 码的优点是（21）；与数字分相码（Manchester 码）相比，HDB3 码的优点是（22）。",
      "options": {
        "A": "主瓣带宽小",
        "B": "误码率低",
        "C": "有利时钟提取",
        "D": "可隔直流传输"
      }
    },
    "g12": {
      "stem": "考虑话音信号的量化，在平均量化信噪比要求相同的条件下，与均匀量化相比，采用 A 律十三折线量化可以使量化编码后的数据（23）。",
      "options": {
        "A": "速率更高",
        "B": "随机性更强",
        "C": "对误码不敏感",
        "D": "速率更低"
      }
    },
    "g13": {
      "stem": "若正交 16FSK 的比特速率是 16 kbit/s，则其频差最小是（24） kHz。",
      "options": {
        "A": "2",
        "B": "4",
        "C": "8",
        "D": "16"
      }
    },
    "g14": {
      "stem": "给定 $E_b/N_0$，下列调制方式中误比特率最低的是（25），最高的是（26）。",
      "options": {
        "A": "64FSK",
        "B": "32ASK",
        "C": "64QAM",
        "D": "16PSK"
      }
    },
    "g15": {
      "stem": "若 AWGN 信道中信号功率是 $S$、噪声单边功率谱密度是 $N_0$、信道带宽是 $B$，则频带利用率的香农极限是（27） bit/(s·Hz)。",
      "options": {
        "A": "$B\\log_2\\left(1+\\dfrac{S}{N_0B}\\right)$",
        "B": "$\\log_2\\left(1+\\dfrac{S}{N_0B}\\right)$",
        "C": "$B\\log_2\\left(1+\\dfrac{S}{N_0}\\right)$",
        "D": "$\\log_2\\left(1+\\dfrac{S}{N_0}\\right)$"
      }
    },
    "g16": {
      "stem": "设基带传输系统的符号速率为 $R_s$，信道带宽为 $W$，系统的总体传递函数为 $X(f)$。欲使接收端采样点无符号间干扰，$X(f)$ 应满足（28），其中 $C$ 表示常数。",
      "options": {
        "A": "$\\sum\\limits_{n=-\\infty}^{\\infty}X(f-nR_s)=C$",
        "B": "$\\sum\\limits_{n=-\\infty}^{\\infty}X(f-nR_s)=C\\,X(f)$",
        "C": "$X(nR_s)=\\begin{cases}C,&n=0\\\\[2pt]0,&n\\neq0\\end{cases}$",
        "D": "$X(f-R_s)=X(f)$"
      }
    },
    "g17": {
      "stem": "设 $m(t)$ 的频带范围是 11 kHz ~ 14 kHz，对其进行理想采样，能使频谱不发生混叠的最低采样率是（29） kHz。",
      "options": {
        "A": "4",
        "B": "5",
        "C": "6",
        "D": "7"
      }
    },
    "g18": {
      "stem": "若 2PSK 和 2DPSK 的比特速率 $R_b$ 及比特信噪比 $E_b/N_0$ 相同，则 2DPSK 的带宽（30），误比特率（31）。",
      "options": {
        "A": "比 2PSK 大",
        "B": "与 2PSK 相同",
        "C": "比 2PSK 小",
        "D": "不可比"
      }
    },
    "g19": {
      "stem": "若四进制最佳基带传输系统的滚降系数是 $1/3$，则该系统的频带利用率是（32） bit/(s·Hz)。",
      "options": {
        "A": "1.5",
        "B": "2",
        "C": "2.5",
        "D": "3"
      }
    },
    "g20": {
      "stem": "信号通过（33）信道后会产生时域扩展，通过（34）信道后会产生频域扩展。",
      "options": {
        "A": "AWGN",
        "B": "BSC",
        "C": "频率选择性",
        "D": "时变"
      }
    },
    "g21": {
      "stem": "下列技术中，对抗多径信道所引起的符号间干扰最有效的是（35）。",
      "options": {
        "A": "多天线分集",
        "B": "OQPSK",
        "C": "64QAM",
        "D": "OFDM"
      }
    },
    "g22": {
      "stem": "假设下列调制都采用了升余弦滚降频谱成形，其中对放大器的非线性失真最不敏感的是（36）。",
      "options": {
        "A": "16QAM",
        "B": "OQPSK",
        "C": "QPSK",
        "D": "8PSK"
      }
    },
    "g23": {
      "stem": "有两个 m 序列 $\\{a_n\\}$、$\\{b_n\\}$，其特征多项式分别为 $f_1(x)=1+x+x^3$、$f_2(x)=1+x^2+x^3$。令 $c_n=a_n\\oplus b_n$，则下列中的（37）是 $\\{c_n\\}$ 的一个周期。",
      "options": {
        "A": "1000001",
        "B": "1011100",
        "C": "0011101",
        "D": "0000000"
      }
    },
    "g24": {
      "stem": "在 OFDM 系统中，信道的（38）决定其循环前缀（CP）的长度。",
      "options": {
        "A": "多径时延扩展",
        "B": "相干时间",
        "C": "噪声功率",
        "D": "群时延"
      }
    },
    "g25": {
      "stem": "在以下技术中，用 Walsh 码区分信道的是（39）。",
      "options": {
        "A": "FDMA",
        "B": "CDMA",
        "C": "TDMA",
        "D": "SDMA"
      }
    },
    "g26": {
      "stem": "在（40）的条件下，按 MAP 准则检测等价于按最小欧氏距离检测。",
      "options": {
        "A": "AWGN 信道传输，接收信号后验等概",
        "B": "BSC 信道传输，发送信号等能量",
        "C": "AWGN 信道传输，发送信号先验等概",
        "D": "BSC 信道传输，发送信号先验等概"
      }
    }
  },
  "questions": [
    {
      "id": "2022-1", "num": 1, "type": "choice", "group": "g1", "blank": 1,
      "chapter": "ch9", "point": "信号波形与能量关系",
      "tags": ["欧氏距离", "信号能量", "相关系数"]
    },
    {
      "id": "2022-2", "num": 2, "type": "choice", "group": "g2", "blank": 2,
      "chapter": "ch1", "point": "窄带高斯过程（包络/相位分布）",
      "tags": ["同相分量", "正交分量", "窄带高斯噪声"]
    },
    {
      "id": "2022-3", "num": 3, "type": "choice", "group": "g3", "blank": 3,
      "chapter": "ch6", "point": "汉明距离与纠检错能力",
      "tags": ["最小码距", "纠错能力"]
    },
    {
      "id": "2022-4", "num": 3, "type": "choice", "group": "g3", "blank": 4,
      "chapter": "ch6", "point": "校验矩阵与伴随式",
      "tags": ["校验矩阵秩", "最小码距"]
    },
    {
      "id": "2022-5", "num": 4, "type": "choice", "group": "g4", "blank": 5,
      "chapter": "ch5", "point": "哈夫曼编码",
      "tags": ["哈夫曼编码", "平均码长"]
    },
    {
      "id": "2022-6", "num": 5, "type": "choice", "group": "g5", "blank": 6,
      "chapter": "ch2", "point": "AM/DSB-SC/SSB/VSB 原理与带宽",
      "tags": ["DSB", "带通信号带宽"]
    },
    {
      "id": "2022-7", "num": 5, "type": "choice", "group": "g5", "blank": 7,
      "chapter": "ch2", "point": "AM/DSB-SC/SSB/VSB 原理与带宽",
      "tags": ["SSB", "希尔伯特变换", "带通信号带宽"]
    },
    {
      "id": "2022-8", "num": 6, "type": "choice", "group": "g6", "blank": 8,
      "chapter": "ch2", "point": "卡森公式与调制指数",
      "tags": ["FM", "卡森公式", "最大频偏"]
    },
    {
      "id": "2022-9", "num": 7, "type": "choice", "group": "g7", "blank": 9,
      "chapter": "ch5", "point": "A律13折线与PCM编码",
      "tags": ["PCM", "抽样速率", "编码位数"]
    },
    {
      "id": "2022-10", "num": 7, "type": "choice", "group": "g7", "blank": 10,
      "chapter": "ch5", "point": "A律13折线与PCM编码",
      "tags": ["时分复用", "总速率"]
    },
    {
      "id": "2022-11", "num": 7, "type": "choice", "group": "g7", "blank": 11,
      "chapter": "ch3", "point": "奈奎斯特准则与无码间串扰",
      "tags": ["二进制基带", "最小信道带宽"]
    },
    {
      "id": "2022-12", "num": 8, "type": "choice", "group": "g8", "blank": 12,
      "chapter": "ch4", "point": "多进制调制的误码性能与带宽",
      "tags": ["64QAM", "符号速率"]
    },
    {
      "id": "2022-13", "num": 8, "type": "choice", "group": "g8", "blank": 13,
      "chapter": "ch4", "point": "频带利用率",
      "tags": ["矩形脉冲", "主瓣带宽"]
    },
    {
      "id": "2022-14", "num": 8, "type": "choice", "group": "g8", "blank": 14,
      "chapter": "ch3", "point": "升余弦滚降与带宽",
      "tags": ["根升余弦", "滚降系数"]
    },
    {
      "id": "2022-15", "num": 9, "type": "choice", "group": "g9", "blank": 15,
      "chapter": "ch1", "point": "无线信道（多径/多普勒/相干带宽）",
      "tags": ["相干时间", "多普勒扩展"]
    },
    {
      "id": "2022-16", "num": 10, "type": "choice", "group": "g10", "blank": 16,
      "chapter": "ch3", "point": "奈奎斯特准则与无码间串扰",
      "tags": ["部分响应", "人为码间串扰"]
    },
    {
      "id": "2022-17", "num": 10, "type": "choice", "group": "g10", "blank": 17,
      "chapter": "ch6", "point": "扩频通信与处理增益",
      "tags": ["直接序列扩频", "窄带干扰"]
    },
    {
      "id": "2022-18", "num": 10, "type": "choice", "group": "g10", "blank": 18,
      "chapter": "ch1", "point": "分集接收与 Rake",
      "tags": ["分集", "平坦衰落"]
    },
    {
      "id": "2022-19", "num": 10, "type": "choice", "group": "g10", "blank": 19,
      "chapter": "ch3", "point": "码间串扰分析",
      "tags": ["时域均衡", "码间串扰"]
    },
    {
      "id": "2022-20", "num": 11, "type": "choice", "group": "g11", "blank": 20,
      "chapter": "ch3", "point": "基带码型（AMI/HDB3等）",
      "tags": ["AMI", "单极性RZ", "隔直流"]
    },
    {
      "id": "2022-21", "num": 11, "type": "choice", "group": "g11", "blank": 21,
      "chapter": "ch3", "point": "基带码型（AMI/HDB3等）",
      "tags": ["HDB3", "连零", "时钟提取"]
    },
    {
      "id": "2022-22", "num": 11, "type": "choice", "group": "g11", "blank": 22,
      "chapter": "ch3", "point": "基带码型（AMI/HDB3等）",
      "tags": ["HDB3", "Manchester", "主瓣带宽"]
    },
    {
      "id": "2022-23", "num": 12, "type": "choice", "group": "g12", "blank": 23,
      "chapter": "ch5", "point": "量化（均匀/最佳量化）",
      "tags": ["A律13折线", "均匀量化", "量化信噪比"]
    },
    {
      "id": "2022-24", "num": 13, "type": "choice", "group": "g13", "blank": 24,
      "chapter": "ch4", "point": "多进制调制的误码性能与带宽",
      "tags": ["16FSK", "正交条件", "最小频差"]
    },
    {
      "id": "2022-25", "num": 14, "type": "choice", "group": "g14", "blank": 25,
      "chapter": "ch4", "point": "多进制调制的误码性能与带宽",
      "tags": ["误比特率比较", "最小距离"]
    },
    {
      "id": "2022-26", "num": 14, "type": "choice", "group": "g14", "blank": 26,
      "chapter": "ch4", "point": "多进制调制的误码性能与带宽",
      "tags": ["误比特率比较", "最小距离"]
    },
    {
      "id": "2022-27", "num": 15, "type": "choice", "group": "g15", "blank": 27,
      "chapter": "ch7", "point": "信道容量与香农公式",
      "tags": ["香农公式", "频带利用率"]
    },
    {
      "id": "2022-28", "num": 16, "type": "choice", "group": "g16", "blank": 28,
      "chapter": "ch3", "point": "奈奎斯特准则与无码间串扰",
      "tags": ["奈奎斯特准则", "折叠谱"]
    },
    {
      "id": "2022-29", "num": 17, "type": "choice", "group": "g17", "blank": 29,
      "chapter": "ch5", "point": "抽样定理",
      "tags": ["带通抽样", "最低采样率"]
    },
    {
      "id": "2022-30", "num": 18, "type": "choice", "group": "g18", "blank": 30,
      "chapter": "ch4", "point": "2ASK/2FSK/2PSK/2DPSK",
      "tags": ["2DPSK", "带宽"]
    },
    {
      "id": "2022-31", "num": 18, "type": "choice", "group": "g18", "blank": 31,
      "chapter": "ch4", "point": "2ASK/2FSK/2PSK/2DPSK",
      "tags": ["2DPSK", "误比特率", "相位模糊"]
    },
    {
      "id": "2022-32", "num": 19, "type": "choice", "group": "g19", "blank": 32,
      "chapter": "ch3", "point": "升余弦滚降与带宽",
      "tags": ["频带利用率", "四进制", "滚降系数"]
    },
    {
      "id": "2022-33", "num": 20, "type": "choice", "group": "g20", "blank": 33,
      "chapter": "ch1", "point": "无线信道（多径/多普勒/相干带宽）",
      "tags": ["频率选择性衰落", "时域扩展"]
    },
    {
      "id": "2022-34", "num": 20, "type": "choice", "group": "g20", "blank": 34,
      "chapter": "ch1", "point": "无线信道（多径/多普勒/相干带宽）",
      "tags": ["时变信道", "频域扩展", "多普勒"]
    },
    {
      "id": "2022-35", "num": 21, "type": "choice", "group": "g21", "blank": 35,
      "chapter": "ch4", "point": "OFDM 与多载波调制",
      "tags": ["OFDM", "多径", "符号间干扰"]
    },
    {
      "id": "2022-36", "num": 22, "type": "choice", "group": "g22", "blank": 36,
      "chapter": "ch4", "point": "MPSK/MQAM 星座图与格雷映射",
      "tags": ["OQPSK", "包络起伏", "非线性失真"]
    },
    {
      "id": "2022-37", "num": 23, "type": "choice", "group": "g23", "blank": 37,
      "chapter": "ch6", "point": "m序列与本原多项式",
      "tags": ["m序列", "特征多项式", "周期"]
    },
    {
      "id": "2022-38", "num": 24, "type": "choice", "group": "g24", "blank": 38,
      "chapter": "ch4", "point": "OFDM 与多载波调制",
      "tags": ["循环前缀", "时延扩展"]
    },
    {
      "id": "2022-39", "num": 25, "type": "choice", "group": "g25", "blank": 39,
      "chapter": "ch6", "point": "正交码与哈达玛矩阵",
      "tags": ["Walsh码", "CDMA", "码分多址"]
    },
    {
      "id": "2022-40", "num": 26, "type": "choice", "group": "g26", "blank": 40,
      "chapter": "ch9", "point": "最佳判决门限",
      "tags": ["MAP准则", "最大似然", "最小欧氏距离"]
    },
    {
      "id": "2022-二",
      "num": "二",
      "type": "big",
      "score": 12,
      "stem": "在下图所示的 AM 系统中，模拟基带信号 $m(t)$ 的均值为零、最大幅度为 $1$ V、功率为 $0.25$ W、带宽为 $5$ kHz，$A=2$ V，载频 $f_c$ 充分大，白高斯噪声 $n_w(t)$ 的单边功率谱密度是 $N_0=2.5\\times10^{-8}$ W/Hz。理想带通滤波器 BPF 的通带正好能使 AM 信号 $s(t)$ 通过，其输出为 $r(t)=s(t)+n(t)$；理想低通滤波器 LPF 的截止频率是 $5$ kHz。试求：",
      "subs": [
        "(1) AM 信号 $s(t)$ 的调制指数 $a$、带宽 $B$、调制效率 $\\eta$；",
        "(2) BPF 输出中 $s(t)$ 及 $n(t)$ 的功率；",
        "(3) 解调输出信噪比。"
      ],
      "fig": "q2am",
      "chapter": "ch2",
      "point": "相干解调与抗噪声性能",
      "tags": ["AM", "调制效率", "相干解调", "输出信噪比"]
    },
    {
      "id": "2022-三",
      "num": "三",
      "type": "big",
      "score": 16,
      "stem": "设有 PAM 信号 $X(t)=\\sum\\limits_{n=-\\infty}^{\\infty}a_ng(t-nT_s)$，其中序列 $\\{a_n\\}$ 的元素是独立同分布的零均值高斯随机变量，方差均为 1。$g(t)$ 的傅氏变换为 $$G(f)=\\begin{cases}T_s\\cos(2\\pi fT_s),&|f|\\le\\dfrac{1}{2T_s}\\\\[2pt]0,&|f|>\\dfrac{1}{2T_s}\\end{cases}$$ $X(t)$ 通过传递函数为 $$H(f)=\\begin{cases}2,&0<f<\\dfrac{1}{2T_s}\\\\[2pt]0,&\\text{else}\\end{cases}$$ 的滤波器后得到 $Y(t)$。试求：",
      "subs": [
        "(1) $g(t)$ 的能量谱密度、能量；",
        "(2) $X(t)$ 的功率谱密度、功率；",
        "(3) $Y(t)$ 的功率谱密度、功率；",
        "(4) $X(0)$ 及 $Y(0)$ 的概率密度函数。（提示：$X(t)$ 是平稳高斯过程，$Y(t)$ 是平稳复高斯过程。）"
      ],
      "fig": null,
      "chapter": "ch1",
      "point": "随机过程通过线性系统",
      "tags": ["能量谱密度", "功率谱密度", "平稳高斯过程", "解析信号"]
    },
    {
      "id": "2022-四",
      "num": "四",
      "type": "big",
      "score": 12,
      "stem": "如下图所示，某二进制调制系统在 $[0,T]$ 时间内等概发送 $s_1(t)=2\\cos(2\\pi f_ct)$ 或 $s_2(t)=-2\\cos(2\\pi f_ct)$ 之一，其中 $f_c$ 充分大。发送信号经过 AWGN 信道传输，接收信号为 $r(t)=s_i(t)+n_w(t)$，$i=1,2$，白高斯噪声 $n_w(t)$ 的双边功率谱密度为 $N_0/2$。试求：",
      "subs": [
        "(1) 平均比特能量 $E_b$；",
        "(2) 发送 $s_1(t)$ 条件下，判决输入 $y$ 的均值、方差；",
        "(3) 最佳判决门限 $V_{\\mathrm{th}}$；",
        "(4) 平均误比特率。"
      ],
      "fig": "q4rx",
      "chapter": "ch9",
      "point": "误比特率分析",
      "tags": ["相关接收机", "最佳判决门限", "误比特率", "2PSK"]
    },
    {
      "id": "2022-五",
      "num": "五",
      "type": "big",
      "score": 14,
      "stem": "下图是某八进制调制系统在归一化正交基函数下的星座图，各星座点等概出现在两个正方形的 8 个顶点上。按复数表示，图中 $s_1=b$，$s_2=\\sqrt2\\,b(1+\\mathrm j)$。已知发送信号的平均符号能量是 $E_s=10$。发送 $s_i$（$i=1,2,\\cdots,8$）时，接收信号为 $r=s_i+n$，其中噪声 $n=n_c+\\mathrm j\\cdot n_s$ 的实部 $n_c$、虚部 $n_s$ 是两个独立的零均值高斯随机变量，方差均为 $0.5$。定义似然函数为发送 $s_i$ 条件下 $r$ 的条件概率密度函数 $f(r|s_i)$。试求：",
      "subs": [
        "(1) 星座点 $s_1$、$s_2$ 的信号能量；",
        "(2) 星座点之间的最小距离；",
        "(3) 星座点 $s_2$ 的最佳判决域；",
        "(4) 发送 $s_1$ 条件下，收到 $r=0$ 的似然函数 $f(r=0|s_1)$ 的值。"
      ],
      "fig": "q5const",
      "chapter": "ch4",
      "point": "MPSK/MQAM 星座图与格雷映射",
      "tags": ["星座图", "最小距离", "判决域", "似然函数"]
    },
    {
      "id": "2022-六",
      "num": "六",
      "type": "big",
      "score": 12,
      "stem": "某 QPSK 系统发送的相位 $\\varphi$ 等概取值于 $\\left\\{0,\\dfrac{\\pi}{2},\\pi,\\dfrac{3\\pi}{2}\\right\\}$。接收端判决输出的相位 $\\hat\\varphi\\in\\left\\{0,\\dfrac{\\pi}{2},\\pi,\\dfrac{3\\pi}{2}\\right\\}$。已知该系统的误符号率是 $0.5$，且出错的情形都是相位增加 $\\dfrac{\\pi}{2}$，即 $$P(\\hat\\varphi|\\varphi)=\\begin{cases}\\dfrac12,&\\hat\\varphi=\\varphi\\\\[2pt]\\dfrac12,&\\hat\\varphi=\\left(\\varphi+\\dfrac{\\pi}{2}\\right)_{\\mathrm{mod}(2\\pi)}\\\\[2pt]0,&\\text{其他}\\end{cases}$$ 试求：",
      "subs": [
        "(1) 熵 $H(\\varphi)$；",
        "(2) 熵 $H(\\hat\\varphi)$；",
        "(3) 条件熵 $H(\\hat\\varphi|\\varphi)$；",
        "(4) 联合熵 $H(\\hat\\varphi,\\varphi)$；",
        "(5) 互信息 $I(\\hat\\varphi;\\varphi)$。"
      ],
      "fig": null,
      "chapter": "ch7",
      "point": "信源熵/联合熵/条件熵",
      "tags": ["熵", "互信息", "条件熵", "QPSK"]
    },
    {
      "id": "2022-七",
      "num": "七",
      "type": "big",
      "score": 12,
      "stem": "下图中 $X$ 的概率密度函数为 $p_X(x)=2(1-x)$，$0\\le x\\le1$，$W=\\sqrt X$。$W$ 通过二电平均匀量化器 $Q(\\cdot)$ 后成为 $Z=Q(W)\\in\\left\\{\\dfrac14,\\dfrac34\\right\\}$。试求：",
      "subs": [
        "(1) $X$ 的功率 $E[X^2]$；",
        "(2) $W$ 的分布函数 $F_W(w)$、概率密度函数 $p_W(w)$、功率 $E[W^2]$；",
        "(3) $Z$ 各种取值的出现概率、$Z$ 的功率 $E[Z^2]$；",
        "(4) 量化器输入输出的相关值 $E[WZ]$、量化误差功率 $E[(Z-W)^2]$。"
      ],
      "fig": "q7block",
      "chapter": "ch5",
      "point": "量化（均匀/最佳量化）",
      "tags": ["量化", "随机变量函数", "量化误差功率"]
    },
    {
      "id": "2022-八",
      "num": "八",
      "type": "big",
      "score": 12,
      "stem": "通过将 $(10,4)$ 循环码的生成多项式移位，得到其生成矩阵为 $$\\boldsymbol G_0=\\begin{bmatrix}1&1&0&0&0&1&1&0&0&0\\\\0&1&1&0&0&0&1&1&0&0\\\\0&0&1&1&0&0&0&1&1&0\\\\0&0&0&1&1&0&0&0&1&1\\end{bmatrix}$$ ",
      "subs": [
        "(1) 通过初等行变换将 $\\boldsymbol G_0$ 化为系统码形式的生成矩阵 $\\boldsymbol G$（约定系统位在左），并写出对应的校验矩阵 $\\boldsymbol H$；",
        "(2) 设 $\\boldsymbol c=(c_9c_8c_7c_6c_5c_4c_3c_2c_1c_0)$ 是该码的系统码码字，证明 $c_4c_3c_2c_1c_0=c_9c_8c_7c_6c_5$；",
        "(3) 若接收端收到 $\\boldsymbol y=1100011001$，写出对应的伴随式 $\\boldsymbol s=\\boldsymbol H\\boldsymbol y^{\\mathrm T}$、最可能的错误图样以及对应的译码结果。"
      ],
      "fig": null,
      "chapter": "ch6",
      "point": "循环码",
      "tags": ["循环码", "系统生成矩阵", "校验矩阵", "伴随式译码"]
    },
    {
      "id": "2022-九",
      "num": "九",
      "type": "big",
      "score": 16,
      "stem": "下图所示为某卷积码的状态转移图，图中虚线/实线分别表示编码器输入为 1/0 对应的输出支路，支路上的数字 $c_1c_2$ 表示状态转移对应的两路编码输出，圆圈中数字表示编码器状态。编码器初始状态为 00。当编码器输入为 $u_0u_1u_2u_300$ 时，输出是 12 个比特 $c_{01}c_{02}c_{11}c_{12}c_{21}c_{22}c_{31}c_{32}c_{41}c_{42}c_{51}c_{52}$，同时编码器状态回到 00。试：",
      "subs": [
        "(1) 写出该卷积码的生成多项式，画出该卷积码的编码器原理框图；",
        "(2) 若编码器输入为 $101000$，写出编码输出的 12 个比特；",
        "(3) 若 ML 译码器输入的 12 个比特是 $100010111000$，写出译码结果（写出对应的 4 个比特 $u_0u_1u_2u_3$）。"
      ],
      "fig": "q9sd",
      "chapter": "ch6",
      "point": "卷积码与状态图",
      "tags": ["卷积码", "状态转移图", "生成多项式", "维特比译码"]
    }
  ]
};
