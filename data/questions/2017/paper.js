// 2017 · 真题（试卷元数据 + groups + 题干/选项）—— 答案与解析在同目录 answer.js
window.BUPT801 = window.BUPT801 || {};
window.BUPT801.papers = window.BUPT801.papers || {};
window.BUPT801.papers["2017"] = {
  "year": 2017,
  "title": "北京邮电大学 2017 年硕士研究生入学考试试题",
  "subject": "801 通信原理",
  "note": "请考生注意：（1）所有答案一律写在答题纸上，否则不计成绩；（2）不允许使用计算器。",
  "duration": 180,
  "sections": [
    {
      "id": "choice",
      "name": "单项选择题",
      "score": 54,
      "perBlank": 1.5,
      "intro": "本大题共 36 个空，每空 1.5 分，满分 54 分。请按题号把答案填在答题纸上。"
    },
    {
      "id": "big",
      "name": "计算题",
      "score": 96,
      "intro": "本大题共 7 题，第二～六题每题 16 分，第七、八题每题 8 分，共 96 分。"
    }
  ],
  "groups": {
    "g1": {
      "stem": "设有 AM 信号 $[1+m(t)]\\cos 2\\pi f_ct$，其中基带调制信号 $m(t)$ 的带宽是 $250\\,\\mathrm{Hz}$、平均功率是 $\\overline{m^2(t)}=0.25\\,\\mathrm W$、最大幅度是 $|m(t)|_{\\max}=1\\,\\mathrm V$。此 AM 信号的带宽是（1）$\\mathrm{kHz}$，调制指数是（2），调制效率是（3）。",
      "options": {
        "A": "$1/5$",
        "B": "$1/4$",
        "C": "$1/2$",
        "D": "$1$"
      }
    },
    "g2": {
      "stem": "将多路信号复用为一路时，按（4）的不同来区分各路信号属于频分复用，按（5）来区分各路信号属于时分复用，按（6）来区分各路信号属于码分复用。",
      "options": {
        "A": "功率",
        "B": "时隙",
        "C": "Walsh 码",
        "D": "频带"
      }
    },
    "g3": {
      "stem": "在数字通信系统的设计中，针对频率选择性衰落的技术包括（7）等。",
      "options": {
        "A": "部分响应系统",
        "B": "科斯塔斯环",
        "C": "时域均衡、直序扩频、OFDM",
        "D": "QOPSK、64QAM"
      }
    },
    "g4": {
      "stem": "若二进制基带 PAM 系统的信道带宽是 $20\\,\\mathrm{Hz}$，则无符号间干扰传输的最高数据速率是（8）$\\mathrm{bit/s}$；若 16ASK 系统的信道带宽是 $5\\,\\mathrm{Hz}$，则无符号间干扰传输的最高速率是（9）$\\mathrm{bit/s}$。",
      "options": {
        "A": "10",
        "B": "20",
        "C": "30",
        "D": "40"
      }
    },
    "g5": {
      "stem": "将基带信号 $m(t)$ 先（10），再（11），得到的是 FM 信号；先（12），再（13），得到的是 PM 信号。",
      "options": {
        "A": "微分",
        "B": "积分",
        "C": "调频",
        "D": "调相"
      }
    },
    "g6": {
      "stem": "设有 FM 信号 $4\\cos\\left[2\\pi f_ct+2\\pi K_f\\int_{-\\infty}^{t}m(\\tau)\\,\\mathrm d\\tau\\right]$，其中 $K_f=2\\,\\mathrm{kHz/V}$，基带信号 $m(t)$ 的带宽是 $2\\,\\mathrm{kHz}$、最大幅度是 $|m(t)|_{\\max}=2\\,\\mathrm V$。此 FM 信号的最大频偏是（14）$\\mathrm{kHz}$、调制指数是（15）、带宽近似是（16）$\\mathrm{kHz}$。",
      "options": {
        "A": "2",
        "B": "4",
        "C": "8",
        "D": "12"
      }
    },
    "g7": {
      "stem": "矩形星座 16QAM 的星座图中有 16 个星座点，将这 16 个点按各自能量的不同分为 3 组，能量从小到大分别是 2、（17）、（18）。",
      "options": {
        "A": "6",
        "B": "10",
        "C": "14",
        "D": "18"
      }
    },
    "g8": {
      "stem": "HDB3 码与 AMI 码的共同之处是（19），不同之处是 HDB3 码（20）。",
      "options": {
        "A": "适用于隔离直流传输",
        "B": "编码输出没有长连零",
        "C": "引入了人为的符号间干扰",
        "D": "降低了主瓣带宽"
      }
    },
    "g9": {
      "stem": "某带通信号的频带范围是 $15\\,\\mathrm{kHz}\\sim18\\,\\mathrm{kHz}$，对其进行理想采样，不发生频谱混叠的最小采样率是（21）$\\mathrm{kHz}$。",
      "options": {
        "A": "6",
        "B": "12",
        "C": "18",
        "D": "36"
      }
    },
    "g10": {
      "stem": "假设数据独立等概，OOK 的误比特率是（22），2FSK 的误比特率是（23），2PSK 的误比特率是（24）。",
      "options": {
        "A": "$\\dfrac{1}{2}\\mathrm{erfc}\\sqrt{\\dfrac{E_b}{N_0}}$",
        "B": "$\\mathrm{erfc}\\sqrt{\\dfrac{E_b}{N_0}}$",
        "C": "$\\dfrac{1}{2}\\mathrm{erfc}\\sqrt{\\dfrac{2E_b}{N_0}}$",
        "D": "$\\dfrac{1}{2}\\mathrm{erfc}\\sqrt{\\dfrac{E_b}{2N_0}}$"
      }
    },
    "g11": {
      "stem": "设 $\\{a_n\\}$ 是零均值平稳独立序列，$E[a_n^2]=1$。令 $x(t)=\\sum\\limits_{n=-\\infty}^{\\infty}a_n\\delta(t-nT_s)$，则 $x(t)$ 的功率谱密度是 $P_x(f)=$（25），平均自相关函数 $\\overline{R}_x(\\tau)=$（26）。将 $x(t)$ 通过一个冲激响应为 $g(t)$、传递函数为 $G(f)$ 的滤波器后成为 $y(t)=$（27），其功率谱密度是（28）。",
      "optionSets": [
        "options25",
        "options26",
        "options27",
        "options28"
      ],
      "options25": {
        "A": "$\\delta(f)$",
        "B": "$\\dfrac{1}{T_s}$",
        "C": "$\\sum\\limits_{n=-\\infty}^{\\infty}\\delta\\left(f-\\dfrac{n}{T_s}\\right)$",
        "D": "$\\dfrac{1}{T_s}\\sum\\limits_{n=-\\infty}^{\\infty}\\mathrm e^{\\mathrm j2\\pi nfT_s}$"
      },
      "options26": {
        "A": "$\\dfrac{1}{T_s}\\delta(\\tau)$",
        "B": "$1$",
        "C": "$\\sum\\limits_{n=-\\infty}^{\\infty}\\mathrm e^{\\mathrm j\\frac{2\\pi n\\tau}{T_s}}$",
        "D": "$\\dfrac{1}{T_s}\\sum\\limits_{n=-\\infty}^{\\infty}\\delta(\\tau-nT_s)$"
      },
      "options27": {
        "A": "$x(t)g(t)$",
        "B": "$g(t)$",
        "C": "$\\sum\\limits_{n=-\\infty}^{\\infty}g(t-nT_s)$",
        "D": "$\\sum\\limits_{n=-\\infty}^{\\infty}a_ng(t-nT_s)$"
      },
      "options28": {
        "A": "$\\dfrac{1}{T_s}\\sum\\limits_{n=-\\infty}^{\\infty}G\\left(\\dfrac{n}{T_s}\\right)$",
        "B": "$\\dfrac{1}{T_s}\\sum\\limits_{n=-\\infty}^{\\infty}G\\left(f-\\dfrac{n}{T_s}\\right)$",
        "C": "$\\dfrac{1}{T_s}\\left|G(f)\\right|^2$",
        "D": "$\\dfrac{1}{T_s}\\sum\\limits_{n=-\\infty}^{\\infty}G\\left(\\dfrac{n}{T_s}\\right)\\delta\\left(f-\\dfrac{n}{T_s}\\right)$"
      }
    },
    "g12": {
      "stem": "卷积码编码输出通过 BSC 信道传输，接收端用 Viterbi 算法译码，此译码算法属于（29）译码。",
      "options": {
        "A": "MAP",
        "B": "ML",
        "C": "MMSE",
        "D": "Max-Lloyd"
      }
    },
    "g13": {
      "stem": "设发送数据速率是 $2\\,\\mathrm{kbit/s}$，正交 2FSK 信号的主瓣带宽最小是（30）$\\mathrm{kHz}$。",
      "options": {
        "A": "3",
        "B": "4",
        "C": "5",
        "D": "6"
      }
    },
    "g14": {
      "stem": "设基带信号 $x(t)$ 的带宽是 $W$，傅氏变换是 $X(f)$。对 $x(t)$ 按速率 $R_s=1/T_s$ 进行理想采样得到 $x_s(t)=x(t)\\sum\\limits_{n=-\\infty}^{\\infty}\\delta(t-nT_s)=\\sum\\limits_{n=-\\infty}^{\\infty}x(nT_s)\\delta(t-nT_s)$。$x_s(t)$ 的频谱是 $X_s(f)=$（31）。采样后频谱不发生混叠的条件是（32）。",
      "optionSets": [
        "options31",
        "options32"
      ],
      "options31": {
        "A": "$X(f)\\sum\\limits_{n=-\\infty}^{\\infty}\\delta\\left(f-\\dfrac{n}{T_s}\\right)$",
        "B": "$\\dfrac{1}{T_s}\\sum\\limits_{n=-\\infty}^{\\infty}x(nT_s)\\delta\\left(f-\\dfrac{n}{T_s}\\right)$",
        "C": "$\\dfrac{1}{T_s}\\sum\\limits_{n=-\\infty}^{\\infty}X\\left(f-\\dfrac{n}{T_s}\\right)$",
        "D": "$\\dfrac{1}{T_s}\\sum\\limits_{n=-\\infty}^{\\infty}x(nT_s)\\mathrm e^{\\mathrm j2\\pi nfT_s}$"
      },
      "options32": {
        "A": "$R_s\\ge 2W$",
        "B": "$R_s\\ge W$",
        "C": "$R_s\\le 2W$",
        "D": "$R_s\\le W$"
      }
    },
    "g15": {
      "stem": "第一类部分响应系统的冲激响应 $h_1(t)$ 满足（33）。若相关编码的输入是二电平序列 $\\{a_n\\}$，$a_n\\in\\{\\pm1\\}$，那么在无噪声情况下，接收端在 $t=nT_b$ 时刻的采样值为 $c_n=$（34）。",
      "optionSets": [
        "options33",
        "options34"
      ],
      "options33": {
        "A": "$h_1(nT_b)=\\begin{cases}1,&n\\ \\text{为偶数}\\\\-1,&\\text{else}\\end{cases}$",
        "B": "$h_1(nT_b)=\\begin{cases}1,&n=0\\\\0,&n\\ne0\\end{cases}$",
        "C": "$h_1(nT_b)=\\begin{cases}1,&n=0,1\\\\0,&\\text{else}\\end{cases}$",
        "D": "$h_1(nT_b)=\\begin{cases}1,&n=0,1\\\\-1,&\\text{else}\\end{cases}$"
      },
      "options34": {
        "A": "$a_n+a_{n-1}$",
        "B": "$a_n-a_{n-1}$",
        "C": "$a_n+a_{n-2}$",
        "D": "$a_n-a_{n-2}$"
      }
    },
    "g16": {
      "stem": "令 $H_N$ 表示 $N$ 阶哈达玛矩阵，其元素取值于 $\\pm1$，则 $H_{2N}=$（35）。",
      "options": {
        "A": "$H_N^2$",
        "B": "$\\begin{bmatrix}H_N&H_N\\\\H_N&-H_N\\end{bmatrix}$",
        "C": "$\\begin{bmatrix}H_N&-H_N\\\\H_N&-H_N\\end{bmatrix}$",
        "D": "$2H_N$"
      }
    },
    "g17": {
      "stem": "四进制信源符号 $X$ 的概率分布是 $\\{1/2,\\,1/4,\\,1/8,\\,1/8\\}$，经过哈夫曼编码后平均每符号的码长是（36）$\\mathrm{bit}$。",
      "options": {
        "A": "$1$",
        "B": "$1.5$",
        "C": "$1.75$",
        "D": "$2$"
      }
    }
  },
  "questions": [
    {
      "id": "2017-1",
      "num": 1,
      "type": "choice",
      "group": "g1",
      "blank": 1,
      "chapter": "ch2",
      "point": "AM/DSB-SC/SSB/VSB 原理与带宽",
      "tags": ["AM", "调制指数", "调制效率"]
    },
    {
      "id": "2017-2",
      "num": 1,
      "type": "choice",
      "group": "g1",
      "blank": 2,
      "chapter": "ch2",
      "point": "AM/DSB-SC/SSB/VSB 原理与带宽",
      "tags": ["AM", "调制指数"]
    },
    {
      "id": "2017-3",
      "num": 1,
      "type": "choice",
      "group": "g1",
      "blank": 3,
      "chapter": "ch2",
      "point": "AM/DSB-SC/SSB/VSB 原理与带宽",
      "tags": ["AM", "调制效率"]
    },
    {
      "id": "2017-4",
      "num": 2,
      "type": "choice",
      "group": "g2",
      "blank": 4,
      "chapter": "ch4",
      "point": "频带利用率",
      "tags": ["频分复用", "多路复用"]
    },
    {
      "id": "2017-5",
      "num": 2,
      "type": "choice",
      "group": "g2",
      "blank": 5,
      "chapter": "ch4",
      "point": "频带利用率",
      "tags": ["时分复用", "多路复用"]
    },
    {
      "id": "2017-6",
      "num": 2,
      "type": "choice",
      "group": "g2",
      "blank": 6,
      "chapter": "ch6",
      "point": "扩频通信与处理增益",
      "tags": ["码分复用", "Walsh 码"]
    },
    {
      "id": "2017-7",
      "num": 3,
      "type": "choice",
      "group": "g3",
      "blank": 7,
      "chapter": "ch1",
      "point": "无线信道（多径/多普勒/相干带宽）",
      "tags": ["频率选择性衰落", "均衡", "OFDM"]
    },
    {
      "id": "2017-8",
      "num": 4,
      "type": "choice",
      "group": "g4",
      "blank": 8,
      "chapter": "ch3",
      "point": "奈奎斯特准则与无码间串扰",
      "tags": ["奈奎斯特速率", "基带 PAM"]
    },
    {
      "id": "2017-9",
      "num": 4,
      "type": "choice",
      "group": "g4",
      "blank": 9,
      "chapter": "ch4",
      "point": "多进制调制的误码性能与带宽",
      "tags": ["16ASK", "奈奎斯特速率"]
    },
    {
      "id": "2017-10",
      "num": 5,
      "type": "choice",
      "group": "g5",
      "blank": 10,
      "chapter": "ch2",
      "point": "FM/PM 角度调制",
      "tags": ["FM 与 PM 的关系", "间接调频"]
    },
    {
      "id": "2017-11",
      "num": 5,
      "type": "choice",
      "group": "g5",
      "blank": 11,
      "chapter": "ch2",
      "point": "FM/PM 角度调制",
      "tags": ["FM 与 PM 的关系", "间接调频"]
    },
    {
      "id": "2017-12",
      "num": 5,
      "type": "choice",
      "group": "g5",
      "blank": 12,
      "chapter": "ch2",
      "point": "FM/PM 角度调制",
      "tags": ["FM 与 PM 的关系", "间接调相"]
    },
    {
      "id": "2017-13",
      "num": 5,
      "type": "choice",
      "group": "g5",
      "blank": 13,
      "chapter": "ch2",
      "point": "FM/PM 角度调制",
      "tags": ["FM 与 PM 的关系", "间接调相"]
    },
    {
      "id": "2017-14",
      "num": 6,
      "type": "choice",
      "group": "g6",
      "blank": 14,
      "chapter": "ch2",
      "point": "卡森公式与调制指数",
      "tags": ["最大频偏", "FM"]
    },
    {
      "id": "2017-15",
      "num": 6,
      "type": "choice",
      "group": "g6",
      "blank": 15,
      "chapter": "ch2",
      "point": "卡森公式与调制指数",
      "tags": ["调制指数", "FM"]
    },
    {
      "id": "2017-16",
      "num": 6,
      "type": "choice",
      "group": "g6",
      "blank": 16,
      "chapter": "ch2",
      "point": "卡森公式与调制指数",
      "tags": ["卡森公式", "FM 带宽"]
    },
    {
      "id": "2017-17",
      "num": 7,
      "type": "choice",
      "group": "g7",
      "blank": 17,
      "chapter": "ch4",
      "point": "MPSK/MQAM 星座图与格雷映射",
      "tags": ["16QAM", "星座点能量"]
    },
    {
      "id": "2017-18",
      "num": 7,
      "type": "choice",
      "group": "g7",
      "blank": 18,
      "chapter": "ch4",
      "point": "MPSK/MQAM 星座图与格雷映射",
      "tags": ["16QAM", "星座点能量"]
    },
    {
      "id": "2017-19",
      "num": 8,
      "type": "choice",
      "group": "g8",
      "blank": 19,
      "chapter": "ch3",
      "point": "基带码型（AMI/HDB3等）",
      "tags": ["HDB3", "AMI", "直流分量"]
    },
    {
      "id": "2017-20",
      "num": 8,
      "type": "choice",
      "group": "g8",
      "blank": 20,
      "chapter": "ch3",
      "point": "基带码型（AMI/HDB3等）",
      "tags": ["HDB3", "连零抑制"]
    },
    {
      "id": "2017-21",
      "num": 9,
      "type": "choice",
      "group": "g9",
      "blank": 21,
      "chapter": "ch5",
      "point": "抽样定理",
      "tags": ["带通采样", "最小采样率"]
    },
    {
      "id": "2017-22",
      "num": 10,
      "type": "choice",
      "group": "g10",
      "blank": 22,
      "chapter": "ch4",
      "point": "2ASK/2FSK/2PSK/2DPSK",
      "tags": ["OOK", "误比特率"]
    },
    {
      "id": "2017-23",
      "num": 10,
      "type": "choice",
      "group": "g10",
      "blank": 23,
      "chapter": "ch4",
      "point": "2ASK/2FSK/2PSK/2DPSK",
      "tags": ["2FSK", "误比特率"]
    },
    {
      "id": "2017-24",
      "num": 10,
      "type": "choice",
      "group": "g10",
      "blank": 24,
      "chapter": "ch4",
      "point": "2ASK/2FSK/2PSK/2DPSK",
      "tags": ["2PSK", "误比特率"]
    },
    {
      "id": "2017-25",
      "num": 11,
      "type": "choice",
      "group": "g11",
      "blank": 25,
      "oKey": "options25",
      "chapter": "ch1",
      "point": "白噪声与功率谱密度",
      "tags": ["随机序列的功率谱", "冲激序列"]
    },
    {
      "id": "2017-26",
      "num": 11,
      "type": "choice",
      "group": "g11",
      "blank": 26,
      "oKey": "options26",
      "chapter": "ch1",
      "point": "平稳性与自相关函数",
      "tags": ["平均自相关函数", "循环平稳"]
    },
    {
      "id": "2017-27",
      "num": 11,
      "type": "choice",
      "group": "g11",
      "blank": 27,
      "oKey": "options27",
      "chapter": "ch1",
      "point": "随机过程通过线性系统",
      "tags": ["线性系统输出", "成形滤波"]
    },
    {
      "id": "2017-28",
      "num": 11,
      "type": "choice",
      "group": "g11",
      "blank": 28,
      "oKey": "options28",
      "chapter": "ch1",
      "point": "随机过程通过线性系统",
      "tags": ["功率谱密度", "传递函数"]
    },
    {
      "id": "2017-29",
      "num": 12,
      "type": "choice",
      "group": "g12",
      "blank": 29,
      "chapter": "ch6",
      "point": "卷积码与状态图",
      "tags": ["Viterbi", "最大似然译码"]
    },
    {
      "id": "2017-30",
      "num": 13,
      "type": "choice",
      "group": "g13",
      "blank": 30,
      "chapter": "ch4",
      "point": "2ASK/2FSK/2PSK/2DPSK",
      "tags": ["2FSK", "主瓣带宽"]
    },
    {
      "id": "2017-31",
      "num": 14,
      "type": "choice",
      "group": "g14",
      "blank": 31,
      "oKey": "options31",
      "chapter": "ch5",
      "point": "抽样定理",
      "tags": ["采样信号频谱", "频谱搬移"]
    },
    {
      "id": "2017-32",
      "num": 14,
      "type": "choice",
      "group": "g14",
      "blank": 32,
      "oKey": "options32",
      "chapter": "ch5",
      "point": "抽样定理",
      "tags": ["奈奎斯特采样定理", "混叠"]
    },
    {
      "id": "2017-33",
      "num": 15,
      "type": "choice",
      "group": "g15",
      "blank": 33,
      "oKey": "options33",
      "chapter": "ch3",
      "point": "奈奎斯特准则与无码间串扰",
      "tags": ["部分响应", "第一类部分响应"]
    },
    {
      "id": "2017-34",
      "num": 15,
      "type": "choice",
      "group": "g15",
      "blank": 34,
      "oKey": "options34",
      "chapter": "ch3",
      "point": "奈奎斯特准则与无码间串扰",
      "tags": ["部分响应", "相关编码"]
    },
    {
      "id": "2017-35",
      "num": 16,
      "type": "choice",
      "group": "g16",
      "blank": 35,
      "chapter": "ch6",
      "point": "正交码与哈达玛矩阵",
      "tags": ["哈达玛矩阵", "递推构造"]
    },
    {
      "id": "2017-36",
      "num": 17,
      "type": "choice",
      "group": "g17",
      "blank": 36,
      "chapter": "ch5",
      "point": "哈夫曼编码",
      "tags": ["哈夫曼编码", "平均码长"]
    },
    {
      "id": "2017-二",
      "num": "二",
      "type": "big",
      "score": 16,
      "stem": "下图 (a) 中 $r(t)=s(t)+n(t)$，其中 $s(t)=m(t)\\cos2\\pi f_ct-\\hat m(t)\\sin2\\pi f_ct$ 是已调信号，载频 $f_c=5\\,\\mathrm{kHz}$；$m(t)$ 是功率为 $3\\,\\mathrm W$、带宽为 $2\\,\\mathrm{kHz}$ 的基带信号，$\\hat m(t)$ 是 $m(t)$ 的希尔伯特变换；$n(t)$ 是窄带噪声，其功率谱密度如图 (b) 所示，图中纵坐标的单位是 $\\mathrm{W/kHz}$；LPF 是截止频率为 $2\\,\\mathrm{kHz}$ 的理想低通滤波器。试：",
      "subs": [
        "(1) 问 $s(t)$ 是什么调制方式，并求 $s(t)$ 的带宽及功率；",
        "(2) 求 $y_1(t)$、$y_2(t)$ 的表达式；",
        "(3) 求两个输出端各自的信噪比（折算成 dB 值）；",
        "(4) 画出 $n(t)$ 的同相分量 $n_c(t)$ 的功率谱密度。"
      ],
      "fig": "q2sys",
      "chapter": "ch2",
      "point": "相干解调与抗噪声性能",
      "tags": ["SSB", "相干解调", "输出信噪比", "同相分量"]
    },
    {
      "id": "2017-三",
      "num": "三",
      "type": "big",
      "score": 16,
      "stem": "设二进制双极性传输系统的接收信号为 $$y(t)=\\begin{cases}s(t)+n_w(t),&\\text{send }1\\\\-s(t)+n_w(t),&\\text{send }0\\end{cases}$$ 其中 $n_w(t)$ 是双边功率谱密度为 $N_0/2$ 的高斯白噪声，$s(t)$ 的波形如下图 (a) 所示。接收信号经过一个冲激响应为 $h(t)=s(-t)$ 的滤波器后，在 $t=t_0$ 时刻进行采样判决，如图 (b) 所示。试：",
      "subs": [
        "(1) 求 $s(t)$ 的能量；",
        "(2) 若 $t_0=0$，求采样时刻有用信号的值、噪声功率、判决错误率；",
        "(3) 若 $t_0=1$，求采样时刻有用信号的值、噪声功率、判决错误率。"
      ],
      "fig": "q3sys",
      "chapter": "ch9",
      "point": "相关接收机",
      "tags": ["匹配滤波器", "码间串扰", "误比特率"]
    },
    {
      "id": "2017-四",
      "num": "四",
      "type": "big",
      "score": 16,
      "stem": "设某 8 电平非均匀量化编码器的输入 $X$ 在 $[-8,+8]$ 内均匀分布，编码器输出码字由 3 个比特 $b_1b_2b_3$ 构成，其中 $b_1=1,0$ 表示 $X$ 的极性为正、负；$b_2b_3$ 取 $00$、$01$、$10$、$11$ 分别表示 $X$ 的绝对值落在 $[0,1)$、$[1,2)$、$[2,4)$、$[4,8)$ 区间中。每个区间的量化电平取为区间的中点。试求：",
      "subs": [
        "(1) 量化输入信号 $X$ 的功率 $E[X^2]$；",
        "(2) 量化电平 $Y$ 的各可能取值及其出现概率；",
        "(3) 量化噪声功率 $N_q=E[(Y-X)^2]$；",
        "(4) $b_1$、$b_2$、$b_3$ 各自取 1 的概率。"
      ],
      "fig": null,
      "chapter": "ch5",
      "point": "量化（均匀/最佳量化）",
      "tags": ["非均匀量化", "量化噪声", "PCM 编码"]
    },
    {
      "id": "2017-五",
      "num": "五",
      "type": "big",
      "score": 16,
      "stem": "已知 $(7,4)$ 系统循环码编码器的输入为 $\\boldsymbol u=0010$ 时，输出为 $\\boldsymbol c=0010110$。试：",
      "subs": [
        "(1) 求生成多项式；",
        "(2) 若编码器的输入是 $\\boldsymbol u=0011$，写出编码器输出的码字 $\\boldsymbol c$；",
        "(3) 若译码器的输入是 $\\boldsymbol y=1101101$，写出译码器输出码字 $\\hat{\\boldsymbol c}$；",
        "(4) 若已知编码器输出 $\\boldsymbol c=c_6c_5\\cdots c_0$，其中 $c_3=c_2=c_1=0$，$c_0=1$，求 $c_6$、$c_5$、$c_4$。"
      ],
      "fig": null,
      "chapter": "ch6",
      "point": "循环码",
      "tags": ["循环码", "生成多项式", "伴随式译码"]
    },
    {
      "id": "2017-六",
      "num": "六",
      "type": "big",
      "score": 16,
      "stem": "下图中 $m$ 序列的周期是 7，特征多项式是 $f(x)=1+x^2+x^3$。输出的 $m$ 序列通过卷积码编码后映射为 8PSK 符号，编码器的初始状态为全零。已知 $m$ 序列的输出速率是 $40\\,\\mathrm{kbit/s}$，信道带宽是 $60\\,\\mathrm{kHz}$。试：",
      "subs": [
        "(1) 求 8PSK 系统的符号速率、滚降系数，画出功率谱密度图、画出调制框图；",
        "(2) 画出 $m$ 序列发生器的框图；",
        "(3) 画出该卷积码的状态转移图。"
      ],
      "fig": "q6sys",
      "chapter": "ch4",
      "point": "MPSK/MQAM 星座图与格雷映射",
      "tags": ["8PSK", "滚降系数", "卷积码", "状态转移图", "m 序列"]
    },
    {
      "id": "2017-七",
      "num": "七",
      "type": "big",
      "score": 8,
      "stem": "设 $X$ 是二进制符号，其概率分布为 $\\{p_1,p_2\\}$，$p_1+p_2=1$。试：",
      "subs": [
        "(1) 写出 $X$ 的熵 $H(X)$ 随 $p_1$ 变化的函数式，画出函数曲线图；",
        "(2) 证明熵在 $p_1=p_2=1/2$ 最大，写出熵的最大值。"
      ],
      "fig": null,
      "chapter": "ch7",
      "point": "信源熵/联合熵/条件熵",
      "tags": ["二元熵函数", "熵的极值"]
    },
    {
      "id": "2017-八",
      "num": "八",
      "type": "big",
      "score": 8,
      "stem": "设某二进制通信系统等概发送 $\\boldsymbol s_1=(+1,+1)$ 和 $\\boldsymbol s_2=(-1,-1)$ 之一，接收信号是 $\\boldsymbol r=(r_1,r_2)=\\boldsymbol s+\\boldsymbol n$，其中 $\\boldsymbol n=(n_1,n_2)$ 是零均值高斯噪声向量，$n_1$ 和 $n_2$ 独立同分布，方差均为 1。试：",
      "subs": [
        "(1) 画出星座图；",
        "(2) 写出发送 $\\boldsymbol s_1=(+1,+1)$ 条件下 $r_1$ 的条件概率密度函数 $f(r_1\\mid+1)$ 以及似然概率 $f(\\boldsymbol r\\mid\\boldsymbol s_1)$；",
        "(3) 画出最大似然判决域。"
      ],
      "fig": null,
      "chapter": "ch9",
      "point": "最佳判决门限",
      "tags": ["最大似然", "判决域", "多维星座"]
    }
  ]
};
