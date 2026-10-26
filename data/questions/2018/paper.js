// 2018 · 真题（试卷元数据 + groups + 题干/选项）—— 答案与解析在同目录 answer.js
window.BUPT801 = window.BUPT801 || {};
window.BUPT801.papers = window.BUPT801.papers || {};
window.BUPT801.papers["2018"] = {
  "year": 2018,
  "title": "北京邮电大学2018年硕士研究生入学考试试题",
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
      "name": "解答题",
      "score": 100,
      "intro": "本大题共 7 题：第二、四、五、六、七题各 14 分，第三、八题各 15 分，共 100 分。"
    }
  ],
  "groups": {
    "g1": {
      "stem": "某 2FSK 系统在 $[0,T_b]$ 时间内发送 $s_1(t)=\\cos(2\\pi f_ct)$ 或 $s_2(t)=\\cos(2\\pi f_ct+2\\pi f_0t)$ 之一，其中 $T_bf_c=106$。令 $\\rho$ 表示 $s_1(t)$ 与 $s_2(t)$ 的归一化相关系数，则当 $f_0=\\dfrac{1}{2T_b}$ 时（1），当 $f_0=\\dfrac{3}{4T_b}$ 时（2）。",
      "options": {
        "A": "$\\rho=-1$",
        "B": "$-1<\\rho<0$",
        "C": "$\\rho=0$",
        "D": "$0<\\rho<1$"
      }
    },
    "g2": {
      "stem": "设 $X(t)$ 是零均值平稳随机过程，其自相关函数是 $R_X(\\tau)$，功率谱密度是 $P_X(f)$。令 $\\hat X(t)$ 为 $X(t)$ 的希尔伯特变换、$\\hat R_X(\\tau)$ 为 $R_X(\\tau)$ 的希尔伯特变换，则 $\\hat X(t)$ 的自相关函数是（3），$X(t)$ 与 $\\hat X(t)$ 的互相关函数是（4），$X(t)+\\mathrm j\\hat X(t)$ 的功率谱密度是（5）。",
      "optionSets": ["options3", "options5"],
      "options3": {
        "A": "$R_X(\\tau)$",
        "B": "$\\hat R_X(\\tau)$",
        "C": "$R_X(\\tau)+\\hat R_X(\\tau)$",
        "D": "$R_X(\\tau)\\cdot\\hat R_X(\\tau)$"
      },
      "options5": {
        "A": "$4P_X(f)$",
        "B": "$2P_X(f)$",
        "C": "$\\begin{cases}4P_X(f),&f>0\\\\0,&f<0\\end{cases}$",
        "D": "$\\begin{cases}4P_X(f),&f<0\\\\0,&f>0\\end{cases}$"
      }
    },
    "g3": {
      "stem": "设 $X_c(t)$、$X_s(t)$ 是两个独立同分布的零均值平稳高斯随机过程，$f_c$ 足够大，则 $X_c(t)\\cos 2\\pi f_ct-X_s(t)\\sin 2\\pi f_ct$ 是（6），$X_c(t)\\cos^2 2\\pi f_ct-X_s(t)\\sin^2 2\\pi f_ct$ 是（7），$A(t)=\\sqrt{X_c^2(t)+X_s^2(t)}$ 是（8）。",
      "options": {
        "A": "平稳非高斯过程",
        "B": "平稳高斯过程",
        "C": "循环平稳高斯过程",
        "D": "循环平稳非高斯过程"
      }
    },
    "g4": {
      "stem": "FM 鉴频器输出端噪声的功率谱密度呈现出（9）形状。",
      "options": { "A": "双曲线", "B": "抛物线", "C": "平坦", "D": "上凸" }
    },
    "g5": {
      "stem": "在下列调制方式中，若基带调制信号 $m(t)$ 相同，已调信号 $s(t)$ 的功率相同，信道高斯白噪声的功率谱密度相同，则解调输出信噪比最大的是（10），已调信号带宽最小的是（11）。",
      "options": {
        "A": "调制指数为 5 的 FM",
        "B": "调制指数为 0.5 的 AM",
        "C": "DSB-SC",
        "D": "SSB"
      }
    },
    "g6": {
      "stem": "假设二进制数据独立等概、速率为 $1000\\ \\mathrm{bit/s}$。双极性 NRZ 码的主瓣带宽是（12）Hz，半占空比的单极性 RZ 码的主瓣带宽是（13）Hz。",
      "options": { "A": "500", "B": "1000", "C": "1500", "D": "2000" }
    },
    "g7": {
      "stem": "考虑下列各图所示的数字基带传输系统的总体传递函数 $X(f)$。无符号间干扰传输速率最高的是（14），其次是（15）；若传输速率是 $200\\ \\mathrm{Baud}$，在采样点存在符号间干扰的是（16）。",
      "options": { "A": "图（A）", "B": "图（B）", "C": "图（C）", "D": "图（D）" }
    },
    "g8": {
      "stem": "下列眼图中，最佳采样时刻明显有符号间干扰的是（17）。在此情况下，接收端可以采用（18）来减少符号间干扰。",
      "optionSets": ["options17", "options18"],
      "options17": { "A": "图（A）", "B": "图（B）", "C": "图（C）", "D": "图（D）" },
      "options18": {
        "A": "差分编码",
        "B": "部分响应",
        "C": "匹配滤波",
        "D": "时域均衡"
      }
    },
    "g9": {
      "stem": "二进制数据 $1111000011110000$ 经过 AMI 编码后是（19），经过 HDB3 编码后是（20）。",
      "options": {
        "A": "+-+-0000+-+-0000",
        "B": "+-+-000-+-+-000-",
        "C": "+-+-0000-+-+0000",
        "D": "+-+-000-+-+-+00+"
      }
    },
    "g10": {
      "stem": "第一类部分响应系统中的发送端采用了（21）。",
      "options": { "A": "相关编码", "B": "升余弦滚降", "C": "根升余弦滚降", "D": "时域均衡" }
    },
    "g11": {
      "stem": "在下列调制中，接收端可以采用差分相干解调器进行解调的是（22），只能采用相干解调的是（23）。",
      "options": { "A": "OOK", "B": "2FSK", "C": "2PSK", "D": "2DPSK" }
    },
    "g12": {
      "stem": "若以双极性 NRZ 码为基带调制信号，对载波做调制指数为（24）、调制效率为（25）的（26）调制，其结果就是 OOK。由于已调信号的功率谱密度中（27），其相干解调器的载波提取可以采用如（28）所示方式。",
      "optionSets": ["options24", "options26", "options27", "options28"],
      "options24": { "A": "$\\dfrac{1}{6}$", "B": "$\\dfrac{1}{3}$", "C": "$\\dfrac{1}{2}$", "D": "$1$" },
      "options26": { "A": "DSB-SC", "B": "AM", "C": "SSB", "D": "FM" },
      "options27": {
        "A": "存在载频的线谱分量",
        "B": "存在二倍载频线谱分量",
        "C": "不存在载频的线谱分量",
        "D": "不存在二倍载频线谱分量"
      },
      "options28": {
        "A": "图 A：平方 $\\to$ 窄带滤波或锁相环",
        "B": "图 B：平方",
        "C": "图 C：窄带滤波或锁相环",
        "D": "图 D：窄带滤波或锁相环 $\\to$ 平方"
      }
    },
    "g13": {
      "stem": "在下列调制方式中，频带利用率最高的是（29）。给定 $E_b/N_0$ 时，误符号率最大的是（30），最小的是（31）。",
      "options": { "A": "64QAM", "B": "16FSK", "C": "16PSK", "D": "16ASK" }
    },
    "g14": {
      "stem": "OQPSK 的（32）比 QPSK 小。",
      "options": { "A": "包络起伏", "B": "频带利用率", "C": "误比特率", "D": "复杂度" }
    },
    "g15": {
      "stem": "若时间离散的 AWGN 信道的输出信噪比是 SNR，则信道容量是（33）bit/symbol。根据（34）信息论中的相关定理，欲使传输速率接近信道容量，必须采用（35）。",
      "optionSets": ["options33", "options34", "options35"],
      "options33": {
        "A": "$\\log_2(1+2\\mathrm{SNR})$",
        "B": "$\\log_2(1+\\mathrm{SNR})$",
        "C": "$\\dfrac{1}{2}\\log_2(1+\\mathrm{SNR})$",
        "D": "$\\dfrac{1}{2}\\log_2(1+2\\mathrm{SNR})$"
      },
      "options34": { "A": "奈奎斯特", "B": "哈达玛", "C": "香农", "D": "希尔伯特" },
      "options35": { "A": "信源编码", "B": "信道编码", "C": "最佳量化", "D": "交织编码" }
    },
    "g16": {
      "stem": "信号通过（36）后会产生时域扩展，通过（37）后会产生频域扩展。",
      "options": {
        "A": "时变平坦衰落信道",
        "B": "频率选择性信道",
        "C": "无记忆信道",
        "D": "无失真信道"
      }
    },
    "g17": {
      "stem": "在高信噪比条件下，若采用格雷码映射的 8PSK 的平均误比特率是 $\\rho$，则其平均误符号率近似为（38）。",
      "options": {
        "A": "$\\dfrac{\\rho}{3}$",
        "B": "$\\rho$",
        "C": "$\\dfrac{3\\rho}{2}$",
        "D": "$3\\rho$"
      }
    },
    "g18": {
      "stem": "某四进制数字通信系统发送 $s_1(t)$、$s_2(t)$、$s_3(t)$、$s_4(t)$ 之一，发送信号通过信道之后成为 $r(t)$，接收端计算 $r(t)$ 与 $s_1(t)$、$s_2(t)$、$s_3(t)$、$s_4(t)$ 的欧氏距离，取距离最小者作为判决结果。若已知该接收机的误符号率与 MAP 接收机相同，则发送信号的特性是（39），并且信道是（40）。",
      "optionSets": ["options39", "options40"],
      "options39": { "A": "等能量", "B": "先验等概", "C": "等距离", "D": "线性无关" },
      "options40": { "A": "AWGN 信道", "B": "非高斯信道", "C": "BSC 信道", "D": "离散信道" }
    },
    "g19": {
      "stem": "通信系统中使用扰码的主要目的是（41），使用交织的主要目的是（42）。",
      "options": {
        "A": "便于实现 Rake 接收",
        "B": "将突发差错变成随机差错",
        "C": "便于实现 CDMA",
        "D": "将数据随机化"
      }
    },
    "g20": {
      "stem": "沃尔什码是一种（43），其特点是（44），主要用于（45）系统。",
      "optionSets": ["options43", "options44", "options45"],
      "options43": { "A": "伪随机码", "B": "正交码", "C": "准正交码", "D": "线路码" },
      "options44": {
        "A": "有平坦的自相关特性",
        "B": "有尖锐的自相关特性",
        "C": "不同码字在异步情况下正交",
        "D": "不同码字在同步情况下正交"
      },
      "options45": { "A": "CDMA", "B": "TDMA", "C": "OFDM", "D": "MFSK" }
    },
    "g21": {
      "stem": "在下列技术中，抵抗单径平坦衰落最有效的是（46）技术。",
      "options": { "A": "OFDM", "B": "扩频", "C": "Rake 接收", "D": "分集" }
    },
    "g22": {
      "stem": "在下列信道中，（47）最适合采用 OFDM 技术。",
      "options": { "A": "AWGN 信道", "B": "瑞利信道", "C": "多径信道", "D": "莱斯信道" }
    },
    "g23": {
      "stem": "信号 $s(t)=\\exp\\!\\left(-\\dfrac{t^2}{2}\\right)$ 的能量是（48）。",
      "options": {
        "A": "$\\sqrt{\\pi}$",
        "B": "$\\sqrt{2\\pi}$",
        "C": "$\\pi$",
        "D": "$2\\pi$"
      }
    },
    "g24": {
      "stem": "令 $s(t)=\\sum\\limits_{n=-\\infty}^{\\infty}a_ng(t-nT)$，其中 $g(t)=\\mathrm{sinc}\\!\\left(\\dfrac{t}{T}\\right)$、$a_n$ 以独立等概方式取值于 $\\pm1$，则序列 $\\{a_n\\}$ 的自相关函数是（49），$s(t)$ 的功率谱密度是（50）。",
      "optionSets": ["options49", "options50"],
      "options49": {
        "A": "$\\begin{cases}2,&m=0\\\\1,&m=\\pm1\\\\0,&\\text{else}\\end{cases}$",
        "B": "$\\begin{cases}2,&m=0\\\\-1,&m=\\pm1\\\\0,&\\text{else}\\end{cases}$",
        "C": "$\\begin{cases}2,&m=0\\\\0,&\\text{else}\\end{cases}$",
        "D": "$\\begin{cases}1,&m=0\\\\0,&\\text{else}\\end{cases}$"
      },
      "options50": {
        "A": "$\\begin{cases}T,&|f|<\\frac{1}{T}\\\\0,&\\text{else}\\end{cases}$",
        "B": "$\\begin{cases}1,&|f|<\\frac{1}{2T}\\\\0,&\\text{else}\\end{cases}$",
        "C": "$\\begin{cases}T,&|f|<\\frac{1}{2T}\\\\0,&\\text{else}\\end{cases}$",
        "D": "$\\begin{cases}1,&|f|<\\frac{1}{T}\\\\0,&\\text{else}\\end{cases}$"
      }
    }
  },
  "questions": [
    { "id": "2018-1", "num": 1, "type": "choice", "group": "g1", "blank": 1, "chapter": "ch4", "point": "2ASK/2FSK/2PSK/2DPSK", "tags": ["2FSK", "相关系数", "正交性"] },
    { "id": "2018-2", "num": 2, "type": "choice", "group": "g1", "blank": 2, "chapter": "ch4", "point": "2ASK/2FSK/2PSK/2DPSK", "tags": ["相关系数", "非正交信号"] },
    { "id": "2018-3", "num": 3, "type": "choice", "group": "g2", "blank": 3, "oKey": "options3", "chapter": "ch1", "point": "希尔伯特变换与复包络", "tags": ["希尔伯特变换", "自相关函数"] },
    { "id": "2018-4", "num": 4, "type": "choice", "group": "g2", "blank": 4, "oKey": "options3", "chapter": "ch1", "point": "希尔伯特变换与复包络", "tags": ["互相关函数"] },
    { "id": "2018-5", "num": 5, "type": "choice", "group": "g2", "blank": 5, "oKey": "options5", "chapter": "ch1", "point": "希尔伯特变换与复包络", "tags": ["解析信号", "功率谱密度"] },
    { "id": "2018-6", "num": 6, "type": "choice", "group": "g3", "blank": 6, "chapter": "ch1", "point": "高斯过程与线性变换", "tags": ["窄带过程", "平稳性"] },
    { "id": "2018-7", "num": 7, "type": "choice", "group": "g3", "blank": 7, "chapter": "ch1", "point": "平稳性与自相关函数", "tags": ["循环平稳", "高斯性"] },
    { "id": "2018-8", "num": 8, "type": "choice", "group": "g3", "blank": 8, "chapter": "ch1", "point": "窄带高斯过程（包络/相位分布）", "tags": ["包络", "瑞利分布"] },
    { "id": "2018-9", "num": 9, "type": "choice", "group": "g4", "blank": 9, "chapter": "ch2", "point": "FM/PM 角度调制", "tags": ["鉴频器", "噪声功率谱"] },
    { "id": "2018-10", "num": 10, "type": "choice", "group": "g5", "blank": 10, "chapter": "ch2", "point": "相干解调与抗噪声性能", "tags": ["制度增益", "FM"] },
    { "id": "2018-11", "num": 11, "type": "choice", "group": "g5", "blank": 11, "chapter": "ch2", "point": "AM/DSB-SC/SSB/VSB 原理与带宽", "tags": ["带宽比较"] },
    { "id": "2018-12", "num": 12, "type": "choice", "group": "g6", "blank": 12, "chapter": "ch3", "point": "基带码型（AMI/HDB3等）", "tags": ["NRZ", "主瓣带宽"] },
    { "id": "2018-13", "num": 13, "type": "choice", "group": "g6", "blank": 13, "chapter": "ch3", "point": "基带码型（AMI/HDB3等）", "tags": ["RZ", "主瓣带宽"] },
    { "id": "2018-14", "num": 14, "type": "choice", "group": "g7", "blank": 14, "chapter": "ch3", "fig": "q14xf", "point": "奈奎斯特准则与无码间串扰", "tags": ["折叠谱", "最高速率"] },
    { "id": "2018-15", "num": 15, "type": "choice", "group": "g7", "blank": 15, "chapter": "ch3", "point": "奈奎斯特准则与无码间串扰", "tags": ["残留边带"] },
    { "id": "2018-16", "num": 16, "type": "choice", "group": "g7", "blank": 16, "chapter": "ch3", "point": "奈奎斯特准则与无码间串扰", "tags": ["200Baud", "折叠不平坦"] },
    { "id": "2018-17", "num": 17, "type": "choice", "group": "g8", "blank": 17, "oKey": "options17", "chapter": "ch3", "fig": "q17eye", "point": "眼图", "tags": ["码间串扰", "眼闭合"] },
    { "id": "2018-18", "num": 18, "type": "choice", "group": "g8", "blank": 18, "oKey": "options18", "chapter": "ch3", "point": "码间串扰分析", "tags": ["时域均衡"] },
    { "id": "2018-19", "num": 19, "type": "choice", "group": "g9", "blank": 19, "chapter": "ch3", "point": "基带码型（AMI/HDB3等）", "tags": ["AMI"] },
    { "id": "2018-20", "num": 20, "type": "choice", "group": "g9", "blank": 20, "chapter": "ch3", "point": "基带码型（AMI/HDB3等）", "tags": ["HDB3", "B00V"] },
    { "id": "2018-21", "num": 21, "type": "choice", "group": "g10", "blank": 21, "chapter": "ch3", "point": "最佳基带系统", "tags": ["第I类部分响应", "相关编码"] },
    { "id": "2018-22", "num": 22, "type": "choice", "group": "g11", "blank": 22, "chapter": "ch4", "point": "2ASK/2FSK/2PSK/2DPSK", "tags": ["差分相干解调"] },
    { "id": "2018-23", "num": 23, "type": "choice", "group": "g11", "blank": 23, "chapter": "ch4", "point": "2ASK/2FSK/2PSK/2DPSK", "tags": ["相干解调", "相位模糊"] },
    { "id": "2018-24", "num": 24, "type": "choice", "group": "g12", "blank": 24, "oKey": "options24", "chapter": "ch4", "point": "2ASK/2FSK/2PSK/2DPSK", "tags": ["OOK", "调制指数"] },
    { "id": "2018-25", "num": 25, "type": "choice", "group": "g12", "blank": 25, "oKey": "options24", "chapter": "ch2", "point": "AM/DSB-SC/SSB/VSB 原理与带宽", "tags": ["调制效率"] },
    { "id": "2018-26", "num": 26, "type": "choice", "group": "g12", "blank": 26, "oKey": "options26", "chapter": "ch2", "point": "AM/DSB-SC/SSB/VSB 原理与带宽", "tags": ["AM", "OOK"] },
    { "id": "2018-27", "num": 27, "type": "choice", "group": "g12", "blank": 27, "oKey": "options27", "chapter": "ch4", "point": "2ASK/2FSK/2PSK/2DPSK", "tags": ["线谱", "载波"] },
    { "id": "2018-28", "num": 28, "type": "choice", "group": "g12", "blank": 28, "oKey": "options28", "chapter": "ch8", "fig": "q28cw", "point": "载波同步（平方环/科斯塔斯环）", "tags": ["载波提取", "窄带滤波"] },
    { "id": "2018-29", "num": 29, "type": "choice", "group": "g13", "blank": 29, "chapter": "ch4", "point": "频带利用率", "tags": ["64QAM", "频带利用率"] },
    { "id": "2018-30", "num": 30, "type": "choice", "group": "g13", "blank": 30, "chapter": "ch4", "point": "多进制调制的误码性能与带宽", "tags": ["16ASK", "误符号率"] },
    { "id": "2018-31", "num": 31, "type": "choice", "group": "g13", "blank": 31, "chapter": "ch4", "point": "多进制调制的误码性能与带宽", "tags": ["16FSK", "正交信号"] },
    { "id": "2018-32", "num": 32, "type": "choice", "group": "g14", "blank": 32, "chapter": "ch4", "point": "MPSK/MQAM 星座图与格雷映射", "tags": ["OQPSK", "包络起伏"] },
    { "id": "2018-33", "num": 33, "type": "choice", "group": "g15", "blank": 33, "oKey": "options33", "chapter": "ch7", "point": "信道容量与香农公式", "tags": ["离散AWGN信道", "每符号容量"] },
    { "id": "2018-34", "num": 34, "type": "choice", "group": "g15", "blank": 34, "oKey": "options34", "chapter": "ch7", "point": "信道容量与香农公式", "tags": ["香农有噪编码定理"] },
    { "id": "2018-35", "num": 35, "type": "choice", "group": "g15", "blank": 35, "oKey": "options35", "chapter": "ch7", "point": "信道容量与香农公式", "tags": ["信道编码"] },
    { "id": "2018-36", "num": 36, "type": "choice", "group": "g16", "blank": 36, "chapter": "ch1", "point": "无线信道（多径/多普勒/相干带宽）", "tags": ["频率选择性", "时延扩展"] },
    { "id": "2018-37", "num": 37, "type": "choice", "group": "g16", "blank": 37, "chapter": "ch1", "point": "无线信道（多径/多普勒/相干带宽）", "tags": ["时变平坦衰落", "多普勒扩展"] },
    { "id": "2018-38", "num": 38, "type": "choice", "group": "g17", "blank": 38, "chapter": "ch4", "point": "多进制调制的误码性能与带宽", "tags": ["格雷码", "误比特率与误符号率"] },
    { "id": "2018-39", "num": 39, "type": "choice", "group": "g18", "blank": 39, "oKey": "options39", "chapter": "ch9", "point": "最佳判决门限", "tags": ["最小距离接收", "MAP"] },
    { "id": "2018-40", "num": 40, "type": "choice", "group": "g18", "blank": 40, "oKey": "options40", "chapter": "ch9", "point": "相关接收机", "tags": ["AWGN", "MAP等价"] },
    { "id": "2018-41", "num": 41, "type": "choice", "group": "g19", "blank": 41, "chapter": "ch6", "point": "m序列与本原多项式", "tags": ["扰码"] },
    { "id": "2018-42", "num": 42, "type": "choice", "group": "g19", "blank": 42, "chapter": "ch6", "point": "汉明距离与纠检错能力", "tags": ["交织", "突发差错"] },
    { "id": "2018-43", "num": 43, "type": "choice", "group": "g20", "blank": 43, "oKey": "options43", "chapter": "ch6", "point": "正交码与哈达玛矩阵", "tags": ["沃尔什码"] },
    { "id": "2018-44", "num": 44, "type": "choice", "group": "g20", "blank": 44, "oKey": "options44", "chapter": "ch6", "point": "正交码与哈达玛矩阵", "tags": ["同步正交"] },
    { "id": "2018-45", "num": 45, "type": "choice", "group": "g20", "blank": 45, "oKey": "options45", "chapter": "ch6", "point": "扩频通信与处理增益", "tags": ["CDMA"] },
    { "id": "2018-46", "num": 46, "type": "choice", "group": "g21", "blank": 46, "chapter": "ch1", "point": "分集接收与 Rake", "tags": ["平坦衰落", "分集"] },
    { "id": "2018-47", "num": 47, "type": "choice", "group": "g22", "blank": 47, "chapter": "ch4", "point": "OFDM 与多载波调制", "tags": ["多径", "OFDM"] },
    { "id": "2018-48", "num": 48, "type": "choice", "group": "g23", "blank": 48, "chapter": "ch9", "point": "信号波形与能量关系", "tags": ["信号能量", "高斯脉冲"] },
    { "id": "2018-49", "num": 49, "type": "choice", "group": "g24", "blank": 49, "oKey": "options49", "chapter": "ch1", "point": "平稳性与自相关函数", "tags": ["独立序列", "自相关"] },
    { "id": "2018-50", "num": 50, "type": "choice", "group": "g24", "blank": 50, "oKey": "options50", "chapter": "ch1", "point": "随机过程通过线性系统", "tags": ["随机脉冲序列功率谱"] },
    {
      "id": "2018-二",
      "num": "二",
      "type": "big",
      "score": 14,
      "stem": "设已调信号 $s(t)=m(t)\\cos 2\\pi f_ct-\\hat m(t)\\sin 2\\pi f_ct$，其中 $f_c=20\\ \\mathrm{kHz}$，$m(t)$ 的自相关函数为 $R_m(\\tau)=21\\,\\mathrm{sinc}^2(5000\\tau)$，$\\hat m(t)$ 是 $m(t)$ 的希尔伯特变换。解调框图如下图所示。图中高斯白噪声 $n_w(t)$ 的单边功率谱密度为 $N_0=10^{-6}\\ \\mathrm{W/Hz}$，带通滤波器的通带范围是 $19\\ \\mathrm{kHz}\\sim26\\ \\mathrm{kHz}$，其输出是 $s(t)+n(t)$，其中 $n(t)=n_c(t)\\cos 2\\pi f_ct-n_s(t)\\sin 2\\pi f_ct$ 是窄带噪声，低通滤波器的截止频率是 $5\\ \\mathrm{kHz}$。试：",
      "subs": [
        "(1) 求 $s(t)$ 的功率和带宽。",
        "(2) 写出 $s(t)$ 的复包络 $s_L(t)$ 的表达式。",
        "(3) 画出带通滤波器输出噪声的同相分量 $n_c(t)$ 的功率谱密度图。",
        "(4) 求图中 A 点和 B 点的信噪比。"
      ],
      "fig": "q2demod",
      "chapter": "ch1",
      "point": "希尔伯特变换与复包络",
      "tags": ["SSB", "复包络", "窄带噪声", "信噪比"]
    },
    {
      "id": "2018-三",
      "num": "三",
      "type": "big",
      "score": 15,
      "stem": "某二进制数字通信系统在 $[0,T_b]$ 时间内等概发送 $s(t)\\in\\{\\pm g(t)\\}$，已知 $T_b=2\\ \\mathrm{s}$、$g(t)$ 如下图所示。发送信号叠加了单边功率谱密度为 $N_0$ 的高斯白噪声 $n_w(t)$ 后成为 $r(t)=s(t)+n_w(t)$。在接收端采用匹配滤波器进行最佳接收，其最佳采样时刻的输出值为 $y$。试：",
      "subs": [
        "(1) 求 $s(t)$ 的平均比特能量 $E_s$。",
        "(2) 确定最佳取样时刻，画出匹配滤波器的冲激响应波形。",
        "(3) 求发送 $-g(t)$ 条件下 $y$ 的均值、方差、概率密度函数。",
        "(4) 写出最佳判决门限。",
        "(5) 求该系统的平均误比特率。"
      ],
      "fig": "q3g",
      "chapter": "ch9",
      "point": "相关接收机",
      "tags": ["匹配滤波器", "最佳采样时刻", "高斯判决变量", "误比特率"]
    },
    {
      "id": "2018-四",
      "num": "四",
      "type": "big",
      "score": 14,
      "stem": "某二维 8 进制数字调制系统的归一化正交基函数为 $f_1(t)=\\begin{cases}1,&0\\le t\\le1\\\\0,&\\text{else}\\end{cases}$，$f_2(t)=\\begin{cases}1,&0\\le t\\le\\frac{1}{2}\\\\-1,&\\frac{1}{2}<t\\le1\\\\0,&\\text{else}\\end{cases}$。星座图上 8 个星座点的坐标分别是 $s_1=(0,0)$、$s_2=(-1,1)$、$s_3=(1,-1)$、$s_4=(1,0)$、$s_5=(1,1)$、$s_6=(-1,-1)$、$s_7=(0,1)$、$s_8=(-1,0)$。假设信道噪声是加性高斯白噪声。试：",
      "subs": [
        "(1) 画出星座图，写出星座点之间的最小距离。",
        "(2) 画出星座点 $s_5$ 对应的发送信号波形 $s_5(t)$。",
        "(3) 若各星座点等概出现，求平均符号能量 $E_s$，画出 $s_1$ 的最佳判决域。",
        "(4) 若星座点 $s_7$ 的出现概率为零，其他星座点等概出现，画出此时 $s_1$ 的最佳判决域。"
      ],
      "fig": null,
      "chapter": "ch4",
      "point": "MPSK/MQAM 星座图与格雷映射",
      "tags": ["星座图", "最小距离", "平均符号能量", "最佳判决域"]
    },
    {
      "id": "2018-五",
      "num": "五",
      "type": "big",
      "score": 14,
      "stem": "在下图中，$m_1(t)$ 和 $m_2(t)$ 是带宽为 $4\\ \\mathrm{kHz}$ 的基带信号，$m_3(t)$ 和 $m_4(t)$ 是带宽为 $1.5\\ \\mathrm{kHz}$、最高频率为 $4\\ \\mathrm{kHz}$ 的带通信号。每路 PCM 按不发生频谱混叠的最小采样率进行采样，对每个样值按 A 律十三折线编码。四路 PCM 的数据复用后，通过升余弦滚降系数为 1 的矩形 16QAM 调制传输。试：",
      "subs": [
        "(1) 写出图中 A 点、B 点、C 点的比特速率 $R_A$、$R_B$ 和 $R_C$。",
        "(2) 画出 D 点的单边功率谱密度图（标出频率值）。",
        "(3) 画出调制框图、解调框图。"
      ],
      "fig": "q5sys",
      "chapter": "ch5",
      "point": "A律13折线与PCM编码",
      "tags": ["带通抽样", "PCM", "复接", "16QAM", "升余弦滚降"]
    },
    {
      "id": "2018-六",
      "num": "六",
      "type": "big",
      "score": 14,
      "stem": "四进制符号 $X\\in\\{A,B,C,D\\}$ 与 $Y\\in\\{a,b,c,d\\}$ 的联合概率 $\\Pr\\{X,Y\\}$ 如下表：$$\\begin{array}{c|cccc}\\Pr\\{X,Y\\}&a&b&c&d\\\\\\hline A&1/8&0&1/4&0\\\\ B&0&1/8&0&1/8\\\\ C&1/16&0&1/8&0\\\\ D&0&1/16&0&1/8\\end{array}$$试：",
      "subs": [
        "(1) 试求熵 $H[X,Y]$、$H[X]$、$H[Y|X]$ 以及互信息 $I[X;Y]$。（注：计算中遇到的对数不必算出具体数值，合理化简即可。）",
        "(2) 试对 $(X,Y)$ 整体进行哈夫曼编码，求出平均码长。"
      ],
      "fig": null,
      "chapter": "ch7",
      "point": "信源熵/联合熵/条件熵",
      "tags": ["联合熵", "条件熵", "互信息", "哈夫曼编码"]
    },
    {
      "id": "2018-七",
      "num": "七",
      "type": "big",
      "score": 14,
      "stem": "某四电平量化器输入信号 $x$ 的概率密度函数 $p(x)$ 如下图所示。量化器 $Q(X)$ 的输入输出关系是 $$Y=Q(X)=\\begin{cases}1+\\dfrac{a}{2},&a\\le X\\le2\\\\[4pt]\\dfrac{a}{2},&0\\le X<a\\\\[4pt]-\\dfrac{a}{2},&-a\\le X<0\\\\[4pt]-1-\\dfrac{a}{2},&-2\\le X<-a\\end{cases}$$ 其中 $0<a<2$。试：",
      "subs": [
        "(1) 求量化器输入信号 $X$ 的平均功率 $S=E\\left[X^2\\right]$。",
        "(2) 求量化噪声功率 $N_q=E\\left[(X-Y)^2\\right]$。",
        "(3) 若 $Q(X)$ 是均匀量化器，求 $a$ 的值以及相应的量化信噪比 $S/N_q$。",
        "(4) 若 $Q(X)$ 能使量化器输出 $Y$ 的熵最大，求对应的 $a$ 值。"
      ],
      "fig": "q7pdf",
      "chapter": "ch5",
      "point": "量化（均匀/最佳量化）",
      "tags": ["非均匀量化", "量化噪声功率", "熵最大准则"]
    },
    {
      "id": "2018-八",
      "num": "八",
      "type": "big",
      "score": 15,
      "stem": "已知 $x^{15}+1$ 可以分解为 $$x^{15}+1=(x^4+x^3+1)(x^4+x^3+x^2+x+1)(x^4+x+1)(x^2+x+1)(x+1)$$ 试：",
      "subs": [
        "(1) 求利用上式可以构成的 $(15,k)$ 循环码的个数。",
        "(2) 写出 $(15,3)$ 循环码的生成多项式。",
        "(3) 求 $(15,3)$ 循环码的系统码生成矩阵。",
        "(4) 写出 $(15,3)$ 循环码的最小码距。",
        "(5) 用 $x^{15}+1$ 的两个因式 $x^4+x^3+1$ 和 $x^4+x+1$ 构造一个 $1/2$ 码率的卷积码，画出编码器框图，写出该编码器的状态数，写出输入为 $10000\\cdots$ 时的卷积码编码输出。"
      ],
      "fig": null,
      "chapter": "ch6",
      "point": "循环码",
      "tags": ["循环码个数", "生成矩阵", "最小码距", "卷积码编码器"]
    }
  ]
};
