// 2019 · 真题（试卷元数据 + groups + 题干/选项）—— 答案与解析在同目录 answer.js
window.BUPT801 = window.BUPT801 || {};
window.BUPT801.papers = window.BUPT801.papers || {};
window.BUPT801.papers["2019"] = {
  "year": 2019,
  "title": "北京邮电大学2019年硕士研究生入学考试试题",
  "subject": "801 通信原理",
  "note": "请考生注意：(1) 所有答案一律写在答题纸上，否则不计成绩；(2) 不允许使用计算器。",
  "duration": 180,
  "sections": [
    {
      "id": "choice",
      "name": "单项选择题",
      "score": 50,
      "intro": "本大题共 25 题、50 个空，每空 1 分，满分 50 分。请按题号把答案填在答题纸上。"
    },
    {
      "id": "big",
      "name": "计算题",
      "score": 100,
      "intro": "本大题共 7 题：第二～六题每题 14 分，第七、八题每题 15 分，共 100 分。"
    }
  ],
  "groups": {
    "g1": {
      "stem": "设 $x(t)$ 的功率谱密度为 $P_x(f)$。令 $z(t)=x(t)+\\mathrm{j}\\hat{x}(t)$，其中 $\\hat{x}(t)$ 是 $x(t)$ 的希尔伯特变换。$x(t)$ 与 $\\hat{x}(t)$（1）。$z(t)$ 的功率谱密度是（2）。",
      "optionSets": [
        "options1",
        "options2"
      ],
      "options1": {
        "A": "同相",
        "B": "反相",
        "C": "正交",
        "D": "互补"
      },
      "options2": {
        "A": "$P_x(f+f_c)+P_x(f-f_c)$",
        "B": "$\\begin{cases}P_x(f),&f>0\\\\0,&f<0\\end{cases}$",
        "C": "$\\begin{cases}2P_x(f),&f>0\\\\0,&f<0\\end{cases}$",
        "D": "$\\begin{cases}4P_x(f),&f>0\\\\0,&f<0\\end{cases}$"
      }
    },
    "g2": {
      "stem": "设某数字基带传输系统的总体传输函数 $X(f)$ 如下图所示（顶点在 $f=0$ 处、幅度为 1，$|f|\\ge2000$ Hz 处为零），则该系统无符号间干扰传输的最高符号速率是（3）kBaud，对应的频带利用率是（4）Baud/Hz。",
      "options": {
        "A": "1",
        "B": "1.5",
        "C": "2",
        "D": "4"
      }
    },
    "g3": {
      "stem": "设 8 进制系统的比特速率是 3000 bit/s，比特能量是 $E_b=1$ mJ，则其符号速率是（5）kBaud，符号间隔是（6）ms，符号能量是（7）mJ。",
      "options": {
        "A": "$1/2$",
        "B": "1",
        "C": "2",
        "D": "3"
      }
    },
    "g4": {
      "stem": "设调制信号 $m(t)=2\\cos20\\pi t$，已调信号 $s(t)=2\\left[2+m(t)\\right]\\cos2\\pi f_ct$，则调幅指数是（8），调制效率是（9）。",
      "options": {
        "A": "$1/4$",
        "B": "$1/3$",
        "C": "$1/2$",
        "D": "$1$"
      }
    },
    "g5": {
      "stem": "A 律十三折线编码是一种标准的（10）编码。它采用了非均匀量化，码字 11111111 所对应的量化区间长度是码字 00000000 对应量化区间长度的（11）倍。",
      "optionSets": [
        "options10",
        "options11"
      ],
      "options10": {
        "A": "文本压缩",
        "B": "视频",
        "C": "语音",
        "D": "图像"
      },
      "options11": {
        "A": "128",
        "B": "64",
        "C": "32",
        "D": "16"
      }
    },
    "g6": {
      "stem": "设基带传输系统的数据速率是 72 kbit/s。若采用 8PAM，无符号间干扰传输最少需要的信道带宽是（12）kHz；采用滚降因子为 $\\alpha=0.5$ 的升余弦滚降后，需要的信道带宽是（13）kHz；若采用 64PAM，最少需要的信道带宽是（14）kHz；采用滚降因子为 $\\alpha=1$ 的升余弦滚降后，需要的信道带宽是（15）kHz。",
      "options": {
        "A": "6",
        "B": "12",
        "C": "18",
        "D": "24"
      }
    },
    "g7": {
      "stem": "设 FM 调制器的频率偏移常数为 $K_f=2$ kHz/V，基带调制信号为 $m(t)=2\\cos(1000\\pi t)$ V。FM 已调信号的最大频偏是（16）kHz，调制指数是（17），已调信号的带宽近似是（18）kHz。",
      "options": {
        "A": "4",
        "B": "6",
        "C": "8",
        "D": "9"
      }
    },
    "g8": {
      "stem": "设基带信号 $m(t)$ 的带宽是 100 Hz，将 $m(t)\\cos2000\\pi t$ 通过一个通频带为 1000 Hz～1200 Hz 的理想带通滤波器，输出是（19）信号。",
      "options": {
        "A": "AM",
        "B": "DSB",
        "C": "上边带 SSB",
        "D": "下边带 SSB"
      }
    },
    "g9": {
      "stem": "若基带信号、发送功率、信道增益、噪声功率谱密度都相同，以下调制方式中，已调信号带宽最大的是（20），最小的是（21）；解调输出信噪比最大的是（22），最小的是（23）。",
      "options": {
        "A": "AM",
        "B": "DSB-SC",
        "C": "FM",
        "D": "SSB"
      }
    },
    "g10": {
      "stem": "设某数字信号的速率是 100 bit/s，幅度是 $\\pm1$ V。下列中，能隔直流传输且功率最小的是（24），连零电平不超过 3 比特的是（25）。AMI 码的主瓣带宽是（26）Hz，半占空比双极性 RZ 码的主瓣带宽是（27）Hz。",
      "optionSets": [
        "options2425",
        "options2627"
      ],
      "options2425": {
        "A": "双极性 NRZ 码",
        "B": "双极性 RZ 码",
        "C": "AMI 码",
        "D": "HDB$_3$ 码"
      },
      "options2627": {
        "A": "50",
        "B": "100",
        "C": "150",
        "D": "200"
      }
    },
    "g11": {
      "stem": "在数字通信系统中，对于各种原因引起的符号间干扰，可以采用（28）技术来消除或减少干扰的影响。",
      "options": {
        "A": "时域均衡",
        "B": "部分响应",
        "C": "匹配滤波",
        "D": "升余弦滚降"
      }
    },
    "g12": {
      "stem": "为了提高频带利用率，部分响应系统引入了人为的（29）。",
      "options": {
        "A": "符号间干扰",
        "B": "比特差错",
        "C": "噪声",
        "D": "频谱滚降"
      }
    },
    "g13": {
      "stem": "设某数字基带传输系统的符号间隔是 $T$，总体冲激响应是 $x(t)$，总体传输函数是 $X(f)$。若该系统的接收端在采样点无符号间干扰，则 $x(t)$ 满足（30），$X(f)$ 满足（31）。",
      "optionSets": [
        "options30",
        "options31"
      ],
      "options30": {
        "A": "$x\\left(\\dfrac{n}{T}\\right)=\\begin{cases}1,&n=0\\\\0,&n\\ne0\\end{cases}$",
        "B": "$x(t)=\\sum\\limits_{n=-\\infty}^{\\infty}x(t-nT)$",
        "C": "$x(nT)=\\begin{cases}1,&n=0\\\\0,&n\\ne0\\end{cases}$",
        "D": "$\\sum\\limits_{n=-\\infty}^{\\infty}x(t-nT)=1$"
      },
      "options31": {
        "A": "$\\sum\\limits_{n=-\\infty}^{\\infty}X\\left(f-\\dfrac{n}{T}\\right)=X(f)$",
        "B": "$\\sum\\limits_{n=-\\infty}^{\\infty}X\\left(f-\\dfrac{n}{T}\\right)=T$",
        "C": "$X\\left(\\dfrac{n}{T}\\right)=\\begin{cases}1,&n=0\\\\0,&n\\ne0\\end{cases}$",
        "D": "$X(f)=\\begin{cases}\\sum\\limits_{n=-\\infty}^{\\infty}X\\left(f-\\dfrac{n}{T}\\right),&|f|\\le\\dfrac{1}{2T}\\\\0,&\\text{else}\\end{cases}$"
      }
    },
    "g14": {
      "stem": "眼图在采样时刻的张开的程度决定了系统的（32）。",
      "options": {
        "A": "噪声容限",
        "B": "频带利用率",
        "C": "定时误差",
        "D": "判决门限"
      }
    },
    "g15": {
      "stem": "将数据先进行差分编码，然后进行 BPSK 调制，所形成的是（33）信号，接收端可以采用（34）解调。",
      "optionSets": [
        "options33",
        "options34"
      ],
      "options33": {
        "A": "OOK",
        "B": "2FSK",
        "C": "DPSK",
        "D": "OQPSK"
      },
      "options34": {
        "A": "包络检波",
        "B": "鉴频器",
        "C": "科斯塔斯环",
        "D": "差分相干"
      }
    },
    "g16": {
      "stem": "在格雷码映射的 $M$ 进制调制中，相邻星座点有（35）比特不同。高信噪比条件下，其误符号率与误比特率的比值近似是（36）。",
      "options": {
        "A": "1",
        "B": "$\\log_2M$",
        "C": "$\\dfrac12\\log_2M$",
        "D": "$M$"
      }
    },
    "g17": {
      "stem": "设数据速率是 1000 bit/s，能使 2FSK 的两个频率保持正交的最小频差是（37）Hz。",
      "options": {
        "A": "500",
        "B": "1000",
        "C": "1500",
        "D": "20000"
      }
    },
    "g18": {
      "stem": "在 $M$ 进制数字通信中，按（38）准则设计的接收机能使平均误符号率最小。当不同的发送信号（39）时，ML 接收机与 MAP 接收机的平均误符号率相同。",
      "optionSets": [
        "options38",
        "options39"
      ],
      "options38": {
        "A": "最大信号能量",
        "B": "最小欧氏距离",
        "C": "最大似然",
        "D": "最大后验概率"
      },
      "options39": {
        "A": "能量相同",
        "B": "带宽相同",
        "C": "峰均比相同",
        "D": "出现概率相同"
      }
    },
    "g19": {
      "stem": "给定滚降因子 $\\alpha$、比特信噪比 $E_b/N_0$，下列数字调制方式中包络起伏最小的是（40），平均误比特率最小的是（41），频带利用率最高的是（42）。",
      "options": {
        "A": "OOK",
        "B": "OQPSK",
        "C": "8ASK",
        "D": "16QAM"
      }
    },
    "g20": {
      "stem": "设有 5 路带通信号，每一路的频率范围均为 15 kHz～18 kHz，对每路信号分别进行理想采样、A 律十三折线编码，然后复用为一路，复用后的速率至少是（43）kbit/s。",
      "options": {
        "A": "120",
        "B": "240",
        "C": "360",
        "D": "480"
      }
    },
    "g21": {
      "stem": "设某三进制信源符号的概率分布是 $0.5$、$0.25$、$0.25$，对其进行哈夫曼编码后码字的平均码长是（44）bit。",
      "options": {
        "A": "1",
        "B": "1.25",
        "C": "1.5",
        "D": "1.75"
      }
    },
    "g22": {
      "stem": "设 $(n,k)$ 循环码的生成多项式为 $g(x)=x^P+c_{P-1}x^{P-1}+\\cdots+c_1x+c_0$，则式中 $c_0=$（45），$P=$（46）。",
      "optionSets": [
        "options45",
        "options46"
      ],
      "options45": {
        "A": "0",
        "B": "1",
        "C": "2",
        "D": "0 或 1"
      },
      "options46": {
        "A": "$n-k$",
        "B": "$n-k+1$",
        "C": "$n-k-1$",
        "D": "$k$"
      }
    },
    "g23": {
      "stem": "若某信道的相干带宽远大于（47），则该信道属于平坦衰落信道。",
      "options": {
        "A": "符号速率",
        "B": "相干时间的倒数",
        "C": "多普勒频移",
        "D": "时延扩展的倒数"
      }
    },
    "g24": {
      "stem": "DS-BPSK 系统一般利用 $m$ 序列来进行扩频。基于 $m$ 序列的（48）特性，DS-BPSK 信号具有抗窄带干扰的能力。通过多径信道传输时，DS-BPSK 还可以借助（49）来实现分集接收。",
      "optionSets": [
        "options48",
        "options49"
      ],
      "options48": {
        "A": "尖锐自相关",
        "B": "高峰均比",
        "C": "随机",
        "D": "正交"
      },
      "options49": {
        "A": "哈夫曼编码",
        "B": "哈达玛变换",
        "C": "FFT 运算",
        "D": "Rake 接收"
      }
    },
    "g25": {
      "stem": "OFDM 中循环前缀的点数应当大于（50）。",
      "options": {
        "A": "多径信道的抽头数",
        "B": "IFFT 点数",
        "C": "每符号的采样点数",
        "D": "子载波数"
      }
    }
  },
  "questions": [
    {
      "id": "2019-1",
      "num": 1,
      "type": "choice",
      "group": "g1",
      "blank": 1,
      "oKey": "options1",
      "chapter": "ch1",
      "point": "希尔伯特变换与复包络",
      "tags": [
        "希尔伯特变换",
        "正交",
        "解析信号"
      ]
    },
    {
      "id": "2019-2",
      "num": 1,
      "type": "choice",
      "group": "g1",
      "blank": 2,
      "oKey": "options2",
      "chapter": "ch1",
      "point": "希尔伯特变换与复包络",
      "tags": [
        "解析信号",
        "功率谱密度",
        "单边谱"
      ]
    },
    {
      "id": "2019-3",
      "num": 2,
      "type": "choice",
      "group": "g2",
      "blank": 3,
      "chapter": "ch3",
      "point": "奈奎斯特准则与无码间串扰",
      "tags": [
        "三角谱",
        "sinc²脉冲",
        "最高符号速率"
      ],
      "fig": "c2spec"
    },
    {
      "id": "2019-4",
      "num": 2,
      "type": "choice",
      "group": "g2",
      "blank": 4,
      "chapter": "ch3",
      "point": "奈奎斯特准则与无码间串扰",
      "tags": [
        "频带利用率"
      ]
    },
    {
      "id": "2019-5",
      "num": 3,
      "type": "choice",
      "group": "g3",
      "blank": 5,
      "chapter": "ch4",
      "point": "多进制调制的误码性能与带宽",
      "tags": [
        "符号速率",
        "多进制"
      ]
    },
    {
      "id": "2019-6",
      "num": 3,
      "type": "choice",
      "group": "g3",
      "blank": 6,
      "chapter": "ch4",
      "point": "多进制调制的误码性能与带宽",
      "tags": [
        "符号间隔"
      ]
    },
    {
      "id": "2019-7",
      "num": 3,
      "type": "choice",
      "group": "g3",
      "blank": 7,
      "chapter": "ch4",
      "point": "多进制调制的误码性能与带宽",
      "tags": [
        "符号能量",
        "比特能量"
      ]
    },
    {
      "id": "2019-8",
      "num": 4,
      "type": "choice",
      "group": "g4",
      "blank": 8,
      "chapter": "ch2",
      "point": "AM/DSB-SC/SSB/VSB 原理与带宽",
      "tags": [
        "调幅指数"
      ]
    },
    {
      "id": "2019-9",
      "num": 4,
      "type": "choice",
      "group": "g4",
      "blank": 9,
      "chapter": "ch2",
      "point": "AM/DSB-SC/SSB/VSB 原理与带宽",
      "tags": [
        "调制效率",
        "易错"
      ]
    },
    {
      "id": "2019-10",
      "num": 5,
      "type": "choice",
      "group": "g5",
      "blank": 10,
      "oKey": "options10",
      "chapter": "ch5",
      "point": "A律13折线与PCM编码",
      "tags": [
        "PCM",
        "语音编码"
      ]
    },
    {
      "id": "2019-11",
      "num": 5,
      "type": "choice",
      "group": "g5",
      "blank": 11,
      "oKey": "options11",
      "chapter": "ch5",
      "point": "A律13折线与PCM编码",
      "tags": [
        "量化间隔",
        "易错"
      ]
    },
    {
      "id": "2019-12",
      "num": 6,
      "type": "choice",
      "group": "g6",
      "blank": 12,
      "chapter": "ch3",
      "point": "升余弦滚降与带宽",
      "tags": [
        "8PAM",
        "奈奎斯特带宽"
      ]
    },
    {
      "id": "2019-13",
      "num": 6,
      "type": "choice",
      "group": "g6",
      "blank": 13,
      "chapter": "ch3",
      "point": "升余弦滚降与带宽",
      "tags": [
        "滚降因子",
        "升余弦"
      ]
    },
    {
      "id": "2019-14",
      "num": 6,
      "type": "choice",
      "group": "g6",
      "blank": 14,
      "chapter": "ch3",
      "point": "升余弦滚降与带宽",
      "tags": [
        "64PAM"
      ]
    },
    {
      "id": "2019-15",
      "num": 6,
      "type": "choice",
      "group": "g6",
      "blank": 15,
      "chapter": "ch3",
      "point": "升余弦滚降与带宽",
      "tags": [
        "滚降因子"
      ]
    },
    {
      "id": "2019-16",
      "num": 7,
      "type": "choice",
      "group": "g7",
      "blank": 16,
      "chapter": "ch2",
      "point": "卡森公式与调制指数",
      "tags": [
        "最大频偏",
        "调频"
      ]
    },
    {
      "id": "2019-17",
      "num": 7,
      "type": "choice",
      "group": "g7",
      "blank": 17,
      "chapter": "ch2",
      "point": "卡森公式与调制指数",
      "tags": [
        "调频指数"
      ]
    },
    {
      "id": "2019-18",
      "num": 7,
      "type": "choice",
      "group": "g7",
      "blank": 18,
      "chapter": "ch2",
      "point": "卡森公式与调制指数",
      "tags": [
        "卡森公式"
      ]
    },
    {
      "id": "2019-19",
      "num": 8,
      "type": "choice",
      "group": "g8",
      "blank": 19,
      "chapter": "ch2",
      "point": "AM/DSB-SC/SSB/VSB 原理与带宽",
      "tags": [
        "SSB",
        "带通滤波"
      ]
    },
    {
      "id": "2019-20",
      "num": 9,
      "type": "choice",
      "group": "g9",
      "blank": 20,
      "chapter": "ch2",
      "point": "相干解调与抗噪声性能",
      "tags": [
        "已调信号带宽"
      ]
    },
    {
      "id": "2019-21",
      "num": 9,
      "type": "choice",
      "group": "g9",
      "blank": 21,
      "chapter": "ch2",
      "point": "相干解调与抗噪声性能",
      "tags": [
        "已调信号带宽",
        "SSB"
      ]
    },
    {
      "id": "2019-22",
      "num": 9,
      "type": "choice",
      "group": "g9",
      "blank": 22,
      "chapter": "ch2",
      "point": "相干解调与抗噪声性能",
      "tags": [
        "输出信噪比",
        "调频"
      ]
    },
    {
      "id": "2019-23",
      "num": 9,
      "type": "choice",
      "group": "g9",
      "blank": 23,
      "chapter": "ch2",
      "point": "相干解调与抗噪声性能",
      "tags": [
        "输出信噪比",
        "AM 效率"
      ]
    },
    {
      "id": "2019-24",
      "num": 10,
      "type": "choice",
      "group": "g10",
      "blank": 24,
      "oKey": "options2425",
      "chapter": "ch3",
      "point": "基带码型（AMI/HDB3等）",
      "tags": [
        "AMI",
        "无直流",
        "平均功率"
      ]
    },
    {
      "id": "2019-25",
      "num": 10,
      "type": "choice",
      "group": "g10",
      "blank": 25,
      "oKey": "options2425",
      "chapter": "ch3",
      "point": "基带码型（AMI/HDB3等）",
      "tags": [
        "HDB3",
        "连零抑制"
      ]
    },
    {
      "id": "2019-26",
      "num": 10,
      "type": "choice",
      "group": "g10",
      "blank": 26,
      "oKey": "options2627",
      "chapter": "ch3",
      "point": "基带码型（AMI/HDB3等）",
      "tags": [
        "主瓣带宽"
      ]
    },
    {
      "id": "2019-27",
      "num": 10,
      "type": "choice",
      "group": "g10",
      "blank": 27,
      "oKey": "options2627",
      "chapter": "ch3",
      "point": "基带码型（AMI/HDB3等）",
      "tags": [
        "RZ",
        "占空比",
        "主瓣带宽"
      ]
    },
    {
      "id": "2019-28",
      "num": 11,
      "type": "choice",
      "group": "g11",
      "blank": 28,
      "chapter": "ch3",
      "point": "码间串扰分析",
      "tags": [
        "时域均衡"
      ]
    },
    {
      "id": "2019-29",
      "num": 12,
      "type": "choice",
      "group": "g12",
      "blank": 29,
      "chapter": "ch3",
      "point": "奈奎斯特准则与无码间串扰",
      "tags": [
        "部分响应"
      ]
    },
    {
      "id": "2019-30",
      "num": 13,
      "type": "choice",
      "group": "g13",
      "blank": 30,
      "oKey": "options30",
      "chapter": "ch3",
      "point": "奈奎斯特准则与无码间串扰",
      "tags": [
        "无码间串扰条件",
        "时域"
      ]
    },
    {
      "id": "2019-31",
      "num": 13,
      "type": "choice",
      "group": "g13",
      "blank": 31,
      "oKey": "options31",
      "chapter": "ch3",
      "point": "奈奎斯特准则与无码间串扰",
      "tags": [
        "奈奎斯特第一准则",
        "频域"
      ]
    },
    {
      "id": "2019-32",
      "num": 14,
      "type": "choice",
      "group": "g14",
      "blank": 32,
      "chapter": "ch3",
      "point": "眼图",
      "tags": [
        "眼图",
        "噪声容限"
      ]
    },
    {
      "id": "2019-33",
      "num": 15,
      "type": "choice",
      "group": "g15",
      "blank": 33,
      "oKey": "options33",
      "chapter": "ch4",
      "point": "2ASK/2FSK/2PSK/2DPSK",
      "tags": [
        "2DPSK",
        "差分编码"
      ]
    },
    {
      "id": "2019-34",
      "num": 15,
      "type": "choice",
      "group": "g15",
      "blank": 34,
      "oKey": "options34",
      "chapter": "ch4",
      "point": "2ASK/2FSK/2PSK/2DPSK",
      "tags": [
        "差分相干",
        "解调方式"
      ]
    },
    {
      "id": "2019-35",
      "num": 16,
      "type": "choice",
      "group": "g16",
      "blank": 35,
      "chapter": "ch4",
      "point": "MPSK/MQAM 星座图与格雷映射",
      "tags": [
        "格雷码"
      ]
    },
    {
      "id": "2019-36",
      "num": 16,
      "type": "choice",
      "group": "g16",
      "blank": 36,
      "chapter": "ch4",
      "point": "MPSK/MQAM 星座图与格雷映射",
      "tags": [
        "误符号率",
        "误比特率"
      ]
    },
    {
      "id": "2019-37",
      "num": 17,
      "type": "choice",
      "group": "g17",
      "blank": 37,
      "chapter": "ch4",
      "point": "2ASK/2FSK/2PSK/2DPSK",
      "tags": [
        "2FSK 正交条件",
        "易错"
      ]
    },
    {
      "id": "2019-38",
      "num": 18,
      "type": "choice",
      "group": "g18",
      "blank": 38,
      "oKey": "options38",
      "chapter": "ch9",
      "point": "最佳判决门限",
      "tags": [
        "MAP 准则"
      ]
    },
    {
      "id": "2019-39",
      "num": 18,
      "type": "choice",
      "group": "g18",
      "blank": 39,
      "oKey": "options39",
      "chapter": "ch9",
      "point": "最佳判决门限",
      "tags": [
        "ML 与 MAP",
        "等概"
      ]
    },
    {
      "id": "2019-40",
      "num": 19,
      "type": "choice",
      "group": "g19",
      "blank": 40,
      "chapter": "ch4",
      "point": "多进制调制的误码性能与带宽",
      "tags": [
        "包络起伏",
        "OQPSK"
      ]
    },
    {
      "id": "2019-41",
      "num": 19,
      "type": "choice",
      "group": "g19",
      "blank": 41,
      "chapter": "ch4",
      "point": "多进制调制的误码性能与带宽",
      "tags": [
        "误比特率"
      ]
    },
    {
      "id": "2019-42",
      "num": 19,
      "type": "choice",
      "group": "g19",
      "blank": 42,
      "chapter": "ch4",
      "point": "频带利用率",
      "tags": [
        "16QAM",
        "频带利用率"
      ]
    },
    {
      "id": "2019-43",
      "num": 20,
      "type": "choice",
      "group": "g20",
      "blank": 43,
      "chapter": "ch5",
      "point": "抽样定理",
      "tags": [
        "带通采样",
        "PCM 复用",
        "易错"
      ]
    },
    {
      "id": "2019-44",
      "num": 21,
      "type": "choice",
      "group": "g21",
      "blank": 44,
      "chapter": "ch5",
      "point": "哈夫曼编码",
      "tags": [
        "哈夫曼",
        "平均码长"
      ]
    },
    {
      "id": "2019-45",
      "num": 22,
      "type": "choice",
      "group": "g22",
      "blank": 45,
      "oKey": "options45",
      "chapter": "ch6",
      "point": "循环码",
      "tags": [
        "生成多项式"
      ]
    },
    {
      "id": "2019-46",
      "num": 22,
      "type": "choice",
      "group": "g22",
      "blank": 46,
      "oKey": "options46",
      "chapter": "ch6",
      "point": "循环码",
      "tags": [
        "生成多项式",
        "次数"
      ]
    },
    {
      "id": "2019-47",
      "num": 23,
      "type": "choice",
      "group": "g23",
      "blank": 47,
      "chapter": "ch1",
      "point": "无线信道（多径/多普勒/相干带宽）",
      "tags": [
        "平坦衰落",
        "相干带宽"
      ]
    },
    {
      "id": "2019-48",
      "num": 24,
      "type": "choice",
      "group": "g24",
      "blank": 48,
      "oKey": "options48",
      "chapter": "ch6",
      "point": "扩频通信与处理增益",
      "tags": [
        "m 序列",
        "自相关"
      ]
    },
    {
      "id": "2019-49",
      "num": 24,
      "type": "choice",
      "group": "g24",
      "blank": 49,
      "oKey": "options49",
      "chapter": "ch6",
      "point": "扩频通信与处理增益",
      "tags": [
        "Rake 接收",
        "多径分集"
      ]
    },
    {
      "id": "2019-50",
      "num": 25,
      "type": "choice",
      "group": "g25",
      "blank": 50,
      "chapter": "ch4",
      "point": "OFDM 与多载波调制",
      "tags": [
        "循环前缀"
      ]
    },
    {
      "id": "2019-二",
      "num": "二",
      "type": "big",
      "score": 14,
      "stem": "下图中 $s(t)=m(t)\\cos(2\\pi f_ct+\\theta)$ 是 DSB-SC 已调信号，其中模拟基带信号 $m(t)$ 的功率为 $P_m$、带宽为 $W$。$n_w(t)$ 是双边功率谱密度为 $N_0/2$ 的加性白高斯噪声。理想带通滤波器的通带范围正好能使 $s(t)$ 通过，理想低通滤波器的截止频率是 $W$。",
      "subs": [
        "(1) 以 $\\cos(2\\pi f_ct)$ 为参考载波，写出已调信号 $s(t)$ 的复包络 $s_L(t)$、同相分量 $I(t)$、正交分量 $Q(t)$ 的表达式；",
        "(2) 求 $I(t)$、$Q(t)$ 的功率；",
        "(3) 写出带通滤波器输出噪声 $n(t)$ 的表达式，并求 $n(t)$ 的同相分量 $n_c(t)$、正交分量 $n_s(t)$ 的功率；",
        "(4) 求低通滤波器输出端有用信号 $s_o(t)$ 及噪声 $n_o(t)$ 的功率。"
      ],
      "fig": "q2block",
      "chapter": "ch2",
      "point": "相干解调与抗噪声性能",
      "tags": [
        "DSB-SC",
        "复包络",
        "同相/正交分量",
        "相干解调"
      ]
    },
    {
      "id": "2019-三",
      "num": "三",
      "type": "big",
      "score": 14,
      "stem": "设有信号 $x(t)=\\sum\\limits_{n=-\\infty}^{\\infty}a_ng_1(t-nT)$，$y(t)=\\sum\\limits_{n=-\\infty}^{\\infty}a_ng_2(t-nT)$，其中 $g_1(t)=\\mathrm{sinc}\\left(\\dfrac{t}{T}\\right)$，$g_2(t)=\\mathrm{sinc}\\left(\\dfrac{2t}{T}\\right)$。$a_n$ 以独立等概方式取值于 $\\{\\pm1\\}$。令 $s_1(t)=x(t)-y(t)$、$s_2(t)=x(t)+\\mathrm{j}y(t)$。试求：",
      "subs": [
        "(1) $x(t)$ 的功率谱密度、功率、带宽；",
        "(2) $y(t)$ 的功率谱密度、功率、带宽；",
        "(3) $s_1(t)$ 的功率谱密度、功率、带宽；",
        "(4) $s_2(t)$ 的功率谱密度、功率、带宽。"
      ],
      "fig": null,
      "chapter": "ch1",
      "point": "随机过程通过线性系统",
      "tags": [
        "PAM 功率谱",
        "sinc 脉冲",
        "复信号"
      ]
    },
    {
      "id": "2019-四",
      "num": "四",
      "type": "big",
      "score": 14,
      "stem": "设某二进制基带传输系统在 $[0,T]$ 时间内等概发送下列两个信号之一：$$s_1(t)=\\begin{cases}\\sin\\dfrac{2\\pi t}{T},&0\\le t\\le T\\\\0,&\\text{else}\\end{cases},\\qquad s_2(t)=0$$ 发送信号叠加了双边功率谱密度为 $N_0/2$ 的高斯白噪声 $n_w(t)$ 后成为接收信号 $r(t)=s(t)+n_w(t)$。在接收端采用匹配滤波器进行最佳接收，其最佳采样时刻 $t_0$ 的输出值为 $y$。试：",
      "subs": [
        "(1) 写出最佳采样时刻 $t_0$，画出匹配滤波器冲激响应的波形图；",
        "(2) 求出发送 $s_1(t)$、$s_2(t)$ 条件下 $y$ 的均值、方差以及条件概率密度函数；",
        "(3) 求出该系统的平均误比特率表达式。"
      ],
      "fig": null,
      "chapter": "ch9",
      "point": "误比特率分析",
      "tags": [
        "匹配滤波器",
        "通断键控",
        "误比特率"
      ]
    },
    {
      "id": "2019-五",
      "num": "五",
      "type": "big",
      "score": 14,
      "stem": "设有两个能量为 1 的确定信号 $s_1(t)$、$s_2(t)$，已知其相关系数是 $1/2$。令 $s_3(t)=s_1(t)+s_2(t)$、$s_4(t)=s_1(t)-s_2(t)$。采用 $s_1(t)$、$s_2(t)$、$s_3(t)$、$s_4(t)$ 构成四进制通信系统的四种波形。假设四种波形等概出现。试：",
      "subs": [
        "(1) 求 $s_3(t)$、$s_4(t)$ 的能量以及该系统的平均符号能量 $E_s$；",
        "(2) $s_1(t)$、$s_2(t)$、$s_3(t)$、$s_4(t)$ 之间的最小欧氏距离；",
        "(3) 若取 $s_3(t)$、$s_4(t)$ 的归一化作为基函数，画出该系统的星座图，并标出 $s_3(t)$ 的最佳判决域。"
      ],
      "fig": null,
      "chapter": "ch9",
      "point": "信号波形与能量关系",
      "tags": [
        "信号空间",
        "星座图",
        "最小欧氏距离",
        "判决域"
      ]
    },
    {
      "id": "2019-六",
      "num": "六",
      "type": "big",
      "score": 14,
      "stem": "设某信道的输入 $X\\in\\{0,1\\}$，输出 $Y\\in\\{0,1,2\\}$。已知 $X$ 的概率分布是 $P(X=0)=p$、$P(X=1)=1-p$，信道转移概率 $P(Y|X)$ 如下表所示：\n| $P(Y\\vert X)$ | $Y=0$ | $Y=1$ | $Y=2$ |\n|---|---|---|---|\n| $X=0$ | 0.8 | 0 | 0.2 |\n| $X=1$ | 0 | 0.8 | 0.2 |",
      "subs": [
        "(1) $Y$ 的概率分布 $P(Y=0)$、$P(Y=1)$、$P(Y=2)$；",
        "(2) 熵 $H(Y)$、条件熵 $H(Y|X)$；",
        "(3) 能使 $H(Y)$ 最大的 $p$ 以及 $H(Y)$ 的最大值；",
        "(4) 此信道的信道容量。"
      ],
      "fig": null,
      "chapter": "ch7",
      "point": "信道容量与香农公式",
      "tags": [
        "条件熵",
        "信道容量",
        "互信息最大化"
      ]
    },
    {
      "id": "2019-七",
      "num": "七",
      "type": "big",
      "score": 15,
      "stem": "设某量化器输入 $X$ 的概率密度函数为 $$p(x)=\\begin{cases}1-|x|,&|x|\\le1\\\\0,&|x|>1\\end{cases}$$ 输出为 $$Y=Q(X)=\\begin{cases}b,&\\dfrac12\\le X\\le1\\\\a,&0\\le X<\\dfrac12\\\\-a,&-\\dfrac12\\le X<0\\\\-b,&-1\\le X<-\\dfrac12\\end{cases}$$ 其中 $0<a<\\dfrac12$、$\\dfrac12<b<1$。试求：",
      "subs": [
        "(1) 量化器输入功率 $S=E[X^2]$；",
        "(2) $Y$ 的概率分布 $P(Y)$；",
        "(3) 当量化器为均匀量化时 $a$、$b$ 的取值以及对应的量化输出功率 $S_q=E[Y^2]$、量化噪声功率 $N_q=E[(X-Y)^2]$；",
        "(4) 能使量化信噪比最大的 $a$、$b$ 值。"
      ],
      "fig": null,
      "chapter": "ch5",
      "point": "量化（均匀/最佳量化）",
      "tags": [
        "最佳量化",
        "Lloyd-Max",
        "量化噪声"
      ]
    },
    {
      "id": "2019-八",
      "num": "八",
      "type": "big",
      "score": 15,
      "stem": "本大题含两道小题。",
      "subs": [
        "1、设某线性分组码的校验矩阵有 3 行 7 列，且所有列两两不同。试：",
        "(1) 写出校验矩阵 $\\boldsymbol H$；",
        "(2) 写出系统码形式的生成矩阵 $\\boldsymbol G$；",
        "(3) 求出接收码组 $0110000$ 所对应的伴随式以及最可能错误图样。",
        "2、设某卷积码的生成多项式为 $g_1(x)=1+x+x^3$、$g_2(x)=1+x^2+x^3$，试：",
        "(1) 画出该卷积码的编码器原理框图；",
        "(2) 写出输入 $1011000$ 对应的编码输出。"
      ],
      "fig": null,
      "chapter": "ch6",
      "point": "校验矩阵与伴随式",
      "tags": [
        "线性分组码",
        "系统生成矩阵",
        "伴随式",
        "卷积码"
      ]
    }
  ]
};
