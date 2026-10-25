// 2020 · 真题（试卷元数据 + groups + 题干/选项）—— 答案与解析在同目录 answer.js
window.BUPT801 = window.BUPT801 || {};
window.BUPT801.papers = window.BUPT801.papers || {};
window.BUPT801.papers["2020"] = {
  "year": 2020,
  "title": "北京邮电大学2020年硕士研究生入学考试试题",
  "subject": "801 通信原理",
  "note": "请考生注意：(1) 所有答案一律写在答题纸上，否则不计成绩；(2) 不允许使用计算器。",
  "duration": 180,
  "sections": [
    {
      "id": "choice",
      "name": "单项选择题",
      "score": 40,
      "intro": "本大题共 40 个空，每空 1 分，满分 40 分。请按题号把答案填在答题纸上。"
    },
    {
      "id": "big",
      "name": "计算题",
      "score": 110,
      "intro": "本大题共 8 题，第二题 12 分，第三～九题每题 14 分，共 110 分。"
    }
  ],
  "groups": {
    "g1": {
      "stem": "$\\cos(200\\pi t)$ 的希尔伯特变换是（1）。",
      "options": {
        "A": "$\\cos(200\\pi t)$",
        "B": "$\\sin(200\\pi t)$",
        "C": "$-\\cos(200\\pi t)$",
        "D": "$-\\sin(200\\pi t)$"
      }
    },
    "g2": {
      "stem": "若 PAM 基带传输系统的信道存在频率选择性失真，则接收端将能观察到（2）变小。",
      "options": {
        "A": "眼张开度",
        "B": "多普勒频移",
        "C": "符号宽度",
        "D": "噪声"
      }
    },
    "g3": {
      "stem": "将模拟基带信号先微分再调频，得到的是（3）信号。",
      "options": {
        "A": "AM",
        "B": "SSB",
        "C": "FM",
        "D": "PM"
      }
    },
    "g4": {
      "stem": "下列中，（4）是解析信号。",
      "options": {
        "A": "$\\cos(200\\pi t)$",
        "B": "$\\mathrm{e}^{-\\mathrm{j}200\\pi t}$",
        "C": "$\\mathrm{e}^{\\mathrm{j}200\\pi t}$",
        "D": "$\\sin(200\\pi t)$"
      }
    },
    "g5": {
      "stem": "若能量信号 $x(t)$ 的自相关函数是 $2\\,\\mathrm{sinc}(2000\\tau)$，则其能量是（5） J，带宽是（6） kHz。",
      "options": {
        "A": "0.5",
        "B": "1",
        "C": "2",
        "D": "4"
      }
    },
    "g6": {
      "stem": "设基带信号 $m(t)$ 的带宽为 $500\\ \\mathrm{Hz}$、最大幅度为 $1\\ \\mathrm{V}$、平均功率为 $0.2\\ \\mathrm{W}$，则 AM 信号 $[1+m(t)]\\cos(2\\pi f_ct)$ 的带宽是（7） kHz、调幅指数是（8）、调制效率是（9）。",
      "options": {
        "A": "$\\dfrac16$",
        "B": "$\\dfrac15$",
        "C": "$\\dfrac12$",
        "D": "1"
      }
    },
    "g7": {
      "stem": "将二进制数据 $\\{a_n\\}$ 差分编码为 $\\{b_n\\}$，然后将 $\\{b_n\\}$ 通过误比特率为 $p$ 的二元对称信道（BSC）传输，信道输出是 $\\tilde{b}_n$。再对 $\\tilde{b}_n$ 进行差分译码得到二进制序列 $\\tilde{a}_n$。从 $\\{a_n\\}$ 到 $\\{\\tilde{a}_n\\}$ 的误比特率是（10）。",
      "options": {
        "A": "$p$",
        "B": "$2p\\left(1-\\dfrac{p}{2}\\right)$",
        "C": "$2p(1-p)$",
        "D": "$2p$"
      }
    },
    "g8": {
      "stem": "为了达到相同的误比特率目标，OOK 需要的 $E_b/N_0$ 比 BPSK 高（11） dB，QPSK 需要的 $E_b/N_0$ 比 BPSK 高（12） dB。",
      "options": {
        "A": "$-3$",
        "B": "0",
        "C": "3",
        "D": "6"
      }
    },
    "g9": {
      "stem": "对于相同的升余弦滚降系数，OQPSK 的（13）比 QPSK 小。",
      "options": {
        "A": "符号间干扰",
        "B": "误比特率",
        "C": "包络起伏",
        "D": "传输带宽"
      }
    },
    "g10": {
      "stem": "设 4ASK 的误符号率是 0.004，则对于相同的 $E_b/N_0$，矩形星座 16QAM 的误符号率近似是（14）。",
      "options": {
        "A": "0.002",
        "B": "0.004",
        "C": "0.006",
        "D": "0.008"
      }
    },
    "g11": {
      "stem": "设 $X(t)$ 是零均值平稳高斯过程，则 $Y(t)=X(t)\\sin(200\\pi t)$ 是（15）。",
      "options": {
        "A": "非高斯的零均值平稳过程",
        "B": "非平稳的零均值高斯过程",
        "C": "均值非零的平稳高斯过程",
        "D": "零均值平稳高斯过程"
      }
    },
    "g12": {
      "stem": "下列调制方式中频带利用率最低的是（16），抗噪声性能最差的是（17）。",
      "options": {
        "A": "16FSK",
        "B": "16ASK",
        "C": "16QAM",
        "D": "16PSK"
      }
    },
    "g13": {
      "stem": "某 A 律十三折线 PCM 编码器的输入范围是 $[-2048,+2048]\\ \\mathrm{mV}$，若译码器的输入是 11111111，则译码输出是（18） mV。",
      "options": {
        "A": "+1824",
        "B": "+1888",
        "C": "+1952",
        "D": "+2016"
      }
    },
    "g14": {
      "stem": "对于信息序列中出现的 0000，HDB3 编码将其进行替换。如果 0000 之前的 HDB3 编码结果中，最后一个 V 是 $+1$，最后一个非零符号是 $+1$，那么 0000 将被替换为（19）。",
      "options": {
        "A": "$-100-1$",
        "B": "$+100-1$",
        "C": "$000-1$",
        "D": "$000+1$"
      }
    },
    "g15": {
      "stem": "若四进制调制系统的符号能量是 $2\\ \\mathrm{mJ}$、符号速率是 $R_s=1000\\ \\mathrm{Baud}$，则符号间隔是（20） ms、比特间隔 $T_b$ 是（21） ms、比特能量 $E_b$ 是（22） mJ、比特速率 $R_b$ 是（23） kbit/s。",
      "options": {
        "A": "4",
        "B": "2",
        "C": "1",
        "D": "0.5"
      }
    },
    "g16": {
      "stem": "若数字基带传输系统的设计遵循奈奎斯特准则，则可以实现（24）。",
      "options": {
        "A": "采样点无符号间干扰",
        "B": "判决后无误码",
        "C": "判决前无噪声",
        "D": "采样前无波形失真"
      }
    },
    "g17": {
      "stem": "若 m 序列的生成多项式是 $f(x)=1+x+x^3$，则其周期是（25）。",
      "options": {
        "A": "15",
        "B": "7",
        "C": "5",
        "D": "3"
      }
    },
    "g18": {
      "stem": "（15，11）汉明码能纠（26）位错。",
      "options": {
        "A": "4",
        "B": "3",
        "C": "2",
        "D": "1"
      }
    },
    "g19": {
      "stem": "某带通信号的频带范围是 $9.5\\ \\mathrm{kHz}\\sim 12\\ \\mathrm{kHz}$，对其进行理想采样，能使频谱不发生混叠的最小采样率是（27） kHz。",
      "options": {
        "A": "5",
        "B": "6",
        "C": "12",
        "D": "24"
      }
    },
    "g20": {
      "stem": "设有 4 路功率相同、带宽同为 $4\\ \\mathrm{kHz}$ 的模拟基带信号，用 SSB 方式将它们复用为一路信号 $m(t)$，$m(t)$ 的带宽最小是（28） kHz。用 $m(t)$ 对高频载波进行调频指数为 3 的 FM 调制得到 $s(t)$，$s(t)$ 的带宽近似是（29） kHz。",
      "options": {
        "A": "16",
        "B": "64",
        "C": "128",
        "D": "256"
      }
    },
    "g21": {
      "stem": "若多普勒扩展越小，则信道的（30）越大。",
      "options": {
        "A": "相干时间",
        "B": "相干带宽",
        "C": "时延扩展",
        "D": "变化速度"
      }
    },
    "g22": {
      "stem": "下列中，（31）具有尖锐的自相关特性，（32）具有正交特性。",
      "options": {
        "A": "Walsh 码",
        "B": "m 序列",
        "C": "汉明码",
        "D": "循环码"
      }
    },
    "g23": {
      "stem": "码字 0011001 的汉明重量是（33）。码字 0011001 与码字 0011000 之间的汉明距离是（34）。",
      "options": {
        "A": "4",
        "B": "3",
        "C": "2",
        "D": "1"
      }
    },
    "g24": {
      "stem": "设（7，4）循环码的生成多项式是 $g(x)=x^3+x+1$。输入信息 1110 对应的系统码编码结果是（35）。",
      "options": {
        "A": "1110010",
        "B": "1110001",
        "C": "1110100",
        "D": "1110011"
      }
    },
    "g25": {
      "stem": "采用直接序列扩频技术可以抗（36）。",
      "options": {
        "A": "白高斯噪声",
        "B": "非线性失真",
        "C": "多普勒频移",
        "D": "窄带干扰"
      }
    },
    "g26": {
      "stem": "Rake 接收是（37）系统中的常用技术。在多径信道中，Rake 接收具有（38）的效果。",
      "optionSets": ["options37", "options38"],
      "options37": {
        "A": "CDMA",
        "B": "OFDM",
        "C": "PAM",
        "D": "PCM"
      },
      "options38": {
        "A": "ML 接收",
        "B": "匹配滤波",
        "C": "分集接收",
        "D": "非相干检测"
      }
    },
    "g27": {
      "stem": "OFDM 系统中采用循环前缀（CP）主要是为了（39）。",
      "options": {
        "A": "保持子载波的正交性",
        "B": "降低峰均比",
        "C": "降低功率谱密度旁瓣",
        "D": "保持频率同步"
      }
    },
    "g28": {
      "stem": "下列码字中，除（40）之外，其他不可能是（7，3）循环码的码字。",
      "options": {
        "A": "0000001",
        "B": "1110000",
        "C": "0101100",
        "D": "1011100"
      }
    }
  },
  "questions": [
    { "id": "2020-1", "num": 1, "type": "choice", "group": "g1", "blank": 1,
      "chapter": "ch1", "point": "希尔伯特变换与复包络",
      "tags": ["希尔伯特变换"] },
    { "id": "2020-2", "num": 2, "type": "choice", "group": "g2", "blank": 2,
      "chapter": "ch3", "point": "眼图",
      "tags": ["PAM", "眼图", "频率选择性失真"] },
    { "id": "2020-3", "num": 3, "type": "choice", "group": "g3", "blank": 3,
      "chapter": "ch2", "point": "FM/PM 角度调制",
      "tags": ["调频", "调相", "预调制微分"] },
    { "id": "2020-4", "num": 4, "type": "choice", "group": "g4", "blank": 4,
      "chapter": "ch1", "point": "希尔伯特变换与复包络",
      "tags": ["解析信号"] },
    { "id": "2020-5", "num": 5, "type": "choice", "group": "g5", "blank": 5,
      "chapter": "ch1", "point": "平稳性与自相关函数",
      "tags": ["能量信号", "自相关函数", "信号能量"] },
    { "id": "2020-6", "num": 6, "type": "choice", "group": "g5", "blank": 6,
      "chapter": "ch1", "point": "平稳性与自相关函数",
      "tags": ["sinc 自相关", "信号带宽"] },
    { "id": "2020-7", "num": 7, "type": "choice", "group": "g6", "blank": 7,
      "chapter": "ch2", "point": "AM/DSB-SC/SSB/VSB 原理与带宽",
      "tags": ["AM", "带宽"] },
    { "id": "2020-8", "num": 8, "type": "choice", "group": "g6", "blank": 8,
      "chapter": "ch2", "point": "AM/DSB-SC/SSB/VSB 原理与带宽",
      "tags": ["AM", "调幅指数"] },
    { "id": "2020-9", "num": 9, "type": "choice", "group": "g6", "blank": 9,
      "chapter": "ch2", "point": "已调信号的统计特性",
      "tags": ["AM", "调制效率"] },
    { "id": "2020-10", "num": 10, "type": "choice", "group": "g7", "blank": 10,
      "chapter": "ch4", "point": "2ASK/2FSK/2PSK/2DPSK",
      "tags": ["差分编码", "误码传播", "BSC"] },
    { "id": "2020-11", "num": 11, "type": "choice", "group": "g8", "blank": 11,
      "chapter": "ch4", "point": "多进制调制的误码性能与带宽",
      "tags": ["OOK", "BPSK", "Eb/N0"] },
    { "id": "2020-12", "num": 12, "type": "choice", "group": "g8", "blank": 12,
      "chapter": "ch4", "point": "多进制调制的误码性能与带宽",
      "tags": ["QPSK", "BPSK", "Eb/N0"] },
    { "id": "2020-13", "num": 13, "type": "choice", "group": "g9", "blank": 13,
      "chapter": "ch4", "point": "MPSK/MQAM 星座图与格雷映射",
      "tags": ["OQPSK", "包络起伏"] },
    { "id": "2020-14", "num": 14, "type": "choice", "group": "g10", "blank": 14,
      "chapter": "ch4", "point": "多进制调制的误码性能与带宽",
      "tags": ["16QAM", "4ASK", "误符号率"] },
    { "id": "2020-15", "num": 15, "type": "choice", "group": "g11", "blank": 15,
      "chapter": "ch1", "point": "高斯过程与线性变换",
      "tags": ["平稳性", "高斯过程"] },
    { "id": "2020-16", "num": 16, "type": "choice", "group": "g12", "blank": 16,
      "chapter": "ch4", "point": "频带利用率",
      "tags": ["16FSK", "频带利用率"] },
    { "id": "2020-17", "num": 17, "type": "choice", "group": "g12", "blank": 17,
      "chapter": "ch4", "point": "多进制调制的误码性能与带宽",
      "tags": ["16ASK", "抗噪声性能"] },
    { "id": "2020-18", "num": 18, "type": "choice", "group": "g13", "blank": 18,
      "chapter": "ch5", "point": "A律13折线与PCM编码",
      "tags": ["A律十三折线", "PCM译码"] },
    { "id": "2020-19", "num": 19, "type": "choice", "group": "g14", "blank": 19,
      "chapter": "ch3", "point": "基带码型（AMI/HDB3等）",
      "tags": ["HDB3", "取代节"] },
    { "id": "2020-20", "num": 20, "type": "choice", "group": "g15", "blank": 20,
      "chapter": "ch4", "point": "频带利用率",
      "tags": ["符号间隔", "四进制"] },
    { "id": "2020-21", "num": 21, "type": "choice", "group": "g15", "blank": 21,
      "chapter": "ch4", "point": "频带利用率",
      "tags": ["比特间隔", "四进制"] },
    { "id": "2020-22", "num": 22, "type": "choice", "group": "g15", "blank": 22,
      "chapter": "ch4", "point": "频带利用率",
      "tags": ["比特能量", "四进制"] },
    { "id": "2020-23", "num": 23, "type": "choice", "group": "g15", "blank": 23,
      "chapter": "ch4", "point": "频带利用率",
      "tags": ["比特速率", "四进制"] },
    { "id": "2020-24", "num": 24, "type": "choice", "group": "g16", "blank": 24,
      "chapter": "ch3", "point": "奈奎斯特准则与无码间串扰",
      "tags": ["奈奎斯特准则", "符号间干扰"] },
    { "id": "2020-25", "num": 25, "type": "choice", "group": "g17", "blank": 25,
      "chapter": "ch6", "point": "m序列与本原多项式",
      "tags": ["m序列", "周期"] },
    { "id": "2020-26", "num": 26, "type": "choice", "group": "g18", "blank": 26,
      "chapter": "ch6", "point": "汉明距离与纠检错能力",
      "tags": ["汉明码", "纠错能力"] },
    { "id": "2020-27", "num": 27, "type": "choice", "group": "g19", "blank": 27,
      "chapter": "ch5", "point": "抽样定理",
      "tags": ["带通采样", "最小采样率"] },
    { "id": "2020-28", "num": 28, "type": "choice", "group": "g20", "blank": 28,
      "chapter": "ch2", "point": "AM/DSB-SC/SSB/VSB 原理与带宽",
      "tags": ["SSB", "频分复用"] },
    { "id": "2020-29", "num": 29, "type": "choice", "group": "g20", "blank": 29,
      "chapter": "ch2", "point": "卡森公式与调制指数",
      "tags": ["FM", "卡森公式"] },
    { "id": "2020-30", "num": 30, "type": "choice", "group": "g21", "blank": 30,
      "chapter": "ch1", "point": "无线信道（多径/多普勒/相干带宽）",
      "tags": ["多普勒扩展", "相干时间"] },
    { "id": "2020-31", "num": 31, "type": "choice", "group": "g22", "blank": 31,
      "chapter": "ch6", "point": "m序列与本原多项式",
      "tags": ["m序列", "自相关特性"] },
    { "id": "2020-32", "num": 32, "type": "choice", "group": "g22", "blank": 32,
      "chapter": "ch6", "point": "正交码与哈达玛矩阵",
      "tags": ["Walsh 码", "正交特性"] },
    { "id": "2020-33", "num": 33, "type": "choice", "group": "g23", "blank": 33,
      "chapter": "ch6", "point": "汉明距离与纠检错能力",
      "tags": ["汉明重量"] },
    { "id": "2020-34", "num": 34, "type": "choice", "group": "g23", "blank": 34,
      "chapter": "ch6", "point": "汉明距离与纠检错能力",
      "tags": ["汉明距离"] },
    { "id": "2020-35", "num": 35, "type": "choice", "group": "g24", "blank": 35,
      "chapter": "ch6", "point": "循环码",
      "tags": ["循环码", "系统码编码"] },
    { "id": "2020-36", "num": 36, "type": "choice", "group": "g25", "blank": 36,
      "chapter": "ch6", "point": "扩频通信与处理增益",
      "tags": ["直接序列扩频", "抗干扰"] },
    { "id": "2020-37", "num": 37, "type": "choice", "group": "g26", "blank": 37, "oKey": "options37",
      "chapter": "ch1", "point": "分集接收与 Rake",
      "tags": ["Rake 接收", "CDMA"] },
    { "id": "2020-38", "num": 38, "type": "choice", "group": "g26", "blank": 38, "oKey": "options38",
      "chapter": "ch1", "point": "分集接收与 Rake",
      "tags": ["Rake 接收", "分集接收"] },
    { "id": "2020-39", "num": 39, "type": "choice", "group": "g27", "blank": 39,
      "chapter": "ch4", "point": "OFDM 与多载波调制",
      "tags": ["OFDM", "循环前缀"] },
    { "id": "2020-40", "num": 40, "type": "choice", "group": "g28", "blank": 40,
      "chapter": "ch6", "point": "循环码",
      "tags": ["循环码", "码字判定"] },
    {
      "id": "2020-二",
      "num": "二",
      "type": "big",
      "score": 12,
      "stem": "设 $n_w(t)$ 是双边功率谱密度为 $N_0/2$ 的白噪声，将 $n_w(t)$ 通过一个传递函数为\n$$H(f)=\\begin{cases}2\\cos\\left(\\dfrac{\\pi f}{2B}\\right) & |f|\\le B \\\\ 0 & |f|>B\\end{cases}$$\n的滤波器后成为 $n(t)$。试求：",
      "subs": [
        "(1) $n(t)$ 的功率谱密度；",
        "(2) $n(t)$ 的均值、方差；",
        "(3) $n(t)$ 的绝对带宽及 3dB 带宽。"
      ],
      "fig": null,
      "chapter": "ch1",
      "point": "随机过程通过线性系统",
      "tags": ["白噪声", "功率谱密度", "3dB带宽", "方差"]
    },
    {
      "id": "2020-三",
      "num": "三",
      "type": "big",
      "score": 14,
      "stem": "下图中，基带信号 $m(t)$ 的均值为零、带宽为 $200\\ \\mathrm{Hz}$、功率为 $3\\ \\mathrm{W}$，载频 $f_c=1\\ \\mathrm{kHz}$，白高斯噪声的单边功率谱密度为 $N_0=10^{-5}\\ \\mathrm{W/Hz}$，理想带通滤波器 BPF 的通频带是 $900\\ \\mathrm{Hz}\\sim 1200\\ \\mathrm{Hz}$，理想低通滤波器 LPF 的截止频率是 $200\\ \\mathrm{Hz}$。试：",
      "subs": [
        "(1) 写出已调信号 $s(t)$ 的带宽、功率；",
        "(2) 画出 A 点噪声的功率谱密度图；",
        "(3) 画出 B 点噪声的功率谱密度图；",
        "(4) 写出 B 点有用信号功率、噪声功率、信噪比。"
      ],
      "fig": "q3block",
      "chapter": "ch2",
      "point": "相干解调与抗噪声性能",
      "tags": ["SSB", "相干解调", "噪声功率谱密度", "信噪比"]
    },
    {
      "id": "2020-四",
      "num": "四",
      "type": "big",
      "score": 14,
      "stem": "某二进制调制系统在 $[0,T_b]$ 内等概发送 $s_1(t)=2\\cos\\left(\\dfrac{22\\pi t}{T_b}\\right)$、$s_2(t)=2\\cos\\left(\\dfrac{20\\pi t}{T_b}\\right)$ 之一。接收框图如下所示，其中两个匹配滤波器分别对 $s_1(t)$ 和 $s_2(t)$ 匹配，且其冲激响应 $h_1(t)$ 和 $h_2(t)$ 的能量均为 1，最佳采样时刻均为 $t_0=T_b$，白高斯噪声 $n_w(t)$ 的双边功率谱密度是 $N_0/2$。试求：",
      "subs": [
        "(1) 两个匹配滤波器的冲激响应；",
        "(2) 发送 $s_1(t)$、$s_2(t)$ 条件下 $y$ 的均值；",
        "(3) 判决量 $y$ 中的噪声功率；",
        "(4) 最佳判决门限 $V_T$；",
        "(5) 该系统的平均误比特率。"
      ],
      "fig": "q4rx",
      "chapter": "ch9",
      "point": "相关接收机",
      "tags": ["匹配滤波器", "相关接收", "判决门限", "误比特率"]
    },
    {
      "id": "2020-五",
      "num": "五",
      "type": "big",
      "score": 14,
      "stem": "某 16 进制调制在归一化正交基函数下的星座点可以表示为 $s=2x+y$，其中 $x$，$y$ 以独立等概方式取值于 QPSK 星座图 $\\{1+\\mathrm{j},\\ 1-\\mathrm{j},\\ -1+\\mathrm{j},\\ -1-\\mathrm{j}\\}$。试：",
      "subs": [
        "(1) 画出该 16 进制调制的星座图；",
        "(2) 求平均符号能量 $E_s=E\\left[s^2\\right]$ 及星座点之间的最小距离；",
        "(3) 在星座图中标出星座点 $s=-3-3\\mathrm{j}$ 的 ML 判决域；",
        "(4) 若星座点 $s=-3-3\\mathrm{j}$ 的信息比特是 0001，按格雷码规则标出相邻星座点信息比特。"
      ],
      "fig": null,
      "chapter": "ch4",
      "point": "MPSK/MQAM 星座图与格雷映射",
      "tags": ["16QAM", "星座图", "平均符号能量", "ML判决域", "格雷码"]
    },
    {
      "id": "2020-六",
      "num": "六",
      "type": "big",
      "score": 14,
      "stem": "某信道的输入 $X$ 等概取值于 8PSK 星座图 $\\left\\{\\mathrm{e}^{\\mathrm{j}\\left(\\frac{\\pi}{4}+\\frac{i\\pi}{4}\\right)},\\ i=0,1,\\cdots,7\\right\\}$，信道输出为 $Y=X\\cdot Ze^{\\mathrm{j}\\theta}$，其中 $Z$ 等概取值于 1 或 2，$\\theta$ 等概取值于 0 或 $\\pi$，$Z$、$\\theta$、$X$ 三者彼此独立。试求：",
      "subs": [
        "(1) 熵 $H(X)$、$H(Y)$、$H(X,Y)$、$H(Y|X)$；",
        "(2) 信道输入输出的互信息 $I(X;Y)$。"
      ],
      "fig": null,
      "chapter": "ch7",
      "point": "信源熵/联合熵/条件熵",
      "tags": ["熵", "联合熵", "条件熵", "互信息"]
    },
    {
      "id": "2020-七",
      "num": "七",
      "type": "big",
      "score": 14,
      "stem": "某 6 电平均匀量化器将输入范围 $[-6,+6]$ 分成 6 个等长的量化区间，量化电平位于每个量化区间的中心。假设量化器输入 $X$ 的概率密度 $p(x)$ 如下图所示。试：",
      "subs": [
        "(1) 求量化器输出 $Y$ 各可能取值的出现概率；",
        "(2) 求量化器输入功率 $E\\left[X^2\\right]$、量化噪声功率 $E\\left[(Y-X)^2\\right]$；",
        "(3) 对 $Y$ 进行哈夫曼编码，并计算编码后码字的平均码长。"
      ],
      "fig": "q7pdf",
      "chapter": "ch5",
      "point": "量化（均匀/最佳量化）",
      "tags": ["均匀量化", "量化噪声", "哈夫曼编码", "平均码长"]
    },
    {
      "id": "2020-八",
      "num": "八",
      "type": "big",
      "score": 14,
      "stem": "某卷积码的编码器框图如下所示：若编码器输入 4 个比特 $b_0b_1b_2b_3$，不考虑卷积长出的部分，则每路输出 4 个比特，两路输出形成一个 8 比特码字 $(c_{10}c_{20}c_{11}c_{21}c_{12}c_{22}c_{13}c_{23})$，整体构成一个 (8，4) 线性分组码。试：",
      "subs": [
        "(1) 写出卷积码的生成多项式，画出状态转移图；",
        "(2) 写出输入为 1000、1100、1110、1111 所对应的码字；",
        "(3) 写出该码的生成矩阵。"
      ],
      "fig": "q8enc",
      "chapter": "ch6",
      "point": "卷积码与状态图",
      "tags": ["卷积码", "生成多项式", "状态转移图", "生成矩阵"]
    },
    {
      "id": "2020-九",
      "num": "九",
      "type": "big",
      "score": 14,
      "stem": "将 4 路速率分别是 $1\\ \\mathrm{kbit/s}$、$2\\ \\mathrm{kbit/s}$、$3\\ \\mathrm{kbit/s}$、$6\\ \\mathrm{kbit/s}$ 的数据通过时分复用合为一路，然后以 MPAM 方式通过带宽为 $4\\ \\mathrm{kHz}$ 的基带 AWGN 信道传输。试：",
      "subs": [
        "(1) 写出复用后的数据速率 $R_b$；",
        "(2) 按最佳基带传输系统的要求进行系统参数设计（只需写出进制数、符号速率、滚降系数）；",
        "(3) 画出发送功率谱密度图；",
        "(4) 写出该系统的频带利用率 ($\\mathrm{bit/(s\\cdot Hz)}$)。"
      ],
      "fig": null,
      "chapter": "ch3",
      "point": "最佳基带系统",
      "tags": ["时分复用", "MPAM", "升余弦滚降", "频带利用率"]
    }
  ]
};
