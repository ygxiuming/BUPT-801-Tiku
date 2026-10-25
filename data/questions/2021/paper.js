// 2021 · 真题（试卷元数据 + groups + 题干/选项）—— 答案与解析在同目录 answer.js
window.BUPT801 = window.BUPT801 || {};
window.BUPT801.papers = window.BUPT801.papers || {};
window.BUPT801.papers["2021"] = {
  "year": 2021,
  "title": "北京邮电大学2021年硕士研究生入学考试试题",
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
      "score": 110,
      "intro": "本大题共 8 题，分值依次为 16、16、16、16、14、16、16 分，共 110 分。"
    }
  ],
  "groups": {
    "g1": {
      "stem": "设 $x(t)=\\cos(200\\pi t)+\\sin(200\\pi t)$，其希尔伯特变换为 $\\hat x(t)$。$x(t)$ 的功率是（1）W，$\\hat x(t)$ 的功率是（2）W，$x(t)+\\hat x(t)$ 的功率是（3）W，$x(t)+\\hat x(-t)$ 的功率是（4）W。",
      "options": {
        "A": "0",
        "B": "1",
        "C": "2",
        "D": "4"
      }
    },
    "g2": {
      "stem": "设 $m(t)$ 是模拟基带调制信号，载频 $f_c$ 充分大。下列中（5）是 $m(t)$ 的调相信号，（6）是 $m(t)$ 的调频信号。",
      "options": {
        "A": "$\\cos\\left[2\\pi f_ct+\\dfrac{\\mathrm d}{\\mathrm dt}m(t)\\right]$",
        "B": "$\\cos\\left[2\\pi f_ct+m(t)\\right]$",
        "C": "$\\cos\\left[2\\pi f_ct+\\overline{m(t)}\\right]$",
        "D": "$\\cos\\left[2\\pi f_ct+\\int_{-\\infty}^{t}m(\\tau)\\,\\mathrm d\\tau\\right]$"
      }
    },
    "g3": {
      "stem": "下列已调信号中，（7）的复包络是解析信号。",
      "options": {
        "A": "AM",
        "B": "FM",
        "C": "下边带 SSB",
        "D": "上边带 SSB"
      }
    },
    "g4": {
      "stem": "若基带信号 $x(t)$ 的主瓣带宽为 $B$，则 $x(t)$ 与（8）正交。",
      "options": {
        "A": "$e^{\\mathrm j2\\pi Bt}$",
        "B": "$e^{-B|t|}$",
        "C": "$\\operatorname{sinc}(Bt)$",
        "D": "$\\operatorname{rect}(Bt)$"
      }
    },
    "g5": {
      "stem": "若基带传输系统的带宽为 $B$，则无符号间干扰传输的最高符号速率是（9）Baud。",
      "options": {
        "A": "$2/B$",
        "B": "$B/2$",
        "C": "$B$",
        "D": "$2B$"
      }
    },
    "g6": {
      "stem": "某 AM 系统的调制指数 $a=1$，基带调制信号 $m(t)$ 的均值为零、带宽为 1 kHz、功率为 1 W、最大幅度为 2 V，已调信号表达式为 $s(t)=\\sqrt{\\dfrac{2}{5}}\\left[A+m(t)\\right]\\cos(2\\pi f_ct)$，则 $A$ 为（10）V。$s(t)$ 的带宽为（11）kHz、功率为（12）W、调制效率为（13）。",
      "optionSets": ["options10", "options13"],
      "options10": {
        "A": "$\\dfrac12$",
        "B": "1",
        "C": "2",
        "D": "5"
      },
      "options13": {
        "A": "$\\dfrac19$",
        "B": "$\\dfrac15$",
        "C": "$\\dfrac12$",
        "D": "1"
      }
    },
    "g7": {
      "stem": "某升余弦滚降系统发送信号的功率谱密度如下图所示，该系统的滚降系数是（14）。",
      "options": {
        "A": "$\\dfrac14$",
        "B": "$\\dfrac13$",
        "C": "$\\dfrac12$",
        "D": "1"
      }
    },
    "g8": {
      "stem": "考虑非相干解调时，OOK 信号可以采用（15），2DPSK 信号可以采用（16）。",
      "options": {
        "A": "包络检波",
        "B": "鉴频器",
        "C": "匹配滤波器",
        "D": "差分相干检测"
      }
    },
    "g9": {
      "stem": "若某 QPSK 系统的误比特率是 0.2，则其误符号率是（17）。",
      "options": {
        "A": "0.04",
        "B": "0.18",
        "C": "0.2",
        "D": "0.36"
      }
    },
    "g10": {
      "stem": "部分响应系统通过引入人为的符号间干扰使频谱利用率达到（18）极限。二进制第 I 类部分响应系统的频带利用率是（19）bit/s/Hz。",
      "optionSets": ["options18", "options19"],
      "options18": {
        "A": "高斯",
        "B": "香农",
        "C": "奈奎斯特",
        "D": "汉明"
      },
      "options19": {
        "A": "0.5",
        "B": "1",
        "C": "1.5",
        "D": "2"
      }
    },
    "g11": {
      "stem": "设 $X(t)$ 是平稳高斯过程，已知其功率谱密度 $P_X(f)$ 在 $-\\infty<f<\\infty$ 范围内有界。$X(t)$ 的均值（20）。",
      "options": {
        "A": "等于零",
        "B": "等于 $\\displaystyle\\int_{-\\infty}^{\\infty}P_X(f)\\,\\mathrm df$",
        "C": "是高斯随机变量",
        "D": "是平稳高斯过程"
      }
    },
    "g12": {
      "stem": "如果信道的相干带宽很小，系统设计时需要考虑（21）问题。",
      "options": {
        "A": "符号间干扰",
        "B": "信道时变性",
        "C": "平坦衰落",
        "D": "包络起伏"
      }
    },
    "g13": {
      "stem": "某 A 律十三折线 PCM 编码器的输入范围是 $[-8,+8]$ V，若编码器输出码组是 11011010，则译码器重建电平是（22）V。",
      "options": {
        "A": "$-\\dfrac{53}{32}$",
        "B": "$+\\dfrac{53}{32}$",
        "C": "$+\\dfrac{53}{16}$",
        "D": "$+\\dfrac{55}{32}$"
      }
    },
    "g14": {
      "stem": "将比特序列 10001000011000010000 编成 HDB$_3$ 码，结果是（23）。",
      "options": {
        "A": "$+1000-1000-1+1-1000-1+1000+1$",
        "B": "$+1000-1000-1+1-1-100-1+1000+1$",
        "C": "$+1000-1000-1+1-1+100+1-1000-1$",
        "D": "$+1000-10000+1-10000+10000$"
      }
    },
    "g15": {
      "stem": "若四进制 PAM 信号 $s(t)$ 的数据独立等概，平均功率是 1 W，比特速率是 $R_b=1$ kbit/s，则平均比特能量 $E_b=$（24）mJ，符号能量 $E_s=$（25）mJ，符号速率 $R_s=$（26）kBaud，符号间隔是（27）ms。",
      "options": {
        "A": "0.5",
        "B": "1",
        "C": "2",
        "D": "4"
      }
    },
    "g16": {
      "stem": "下列数字调制方式中，抗噪声能力最强的是（28），最弱的是（29）。",
      "options": {
        "A": "16FSK",
        "B": "16QAM",
        "C": "16ASK",
        "D": "16PSK"
      }
    },
    "g17": {
      "stem": "设 $(n,k)$ 分组码的最小码距是 $d_{\\min}$。如欲纠正 $t$ 位及 $t$ 位以内的差错，$d_{\\min}$ 必须满足（30）。",
      "options": {
        "A": "$d_{\\min}\\ge t+2$",
        "B": "$d_{\\min}\\ge 2t$",
        "C": "$d_{\\min}\\ge 2t+1$",
        "D": "$d_{\\min}\\ge 2(t+1)$"
      }
    },
    "g18": {
      "stem": "对实信号 $x(t)$ 进行理想采样。若 $x(t)$ 是基带信号，其最高频率是 4 kHz，采样后频谱不发生混叠的最小采样率是（31）kHz。若 $x(t)$ 是带通信号，其频带范围是 $[15\\text{ kHz}\\sim18\\text{ kHz}]$，采样后频谱不发生混叠的最小采样率是（32）kHz。",
      "options": {
        "A": "4",
        "B": "6",
        "C": "8",
        "D": "12"
      }
    },
    "g19": {
      "stem": "某数字调制系统的设计者从 QPSK 和 OQPSK 中选择了 OQPSK，其主要原因是该系统的（33）不够理想。",
      "options": {
        "A": "功率放大器线性度",
        "B": "滤波器幅频特性",
        "C": "定时精度",
        "D": "载波同步"
      }
    },
    "g20": {
      "stem": "FM 信号 $s(t)=\\cos\\left[5\\times10^6\\pi t+5\\sin(5000\\pi t)\\right]$ 的带宽近似是（34）kHz。",
      "options": {
        "A": "5",
        "B": "10",
        "C": "15",
        "D": "30"
      }
    },
    "g21": {
      "stem": "若 $(n,k)$ 线性分组码的合法码字包含全 1 码字，则其校验矩阵 $\\boldsymbol H$ 的每一行的汉明重量一定（35）。",
      "options": {
        "A": "小于 $k$",
        "B": "等于最小码距",
        "C": "是奇数",
        "D": "是偶数"
      }
    },
    "g22": {
      "stem": "直接序列扩频（DSSS）系统经常采用（36）技术来对抗多径衰落。",
      "options": {
        "A": "Rake 接收",
        "B": "频域均衡",
        "C": "部分响应",
        "D": "Doppler 扩展"
      }
    },
    "g23": {
      "stem": "8PSK 将 3 个比特 $b_1b_2b_3$ 映射到 8 个相位。采用格雷映射时，相邻相位对应的比特组之间的汉明距离是（37）。",
      "options": {
        "A": "0",
        "B": "1",
        "C": "2",
        "D": "3"
      }
    },
    "g24": {
      "stem": "设二进制数据独立等概、速率为 16 kbit/s，则 2DPSK 信号的主瓣带宽是（38）kHz。",
      "options": {
        "A": "8",
        "B": "12",
        "C": "16",
        "D": "32"
      }
    },
    "g25": {
      "stem": "设 32FSK 的数据速率是 30 kbit/s，保持频率正交的最小频率间隔是（39）kHz。",
      "options": {
        "A": "3",
        "B": "6",
        "C": "15",
        "D": "30"
      }
    },
    "g26": {
      "stem": "采用科斯塔斯环提取载波存在（40）问题。",
      "options": {
        "A": "差错传播",
        "B": "符号间干扰",
        "C": "频谱混叠",
        "D": "相位模糊"
      }
    }
  },
  "questions": [
    {
      "id": "2021-1", "num": 1, "type": "choice", "group": "g1", "blank": 1,
      "chapter": "ch1", "point": "希尔伯特变换与复包络",
      "tags": ["希尔伯特变换", "信号功率", "解析信号"]
    },
    {
      "id": "2021-2", "num": 1, "type": "choice", "group": "g1", "blank": 2,
      "chapter": "ch1", "point": "希尔伯特变换与复包络",
      "tags": ["希尔伯特变换", "正交分量", "功率不变"]
    },
    {
      "id": "2021-3", "num": 1, "type": "choice", "group": "g1", "blank": 3,
      "chapter": "ch1", "point": "希尔伯特变换与复包络",
      "tags": ["希尔伯特变换", "同相分量", "功率叠加"]
    },
    {
      "id": "2021-4", "num": 1, "type": "choice", "group": "g1", "blank": 4,
      "chapter": "ch1", "point": "希尔伯特变换与复包络",
      "tags": ["希尔伯特变换", "奇偶性", "完全抵消"]
    },
    {
      "id": "2021-5", "num": 2, "type": "choice", "group": "g2", "blank": 5,
      "chapter": "ch2", "point": "FM/PM 角度调制",
      "tags": ["调相", "瞬时相位", "角度调制"]
    },
    {
      "id": "2021-6", "num": 2, "type": "choice", "group": "g2", "blank": 6,
      "chapter": "ch2", "point": "FM/PM 角度调制",
      "tags": ["调频", "瞬时频率", "积分"]
    },
    {
      "id": "2021-7", "num": 3, "type": "choice", "group": "g3", "blank": 7,
      "chapter": "ch1", "point": "希尔伯特变换与复包络",
      "tags": ["解析信号", "单边谱", "SSB"]
    },
    {
      "id": "2021-8", "num": 4, "type": "choice", "group": "g4", "blank": 8,
      "chapter": "ch9", "point": "信号波形与能量关系",
      "tags": ["正交性", "频谱搬移", "内积"]
    },
    {
      "id": "2021-9", "num": 5, "type": "choice", "group": "g5", "blank": 9,
      "chapter": "ch3", "point": "奈奎斯特准则与无码间串扰",
      "tags": ["奈奎斯特速率", "2B", "无码间串扰"]
    },
    {
      "id": "2021-10", "num": 6, "type": "choice", "group": "g6", "blank": 10, "oKey": "options10",
      "chapter": "ch2", "point": "AM/DSB-SC/SSB/VSB 原理与带宽",
      "tags": ["AM", "调制指数", "载波幅度"]
    },
    {
      "id": "2021-11", "num": 6, "type": "choice", "group": "g6", "blank": 11, "oKey": "options10",
      "chapter": "ch2", "point": "AM/DSB-SC/SSB/VSB 原理与带宽",
      "tags": ["AM", "带宽", "双边谱"]
    },
    {
      "id": "2021-12", "num": 6, "type": "choice", "group": "g6", "blank": 12, "oKey": "options10",
      "chapter": "ch2", "point": "AM/DSB-SC/SSB/VSB 原理与带宽",
      "tags": ["AM", "已调信号功率", "系数"]
    },
    {
      "id": "2021-13", "num": 6, "type": "choice", "group": "g6", "blank": 13, "oKey": "options13",
      "chapter": "ch2", "point": "AM/DSB-SC/SSB/VSB 原理与带宽",
      "tags": ["AM", "调制效率"]
    },
    {
      "id": "2021-14", "num": 7, "type": "choice", "group": "g7", "blank": 14, "fig": "q14rc",
      "chapter": "ch3", "point": "升余弦滚降与带宽",
      "tags": ["升余弦滚降", "滚降系数", "功率谱"]
    },
    {
      "id": "2021-15", "num": 8, "type": "choice", "group": "g8", "blank": 15,
      "chapter": "ch4", "point": "2ASK/2FSK/2PSK/2DPSK",
      "tags": ["OOK", "包络检波", "非相干解调"]
    },
    {
      "id": "2021-16", "num": 8, "type": "choice", "group": "g8", "blank": 16,
      "chapter": "ch4", "point": "2ASK/2FSK/2PSK/2DPSK",
      "tags": ["2DPSK", "差分相干检测", "非相干解调"]
    },
    {
      "id": "2021-17", "num": 9, "type": "choice", "group": "g9", "blank": 17,
      "chapter": "ch4", "point": "MPSK/MQAM 星座图与格雷映射",
      "tags": ["QPSK", "误符号率", "误比特率"]
    },
    {
      "id": "2021-18", "num": 10, "type": "choice", "group": "g10", "blank": 18, "oKey": "options18",
      "chapter": "ch3", "point": "最佳基带系统",
      "tags": ["部分响应", "奈奎斯特极限", "频谱利用率"]
    },
    {
      "id": "2021-19", "num": 10, "type": "choice", "group": "g10", "blank": 19, "oKey": "options19",
      "chapter": "ch3", "point": "最佳基带系统",
      "tags": ["第I类部分响应", "频带利用率", "2bit/s/Hz"]
    },
    {
      "id": "2021-20", "num": 11, "type": "choice", "group": "g11", "blank": 20,
      "chapter": "ch1", "point": "平稳性与自相关函数",
      "tags": ["平稳高斯过程", "功率谱有界", "均值"]
    },
    {
      "id": "2021-21", "num": 12, "type": "choice", "group": "g12", "blank": 21,
      "chapter": "ch1", "point": "无线信道（多径/多普勒/相干带宽）",
      "tags": ["相干带宽", "频率选择性衰落", "符号间干扰"]
    },
    {
      "id": "2021-22", "num": 13, "type": "choice", "group": "g13", "blank": 22,
      "chapter": "ch5", "point": "A律13折线与PCM编码",
      "tags": ["A律13折线", "PCM译码", "段内码"]
    },
    {
      "id": "2021-23", "num": 14, "type": "choice", "group": "g14", "blank": 23,
      "chapter": "ch3", "point": "基带码型（AMI/HDB3等）",
      "tags": ["HDB3", "取代节", "AMI"]
    },
    {
      "id": "2021-24", "num": 15, "type": "choice", "group": "g15", "blank": 24,
      "chapter": "ch4", "point": "多进制调制的误码性能与带宽",
      "tags": ["4PAM", "比特能量", "平均功率"]
    },
    {
      "id": "2021-25", "num": 15, "type": "choice", "group": "g15", "blank": 25,
      "chapter": "ch4", "point": "多进制调制的误码性能与带宽",
      "tags": ["4PAM", "符号能量", "log2M"]
    },
    {
      "id": "2021-26", "num": 15, "type": "choice", "group": "g15", "blank": 26,
      "chapter": "ch4", "point": "多进制调制的误码性能与带宽",
      "tags": ["符号速率", "波特率", "比特速率"]
    },
    {
      "id": "2021-27", "num": 15, "type": "choice", "group": "g15", "blank": 27,
      "chapter": "ch4", "point": "多进制调制的误码性能与带宽",
      "tags": ["符号间隔", "符号速率"]
    },
    {
      "id": "2021-28", "num": 16, "type": "choice", "group": "g16", "blank": 28,
      "chapter": "ch4", "point": "多进制调制的误码性能与带宽",
      "tags": ["16FSK", "正交调制", "抗噪声能力"]
    },
    {
      "id": "2021-29", "num": 16, "type": "choice", "group": "g16", "blank": 29,
      "chapter": "ch4", "point": "多进制调制的误码性能与带宽",
      "tags": ["16ASK", "最小距离", "抗噪声能力"]
    },
    {
      "id": "2021-30", "num": 17, "type": "choice", "group": "g17", "blank": 30,
      "chapter": "ch6", "point": "汉明距离与纠检错能力",
      "tags": ["最小码距", "纠错能力", "2t+1"]
    },
    {
      "id": "2021-31", "num": 18, "type": "choice", "group": "g18", "blank": 31,
      "chapter": "ch5", "point": "抽样定理",
      "tags": ["奈奎斯特采样", "基带采样", "混叠"]
    },
    {
      "id": "2021-32", "num": 18, "type": "choice", "group": "g18", "blank": 32,
      "chapter": "ch5", "point": "抽样定理",
      "tags": ["带通采样", "最小采样率", "频谱不混叠"]
    },
    {
      "id": "2021-33", "num": 19, "type": "choice", "group": "g19", "blank": 33,
      "chapter": "ch4", "point": "MPSK/MQAM 星座图与格雷映射",
      "tags": ["OQPSK", "包络起伏", "功放线性度"]
    },
    {
      "id": "2021-34", "num": 20, "type": "choice", "group": "g20", "blank": 34,
      "chapter": "ch2", "point": "卡森公式与调制指数",
      "tags": ["FM", "卡森公式", "最大频偏"]
    },
    {
      "id": "2021-35", "num": 21, "type": "choice", "group": "g21", "blank": 35,
      "chapter": "ch6", "point": "校验矩阵与伴随式",
      "tags": ["线性分组码", "全1码字", "校验矩阵行重"]
    },
    {
      "id": "2021-36", "num": 22, "type": "choice", "group": "g22", "blank": 36,
      "chapter": "ch1", "point": "分集接收与 Rake",
      "tags": ["DSSS", "Rake接收", "多径"]
    },
    {
      "id": "2021-37", "num": 23, "type": "choice", "group": "g23", "blank": 37,
      "chapter": "ch4", "point": "MPSK/MQAM 星座图与格雷映射",
      "tags": ["8PSK", "格雷映射", "汉明距离"]
    },
    {
      "id": "2021-38", "num": 24, "type": "choice", "group": "g24", "blank": 38,
      "chapter": "ch4", "point": "2ASK/2FSK/2PSK/2DPSK",
      "tags": ["2DPSK", "主瓣带宽", "2Rb"]
    },
    {
      "id": "2021-39", "num": 25, "type": "choice", "group": "g25", "blank": 39,
      "chapter": "ch4", "point": "多进制调制的误码性能与带宽",
      "tags": ["32FSK", "正交频率间隔", "符号速率"]
    },
    {
      "id": "2021-40", "num": 26, "type": "choice", "group": "g26", "blank": 40,
      "chapter": "ch8", "point": "载波同步（平方环/科斯塔斯环）",
      "tags": ["科斯塔斯环", "相位模糊"]
    },
    {
      "id": "2021-二", "num": "二", "type": "big", "score": 16,
      "stem": "下图中，$s(t)=m(t)\\cos(2\\pi f_ct)-\\hat m(t)\\sin(2\\pi f_ct)$ 是已调信号，其中基带调制信号 $m(t)$ 的带宽为 100 Hz、功率为 2 W，$\\hat m(t)$ 是 $m(t)$ 的希尔伯特变换，$f_c=1000$ Hz。加性白高斯噪声的单边功率谱密度为 $N_0=10^{-5}$ W/Hz，理想低通滤波器 LPF 的截止频率是 100 Hz。试：",
      "subs": [
        "(1) 求 $s(t)$ 的功率、带宽；",
        "(2) 若 BPF 的通带是 1000 Hz ~ 1100 Hz，画出 A 点和 B 点噪声的双边功率谱密度图，并求 B 点信噪比；",
        "(3) 若 BPF 的通带是 950 Hz ~ 1100 Hz，画出 A 点和 B 点噪声的双边功率谱密度图，并求 B 点信噪比。"
      ],
      "fig": "q2block",
      "chapter": "ch2",
      "point": "相干解调与抗噪声性能",
      "tags": ["SSB", "相干解调", "噪声功率谱", "输出信噪比"]
    },
    {
      "id": "2021-三", "num": "三", "type": "big", "score": 16,
      "stem": "某二进制双极性 PAM 传输系统如下图所示。图中 $a_n$ 以独立等概方式取值于 $\\pm1$，A 点发送信号 $s(t)=\\sum\\limits_{n=-\\infty}^{+\\infty}a_ng(t-nT_b)$，其中 $T_b$ 是比特间隔，$g(t)=\\operatorname{sinc}(t)$，接收滤波器的冲激响应为 $g(t)$，采样时刻是 $T_b$ 的整倍数。试：",
      "subs": [
        "(1) 求 $g(t)$ 的能量谱密度、能量；",
        "(2) 求 $s(t)$ 的功率谱密度、功率；",
        "(3) 若 $T_b=1$ s，画出 B 点眼图，判断 C 点是否有符号间干扰；",
        "(4) 若 $T_b=0.5$ s，画出 B 点眼图，判断 C 点是否有符号间干扰。（注：眼图按无噪声画出示意图即可。）"
      ],
      "fig": "q3block",
      "chapter": "ch3",
      "point": "最佳基带系统",
      "tags": ["匹配滤波", "功率谱密度", "眼图", "码间串扰"]
    },
    {
      "id": "2021-四", "num": "四", "type": "big", "score": 16,
      "stem": "某二进制调制系统在 $[0,T_s]$ 内发送 $s(t)=a\\cdot\\cos(2\\pi f_ct)$，其中 $a$ 等概取值于 $\\{-1,+1\\}$，$f_c$ 充分大。接收框图如下所示，其中白高斯噪声 $n_w(t)$ 的单边功率谱密度为 $N_0$，判决输入是 $y(t)$ 在 $[0,T_s]$ 内的积分：$l=\\dfrac{1}{T_s}\\displaystyle\\int_0^{T_s}y(t)\\,\\mathrm dt$，判决结果 $\\hat a\\in\\{-1,+1\\}$。试：",
      "subs": [
        "(1) 求出 $s(t)$ 的平均符号能量 $E_s$；",
        "(2) 写出判决量 $l$ 的表达式、发送 $a=-1$ 条件下 $l$ 的均值、$l$ 中噪声的方差；",
        "(3) 写出最佳判决门限，并求发送 $a=-1$ 条件下的判决错误概率。"
      ],
      "fig": "q4rx",
      "chapter": "ch9",
      "point": "误比特率分析",
      "tags": ["相关接收机", "判决门限", "误比特率", "2PSK"]
    },
    {
      "id": "2021-五", "num": "五", "type": "big", "score": 16,
      "stem": "下图所示为归一化正交基下的 12 进制调制信号星座图。将星座点表示为复数 $X=X_I+\\mathrm jX_Q$，其中实部 $X_I$、虚部 $X_Q$ 的可能取值是 $-3$、$-1$、$+1$、$+3$。已知 12 个星座点等概出现。试：",
      "subs": [
        "(1) 画出 AWGN 信道传输时，各星座点的最佳判决域；",
        "(2) 求平均符号能量 $E_s=E\\left[|X|^2\\right]$ 及星座点之间的最小距离 $d_{\\min}$；",
        "(3) 求熵 $H(X)$、$H(X_I)$，联合熵 $H(X_I,X_Q)$，互信息 $I(X_I;X_Q)$（不能使用计算器，相关计算给出合理简式即可）。"
      ],
      "fig": "q5stem",
      "chapter": "ch4",
      "point": "MPSK/MQAM 星座图与格雷映射",
      "tags": ["星座图", "判决域", "平均符号能量", "熵与互信息"]
    },
    {
      "id": "2021-六", "num": "六", "type": "big", "score": 14,
      "stem": "某 2 电平均匀量化器的输入 $X\\in[0,4]$，输出 $Y=\\begin{cases}1,&0\\le X<2\\\\[2pt]3,&2\\le X\\le4\\end{cases}$。已知 $P(Y=1)=\\dfrac23$、$P(Y=3)=\\dfrac13$，且对任意 $Y\\in\\{1,3\\}$，量化噪声 $Z=Y-X$ 均在 $[-1,+1]$ 内均匀分布。试求：",
      "subs": [
        "(1) 量化噪声功率 $N_q=E\\left[Z^2\\right]$；",
        "(2) $Y=1$ 条件下，$X=Y-Z$ 的条件概率密度函数 $p(x|Y=1)$；",
        "(3) $Y=3$ 条件下，$X=Y-Z$ 的条件概率密度函数 $p(x|Y=3)$；",
        "(4) $X$ 的概率密度函数 $p(x)$ 及其均值 $E[X]$、功率 $E\\left[X^2\\right]$。"
      ],
      "fig": null,
      "chapter": "ch5",
      "point": "量化（均匀/最佳量化）",
      "tags": ["均匀量化", "量化噪声", "条件概率密度", "全概率公式"]
    },
    {
      "id": "2021-七", "num": "七", "type": "big", "score": 16,
      "stem": "设有 3 个系数在 GF(2) 上的多项式 $g_1(x)=x^3+x+1$，$g_2(x)=x^3+x^2+1$，$g_3(x)=x^3+1$。",
      "subs": [
        "(1) 以 $g(x)=g_1(x)g_2(x)$ 为生成多项式，构成一个码长为 $n=7$ 的系统循环码。试写出该循环码的生成矩阵、校验矩阵、最小码距；",
        "(2) 以 $g_1(x)$、$g_2(x)$、$g_3(x)$ 为生成多项式，构成一个 $(3,1,4)$ 卷积码。试画出该卷积码的编码器框图，并写出输入 1110000 所对应的编码输出；",
        "(3) 以 $g_1(x)$、$g_2(x)$ 为特征多项式，分别构成两个线性反馈移存器序列。试写出两个输出序列。"
      ],
      "fig": null,
      "chapter": "ch6",
      "point": "循环码",
      "tags": ["循环码", "生成矩阵", "校验矩阵", "卷积码", "m序列"]
    },
    {
      "id": "2021-八", "num": "八", "type": "big", "score": 16,
      "stem": "某 FDM 系统有 3 个频谱互不交叠的子信道，子信道带宽均为 1 kHz。发端通过 3 个子信道发送信号，子信道 1、2、3 上的发送功率 $P_1$、$P_2$、$P_3$ 满足 $P_1+P_2+P_3=3$ W。三个子信道的功率增益分别为 $g_1=1$、$g_2=2$ 和 $g_3=3$，子信道输出端的噪声功率均为 1 W。",
      "subs": [
        "(1) 若子信道 1、2、3 的调制方式分别为 QPSK、16QAM、64QAM，且符号速率能达到奈奎斯特无符号间干扰传输的极限，试分别求出各个子信道的传输速率（bit/s），并给出该系统的总传输速率及频带利用率（bit/s/Hz）；",
        "(2) 利用香农公式，分别按如下条件求系统的总传输速率：（a）$P_1=3$ W，$P_2=P_3=0$ W；（b）$P_1=P_2=P_3=1$ W；（c）$P_i=\\beta g_i$，其中 $\\beta$ 是能满足 $P_1+P_2+P_3=3$ W 的系数。"
      ],
      "fig": null,
      "chapter": "ch7",
      "point": "信道容量与香农公式",
      "tags": ["FDM", "奈奎斯特", "香农公式", "频带利用率", "注水原理"]
    }
  ]
};
