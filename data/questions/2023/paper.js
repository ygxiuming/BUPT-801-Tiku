// 2023 · 真题（试卷元数据 + groups + 题干/选项）—— 答案与解析在同目录 answer.js
window.BUPT801 = window.BUPT801 || {};
window.BUPT801.papers = window.BUPT801.papers || {};
window.BUPT801.papers["2023"] = {
  "year": 2023,
  "title": "北京邮电大学2023年硕士研究生招生考试试题",
  "subject": "801 通信原理",
  "note": "请考生注意：(1) 所有答案一律写在答题纸上，否则不计成绩；(2) 不允许使用计算器。",
  "duration": 180,
  "sections": [
    {
      "id": "choice",
      "name": "单项选择题",
      "score": 50,
      "intro": "本大题共 50 个空，每空 1 分，满分 50 分。请按题号把答案填在答题纸上。"
    },
    {
      "id": "big",
      "name": "计算题",
      "score": 100,
      "intro": "本大题共 8 题，第二～七题每题 12 分，第八、九题每题 14 分，共 100 分。"
    }
  ],
  "groups": {
    "g1": {
      "stem": "数据 $1000010000110000$ 经过 AMI 编码后是（1），经过 HDB3 编码后是（2）。",
      "options": {
        "A": "$+000+-000-+-+00+$",
        "B": "$+000+-000-+-000-$",
        "C": "$+0000-0000+-0000$",
        "D": "$+000+-000-+0000-$"
      }
    },
    "g2": {
      "stem": "若基带信号 $m(t)$ 的均值为零、功率为 1 W、最大幅度为 2 V，则 AM 信号 $s(t)=[3+m(t)]\\cos(2\\pi f_ct)$ 的调幅系数是（3），调制效率是（4）。",
      "options": {
        "A": "$1/10$",
        "B": "$1/5$",
        "C": "$1/3$",
        "D": "$2/3$"
      }
    },
    "g3": {
      "stem": "设 $s(t)=\\sum\\limits_{n=-\\infty}^{\\infty}a_ng(t-nT_s)$，其中 $\\{a_n\\}$ 是平稳序列，$g(t)$ 的傅氏变换 $G(f)$ 有界。若 $s(t)$ 的功率谱密度是 $\\delta(f)+\\dfrac{1}{T_s}|G(f)|^2$，则 $\\{a_n\\}$ 是（5）序列，$E[s(t)]=$（6）。",
      "optionSets": ["options5", "options6"],
      "options5": {
        "A": "零均值的相关",
        "B": "零均值的不相关",
        "C": "均值非零的相关",
        "D": "均值非零的不相关"
      },
      "options6": {
        "A": "$g(t)$",
        "B": "无穷大",
        "C": "1",
        "D": "0"
      }
    },
    "g4": {
      "stem": "下列模拟调制中抗噪声性能最好的是（7）。",
      "options": {
        "A": "AM",
        "B": "DSB-SC",
        "C": "FM",
        "D": "SSB"
      }
    },
    "g5": {
      "stem": "OQPSK 将 QPSK 的 Q 路信号延迟了 $T_b$ 时间，其目的是为了（8）。",
      "options": {
        "A": "增大时延",
        "B": "减小带宽",
        "C": "实现非相干解调",
        "D": "降低包络起伏"
      }
    },
    "g6": {
      "stem": "设基带传输系统的符号速率为 $R_s=1/T_s$，根据奈奎斯特准则，当基带传输系统的总体传递函数 $X(f)$ 满足 $R_s\\sum\\limits_{n=-\\infty}^{\\infty}X(f-nR_s)=$（9）时，接收端采样点处无符号间干扰，此时对应的总体冲激响应 $x(t)$ 满足 $x(nT_s)=$（10）。",
      "optionSets": ["options9", "options10"],
      "options9": {
        "A": "$X(f)$",
        "B": "$\\delta(f)$",
        "C": "$0$",
        "D": "$1$"
      },
      "options10": {
        "A": "$\\begin{cases}1,&n=0\\\\0,&n\\ne0\\end{cases}$",
        "B": "$\\begin{cases}1,&n\\ge0\\\\0,&n<0\\end{cases}$",
        "C": "$0$",
        "D": "$1$"
      }
    },
    "g7": {
      "stem": "某基带传输系统的总体传递函数如下图所示，则该系统无符号间干扰传输的最高符号速率是（11）kBaud，对应的频带利用率是（12）Baud/Hz。",
      "optionSets": ["options11", "options12"],
      "options11": {
        "A": "2",
        "B": "3",
        "C": "5",
        "D": "8"
      },
      "options12": {
        "A": "$3/4$",
        "B": "$5/4$",
        "C": "$7/4$",
        "D": "2"
      }
    },
    "g8": {
      "stem": "第 I 类部分响应系统的频带利用率是（13）Baud/Hz。",
      "options": {
        "A": "0.5",
        "B": "1",
        "C": "1.5",
        "D": "2"
      }
    },
    "g9": {
      "stem": "设 $s(t)$ 是速率为 $R_b=2$ kbit/s 的双极性不归零信号，则其主瓣带宽是（14）kHz。令 $y(t)=s(t)+s(t-T_b)$，则 $y(t)$ 的主瓣带宽是（15）kHz。",
      "options": {
        "A": "0.5",
        "B": "1",
        "C": "2",
        "D": "4"
      }
    },
    "g10": {
      "stem": "设 QPSK 的数据速率为 8 Mbit/s，则该系统无符号间干扰传输需要的最小信道带宽是（16）MHz。若采用滚降因子为 1/4 的升余弦滚降，则需要的信道带宽是（17）MHz。",
      "options": {
        "A": "3",
        "B": "4",
        "C": "5",
        "D": "6"
      }
    },
    "g11": {
      "stem": "数字信号通过（18）信道传输时会出现符号间干扰问题，解决此问题的方法之一是在接收端采用（19）技术。",
      "optionSets": ["options18", "options19"],
      "options18": {
        "A": "频率选择性衰落",
        "B": "平坦衰落",
        "C": "AWGN",
        "D": "无失真"
      },
      "options19": {
        "A": "科斯塔斯环",
        "B": "时域均衡",
        "C": "部分响应",
        "D": "差分相干解调"
      }
    },
    "g12": {
      "stem": "数字基带传输系统的眼图在最佳采样时刻的张开度越大，系统的（20）越小。",
      "options": {
        "A": "滚降系数",
        "B": "符号间干扰",
        "C": "带宽",
        "D": "包络起伏"
      }
    },
    "g13": {
      "stem": "下列二进制数字调制中抗噪声性能最好的是（21），频带利用率最差的是（22），只能相干解调的是（23）。",
      "options": {
        "A": "2PSK",
        "B": "OOK",
        "C": "2FSK",
        "D": "2DPSK"
      }
    },
    "g14": {
      "stem": "下列数字调制中抗噪声性能最好的是（24），频带利用率最好的是（25）。",
      "options": {
        "A": "QPSK",
        "B": "16QAM",
        "C": "32FSK",
        "D": "64QAM"
      }
    },
    "g15": {
      "stem": "M 进制信号检测中，ML 准则与 MAP 准则等价的条件是各发送信号的（26）相同。",
      "options": {
        "A": "出现概率",
        "B": "能量",
        "C": "带宽",
        "D": "幅度"
      }
    },
    "g16": {
      "stem": "某 A 律十三折线编码器设计的输入范围是 $[-640\\ \\mathrm{mV},\\,+640\\ \\mathrm{mV}]$，若编码器输入为 $+330\\ \\mathrm{mV}$，则输出为（27）。若译码器输入为 $11100000$，则输出（28）$\\mathrm{mV}$。",
      "optionSets": ["options27", "options28"],
      "options27": {
        "A": "11110000",
        "B": "11100000",
        "C": "11110001",
        "D": "11100001"
      },
      "options28": {
        "A": "+165",
        "B": "+175",
        "C": "+330",
        "D": "+340"
      }
    },
    "g17": {
      "stem": "设随机符号 $X$、$Y$ 的熵分别为 $H(X)$、$H(Y)$，当 $X$、$Y$ 独立时，互信息 $I(X;Y)=$（29），条件熵 $H(Y|X)=$（30），联合熵 $H(X,Y)=$（31）。",
      "options": {
        "A": "$0$",
        "B": "$H(X)$",
        "C": "$H(Y)$",
        "D": "$H(X)+H(Y)$"
      }
    },
    "g18": {
      "stem": "无线通信系统中，发端设置 1 根天线，收端设置 3 根天线，选择信号最强的天线进行接收，这种技术叫（32）。",
      "options": {
        "A": "Rake 接收",
        "B": "最佳接收",
        "C": "分集接收",
        "D": "相干接收"
      }
    },
    "g19": {
      "stem": "无线信道的相干带宽与（33）成反比，相干时间与（34）成反比。",
      "options": {
        "A": "多普勒扩展",
        "B": "时延扩展",
        "C": "信号带宽",
        "D": "符号间隔"
      }
    },
    "g20": {
      "stem": "$(n,k)$ 循环码的生成多项式是（35）的因式。",
      "options": {
        "A": "$x^{n+k}+1$",
        "B": "$x^k+1$",
        "C": "$x^{n-k}+1$",
        "D": "$x^n+1$"
      }
    },
    "g21": {
      "stem": "设模拟基带调制信号的带宽是 5 kHz，则 DSB-SC 已调信号的带宽是（36）kHz，SSB 已调信号的带宽是（37）kHz。",
      "options": {
        "A": "20",
        "B": "15",
        "C": "10",
        "D": "5"
      }
    },
    "g22": {
      "stem": "若 m 序列的特征多项式为 $1+x+x^3$，则其周期为（38），每个周期内有（39）个“0”。",
      "options": {
        "A": "1",
        "B": "3",
        "C": "5",
        "D": "7"
      }
    },
    "g23": {
      "stem": "OFDM 信号中设置循环前缀是为了（40）。",
      "options": {
        "A": "实现扰码",
        "B": "保持子载波正交性",
        "C": "对抗突发错",
        "D": "降低峰均比"
      }
    },
    "g24": {
      "stem": "某线性分组码的校验矩阵为 $$H=\\begin{bmatrix}1&1&0&1&0&0&1\\\\1&1&1&0&1&0&0\\\\1&0&1&1&0&1&0\\end{bmatrix}$$ 则该码的最小码距是（41），能保证纠正（42）位错。若译码器输入为 $y=(1000010)$，则伴随式为 $s=yH^{\\mathrm T}=$（43），对应的可纠正错误图样为（44）。",
      "optionSets": ["options4142", "options43", "options44"],
      "options4142": {
        "A": "0",
        "B": "1",
        "C": "2",
        "D": "3"
      },
      "options43": {
        "A": "000",
        "B": "001",
        "C": "101",
        "D": "110"
      },
      "options44": {
        "A": "0000010",
        "B": "0100000",
        "C": "1000000",
        "D": "0000011"
      }
    },
    "g25": {
      "stem": "下列中的（45）是 $(7,4)$ 循环码的生成多项式，若编码器输入信息是 $1110$，则系统码编码结果是（46）。",
      "optionSets": ["options45", "options46"],
      "options45": {
        "A": "$x^4+x+1$",
        "B": "$x^3+x+1$",
        "C": "$x^2+x+1$",
        "D": "$x+1$"
      },
      "options46": {
        "A": "1110000",
        "B": "1110101",
        "C": "1110110",
        "D": "1110100"
      }
    },
    "g26": {
      "stem": "2DPSK 的非相干解调可以采用下列中的（47）解调。",
      "options": {
        "A": "平方律检波",
        "B": "锁相鉴频",
        "C": "差分相干",
        "D": "包络检波"
      }
    },
    "g27": {
      "stem": "令 $A=H_4H_4^{\\mathrm T}$，其中 $H_4$ 是元素取值于 $\\{\\pm1\\}$ 的 4 阶哈达玛矩阵，则 $A$ 的第 1 行第 1 列元素是（48），第 1 行第 2 列元素是（49）。",
      "options": {
        "A": "0",
        "B": "1",
        "C": "2",
        "D": "4"
      }
    },
    "g28": {
      "stem": "直接序列扩频能克服窄带干扰，若带宽扩展 20 倍，解扩后信噪比可提升大约（50）dB。",
      "options": {
        "A": "3",
        "B": "13",
        "C": "23",
        "D": "33"
      }
    }
  },
  "questions": [
    {
      "id": "2023-1", "num": 1, "type": "choice", "group": "g1", "blank": 1,
      "chapter": "ch3", "point": "基带码型（AMI/HDB3等）", "tags": ["AMI", "HDB3", "4连零取代"]
    },
    {
      "id": "2023-2", "num": 2, "type": "choice", "group": "g1", "blank": 2,
      "chapter": "ch3", "point": "基带码型（AMI/HDB3等）", "tags": ["HDB3", "极性交替"]
    },
    {
      "id": "2023-3", "num": 3, "type": "choice", "group": "g2", "blank": 3,
      "chapter": "ch2", "point": "AM/DSB-SC/SSB/VSB 原理与带宽", "tags": ["调幅系数"]
    },
    {
      "id": "2023-4", "num": 4, "type": "choice", "group": "g2", "blank": 4,
      "chapter": "ch2", "point": "AM/DSB-SC/SSB/VSB 原理与带宽", "tags": ["调制效率"]
    },
    {
      "id": "2023-5", "num": 5, "type": "choice", "group": "g3", "blank": 5, "oKey": "options5",
      "chapter": "ch1", "point": "平稳性与自相关函数", "tags": ["功率谱", "均值", "不相关"]
    },
    {
      "id": "2023-6", "num": 6, "type": "choice", "group": "g3", "blank": 6, "oKey": "options6",
      "chapter": "ch1", "point": "平稳性与自相关函数", "tags": ["直流分量", "功率谱"]
    },
    {
      "id": "2023-7", "num": 7, "type": "choice", "group": "g4", "blank": 7,
      "chapter": "ch2", "point": "相干解调与抗噪声性能", "tags": ["抗噪声性能"]
    },
    {
      "id": "2023-8", "num": 8, "type": "choice", "group": "g5", "blank": 8,
      "chapter": "ch4", "point": "MPSK/MQAM 星座图与格雷映射", "tags": ["OQPSK", "包络起伏"]
    },
    {
      "id": "2023-9", "num": 9, "type": "choice", "group": "g6", "blank": 9, "oKey": "options9",
      "chapter": "ch3", "point": "奈奎斯特准则与无码间串扰", "tags": ["奈奎斯特准则"]
    },
    {
      "id": "2023-10", "num": 10, "type": "choice", "group": "g6", "blank": 10, "oKey": "options10",
      "chapter": "ch3", "point": "奈奎斯特准则与无码间串扰", "tags": ["无码间串扰", "冲激响应"]
    },
    {
      "id": "2023-11", "num": 11, "type": "choice", "group": "g7", "blank": 11, "oKey": "options11",
      "fig": "q7spec",
      "chapter": "ch3", "point": "升余弦滚降与带宽", "tags": ["梯形谱", "奈奎斯特速率"]
    },
    {
      "id": "2023-12", "num": 12, "type": "choice", "group": "g7", "blank": 12, "oKey": "options12",
      "chapter": "ch3", "point": "升余弦滚降与带宽", "tags": ["频带利用率"]
    },
    {
      "id": "2023-13", "num": 13, "type": "choice", "group": "g8", "blank": 13,
      "chapter": "ch3", "point": "奈奎斯特准则与无码间串扰", "tags": ["部分响应", "频带利用率"]
    },
    {
      "id": "2023-14", "num": 14, "type": "choice", "group": "g9", "blank": 14,
      "chapter": "ch3", "point": "基带码型（AMI/HDB3等）", "tags": ["主瓣带宽", "NRZ"]
    },
    {
      "id": "2023-15", "num": 15, "type": "choice", "group": "g9", "blank": 15,
      "chapter": "ch3", "point": "基带码型（AMI/HDB3等）", "tags": ["部分响应", "主瓣带宽"]
    },
    {
      "id": "2023-16", "num": 16, "type": "choice", "group": "g10", "blank": 16,
      "chapter": "ch3", "point": "升余弦滚降与带宽", "tags": ["QPSK", "奈奎斯特带宽"]
    },
    {
      "id": "2023-17", "num": 17, "type": "choice", "group": "g10", "blank": 17,
      "chapter": "ch3", "point": "升余弦滚降与带宽", "tags": ["升余弦", "带宽"]
    },
    {
      "id": "2023-18", "num": 18, "type": "choice", "group": "g11", "blank": 18, "oKey": "options18",
      "chapter": "ch3", "point": "码间串扰分析", "tags": ["频率选择性衰落", "ISI"]
    },
    {
      "id": "2023-19", "num": 19, "type": "choice", "group": "g11", "blank": 19, "oKey": "options19",
      "chapter": "ch3", "point": "码间串扰分析", "tags": ["时域均衡"]
    },
    {
      "id": "2023-20", "num": 20, "type": "choice", "group": "g12", "blank": 20,
      "chapter": "ch3", "point": "眼图", "tags": ["眼图", "张开度"]
    },
    {
      "id": "2023-21", "num": 21, "type": "choice", "group": "g13", "blank": 21,
      "chapter": "ch4", "point": "2ASK/2FSK/2PSK/2DPSK", "tags": ["抗噪声性能"]
    },
    {
      "id": "2023-22", "num": 22, "type": "choice", "group": "g13", "blank": 22,
      "chapter": "ch4", "point": "2ASK/2FSK/2PSK/2DPSK", "tags": ["频带利用率"]
    },
    {
      "id": "2023-23", "num": 23, "type": "choice", "group": "g13", "blank": 23,
      "chapter": "ch4", "point": "2ASK/2FSK/2PSK/2DPSK", "tags": ["相干解调"]
    },
    {
      "id": "2023-24", "num": 24, "type": "choice", "group": "g14", "blank": 24,
      "chapter": "ch4", "point": "多进制调制的误码性能与带宽", "tags": ["MFSK", "抗噪声"]
    },
    {
      "id": "2023-25", "num": 25, "type": "choice", "group": "g14", "blank": 25,
      "chapter": "ch4", "point": "多进制调制的误码性能与带宽", "tags": ["MQAM", "频带利用率"]
    },
    {
      "id": "2023-26", "num": 26, "type": "choice", "group": "g15", "blank": 26,
      "chapter": "ch9", "point": "最佳判决门限", "tags": ["ML", "MAP"]
    },
    {
      "id": "2023-27", "num": 27, "type": "choice", "group": "g16", "blank": 27, "oKey": "options27",
      "chapter": "ch5", "point": "A律13折线与PCM编码", "tags": ["A律13折线", "编码"]
    },
    {
      "id": "2023-28", "num": 28, "type": "choice", "group": "g16", "blank": 28, "oKey": "options28",
      "chapter": "ch5", "point": "A律13折线与PCM编码", "tags": ["A律13折线", "译码"]
    },
    {
      "id": "2023-29", "num": 29, "type": "choice", "group": "g17", "blank": 29,
      "chapter": "ch7", "point": "信源熵/联合熵/条件熵", "tags": ["互信息"]
    },
    {
      "id": "2023-30", "num": 30, "type": "choice", "group": "g17", "blank": 30,
      "chapter": "ch7", "point": "信源熵/联合熵/条件熵", "tags": ["条件熵"]
    },
    {
      "id": "2023-31", "num": 31, "type": "choice", "group": "g17", "blank": 31,
      "chapter": "ch7", "point": "信源熵/联合熵/条件熵", "tags": ["联合熵"]
    },
    {
      "id": "2023-32", "num": 32, "type": "choice", "group": "g18", "blank": 32,
      "chapter": "ch1", "point": "分集接收与 Rake", "tags": ["选择式分集"]
    },
    {
      "id": "2023-33", "num": 33, "type": "choice", "group": "g19", "blank": 33,
      "chapter": "ch1", "point": "无线信道（多径/多普勒/相干带宽）", "tags": ["相干带宽", "时延扩展"]
    },
    {
      "id": "2023-34", "num": 34, "type": "choice", "group": "g19", "blank": 34,
      "chapter": "ch1", "point": "无线信道（多径/多普勒/相干带宽）", "tags": ["相干时间", "多普勒扩展"]
    },
    {
      "id": "2023-35", "num": 35, "type": "choice", "group": "g20", "blank": 35,
      "chapter": "ch6", "point": "循环码", "tags": ["生成多项式"]
    },
    {
      "id": "2023-36", "num": 36, "type": "choice", "group": "g21", "blank": 36,
      "chapter": "ch2", "point": "AM/DSB-SC/SSB/VSB 原理与带宽", "tags": ["DSB带宽"]
    },
    {
      "id": "2023-37", "num": 37, "type": "choice", "group": "g21", "blank": 37,
      "chapter": "ch2", "point": "AM/DSB-SC/SSB/VSB 原理与带宽", "tags": ["SSB带宽"]
    },
    {
      "id": "2023-38", "num": 38, "type": "choice", "group": "g22", "blank": 38,
      "chapter": "ch6", "point": "m序列与本原多项式", "tags": ["m序列周期"]
    },
    {
      "id": "2023-39", "num": 39, "type": "choice", "group": "g22", "blank": 39,
      "chapter": "ch6", "point": "m序列与本原多项式", "tags": ["m序列", "平衡性"]
    },
    {
      "id": "2023-40", "num": 40, "type": "choice", "group": "g23", "blank": 40,
      "chapter": "ch4", "point": "OFDM 与多载波调制", "tags": ["循环前缀"]
    },
    {
      "id": "2023-41", "num": 41, "type": "choice", "group": "g24", "blank": 41, "oKey": "options4142",
      "chapter": "ch6", "point": "校验矩阵与伴随式", "tags": ["最小码距"]
    },
    {
      "id": "2023-42", "num": 42, "type": "choice", "group": "g24", "blank": 42, "oKey": "options4142",
      "chapter": "ch6", "point": "校验矩阵与伴随式", "tags": ["纠错能力"]
    },
    {
      "id": "2023-43", "num": 43, "type": "choice", "group": "g24", "blank": 43, "oKey": "options43",
      "chapter": "ch6", "point": "校验矩阵与伴随式", "tags": ["伴随式"]
    },
    {
      "id": "2023-44", "num": 44, "type": "choice", "group": "g24", "blank": 44, "oKey": "options44",
      "chapter": "ch6", "point": "校验矩阵与伴随式", "tags": ["错误图样"]
    },
    {
      "id": "2023-45", "num": 45, "type": "choice", "group": "g25", "blank": 45, "oKey": "options45",
      "chapter": "ch6", "point": "循环码", "tags": ["生成多项式", "因式分解"]
    },
    {
      "id": "2023-46", "num": 46, "type": "choice", "group": "g25", "blank": 46, "oKey": "options46",
      "chapter": "ch6", "point": "循环码", "tags": ["系统码", "多项式除法"]
    },
    {
      "id": "2023-47", "num": 47, "type": "choice", "group": "g26", "blank": 47,
      "chapter": "ch4", "point": "2ASK/2FSK/2PSK/2DPSK", "tags": ["2DPSK", "差分相干"]
    },
    {
      "id": "2023-48", "num": 48, "type": "choice", "group": "g27", "blank": 48,
      "chapter": "ch6", "point": "正交码与哈达玛矩阵", "tags": ["哈达玛矩阵"]
    },
    {
      "id": "2023-49", "num": 49, "type": "choice", "group": "g27", "blank": 49,
      "chapter": "ch6", "point": "正交码与哈达玛矩阵", "tags": ["哈达玛矩阵", "正交性"]
    },
    {
      "id": "2023-50", "num": 50, "type": "choice", "group": "g28", "blank": 50,
      "chapter": "ch6", "point": "扩频通信与处理增益", "tags": ["直扩", "处理增益"]
    },
    {
      "id": "2023-二", "num": "二", "type": "big", "score": 12,
      "stem": "下图中，双边功率谱密度为 $N_0/2$ 的加性白高斯噪声 $n_w(t)$ 通过一个通带为 $f_c\\le|f|\\le f_c+B$、增益为 1 的理想带通滤波器后成为窄带噪声 $n(t)$，对应的解析信号是 $z(t)$、复包络是 $n_L(t)$、同相分量和正交分量分别是 $n_c(t)$ 和 $n_s(t)$。试：",
      "subs": [
        "(1) 写出 $n(t)$、$n_L(t)$ 的功率；",
        "(2) 画出 $z(t)$、$n_L(t)$、$n_c(t)$ 的功率谱密度图；",
        "(3) 写出 $n_L(t)$、$n_c(t)$ 的自相关函数；",
        "(4) 写出 $X=n_c(0)$ 与 $Y=n_s(0)$ 的联合概率密度函数。"
      ],
      "fig": "q2sys",
      "chapter": "ch1", "point": "希尔伯特变换与复包络",
      "tags": ["窄带噪声", "解析信号", "功率谱", "自相关函数"]
    },
    {
      "id": "2023-三", "num": "三", "type": "big", "score": 12,
      "stem": "某调频器的输入为 $m_1(t)=2\\cos(200\\pi t)$ 时，输出为 $s_1(t)=2\\cos\\left[2\\pi\\times10^6t+5\\sin(200\\pi t)\\right]$。输入为 $m_2(t)=3\\cos(300\\pi t)$ 时，输出为 $s_2(t)=2\\cos\\left[2\\pi\\times10^6t+\\theta_2(t)\\right]$。试求：",
      "subs": [
        "(1) $s_1(t)$ 的最大频偏、调频指数、近似带宽；",
        "(2) 该调频器的调频灵敏度 $K_f$；",
        "(3) $\\theta_2(t)$ 的表达式，$s_2(t)$ 的最大频偏、近似带宽。"
      ],
      "fig": null,
      "chapter": "ch2", "point": "FM/PM 角度调制",
      "tags": ["最大频偏", "调频指数", "卡森公式", "调频灵敏度"]
    },
    {
      "id": "2023-四", "num": "四", "type": "big", "score": 12,
      "stem": "某二进制系统在比特周期 $[0,T_b]$ 内等概发送 $s_1(t)=g(t)$ 或 $s_2(t)=-g(t)$，其中 $g(t)=\\begin{cases}1,&0\\le t\\le 3T_b/4\\\\0,&\\text{else}\\end{cases}$。发送信号经过信道传输时叠加了单边功率谱密度为 $N_0$ 的加性白高斯噪声 $n_w(t)$。接收信号 $r(t)=s_i(t)+n_w(t)$（$i=1$ 或 2）通过冲激响应为 $h(t)$ 的滤波器后在 $t=T_b$ 时刻采样得到判决量 $y$，然后根据其极性判定发送的是 $s_1(t)$ 还是 $s_2(t)$。",
      "subs": [
        "(1) 若 $h(t)$ 为对 $g(t)$ 匹配的匹配滤波器，画出 $h(t)$ 的波形，并求出发送 $s_1(t)$ 条件下 $y$ 的均值、方差、判决出错的概率；",
        "(2) 若 $h(t)=g(t)$，求发送 $s_1(t)$ 条件下 $y$ 的均值、判决出错的概率。"
      ],
      "fig": null,
      "chapter": "ch9", "point": "相关接收机",
      "tags": ["匹配滤波器", "误比特率", "极性判决"]
    },
    {
      "id": "2023-五", "num": "五", "type": "big", "score": 12,
      "stem": "下图所示为某八进制调制在归一化正交基下的星座图，该星座图上下对称、左右对称，图中 4 个虚线所示的三角形是全等正三角形。已知相邻星点之间的最小距离是 2，各星座点等概出现，发送信号通过 AWGN 信道传输，发送 $s_1$ 条件下实际判为 $s_i$（$i=1,2,\\cdots,8$）的概率为 $p_i$。试：",
      "subs": [
        "(1) 写出星座点 $s_1$、$s_2$、$s_3$ 的坐标以及对应波形的能量；",
        "(2) 画出 $s_1$ 的最佳判决域；",
        "(3) 对 $p_5$、$p_6$、$p_7$、$p_8$ 按从大到小的方式排序。"
      ],
      "fig": "q5const",
      "chapter": "ch4", "point": "MPSK/MQAM 星座图与格雷映射",
      "tags": ["星座图", "判决域", "符号能量", "误符号率排序"]
    },
    {
      "id": "2023-六", "num": "六", "type": "big", "score": 12,
      "stem": "下图中，速率为 3 Mbit/s 的一路比特流分成两路速率为 $R_1$ 和 $R_2$ 的比特流后，分别通过不同的 AWGN 信道传输。假设所用的信道编码译码均能实现香农公式给出的信息传输速率；信道 1 带宽是 $B_1=2$ MHz，输出端的信号功率是 $P_1$，噪声单边功率谱密度是 $N_1=2\\times10^{-9}$ W/Hz；信道 2 带宽是 $B_2=1$ MHz，输出端的信号功率是 $P_2$，噪声单边功率谱密度是 $N_2=1\\times10^{-9}$ W/Hz。试：",
      "subs": [
        "(1) 写出每路信道的噪声功率；",
        "(2) 根据香农公式写出 $P_1$ 与 $R_1$ 的关系式、$P_2$ 与 $R_2$ 的关系式；",
        "(3) 分别按 $R_1$ 为 2 Mbit/s 和 1 Mbit/s 两种情况，求最小所需的总接收信号功率 $P_1+P_2$。"
      ],
      "fig": "q6sys",
      "chapter": "ch7", "point": "信道容量与香农公式",
      "tags": ["香农公式", "信道容量", "功率分配"]
    },
    {
      "id": "2023-七", "num": "七", "type": "big", "score": 12,
      "stem": "某卷积码的生成多项式为 $g_1(x)=1+x+x^2$，$g_2(x)=1+x^2$。试：",
      "subs": [
        "(1) 画出该卷积码的编码器框图、状态转移图；",
        "(2) 若编码器输入为 $111000$，写出编码器的两路输出；",
        "(3) 若译码器在前一时刻到达状态 00、10、11、01 的幸存路径的累积度量分别是 1、2、3、3，当前输入是 11，写出当前时刻到达各状态的幸存路径的累积度量。"
      ],
      "fig": null,
      "chapter": "ch6", "point": "卷积码与状态图",
      "tags": ["卷积码", "生成多项式", "状态转移图", "维特比译码"]
    },
    {
      "id": "2023-八", "num": "八", "type": "big", "score": 14,
      "stem": "下图中，模拟信号的采样值 $X$ 在区间 $[0,4]$ 内均匀分布，量化输出 $Y$ 与输入 $X$ 的关系如下，试：$$Y=\\begin{cases}0.25,&0\\le X<0.5\\\\0.75,&0.5\\le X<1\\\\1.5,&1\\le X<2\\\\3,&2\\le X\\le4\\end{cases}$$",
      "subs": [
        "(1) 写出 $Y$ 各可能取值的出现概率、$Y$ 的熵，并对 $Y$ 进行哈夫曼编码，写出全部码字；",
        "(2) 求量化器输入功率 $E[X^2]$、输出功率 $E[Y^2]$，证明 $E[XY]=E[Y^2]$ 并求量化噪声功率 $E[(Y-X)^2]$。"
      ],
      "fig": "q8sys",
      "chapter": "ch5", "point": "量化（均匀/最佳量化）",
      "tags": ["均匀分布", "哈夫曼编码", "量化噪声", "熵"]
    },
    {
      "id": "2023-九", "num": "九", "type": "big", "score": 14,
      "stem": "下图中，两路模拟信号 $m_1(t)$、$m_2(t)$ 分别经过理想奈奎斯特采样、A 律十三折线编码，然后时分复用为一路，再经过 $(15,7)$ 循环码编码、64QAM 调制后送入无线信道传输。已知 $m_1(t)$ 是最高频率为 4 kHz 的模拟基带信号，$m_2(t)$ 是通带为 3.5 kHz～6 kHz 的带通信号，64QAM 的升余弦滚降系数为 1/4。试：",
      "subs": [
        "(1) 写出两路模拟信号的采样率；",
        "(2) 写出图中 A、B、C、D 处的比特速率，E 处的符号速率；",
        "(3) 画出 64QAM 的调制解调框图，画出 E 点的单边功率谱密度图。"
      ],
      "fig": "q9sys",
      "chapter": "ch5", "point": "抽样定理",
      "tags": ["带通抽样", "时分复用", "循环码", "64QAM", "功率谱"]
    }
  ]
};
