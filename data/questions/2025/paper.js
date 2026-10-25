// 2025 · 真题（试卷元数据 + groups + 题干/选项）—— 答案与解析在同目录 answer.js
// 约定：一组（试卷上的一个圆点条目）一个 group，组干写全该组所有空号（n）与分句，
//       题目本身不再重复组干文字（q.stem 省略），前端/PDF 只渲染一次组干 + 该组各套选项。
window.BUPT801 = window.BUPT801 || {};
window.BUPT801.papers = window.BUPT801.papers || {};
window.BUPT801.papers["2025"] = {
  "year": 2025,
  "title": "北京邮电大学2025年硕士研究生招生考试试题",
  "subject": "801 通信原理",
  "note": "请考生注意：所有答案（包括选择题）一律写在答题纸上，否则不计成绩。",
  "duration": 180,
  "sections": [
    {
      "id": "choice",
      "name": "单项选择题",
      "score": 30,
      "intro": "按下面的格式将答案表复制在答题纸上，然后填写最佳答案。（每题1分，共30分）"
    },
    {
      "id": "big",
      "name": "综合题",
      "score": 120,
      "intro": "（每题15分，共120分）"
    }
  ],
  "groups": {
    "g1": {
      "stem": "设模拟调制系统中的基带信号是零均值平稳高斯过程。DSB-SC 已调信号是（1），SSB 已调信号是（2），FM 已调信号是（3）。",
      "options": {
        "A": "平稳高斯过程",
        "B": "非平稳的高斯过程",
        "C": "平稳非高斯过程",
        "D": "非平稳的非高斯过程"
      }
    },
    "g2": {
      "stem": "设有 FM 信号 $s(t)=4\\cos\\!\\left[2\\pi\\times10^{7}t+6000\\pi\\!\\int_{-\\infty}^{t}m(\\tau)\\,\\mathrm{d}\\tau\\right]$，其中基带信号 $m(t)$ 的带宽是 3 kHz，最大幅度是 3 V。此 FM 信号的功率是（4）W，调制指数是（5），带宽近似是（6）kHz。",
      "options": {
        "A": "3",
        "B": "8",
        "C": "12",
        "D": "24"
      }
    },
    "g3": {
      "stem": "设模拟调制系统中基带信号的带宽为 4 kHz。DSB-SC、AM、SSB 已调信号的带宽分别为（7）kHz、（8）kHz、（9）kHz。",
      "options": {
        "A": "2",
        "B": "4",
        "C": "6",
        "D": "8"
      }
    },
    "g4": {
      "stem": "某三进制符号的概率分布为 $\\left\\{\\dfrac12,\\ \\dfrac13,\\ \\dfrac16\\right\\}$，对其做哈夫曼编码后，平均码长是（10）bit。",
      "options": {
        "A": "1",
        "B": "1.2",
        "C": "1.5",
        "D": "2"
      }
    },
    "g5": {
      "stem": "数字基带 PAM 信号在示波器上重复扫描形成的图像称为（11）。",
      "options": {
        "A": "状态图",
        "B": "频谱图",
        "C": "星座图",
        "D": "眼图"
      }
    },
    "g6": {
      "stem": "BPSK 的接收端经常采用科斯塔斯环来实现（12）。为了解决其中存在的（13）问题，可改用 2DPSK 调制。",
      "optionSets": [
        "options12",
        "options13"
      ],
      "options12": {
        "A": "频谱搬移",
        "B": "定时同步",
        "C": "匹配滤波",
        "D": "载波同步"
      },
      "options13": {
        "A": "相位模糊",
        "B": "定时偏差",
        "C": "符号间干扰",
        "D": "多普勒频移"
      }
    },
    "g7": {
      "stem": "单边功率谱密度为 $N_0=2$ W/Hz 的白高斯噪声通过一个冲激响应为 $h(t)$ 的带通滤波器后成为 $n(t)$，已知 $h(t)$ 的能量为 1 J。$n(t)$ 服从方差为（14）的（15）分布，其相位服从（16）分布，包络服从（17）分布。",
      "optionSets": [
        "options14",
        "options151617"
      ],
      "options14": {
        "A": "0.5",
        "B": "1",
        "C": "2",
        "D": "4"
      },
      "options151617": {
        "A": "瑞利",
        "B": "高斯",
        "C": "指数",
        "D": "均匀"
      }
    },
    "g8": {
      "stem": "某 A 律 13 折线量化编码器的动态范围是 $[-2048,\\ 2048]$ mV。当编码器输入的样值为 $x=+1020$ mV 时，输出的码字为（18）。",
      "options": {
        "A": "11100110",
        "B": "11011111",
        "C": "11101111",
        "D": "11111111"
      }
    },
    "g9": {
      "stem": "某 1024QAM 系统的信道带宽为 1 MHz。该系统无 ISI 传输的最高比特速率为（19）Mbit/s。若该系统采用了升余弦滚降，滚降因子为 1/4，则无 ISI 传输的最高比特速率为（20）Mbit/s。",
      "options": {
        "A": "8",
        "B": "10",
        "C": "16",
        "D": "20"
      }
    },
    "g10": {
      "stem": "将 $(n,k)$ 循环码的码字表示为多项式 $c(x)$，则 $c(x)$ 与生成多项式 $g(x)$ 的关系是（21）。",
      "options": {
        "A": "$c(x)$ 能被 $g(x)$ 整除",
        "B": "$c(x)$ 与 $g(x)$ 次数相同",
        "C": "$c(x)g(x)=x^n+1$",
        "D": "$c(x)$ 不能被 $g(x)$ 整除"
      }
    },
    "g11": {
      "stem": "HDB3 码主要用于（22）。与 AMI 码相比，HDB3 码的优点是（23）。",
      "optionSets": [
        "options22",
        "options23"
      ],
      "options22": {
        "A": "数字基带设备接口",
        "B": "无线空中接口",
        "C": "电源接口",
        "D": "时钟接口"
      },
      "options23": {
        "A": "能够隔直流传输",
        "B": "主瓣带宽小",
        "C": "没有长连零",
        "D": "平均功率低"
      }
    },
    "g12": {
      "stem": "零均值平稳信号 $s(t)$ 的希尔伯特变换为 $\\hat s(t)$。若 $s(t)$ 的自相关函数为 $R_s(\\tau)$，则 $\\hat s(t)$ 与 $s(t)$ 的互相关函数是 $R_s(\\tau)$ 的（24）变换。",
      "options": {
        "A": "希尔伯特",
        "B": "拉普拉斯",
        "C": "傅里叶",
        "D": "哈达玛"
      }
    },
    "g13": {
      "stem": "根据香农公式，通过 AWGN 信道传输信息时，若要求频带利用率为 $\\eta$（bit/s/Hz），所需的比特信噪比 $E_b/N_0$ 应当大于等于（25）。给定噪声单边功率谱密度 $N_0$，当频带利用率非常高时，频带利用率每增加 1 bit/s/Hz，要求比特能量 $E_b$ 至少提高（26）。",
      "optionSets": [
        "options25",
        "options26"
      ],
      "options25": {
        "A": "$\\dfrac{2}{\\eta}$",
        "B": "$\\log_2(1+\\eta)$",
        "C": "$\\dfrac{2^{\\eta}-1}{\\eta}$",
        "D": "$\\mathrm{e}^{\\eta}$"
      },
      "options26": {
        "A": "3 dB",
        "B": "1 J",
        "C": "1 dB",
        "D": "50%"
      }
    },
    "g14": {
      "stem": "下列信道中，最适合采用 OFDM 技术的是（27）。",
      "options": {
        "A": "多普勒扩展很大的瑞利信道",
        "B": "相干带宽很大的时变信道",
        "C": "相干带宽较小的时不变信道",
        "D": "多径时延扩展很小的莱斯信道"
      }
    },
    "g15": {
      "stem": "下列中，（28）是周期为 7 的 m 序列的特征多项式。",
      "options": {
        "A": "$1+x^3$",
        "B": "$1+x+x^2+x^3$",
        "C": "$1+x+x^3$",
        "D": "$1+x+x^4$"
      }
    },
    "g16": {
      "stem": "保持比特信噪比 $E_b/N_0$ 及比特速率 $R_b$ 不变，进制数 $M$ 增加时，MFSK 的（29），MQAM 的（30）。",
      "options": {
        "A": "误符号率下降，带宽减小",
        "B": "误符号率增大，带宽减小",
        "C": "误符号率下降，带宽增大",
        "D": "误符号率增大，带宽增大"
      }
    }
  },
  "questions": [
    {
      "id": "2025-1",
      "num": 1,
      "type": "choice",
      "group": "g1",
      "blank": 1,
      "chapter": "ch2",
      "point": "已调信号的统计特性",
      "tags": [
        "平稳性判别",
        "高斯过程的线性变换"
      ]
    },
    {
      "id": "2025-2",
      "num": 2,
      "type": "choice",
      "group": "g1",
      "blank": 2,
      "chapter": "ch2",
      "point": "已调信号的统计特性",
      "tags": [
        "平稳性判别",
        "希尔伯特变换"
      ]
    },
    {
      "id": "2025-3",
      "num": 3,
      "type": "choice",
      "group": "g1",
      "blank": 3,
      "chapter": "ch2",
      "point": "已调信号的统计特性",
      "tags": [
        "平稳性判别",
        "非线性调制"
      ]
    },
    {
      "id": "2025-4",
      "num": 4,
      "type": "choice",
      "group": "g2",
      "blank": 4,
      "chapter": "ch2",
      "point": "FM/PM 角度调制",
      "tags": [
        "恒包络功率",
        "卡森公式"
      ]
    },
    {
      "id": "2025-5",
      "num": 5,
      "type": "choice",
      "group": "g2",
      "blank": 5,
      "chapter": "ch2",
      "point": "卡森公式与调制指数",
      "tags": [
        "最大频偏",
        "调制指数"
      ]
    },
    {
      "id": "2025-6",
      "num": 6,
      "type": "choice",
      "group": "g2",
      "blank": 6,
      "chapter": "ch2",
      "point": "卡森公式与调制指数",
      "tags": [
        "卡森公式",
        "宽带调频"
      ]
    },
    {
      "id": "2025-7",
      "num": 7,
      "type": "choice",
      "group": "g3",
      "blank": 7,
      "chapter": "ch2",
      "point": "AM/DSB-SC/SSB/VSB 原理与带宽",
      "tags": [
        "已调信号带宽"
      ]
    },
    {
      "id": "2025-8",
      "num": 8,
      "type": "choice",
      "group": "g3",
      "blank": 8,
      "chapter": "ch2",
      "point": "AM/DSB-SC/SSB/VSB 原理与带宽",
      "tags": [
        "已调信号带宽"
      ]
    },
    {
      "id": "2025-9",
      "num": 9,
      "type": "choice",
      "group": "g3",
      "blank": 9,
      "chapter": "ch2",
      "point": "AM/DSB-SC/SSB/VSB 原理与带宽",
      "tags": [
        "已调信号带宽",
        "单边带"
      ]
    },
    {
      "id": "2025-10",
      "num": 10,
      "type": "choice",
      "group": "g4",
      "blank": 10,
      "chapter": "ch5",
      "point": "哈夫曼编码",
      "tags": [
        "哈夫曼编码",
        "平均码长",
        "熵校验"
      ]
    },
    {
      "id": "2025-11",
      "num": 11,
      "type": "choice",
      "group": "g5",
      "blank": 11,
      "chapter": "ch3",
      "point": "眼图",
      "tags": [
        "眼图",
        "实验观察"
      ]
    },
    {
      "id": "2025-12",
      "num": 12,
      "type": "choice",
      "group": "g6",
      "blank": 12,
      "oKey": "options12",
      "chapter": "ch8",
      "point": "载波同步（平方环/科斯塔斯环）",
      "tags": [
        "载波同步",
        "科斯塔斯环"
      ]
    },
    {
      "id": "2025-13",
      "num": 13,
      "type": "choice",
      "group": "g6",
      "blank": 13,
      "oKey": "options13",
      "chapter": "ch8",
      "point": "相位模糊及其消除",
      "tags": [
        "相位模糊",
        "2DPSK"
      ]
    },
    {
      "id": "2025-14",
      "num": 14,
      "type": "choice",
      "group": "g7",
      "blank": 14,
      "oKey": "options14",
      "chapter": "ch1",
      "point": "随机过程通过线性系统",
      "tags": [
        "输出噪声方差",
        "帕塞瓦尔定理"
      ]
    },
    {
      "id": "2025-15",
      "num": 15,
      "type": "choice",
      "group": "g7",
      "blank": 15,
      "oKey": "options151617",
      "chapter": "ch1",
      "point": "窄带高斯过程（包络/相位分布）",
      "tags": [
        "高斯性保持",
        "线性系统"
      ]
    },
    {
      "id": "2025-16",
      "num": 16,
      "type": "choice",
      "group": "g7",
      "blank": 16,
      "oKey": "options151617",
      "chapter": "ch1",
      "point": "窄带高斯过程（包络/相位分布）",
      "tags": [
        "窄带高斯过程",
        "相位分布"
      ]
    },
    {
      "id": "2025-17",
      "num": 17,
      "type": "choice",
      "group": "g7",
      "blank": 17,
      "oKey": "options151617",
      "chapter": "ch1",
      "point": "窄带高斯过程（包络/相位分布）",
      "tags": [
        "瑞利分布",
        "包络"
      ]
    },
    {
      "id": "2025-18",
      "num": 18,
      "type": "choice",
      "group": "g8",
      "blank": 18,
      "chapter": "ch5",
      "point": "A律13折线与PCM编码",
      "tags": [
        "A律13折线",
        "段落判定",
        "PCM编码"
      ]
    },
    {
      "id": "2025-19",
      "num": 19,
      "type": "choice",
      "group": "g9",
      "blank": 19,
      "chapter": "ch4",
      "point": "频带利用率",
      "tags": [
        "奈奎斯特准则",
        "MQAM频带利用率"
      ]
    },
    {
      "id": "2025-20",
      "num": 20,
      "type": "choice",
      "group": "g9",
      "blank": 20,
      "chapter": "ch3",
      "point": "升余弦滚降与带宽",
      "tags": [
        "升余弦滚降",
        "奈奎斯特带宽"
      ]
    },
    {
      "id": "2025-21",
      "num": 21,
      "type": "choice",
      "group": "g10",
      "blank": 21,
      "chapter": "ch6",
      "point": "循环码",
      "tags": [
        "循环码",
        "生成多项式"
      ]
    },
    {
      "id": "2025-22",
      "num": 22,
      "type": "choice",
      "group": "g11",
      "blank": 22,
      "oKey": "options22",
      "chapter": "ch3",
      "point": "基带码型（AMI/HDB3等）",
      "tags": [
        "HDB3",
        "传输接口"
      ]
    },
    {
      "id": "2025-23",
      "num": 23,
      "type": "choice",
      "group": "g11",
      "blank": 23,
      "oKey": "options23",
      "chapter": "ch3",
      "point": "基带码型（AMI/HDB3等）",
      "tags": [
        "HDB3",
        "长连零问题"
      ]
    },
    {
      "id": "2025-24",
      "num": 24,
      "type": "choice",
      "group": "g12",
      "blank": 24,
      "chapter": "ch1",
      "point": "希尔伯特变换与复包络",
      "tags": [
        "希尔伯特变换",
        "互相关函数"
      ]
    },
    {
      "id": "2025-25",
      "num": 25,
      "type": "choice",
      "group": "g13",
      "blank": 25,
      "oKey": "options25",
      "chapter": "ch7",
      "point": "信道容量与香农公式",
      "tags": [
        "香农公式",
        "频带利用率",
        "Eb/N0"
      ]
    },
    {
      "id": "2025-26",
      "num": 26,
      "type": "choice",
      "group": "g13",
      "blank": 26,
      "oKey": "options26",
      "chapter": "ch7",
      "point": "Eb/N0 与极限性能",
      "tags": [
        "香农公式",
        "带宽换功率"
      ]
    },
    {
      "id": "2025-27",
      "num": 27,
      "type": "choice",
      "group": "g14",
      "blank": 27,
      "chapter": "ch4",
      "point": "OFDM 与多载波调制",
      "tags": [
        "OFDM",
        "频率选择性衰落",
        "相干带宽"
      ]
    },
    {
      "id": "2025-28",
      "num": 28,
      "type": "choice",
      "group": "g15",
      "blank": 28,
      "chapter": "ch6",
      "point": "m序列与本原多项式",
      "tags": [
        "m序列",
        "本原多项式"
      ]
    },
    {
      "id": "2025-29",
      "num": 29,
      "type": "choice",
      "group": "g16",
      "blank": 29,
      "chapter": "ch4",
      "point": "多进制调制的误码性能与带宽",
      "tags": [
        "MFSK",
        "正交调制",
        "带宽换可靠性"
      ]
    },
    {
      "id": "2025-30",
      "num": 30,
      "type": "choice",
      "group": "g16",
      "blank": 30,
      "chapter": "ch4",
      "point": "多进制调制的误码性能与带宽",
      "tags": [
        "MQAM",
        "频带利用率",
        "与参考答案差异"
      ]
    },
    {
      "id": "2025-二",
      "num": "二",
      "type": "big",
      "score": 15,
      "stem": "设 $n_B(t)$ 是零均值平稳高斯过程，其自相关函数为 $R_{n_B}(\\tau)=N_0B\\,\\mathrm{sinc}(2B\\tau)$。令 $Z_1=\\int_{-\\infty}^{\\infty}n_B(t)g(t)\\,\\mathrm dt$、$Z_2=\\int_{-\\infty}^{\\infty}n_B(t)g(t-T_s)\\,\\mathrm dt$，其中 $g(t)=\\dfrac{1}{\\sqrt{T_s}}\\,\\mathrm{sinc}\\!\\left(\\dfrac{t}{T_s}\\right)$，$B$ 充分大。试求：",
      "subs": [
        "(1) $g(t)$ 的能量谱密度、能量；",
        "(2) $g(t-T_s)$ 与 $g(t)$ 的内积；",
        "(3) $n_B(t)$ 的功率、功率谱密度；",
        "(4) $Z_1$、$Z_2$ 的均值、方差、协方差。"
      ],
      "fig": null,
      "chapter": "ch1",
      "point": "随机过程通过线性系统",
      "tags": [
        "维纳-辛钦",
        "帕塞瓦尔",
        "白噪声近似",
        "sinc正交性"
      ]
    },
    {
      "id": "2025-三",
      "num": "三",
      "type": "big",
      "score": 15,
      "stem": "下图中，$s(t)=\\mathrm{Re}\\{[m(t)+\\mathrm j\\hat m(t)]\\mathrm e^{\\mathrm j2\\pi f_ct}\\}$ 是 SSB 已调信号，其中基带调制信号为 $m(t)=2\\cos(800\\pi t)+\\cos(1800\\pi t)$，$\\hat m(t)$ 是 $m(t)$ 的希尔伯特变换，载频 $f_c=5\\,$kHz。已调信号通过 AWGN 信道传输，到达接收端的信号为 $r(t)=s(t)+n_w(t)$，其中加性白高斯噪声 $n_w(t)$ 的单边功率谱密度为 $N_0=5\\times10^{-7}\\,$W/Hz，接收端 BPF 的通带范围为 5 kHz~6 kHz，LPF 的截止频率是 1 kHz。试求：",
      "subs": [
        "(1) $m(t)$ 的功率、功率谱密度；",
        "(2) $\\hat m(t)$ 的时域表达式；",
        "(3) $s(t)$ 复包络 $s_L(t)$ 的时域表达式；",
        "(4) 解调输出信噪比。"
      ],
      "fig": "ssb",
      "chapter": "ch2",
      "point": "相干解调与抗噪声性能",
      "tags": [
        "SSB",
        "希尔伯特变换",
        "复包络",
        "解调增益"
      ]
    },
    {
      "id": "2025-四",
      "num": "四",
      "type": "big",
      "score": 15,
      "stem": "下图所示为一 PAM 系统，其中 $d(t)=\\sum_{n=-\\infty}^{\\infty}a_n\\delta(t-nT_s)$，序列 $\\{a_n\\}$ 是零均值平稳不相关序列，$E[a_n^2]=1$。发送及接收滤波器的传递函数为 $G_T(f)=G_R(f)=\\sqrt{T_s}\\cdot\\mathrm{rect}(fT_s)$。信道输入为 $s(t)=\\sum_{n=-\\infty}^{\\infty}a_ng_T(t-nT_s)$，其中 $g_T(t)$ 是发送滤波器的冲激响应。信道输出 $y(t)=s(t)-s(t-2T_s)$。接收滤波器输入为 $r(t)=y(t)+n_w(t)$，其中 $n_w(t)$ 是单边功率谱密度为 $N_0$ 的加性白高斯噪声。接收端在时刻 $t=kT_s$（$k=\\cdots,-2,-1,0,1,2,\\cdots$）对接收滤波器的输出 $v(t)$ 采样得到 $v_k=v(kT_s)$。试求：",
      "subs": [
        "(1) 信道的传递函数 $C(f)$ 及冲激响应 $c(t)$；",
        "(2) $d(t)$、$s(t)$、$y(t)$ 的功率谱密度；",
        "(3) 从 A 点到 B 点的总体传递函数 $X(f)$ 及冲激响应 $x(t)$；",
        "(4) C 点采样值 $v_k$ 表达式及其中的噪声功率。"
      ],
      "fig": "pam",
      "chapter": "ch3",
      "point": "码间串扰分析",
      "tags": [
        "PAM功率谱",
        "多径回波",
        "奈奎斯特采样",
        "噪声功率"
      ]
    },
    {
      "id": "2025-五",
      "num": "五",
      "type": "big",
      "score": 15,
      "stem": "某 OOK 系统在 $0\\le t\\le T_b$ 内发送 $s_1(t)=A\\cos(2\\pi f_ct)$ 表示数据“1”，发送 $s_2(t)=0$ 表示数据“0”，其中 $f_c\\gg1/T_b$，数据“1”出现概率为 $p$。接收信号为 $r(t)=s_i(t)+n_w(t)$，$i=1,2$，其中 $n_w(t)$ 是单边功率谱密度为 $N_0$ 的加性白高斯噪声。接收端根据 $r(t)$ 与 $s_1(t)$ 的内积 $y=\\int_0^{T_b}r(t)s_1(t)\\,\\mathrm dt$ 来判决，若 $y$ 大于门限 $V_T$ 则判为“1”，否则判为“0”。试求：",
      "subs": [
        "(1) 求 $s_1(t)$ 的能量 $E_1$，该系统的平均比特能量 $E_b$；",
        "(2) 求 $y$ 中所包含的噪声分量的功率 $\\sigma^2$；",
        "(3) 若 $p=1/2$，求最佳判决门限 $V_T$ 以及系统的平均误比特率 $P_b$；",
        "(4) 若 $p<1/2$，保持门限 $V_T$ 与(3)中相同，求系统此时的平均误比特率 $P_b$ 与 $E_b/N_0$ 的关系式。"
      ],
      "fig": null,
      "chapter": "ch9",
      "point": "相关接收机",
      "tags": [
        "OOK",
        "相关接收",
        "最佳门限",
        "非等概判决"
      ]
    },
    {
      "id": "2025-六",
      "num": "六",
      "type": "big",
      "score": 15,
      "stem": "设 8PSK 系统在归一化正交基下的星座图为 $\\Omega=\\left\\{s_i=\\mathrm e^{\\mathrm j\\frac{\\pi i}{4}},\\ i=1,2,\\cdots,8\\right\\}$，各星座点等概出现。试求：",
      "subs": [
        "(1) 画出星座图，标出 ML 判决域，并按格雷映射标出各星座点对应的 3 个比特；",
        "(2) 求该 8PSK 星座图的平均符号能量 $E_s$ 及星座点之间的最小距离 $d_{\\min}$；",
        "(3) 假设发送 $s_8=1$，收到 $y=1+z$，其中复噪声 $z$ 的实部虚部都是独立同分布的零均值高斯随机变量，方差 $\\sigma^2\\ll1$。求错判为 $s_1$ 的近似概率；",
        "(4) 将 8PSK 星座图的 4 个星座点 $s_1,s_3,s_5,s_7$ 的幅度缩小一半，形成一个新的星座图 $\\Omega'$。求该星座图对应的平均符号能量 $E_s'$ 及最小距离 $d'_{\\min}$，并画出星座图及 ML 判决域。"
      ],
      "fig": null,
      "chapter": "ch4",
      "point": "MPSK/MQAM 星座图与格雷映射",
      "tags": [
        "8PSK",
        "格雷映射",
        "ML判决",
        "Q函数",
        "沃罗诺伊域"
      ]
    },
    {
      "id": "2025-七",
      "num": "七",
      "type": "big",
      "score": 15,
      "stem": "某四电平量化器的输入信号 $X$ 的概率密度函数为 $p(x)=\\dfrac{4-|x|}{16},\\ |x|\\le4$。量化器输入输出关系为 $Y=Q(X)=\\begin{cases}b\\cdot\\mathrm{sgn}(X), & |X|\\ge2\\\\ a\\cdot\\mathrm{sgn}(X), & |X|<2\\end{cases}$，其中 $0<a<2$，$2<b<4$。试求：",
      "subs": [
        "(1) 量化输入信号功率 $E[X^2]$；",
        "(2) 量化输出功率 $E[Y^2]$、量化输入输出相关值 $E[XY]$、量化噪声功率 $E[(X-Y)^2]$；",
        "(3) 能使量化噪声功率最小的 $a$、$b$ 值。"
      ],
      "fig": null,
      "chapter": "ch5",
      "point": "量化（均匀/最佳量化）",
      "tags": [
        "三角分布",
        "量化噪声",
        "Lloyd-Max",
        "条件均值"
      ]
    },
    {
      "id": "2025-八",
      "num": "八",
      "type": "big",
      "score": 15,
      "stem": "某信道的输入 $X$ 等概取值于 $0,1,2$，信道输出 $Y$ 有一半机会等于 $X$，一半机会等于 3，即 $P(Y=X)=0.5$，$P(Y=3)=0.5$。试求：",
      "subs": [
        "(1) $Y$ 的概率分布 $P(Y=j)$，$j=0,1,2,3$；",
        "(2) $X,Y$ 的联合概率分布 $P(X=i,Y=j)$，$i=0,1,2$，$j=0,1,2,3$；",
        "(3) 熵 $H(X)$、$H(Y)$，联合熵 $H(X,Y)$，条件熵 $H(Y|X)$；",
        "(4) 信道输入输出互信息 $I(X;Y)$。"
      ],
      "fig": null,
      "chapter": "ch7",
      "point": "信源熵/联合熵/条件熵",
      "tags": [
        "熵",
        "链式法则",
        "互信息"
      ]
    },
    {
      "id": "2025-九",
      "num": "九",
      "type": "big",
      "score": 15,
      "stem": "下图中，4 个信息比特 $\\boldsymbol u=(u_0u_1u_2u_3)$ 经过矩阵 $G_1=\\begin{pmatrix}1&1&1&0\\\\0&1&1&1\\\\0&0&1&1\\\\0&0&0&1\\end{pmatrix}$ 变换成 4 个比特 $\\boldsymbol b=(b_0b_1b_2b_3)$，再与 $g=(1,1,0,1)$ 卷积得到 7 个比特 $\\boldsymbol c=(c_0c_1\\cdots c_6)$。从 $\\boldsymbol b$ 到 $\\boldsymbol c$ 是一个 (7,4) 线性分组码，其生成矩阵为 $G_2$。从 $\\boldsymbol u$ 到 $\\boldsymbol c$ 也是一个 (7,4) 线性分组码，其生成矩阵为 $G$。图中的编码关系为 $\\boldsymbol b=\\boldsymbol uG_1$，$\\boldsymbol c=\\boldsymbol bG_2=\\boldsymbol uG_1G_2=\\boldsymbol uG$。试求：",
      "subs": [
        "(1) 按 $\\boldsymbol b$ 分别为 1000、0100、0010、0001 写出编码结果；",
        "(2) 按 $\\boldsymbol u$ 分别为 1000、0100、0010、0001 写出编码结果；",
        "(3) 写出生成矩阵 $G_2$ 及 $G$，并根据 $G$ 写出对应的校验矩阵 $H$；",
        "(4) 根据 $H$ 求出该码的最小码距；",
        "(5) 若收端译码器输入为 1110111，求伴随式 $\\boldsymbol s$，确定最可能的错误比特位置，给出译码结果对应的 4 个信息比特 $\\boldsymbol u=(u_0u_1u_2u_3)$。"
      ],
      "fig": "encoder",
      "chapter": "ch6",
      "point": "校验矩阵与伴随式",
      "tags": [
        "线性分组码",
        "卷积成码",
        "伴随式译码",
        "最小码距"
      ]
    }
  ]
};
