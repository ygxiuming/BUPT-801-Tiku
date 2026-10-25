// 2024 · 真题（试卷元数据 + groups + 题干/选项）—— 答案与解析在同目录 answer.js
window.BUPT801 = window.BUPT801 || {};
window.BUPT801.papers = window.BUPT801.papers || {};
window.BUPT801.papers["2024"] = {
  "year": 2024,
  "title": "北京邮电大学2024年硕士研究生招生考试试题",
  "subject": "801 通信原理",
  "note": "请考生注意：①所有答案（包括选择题）一律写在答题纸上，否则不计成绩。②不允许使用计算器。",
  "duration": 180,
  "sections": [
    {
      "id": "choice",
      "name": "单项选择题",
      "score": 40,
      "intro": "本大题共 20 题、40 个空，每空 1 分，满分 40 分。请按题号把答案填在答题纸上。"
    },
    {
      "id": "big",
      "name": "计算题",
      "score": 110,
      "intro": "本大题共 9 题，第二～九题每题 12 分，第十题 14 分，共 110 分。"
    }
  ],
  "groups": {
    "g1": {
      "stem": "设 FM 信号 $s(t)=2\\cos\\left[2\\pi\\times10^7t+8000\\pi\\int_{-\\infty}^{t}m(\\tau)\\mathrm{d}\\tau\\right]$，其中基带信号 $m(t)$ 的带宽是 2 kHz、最大幅度是 2 V。此 FM 信号的调制指数是（1），带宽近似是（2）kHz。",
      "options": {
        "A": "4",
        "B": "8",
        "C": "16",
        "D": "20"
      }
    },
    "g2": {
      "stem": "设模拟基带信号 $m(t)$ 的傅氏变换为 $M(f)$，希尔伯特变换为 $\\hat{m}(t)$。下列中（3）是上边带 SSB 信号的复包络 $S_L(t)$，其傅氏变换为 $S_L(f)=$（4）。",
      "optionSets": [
        "options3",
        "options4"
      ],
      "options3": {
        "A": "$m(t)+\\mathrm{j}\\hat{m}(t)$",
        "B": "$m(t)-\\hat{m}(t)$",
        "C": "$\\hat{m}(t)+\\mathrm{j}m(t)$",
        "D": "$m(t)-\\mathrm{j}\\hat{m}(t)$"
      },
      "options4": {
        "A": "$\\mathrm{sgn}(f)M(f)$",
        "B": "$-\\mathrm{j}\\cdot\\mathrm{sgn}(f)M(f)$",
        "C": "$[1-\\mathrm{sgn}(f)]M(f)$",
        "D": "$[1+\\mathrm{sgn}(f)]M(f)$"
      }
    },
    "g3": {
      "stem": "某四进制符号的概率分布为 $\\left(\\dfrac17,\\dfrac17,\\dfrac17,\\dfrac47\\right)$。对其做哈夫曼编码，编码后码字的最小码长是（5）bit、最大码长是（6）bit，平均码长是（7）bit。",
      "optionSets": [
        "options56",
        "options7"
      ],
      "options56": {
        "A": "1",
        "B": "2",
        "C": "3",
        "D": "4"
      },
      "options7": {
        "A": "$\\dfrac87$",
        "B": "$\\dfrac{10}{7}$",
        "C": "$\\dfrac{12}{7}$",
        "D": "2"
      }
    },
    "g4": {
      "stem": "测量眼图需要的仪器设备是（8）。",
      "options": {
        "A": "频谱仪",
        "B": "摄像头",
        "C": "万用表",
        "D": "示波器"
      }
    },
    "g5": {
      "stem": "BPSK 相干解调可采用（9）来恢复载波，为了解决其中的（10）问题，可改用 2DPSK 调制。",
      "optionSets": [
        "options9",
        "options10"
      ],
      "options9": {
        "A": "鉴频器",
        "B": "超前滞后门",
        "C": "匹配滤波器",
        "D": "科斯塔斯环"
      },
      "options10": {
        "A": "相位模糊",
        "B": "定时偏差",
        "C": "相位噪声",
        "D": "载频偏差"
      }
    },
    "g6": {
      "stem": "下列中，（11）是 $(10,6)$ 循环码的生成多项式，（12）是 $(10,4)$ 循环码的生成多项式。",
      "options": {
        "A": "$x^4+x+1$",
        "B": "$x^4+x^3+x^2+x+1$",
        "C": "$x^6+x+1$",
        "D": "$x^6+x^5+x+1$"
      }
    },
    "g7": {
      "stem": "单边功率谱密度为 $N_0$ 的白高斯噪声通过一个冲激响应为 $h(t)$ 的带通滤波器后成为 $n(t)$。若 $h(t)$ 的主瓣带宽为 $B$、能量为 1，则 $n(t)$ 的主瓣带宽为（13），$n(t)$ 的同相分量服从方差为（14）的高斯分布，$n(t)$ 的相位服从（15）分布，$n(t)$ 的包络服从（16）分布。",
      "optionSets": [
        "options13",
        "options14",
        "options1516"
      ],
      "options13": {
        "A": "$0.5B$",
        "B": "$B$",
        "C": "$1.5B$",
        "D": "$2B$"
      },
      "options14": {
        "A": "$\\dfrac{N_0B}{2}$",
        "B": "$N_0B$",
        "C": "$\\dfrac{N_0}{2}$",
        "D": "$N_0$"
      },
      "options1516": {
        "A": "瑞利",
        "B": "高斯",
        "C": "指数",
        "D": "均匀"
      }
    },
    "g8": {
      "stem": "比较 8 比特均匀量化和 $A$ 律 13 折线量化的量化信噪比性能，当输入信号（17）时，$A$ 律 13 折线量化有更好的性能。",
      "options": {
        "A": "服从均匀分布",
        "B": "峰均比高",
        "C": "功率高",
        "D": "非负"
      }
    },
    "g9": {
      "stem": "设基带传输系统的符号间隔为 $T_s=1\\,\\mathrm{s}$，考虑四个系统，其总体冲激响应分别是 $x_1(t)=\\mathrm{sinc}(t)+\\mathrm{sinc}(t-1)$，$x_2(t)=\\mathrm{sinc}(t)$，$x_3(t)=\\mathrm{sinc}^2(t)$，$x_4(t)=\\mathrm{sinc}(t)\\,\\mathrm{sinc}\\!\\left(\\dfrac{t}{3}\\right)$。这四个系统的频带利用率依次是（18），（19），（20），（21）Baud/Hz。",
      "options": {
        "A": "1",
        "B": "1.5",
        "C": "2",
        "D": "3"
      }
    },
    "g10": {
      "stem": "某信道的输入 $X$ 等概取值于 $\\{\\pm1,\\pm3\\}$，输出 $Y=X+Z$，其中 $Z$ 是与 $X$ 独立的零均值高斯随机变量，方差为 0.5。发送 $X=-1$ 条件下，接收信号的似然概率函数为（22）。收到 $Y=-1$ 条件下，发送信号为 $X=-1$ 的后验概率是（23）。",
      "optionSets": [
        "options22",
        "options23"
      ],
      "options22": {
        "A": "$\\dfrac{1}{\\sqrt{\\pi}}\\mathrm{e}^{-(y-1)^2}$",
        "B": "$\\dfrac{1}{\\sqrt{\\pi}}\\mathrm{e}^{-(y+1)^2}$",
        "C": "$\\dfrac{1}{\\sqrt{\\pi}}\\mathrm{e}^{-y^2}$",
        "D": "$\\dfrac{1}{\\sqrt{2\\pi}}\\mathrm{e}^{-\\frac{(y+1)^2}{2}}$"
      },
      "options23": {
        "A": "$\\dfrac{1}{1+2\\mathrm{e}^{-4}+\\mathrm{e}^{16}}$",
        "B": "$\\dfrac{1}{1+\\mathrm{e}}$",
        "C": "$\\dfrac12$",
        "D": "$\\dfrac{1}{1+2\\mathrm{e}^{4}+\\mathrm{e}^{16}}$"
      }
    },
    "g11": {
      "stem": "循环冗余校验码（CRC）是一种（24）码。",
      "options": {
        "A": "纠错",
        "B": "线性分组",
        "C": "正交",
        "D": "伪随机"
      }
    },
    "g12": {
      "stem": "HDB$_3$ 码信号可以表示为 $s(t)=\\sum\\limits_{n=-\\infty}^{\\infty}a_ng(t-nT_b)$，其中 $a_n\\in\\{-1,0,+1\\}$，$g(t)$ 是半占空矩形脉冲。当序列 $\\{a_n\\}$ 为 $-1000-1+1-1+100+1-1$ 时，对应的二进制数据序列为（25）；当 $\\{a_n\\}$ 为平稳随机序列时，$s(t)$ 的功率谱密度 $P_s(f)$ 满足（26）。",
      "optionSets": [
        "options25",
        "options26"
      ],
      "options25": {
        "A": "1000011100001",
        "B": "100011110011",
        "C": "100011100001",
        "D": "100001110001"
      },
      "options26": {
        "A": "$P_s(0)=0$",
        "B": "$P_s(0)=\\infty$",
        "C": "$P_s(0)<0$",
        "D": "$P_s(0)=\\dfrac{1}{T_b}$"
      }
    },
    "g13": {
      "stem": "下列中，满足幅频特性为常数、群时延特性为常数的系统是（27）。",
      "options": {
        "A": "匹配滤波器",
        "B": "积分器",
        "C": "微分器",
        "D": "希尔伯特变换器"
      }
    },
    "g14": {
      "stem": "设理想限带 AWGN 信道的带宽为 $B$，有用信号功率为 $S$，噪声单边功率谱密度为 $N_0$。给定 $\\dfrac{S}{N_0}$，当 $B$ 趋于无穷时，信道容量趋于（28）；给定 $\\dfrac{S}{N_0B}$，当 $B$ 趋于无穷时，信道容量趋于（29）。",
      "options": {
        "A": "0",
        "B": "$\\dfrac{S\\ln2}{N_0}$",
        "C": "$\\dfrac{S}{N_0\\ln2}$",
        "D": "$\\infty$"
      }
    },
    "g15": {
      "stem": "在矩形 MQAM 和正交 MFSK 星座图中不断增加星座点数，并保持星座点间的最小距离不变。随着点数的增加，MQAM 的平均符号能量（30），MFSK 的平均符号能量（31）。",
      "options": {
        "A": "单调减小",
        "B": "单调增加",
        "C": "保持不变",
        "D": "先增加后减小"
      }
    },
    "g16": {
      "stem": "下列 64 进制星座图设计中，（32）的抗噪声能力最强。",
      "options": {
        "A": "将 64 个点均匀分布在一条直线上",
        "B": "将 64 个点均匀分布在一个圆周上",
        "C": "将 64 个点布局为 $4\\times16$ 的均匀方阵",
        "D": "将 64 个点布局为 $8\\times8$ 的均匀方阵"
      }
    },
    "g17": {
      "stem": "若 m 序列的特征多项式为 $1+x+x^4$，则其周期为（33）。",
      "options": {
        "A": "3",
        "B": "7",
        "C": "15",
        "D": "31"
      }
    },
    "g18": {
      "stem": "若 $(n,k)$ 循环码的所有码字的码重均为偶数，则该码的生成多项式包含因式（34）。",
      "options": {
        "A": "$x$",
        "B": "$x+1$",
        "C": "$x^2+x+1$",
        "D": "$x^{n-k}+1$"
      }
    },
    "g19": {
      "stem": "为了使数据随机化，可以采用（35）技术。为了应对信道中的突发差错，可以采用（36）技术。为了解决信道不理想所造成的符号间干扰问题，可以采用（37）技术。为了对抗平坦衰落，可以采用（38）技术。",
      "options": {
        "A": "分集",
        "B": "交织",
        "C": "均衡",
        "D": "扰码"
      }
    },
    "g20": {
      "stem": "高速率 MQAM 信号通过有显著时延扩展的无线信道传输时，接收端将存在（39）问题。为了有效解决这一问题，4G/5G 移动通信采用了（40）技术。",
      "optionSets": [
        "options39",
        "options40"
      ],
      "options39": {
        "A": "多普勒频移",
        "B": "非线性失真",
        "C": "符号间干扰",
        "D": "时间选择性失真"
      },
      "options40": {
        "A": "FM",
        "B": "OFDM",
        "C": "PAM",
        "D": "TDM"
      }
    }
  },
  "questions": [
    {
      "id": "2024-1",
      "num": 1,
      "type": "choice",
      "group": "g1",
      "blank": 1,
      "oKey": "options",
      "chapter": "ch2",
      "point": "卡森公式与调制指数",
      "tags": ["FM", "调制指数", "卡森公式"]
    },
    {
      "id": "2024-2",
      "num": 1,
      "type": "choice",
      "group": "g1",
      "blank": 2,
      "oKey": "options",
      "chapter": "ch2",
      "point": "卡森公式与调制指数",
      "tags": ["FM", "带宽估算"]
    },
    {
      "id": "2024-3",
      "num": 2,
      "type": "choice",
      "group": "g2",
      "blank": 3,
      "oKey": "options3",
      "chapter": "ch1",
      "point": "希尔伯特变换与复包络",
      "tags": ["复包络", "SSB", "解析信号"]
    },
    {
      "id": "2024-4",
      "num": 2,
      "type": "choice",
      "group": "g2",
      "blank": 4,
      "oKey": "options4",
      "chapter": "ch1",
      "point": "希尔伯特变换与复包络",
      "tags": ["SSB", "频谱搬移"]
    },
    {
      "id": "2024-5",
      "num": 3,
      "type": "choice",
      "group": "g3",
      "blank": 5,
      "oKey": "options56",
      "chapter": "ch5",
      "point": "哈夫曼编码",
      "tags": ["哈夫曼", "最短码长"]
    },
    {
      "id": "2024-6",
      "num": 3,
      "type": "choice",
      "group": "g3",
      "blank": 6,
      "oKey": "options56",
      "chapter": "ch5",
      "point": "哈夫曼编码",
      "tags": ["哈夫曼", "最长码长"]
    },
    {
      "id": "2024-7",
      "num": 3,
      "type": "choice",
      "group": "g3",
      "blank": 7,
      "oKey": "options7",
      "chapter": "ch5",
      "point": "哈夫曼编码",
      "tags": ["哈夫曼", "平均码长"]
    },
    {
      "id": "2024-8",
      "num": 4,
      "type": "choice",
      "group": "g4",
      "blank": 8,
      "oKey": "options",
      "chapter": "ch3",
      "point": "眼图",
      "tags": ["眼图", "测量仪器"]
    },
    {
      "id": "2024-9",
      "num": 5,
      "type": "choice",
      "group": "g5",
      "blank": 9,
      "oKey": "options9",
      "chapter": "ch8",
      "point": "载波同步（平方环/科斯塔斯环）",
      "tags": ["载波同步", "科斯塔斯环"]
    },
    {
      "id": "2024-10",
      "num": 5,
      "type": "choice",
      "group": "g5",
      "blank": 10,
      "oKey": "options10",
      "chapter": "ch8",
      "point": "相位模糊及其消除",
      "tags": ["相位模糊", "2DPSK"]
    },
    {
      "id": "2024-11",
      "num": 6,
      "type": "choice",
      "group": "g6",
      "blank": 11,
      "oKey": "options",
      "chapter": "ch6",
      "point": "循环码",
      "tags": ["循环码", "生成多项式"]
    },
    {
      "id": "2024-12",
      "num": 6,
      "type": "choice",
      "group": "g6",
      "blank": 12,
      "oKey": "options",
      "chapter": "ch6",
      "point": "循环码",
      "tags": ["循环码", "因式分解"]
    },
    {
      "id": "2024-13",
      "num": 7,
      "type": "choice",
      "group": "g7",
      "blank": 13,
      "oKey": "options13",
      "chapter": "ch1",
      "point": "窄带高斯过程（包络/相位分布）",
      "tags": ["窄带噪声", "主瓣带宽"]
    },
    {
      "id": "2024-14",
      "num": 7,
      "type": "choice",
      "group": "g7",
      "blank": 14,
      "oKey": "options14",
      "chapter": "ch1",
      "point": "窄带高斯过程（包络/相位分布）",
      "tags": ["同相分量", "方差"]
    },
    {
      "id": "2024-15",
      "num": 7,
      "type": "choice",
      "group": "g7",
      "blank": 15,
      "oKey": "options1516",
      "chapter": "ch1",
      "point": "窄带高斯过程（包络/相位分布）",
      "tags": ["相位分布"]
    },
    {
      "id": "2024-16",
      "num": 7,
      "type": "choice",
      "group": "g7",
      "blank": 16,
      "oKey": "options1516",
      "chapter": "ch1",
      "point": "窄带高斯过程（包络/相位分布）",
      "tags": ["瑞利分布", "包络"]
    },
    {
      "id": "2024-17",
      "num": 8,
      "type": "choice",
      "group": "g8",
      "blank": 17,
      "oKey": "options",
      "chapter": "ch5",
      "point": "量化（均匀/最佳量化）",
      "tags": ["A律13折线", "均匀量化", "峰均比"]
    },
    {
      "id": "2024-18",
      "num": 9,
      "type": "choice",
      "group": "g9",
      "blank": 18,
      "oKey": "options",
      "chapter": "ch3",
      "point": "奈奎斯特准则与无码间串扰",
      "tags": ["频带利用率", "奈奎斯特"]
    },
    {
      "id": "2024-19",
      "num": 9,
      "type": "choice",
      "group": "g9",
      "blank": 19,
      "oKey": "options",
      "chapter": "ch3",
      "point": "奈奎斯特准则与无码间串扰",
      "tags": ["频带利用率", "sinc脉冲"]
    },
    {
      "id": "2024-20",
      "num": 9,
      "type": "choice",
      "group": "g9",
      "blank": 20,
      "oKey": "options",
      "chapter": "ch3",
      "point": "奈奎斯特准则与无码间串扰",
      "tags": ["频带利用率", "sinc平方"]
    },
    {
      "id": "2024-21",
      "num": 9,
      "type": "choice",
      "group": "g9",
      "blank": 21,
      "oKey": "options",
      "chapter": "ch3",
      "point": "奈奎斯特准则与无码间串扰",
      "tags": ["频带利用率", "频域卷积"]
    },
    {
      "id": "2024-22",
      "num": 10,
      "type": "choice",
      "group": "g10",
      "blank": 22,
      "oKey": "options22",
      "chapter": "ch1",
      "point": "高斯过程与线性变换",
      "tags": ["似然函数", "条件概率密度"]
    },
    {
      "id": "2024-23",
      "num": 10,
      "type": "choice",
      "group": "g10",
      "blank": 23,
      "oKey": "options23",
      "chapter": "ch1",
      "point": "高斯过程与线性变换",
      "tags": ["贝叶斯", "后验概率"]
    },
    {
      "id": "2024-24",
      "num": 11,
      "type": "choice",
      "group": "g11",
      "blank": 24,
      "oKey": "options",
      "chapter": "ch6",
      "point": "循环码",
      "tags": ["CRC", "线性分组码"]
    },
    {
      "id": "2024-25",
      "num": 12,
      "type": "choice",
      "group": "g12",
      "blank": 25,
      "oKey": "options25",
      "chapter": "ch3",
      "point": "基带码型（AMI/HDB3等）",
      "tags": ["HDB3", "码型反变换"]
    },
    {
      "id": "2024-26",
      "num": 12,
      "type": "choice",
      "group": "g12",
      "blank": 26,
      "oKey": "options26",
      "chapter": "ch3",
      "point": "基带码型（AMI/HDB3等）",
      "tags": ["HDB3", "功率谱", "无直流"]
    },
    {
      "id": "2024-27",
      "num": 13,
      "type": "choice",
      "group": "g13",
      "blank": 27,
      "oKey": "options",
      "chapter": "ch1",
      "point": "希尔伯特变换与复包络",
      "tags": ["希尔伯特变换器", "群时延", "幅频特性"]
    },
    {
      "id": "2024-28",
      "num": 14,
      "type": "choice",
      "group": "g14",
      "blank": 28,
      "oKey": "options",
      "chapter": "ch7",
      "point": "信道容量与香农公式",
      "tags": ["香农公式", "带宽趋于无穷"]
    },
    {
      "id": "2024-29",
      "num": 14,
      "type": "choice",
      "group": "g14",
      "blank": 29,
      "oKey": "options",
      "chapter": "ch7",
      "point": "信道容量与香农公式",
      "tags": ["香农公式", "信噪比固定"]
    },
    {
      "id": "2024-30",
      "num": 15,
      "type": "choice",
      "group": "g15",
      "blank": 30,
      "oKey": "options",
      "chapter": "ch4",
      "point": "多进制调制的误码性能与带宽",
      "tags": ["MQAM", "平均符号能量"]
    },
    {
      "id": "2024-31",
      "num": 15,
      "type": "choice",
      "group": "g15",
      "blank": 31,
      "oKey": "options",
      "chapter": "ch4",
      "point": "多进制调制的误码性能与带宽",
      "tags": ["MFSK", "正交", "平均符号能量"]
    },
    {
      "id": "2024-32",
      "num": 16,
      "type": "choice",
      "group": "g16",
      "blank": 32,
      "oKey": "options",
      "chapter": "ch4",
      "point": "MPSK/MQAM 星座图与格雷映射",
      "tags": ["星座图设计", "最小欧氏距离"]
    },
    {
      "id": "2024-33",
      "num": 17,
      "type": "choice",
      "group": "g17",
      "blank": 33,
      "oKey": "options",
      "chapter": "ch6",
      "point": "m序列与本原多项式",
      "tags": ["m序列", "周期"]
    },
    {
      "id": "2024-34",
      "num": 18,
      "type": "choice",
      "group": "g18",
      "blank": 34,
      "oKey": "options",
      "chapter": "ch6",
      "point": "循环码",
      "tags": ["循环码", "偶数码重", "生成多项式"]
    },
    {
      "id": "2024-35",
      "num": 19,
      "type": "choice",
      "group": "g19",
      "blank": 35,
      "oKey": "options",
      "chapter": "ch3",
      "point": "码间串扰分析",
      "tags": ["扰码", "数据随机化"]
    },
    {
      "id": "2024-36",
      "num": 19,
      "type": "choice",
      "group": "g19",
      "blank": 36,
      "oKey": "options",
      "chapter": "ch3",
      "point": "码间串扰分析",
      "tags": ["交织", "突发差错"]
    },
    {
      "id": "2024-37",
      "num": 19,
      "type": "choice",
      "group": "g19",
      "blank": 37,
      "oKey": "options",
      "chapter": "ch3",
      "point": "码间串扰分析",
      "tags": ["均衡", "ISI"]
    },
    {
      "id": "2024-38",
      "num": 19,
      "type": "choice",
      "group": "g19",
      "blank": 38,
      "oKey": "options",
      "chapter": "ch3",
      "point": "码间串扰分析",
      "tags": ["分集", "平坦衰落"]
    },
    {
      "id": "2024-39",
      "num": 20,
      "type": "choice",
      "group": "g20",
      "blank": 39,
      "oKey": "options39",
      "chapter": "ch4",
      "point": "OFDM 与多载波调制",
      "tags": ["时延扩展", "符号间干扰"]
    },
    {
      "id": "2024-40",
      "num": 20,
      "type": "choice",
      "group": "g20",
      "blank": 40,
      "oKey": "options40",
      "chapter": "ch4",
      "point": "OFDM 与多载波调制",
      "tags": ["OFDM", "4G/5G"]
    },
    {
      "id": "2024-二",
      "num": "二",
      "type": "big",
      "score": 12,
      "stem": "设 $s_1(t)=\\sum\\limits_{n=-\\infty}^{\\infty}a_ng(t-nT_s)$，$s_2(t)=s_1(t)-s_1(t-2T_s)$，$s_3(t)=s_1(t)s_2(t)$，其中 $g(t)=\\begin{cases}1, & 0\\le t\\le T_s\\\\[2pt] 0, & \\text{else}\\end{cases}$。试求：",
      "subs": [
        "(1) 求 $g(t)$ 的能量谱密度。",
        "(2) 若 $\\{a_n\\}$ 的元素以独立等概方式取值于 $\\{\\pm1\\}$，求 $s_1(t)$、$s_2(t)$、$s_3(t)$ 的功率谱密度。",
        "(3) 若 $\\{a_n\\}$ 的自相关函数为 $E[a_{n+m}a_n]=\\begin{cases}1, & m=0\\\\[2pt] -0.5, & m=\\pm1\\\\[2pt] 0, & \\text{else}\\end{cases}$，求 $s_1(t)$ 的功率谱密度。"
      ],
      "fig": null,
      "chapter": "ch1",
      "point": "随机过程通过线性系统",
      "tags": ["功率谱密度", "能量谱密度", "相关编码", "循环平稳"]
    },
    {
      "id": "2024-三",
      "num": "三",
      "type": "big",
      "score": 12,
      "stem": "设 $m_1(t)$、$m_2(t)$、$m_3(t)$ 及 $m_4(t)$ 是 4 路平稳随机信号，其一维概率分布为均匀分布。$m_1(t)$、$m_2(t)$ 是通带为 $2\\,\\mathrm{kHz}\\sim3\\,\\mathrm{kHz}$ 的带通信号，$m_3(t)$、$m_4(t)$ 是带宽为 2 kHz 的基带信号。对每路信号分别按不发生频谱混叠的最低速率采样，对每个样值按 $k$ 比特均匀量化（要求 $k$ 尽量小且量化信噪比不低于 40 dB），然后将 4 路比特流时分复用为一路，再通过一个带宽为 24 kHz 的带通信道传输。试：",
      "subs": [
        "(1) 求出各路的数据速率、复用后的总数据速率。",
        "(2) 设计调制方式（调制阶数尽量低），给出符号速率、滚降因子。",
        "(3) 画出从发端到收端的完整系统框图。"
      ],
      "fig": null,
      "chapter": "ch5",
      "point": "抽样定理",
      "tags": ["带通抽样", "量化比特数", "时分复用", "16QAM", "滚降因子"]
    },
    {
      "id": "2024-四",
      "num": "四",
      "type": "big",
      "score": 12,
      "stem": "下图中 $s(t)=m(t)\\cos(2\\pi f_ct+\\theta)$ 为功率是 10 mW 的 DSB-SC 信号，其中载频 $f_c=1\\,\\mathrm{MHz}$，模拟基带信号 $m(t)$ 的带宽为 5 kHz。理想带通滤波器正好能让 $s(t)$ 无失真通过，理想低通滤波器的截止频率是 5 kHz。加性白高斯噪声 $n_w(t)$ 的单边功率谱密度为 $N_0=10^{-9}\\,\\mathrm{W/Hz}$。试求：",
      "subs": [
        "(1) 带通滤波器输出端的信噪比；",
        "(2) 当 $\\theta=0$ 时，低通滤波器输出端的信噪比；",
        "(3) 当 $\\theta$ 在区间 $\\left[0,\\dfrac{\\pi}{4}\\right]$ 上均匀分布时，低通滤波器输出端的平均信噪比。"
      ],
      "fig": "q4recv",
      "chapter": "ch2",
      "point": "相干解调与抗噪声性能",
      "tags": ["DSB-SC", "相干解调", "制度增益", "相位误差"]
    },
    {
      "id": "2024-五",
      "num": "五",
      "type": "big",
      "score": 12,
      "stem": "某对称信道的输入 $X$ 等概取值于 $\\pm1$，输出 $Y\\in\\{-1,0,+1\\}$。令 $Z=XY$，已知 $P(Z=1)=\\dfrac23$，$P(Z=0)=P(Z=-1)=\\dfrac16$。试求：（提示：$\\log_23\\approx\\dfrac{11}{7}$，$\\log_25\\approx\\dfrac73$）",
      "subs": [
        "(1) $X$ 和 $Y$ 的联合概率分布 $P(X,Y)$，$Y$ 的边缘概率分布 $P(Y)$；",
        "(2) 熵 $H(X)$、$H(Y)$、$H(X,Y)$、$H(Y\\mid X)$；",
        "(3) 信道输入输出互信息 $I(X;Y)$。"
      ],
      "fig": null,
      "chapter": "ch7",
      "point": "信源熵/联合熵/条件熵",
      "tags": ["联合概率", "熵", "条件熵", "互信息"]
    },
    {
      "id": "2024-六",
      "num": "六",
      "type": "big",
      "score": 12,
      "stem": "某 8 进制调制在归一化正交基下的 8 个星座点的复数表示为 $s_1=-2$，$s_2=-1$，$s_3=0$，$s_4=1$，$s_5=2$，$s_6=2\\mathrm{j}$，$s_7=\\dfrac{s_1-s_6}{2}$，$s_8=\\dfrac{s_5-s_6}{2}$，各星座点等概出现。通过 AWGN 信道发送某个星座点 $a_i$，$i=1,2,\\cdots,8$，收端收到 $y=s_i+z$，其中噪声 $z$ 的实部和虚部是独立同分布的零均值高斯随机变量，方差均为 0.005。试求：",
      "subs": [
        "(1) 平均符号能量以及星座点之间的最小欧氏距离；",
        "(2) 各星座点的最大似然判决域（画图标出）；",
        "(3) 发送 $s_8$ 条件下判决出错概率的近似值。"
      ],
      "fig": null,
      "chapter": "ch4",
      "point": "MPSK/MQAM 星座图与格雷映射",
      "tags": ["星座图", "平均符号能量", "最小欧氏距离", "判决域", "误符号率"]
    },
    {
      "id": "2024-七",
      "num": "七",
      "type": "big",
      "score": 12,
      "stem": "已知某线性分组码的生成矩阵如下，试求：$$G=\\begin{bmatrix}1&1&1&0&1&0&0&0\\\\0&0&1&1&1&1&0&0\\\\1&1&0&0&0&0&1&1\\\\0&1&1&1&0&0&0&1\\end{bmatrix}$$",
      "subs": [
        "(1) 通过初等行变换写出该码系统码形式的生成矩阵；",
        "(2) 写出该码的校验矩阵，并根据校验矩阵确定该码的最小码距；",
        "(3) 写出所有码重为 2、伴随式为 1100 的错误图样。"
      ],
      "fig": null,
      "chapter": "ch6",
      "point": "线性分组码与生成矩阵",
      "tags": ["生成矩阵", "系统码", "校验矩阵", "最小码距", "伴随式"]
    },
    {
      "id": "2024-八",
      "num": "八",
      "type": "big",
      "score": 12,
      "stem": "下图所示为某卷积码的状态转移图，图中的虚线/实线支路分别对应编码器输入为 “1” 或 “0”，支路上的数字 $c_1c_2$ 表示对应的两路编码输出比特，圆圈中数字表示编码器状态。编码器初始状态为零。试：",
      "subs": [
        "(1) 写出该卷积码的生成多项式；",
        "(2) 画出该卷积码的编码器原理框图；",
        "(3) 假设该卷积码的维特比译码器从全零状态出发，译码器输入 8 个比特 11111111 后，有可能到达任何一个状态，按维特比译码算法求出到达状态 000 及状态 100 的幸存路径及其累积度量。"
      ],
      "fig": "q8state",
      "chapter": "ch6",
      "point": "卷积码与状态图",
      "tags": ["卷积码", "状态转移图", "生成多项式", "维特比译码", "幸存路径"]
    },
    {
      "id": "2024-九",
      "num": "九",
      "type": "big",
      "score": 12,
      "stem": "下图所示接收机中，$r(t)=s_i(t)+n_w(t)$，$i=1,2$，其中 $s_1(t)=g(t)\\cos(2\\pi f_ct)$，$f_c$ 充分大，$g(t)=\\begin{cases}\\dfrac{t}{T_b}, & 0\\le t\\le T_b\\\\[2pt] 0, & \\text{else}\\end{cases}$，$s_2(t)=-s_1(t)$，$n_w(t)$ 是单边功率谱密度为 $N_0$ 的加性白高斯噪声。接收信号经过相干解调、低通滤波器后在 $t=T_b$ 时刻采样，然后根据样值 $y$ 的极性进行判决。图中带通滤波器能使 $s_i(t)$ 无失真通过。试：",
      "subs": [
        "(1) 若低通滤波器对 $g(t)$ 匹配，求发送 $s_1(t)$ 条件下 $y$ 的均值和方差，并求判决出错的概率；",
        "(2) 若低通滤波器的冲激响应为 $h(t)=g(t)$，求发送 $s_1(t)$ 条件下 $y$ 的均值和方差，并求判决出错的概率。"
      ],
      "fig": "q9recv",
      "chapter": "ch9",
      "point": "误比特率分析",
      "tags": ["匹配滤波", "相关接收", "判决门限", "误比特率"]
    },
    {
      "id": "2024-十",
      "num": "十",
      "type": "big",
      "score": 14,
      "stem": "某四电平均匀量化器的输入动态范围是 $[0,+2]$，若输入信号 $X$ 的概率密度函数为 $p(x)=\\dfrac{x}{2}$，$0\\le x\\le2$，试求：（提示：$\\lg2\\approx0.3$，$\\lg3\\approx0.5$）",
      "subs": [
        "(1) 量化器输入 $X$ 的功率 $E[X^2]$；",
        "(2) 各量化电平及其出现概率；",
        "(3) 量化器输出 $Y$ 的功率 $E[Y^2]$；",
        "(4) 量化输入输出相关值 $E[XY]$；",
        "(5) 量化噪声功率 $E[(X-Y)^2]$；",
        "(6) 量化信噪比的分贝值。"
      ],
      "fig": null,
      "chapter": "ch5",
      "point": "量化（均匀/最佳量化）",
      "tags": ["均匀量化", "量化噪声", "量化信噪比", "统计平均"]
    }
  ]
};
