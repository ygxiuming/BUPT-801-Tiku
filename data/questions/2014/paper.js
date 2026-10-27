// 2014 · 真题（试卷元数据 + groups + 题干/选项）—— 答案与解析在同目录 answer.js
window.BUPT801 = window.BUPT801 || {};
window.BUPT801.papers = window.BUPT801.papers || {};
window.BUPT801.papers["2014"] = {
  "year": 2014,
  "title": "北京邮电大学2014年硕士研究生入学考试试题",
  "subject": "801 通信原理",
  "note": "请考生注意：(1) 所有答案一律写在答题纸上，否则不计成绩；(2) 不允许使用计算器。",
  "duration": 180,
  "sections": [
    {
      "id": "choice",
      "name": "选择题",
      "score": 30,
      "perBlank": 1,
      "intro": "本大题共 30 个空，每空 1 分，共 30 分。请按题号把答案填在答题纸上。"
    },
    {
      "id": "big",
      "name": "判断题与计算题",
      "score": 120,
      "intro": "判断题共 10 小题（第二题，每小题 2 分，共 20 分）；计算题共 8 小题（第三～十题，共 100 分）。"
    }
  ],
  "groups": {
    "g1": {
      "stem": "某二进制数字 PAM 基带信号波形的功率谱密度如下图所示，其中 $R_b$ 为比特速率。该基带信号可能采用了（1）。",
      "options": {
        "A": "单极性不归零码",
        "B": "单极性归零码",
        "C": "双极性不归零码",
        "D": "双极性归零码"
      }
    },
    "g2": {
      "stem": "某音乐信号的最高频率为 $12\\,\\mathrm{kHz}$，采用 MP3 格式压缩编码后的信息速率为 $192\\,\\mathrm{Kbit/s}$。若采用 HDB3 码传输该音乐信号所需要的主瓣带宽为（2）$\\mathrm{kHz}$，若采用 CMI 码传输所需要的主瓣带宽为（3）$\\mathrm{kHz}$，若采用第一类部分响应信号传输该信号所需要的带宽为（4）$\\mathrm{kHz}$。",
      "optionSets": ["options2", "options3", "options4"],
      "options2": { "A": "$24\\,\\mathrm{kHz}$", "B": "$96\\,\\mathrm{kHz}$", "C": "$192\\,\\mathrm{kHz}$", "D": "$384\\,\\mathrm{kHz}$" },
      "options3": { "A": "$24\\,\\mathrm{kHz}$", "B": "$96\\,\\mathrm{kHz}$", "C": "$192\\,\\mathrm{kHz}$", "D": "$384\\,\\mathrm{kHz}$" },
      "options4": { "A": "$24\\,\\mathrm{kHz}$", "B": "$96\\,\\mathrm{kHz}$", "C": "$192\\,\\mathrm{kHz}$", "D": "$384\\,\\mathrm{kHz}$" }
    },
    "g3": {
      "stem": "已知窄带平稳随机过程 $X(t)=X_c(t)\\cos\\omega_c t-X_s(t)\\sin\\omega_c t$，其 Hilbert 变换为 $\\hat X(t)=$（5），其复包络为 $X_L(t)=$（6）。假设 $X(t)$ 的均值为 0，方差为 1，则 $\\hat X(t)$ 的方差为（7），$X_L(t)$ 的平均功率为（8）。",
      "optionSets": ["options5", "options6", "options7", "options8"],
      "options5": {
        "A": "$X_c(t)\\cos\\omega_c t+X_s(t)\\sin\\omega_c t$",
        "B": "$-X_c(t)\\cos\\omega_c t+X_s(t)\\sin\\omega_c t$",
        "C": "$X_c(t)\\sin\\omega_c t-X_s(t)\\cos\\omega_c t$",
        "D": "$X_c(t)\\sin\\omega_c t+X_s(t)\\cos\\omega_c t$"
      },
      "options6": {
        "A": "$X_c(t)+X_s(t)$",
        "B": "$X_c(t)-X_s(t)$",
        "C": "$X_c(t)-\\mathrm{j}X_s(t)$",
        "D": "$X_c(t)+\\mathrm{j}X_s(t)$"
      },
      "options7": { "A": "$0.5$", "B": "$1$", "C": "$2$", "D": "$4$" },
      "options8": { "A": "$0.5$", "B": "$1$", "C": "$2$", "D": "$4$" }
    },
    "g4": {
      "stem": "（2,1,7）系统卷积编码器的总状态有（9）个，每个输出码组中监督码元的取值与前面（10）个信息码组有关。",
      "optionSets": ["options9", "options10"],
      "options9": { "A": "$2$", "B": "$4$", "C": "$64$", "D": "$128$" },
      "options10": { "A": "$1$", "B": "$2$", "C": "$7$", "D": "$6$" }
    },
    "g5": {
      "stem": "第四类部分响应系统的频带利用率为（11）$\\mathrm{Baud/Hz}$，当采用二进制输入时该系统在信道上传输信号的电平数为（12）。",
      "optionSets": ["options11", "options12"],
      "options11": { "A": "$1$", "B": "$2$", "C": "$3$", "D": "$4$" },
      "options12": { "A": "$2$", "B": "$3$", "C": "$4$", "D": "$5$" }
    },
    "g6": {
      "stem": "某信源符号由 4 个不同的独立符号组成，信源最大熵为 $H_{\\max}(X)=$（13）$\\mathrm{bit}/$符号。",
      "options": { "A": "$1$", "B": "$2$", "C": "$3$", "D": "$4$" }
    },
    "g7": {
      "stem": "A 律 13 折线 PCM 编码器中采用了（14）量化器，若该量化器的最小的量化间隔为 2 个量化单位，则最大的量化电平为（15）个量化单位。",
      "optionSets": ["options14", "options15"],
      "options14": { "A": "对数", "B": "线性", "C": "均匀", "D": "矢量" },
      "options15": { "A": "$64$", "B": "$128$", "C": "$4096$", "D": "$4032$" }
    },
    "g8": {
      "stem": "信号 $s(t)=1000\\,\\mathrm{sinc}^2(1000t)\\,\\mathrm{e}^{\\mathrm{j}2\\pi f_0 t}$ 为解析信号的条件是（16），该信号的频谱为（17）。",
      "optionSets": ["options16", "options17"],
      "options16": {
        "A": "$f_0>500\\,\\mathrm{Hz}$",
        "B": "$f_0>1000\\,\\mathrm{Hz}$",
        "C": "$f_0>1500\\,\\mathrm{Hz}$",
        "D": "$f_0>2000\\,\\mathrm{Hz}$"
      },
      "options17": {
        "A": "$\\mathrm{rect}\\!\\left(\\dfrac{f+f_0}{1000}\\right)$",
        "B": "$\\mathrm{rect}\\!\\left(\\dfrac{f-f_0}{1000}\\right)$",
        "C": "$\\Lambda\\!\\left(\\dfrac{f+f_0}{1000}\\right)$",
        "D": "$\\Lambda\\!\\left(\\dfrac{f-f_0}{1000}\\right)$"
      }
    },
    "g9": {
      "stem": "某调频信号在信道中传输时叠加了加性白高斯噪声。大信噪比条件下，接收机鉴频器的输出噪声分量具有的特征是（18）。",
      "options": {
        "A": "是一个高斯过程",
        "B": "具有抛物线式的功率谱密度",
        "C": "均值为零",
        "D": "以上所有"
      }
    },
    "g10": {
      "stem": "要得到一个周期大于 500 的 m 序列，至少需要（19）级线性反馈移位寄存器，该序列所对应的最小周期是（20）。",
      "optionSets": ["options19", "options20"],
      "options19": { "A": "$7$", "B": "$8$", "C": "$9$", "D": "$10$" },
      "options20": { "A": "$501$", "B": "$511$", "C": "$512$", "D": "$513$" }
    },
    "g11": {
      "stem": "已知一 AM 信号 $s(t)=4\\cos 8000\\pi t+10\\cos 10000\\pi t+4\\cos 12000\\pi t$，则该信号的调幅系数是（21），带宽是（22）$\\mathrm{kHz}$，调制效率为（23）。",
      "optionSets": ["options21", "options22", "options23"],
      "options21": { "A": "$0.4$", "B": "$0.6$", "C": "$0.8$", "D": "$1.0$" },
      "options22": { "A": "$1$", "B": "$2$", "C": "$4$", "D": "$20$" },
      "options23": { "A": "$\\dfrac{8}{33}$", "B": "$\\dfrac{25}{33}$", "C": "$\\dfrac{2}{5}$", "D": "$\\dfrac{4}{5}$" }
    },
    "g12": {
      "stem": "以下处理过程中，不会出现门限效应的是（24）。",
      "options": {
        "A": "AM 信号通过相干解调器",
        "B": "AM 信号通过包络检波器",
        "C": "FM 信号通过普通鉴频器",
        "D": "FM 信号通过调频负反馈解调器"
      }
    },
    "g13": {
      "stem": "恒参信道特性不理想，会引起信号的（25）。",
      "options": {
        "A": "瑞利衰落",
        "B": "频率选择性衰落",
        "C": "频率弥散",
        "D": "幅频畸变和相频畸变"
      }
    },
    "g14": {
      "stem": "在移动信道条件下，移动台与基站之间的相对运动，使接收信号的载波发生多普勒频移。假定载波频率 $1200\\,\\mathrm{MHz}$，移动台车速 $25\\,\\mathrm{m/s}$，则最大多普勒频率为（26）；为尽量避免信号在传输中受到快衰落的影响，应要求所传信号的符号周期 $T_S$ 满足条件（27）。",
      "optionSets": ["options26", "options27"],
      "options26": { "A": "$25\\,\\mathrm{Hz}$", "B": "$50\\,\\mathrm{Hz}$", "C": "$100\\,\\mathrm{Hz}$", "D": "$200\\,\\mathrm{Hz}$" },
      "options27": {
        "A": "$T_S\\ll 10\\,\\mathrm{ms}$",
        "B": "$T_S\\gg 10\\,\\mathrm{ms}$",
        "C": "$T_S\\ll 10\\,\\mathrm{\\mu s}$",
        "D": "$T_S\\gg 10\\,\\mathrm{\\mu s}$"
      }
    },
    "g15": {
      "stem": "扩频系数为 40 的一个 DS-BPSK 系统，码片速率为 $4\\,\\mathrm{Mchip/s}$，则该系统的信息速率为（28），该 DS-BPSK 信号的主瓣带宽为（29），该信号是一个（30）。",
      "optionSets": ["options28", "options29", "options30"],
      "options28": { "A": "$10\\,\\mathrm{kbps}$", "B": "$100\\,\\mathrm{kbps}$", "C": "$10\\,\\mathrm{kBaud}$", "D": "$100\\,\\mathrm{kBaud}$" },
      "options29": { "A": "$200\\,\\mathrm{kHz}$", "B": "$100\\,\\mathrm{kHz}$", "C": "$4\\,\\mathrm{MHz}$", "D": "$8\\,\\mathrm{MHz}$" },
      "options30": { "A": "循环平稳过程", "B": "平稳过程", "C": "确定信号", "D": "周期信号" }
    }
  },
  "questions": [
    {"id": "2014-1", "num": 1, "type": "choice", "group": "g1", "blank": 1, "fig": "q1psd", "chapter": "ch3", "point": "基带码型（AMI/HDB3等）", "tags": ["功率谱密度", "码型"]},
    {"id": "2014-2", "num": 2, "type": "choice", "group": "g2", "blank": 2, "oKey": "options2", "chapter": "ch3", "point": "基带码型（AMI/HDB3等）", "tags": ["主瓣带宽", "HDB3"]},
    {"id": "2014-3", "num": 3, "type": "choice", "group": "g2", "blank": 3, "oKey": "options3", "chapter": "ch3", "point": "基带码型（AMI/HDB3等）", "tags": ["主瓣带宽", "CMI"]},
    {"id": "2014-4", "num": 4, "type": "choice", "group": "g2", "blank": 4, "oKey": "options4", "chapter": "ch3", "point": "奈奎斯特准则与无码间串扰", "tags": ["第一类部分响应", "频带利用率"]},
    {"id": "2014-5", "num": 5, "type": "choice", "group": "g3", "blank": 5, "oKey": "options5", "chapter": "ch1", "point": "希尔伯特变换与复包络", "tags": ["希尔伯特变换", "窄带过程"]},
    {"id": "2014-6", "num": 6, "type": "choice", "group": "g3", "blank": 6, "oKey": "options6", "chapter": "ch1", "point": "希尔伯特变换与复包络", "tags": ["复包络"]},
    {"id": "2014-7", "num": 7, "type": "choice", "group": "g3", "blank": 7, "oKey": "options7", "chapter": "ch1", "point": "希尔伯特变换与复包络", "tags": ["方差", "希尔伯特变换"]},
    {"id": "2014-8", "num": 8, "type": "choice", "group": "g3", "blank": 8, "oKey": "options8", "chapter": "ch1", "point": "希尔伯特变换与复包络", "tags": ["平均功率", "复包络"]},
    {"id": "2014-9", "num": 9, "type": "choice", "group": "g4", "blank": 9, "oKey": "options9", "chapter": "ch6", "point": "卷积码与状态图", "tags": ["约束长度", "状态数"]},
    {"id": "2014-10", "num": 10, "type": "choice", "group": "g4", "blank": 10, "oKey": "options10", "chapter": "ch6", "point": "卷积码与状态图", "tags": ["约束长度"]},
    {"id": "2014-11", "num": 11, "type": "choice", "group": "g5", "blank": 11, "oKey": "options11", "chapter": "ch3", "point": "奈奎斯特准则与无码间串扰", "tags": ["第四类部分响应", "频带利用率"]},
    {"id": "2014-12", "num": 12, "type": "choice", "group": "g5", "blank": 12, "oKey": "options12", "chapter": "ch3", "point": "奈奎斯特准则与无码间串扰", "tags": ["第四类部分响应", "电平数"]},
    {"id": "2014-13", "num": 13, "type": "choice", "group": "g6", "blank": 13, "chapter": "ch7", "point": "信源熵/联合熵/条件熵", "tags": ["最大熵"]},
    {"id": "2014-14", "num": 14, "type": "choice", "group": "g7", "blank": 14, "oKey": "options14", "chapter": "ch5", "point": "A律13折线与PCM编码", "tags": ["非均匀量化"]},
    {"id": "2014-15", "num": 15, "type": "choice", "group": "g7", "blank": 15, "oKey": "options15", "chapter": "ch5", "point": "A律13折线与PCM编码", "tags": ["量化间隔", "计算"]},
    {"id": "2014-16", "num": 16, "type": "choice", "group": "g8", "blank": 16, "oKey": "options16", "chapter": "ch1", "point": "希尔伯特变换与复包络", "tags": ["解析信号", "频谱搬移"]},
    {"id": "2014-17", "num": 17, "type": "choice", "group": "g8", "blank": 17, "oKey": "options17", "chapter": "ch1", "point": "希尔伯特变换与复包络", "tags": ["解析信号", "频谱"]},
    {"id": "2014-18", "num": 18, "type": "choice", "group": "g9", "blank": 18, "chapter": "ch2", "point": "相干解调与抗噪声性能", "tags": ["鉴频器", "输出噪声"]},
    {"id": "2014-19", "num": 19, "type": "choice", "group": "g10", "blank": 19, "oKey": "options19", "chapter": "ch6", "point": "m序列与本原多项式", "tags": ["m序列", "周期"]},
    {"id": "2014-20", "num": 20, "type": "choice", "group": "g10", "blank": 20, "oKey": "options20", "chapter": "ch6", "point": "m序列与本原多项式", "tags": ["m序列", "周期"]},
    {"id": "2014-21", "num": 21, "type": "choice", "group": "g11", "blank": 21, "oKey": "options21", "chapter": "ch2", "point": "AM/DSB-SC/SSB/VSB 原理与带宽", "tags": ["调幅系数", "计算"]},
    {"id": "2014-22", "num": 22, "type": "choice", "group": "g11", "blank": 22, "oKey": "options22", "chapter": "ch2", "point": "AM/DSB-SC/SSB/VSB 原理与带宽", "tags": ["带宽"]},
    {"id": "2014-23", "num": 23, "type": "choice", "group": "g11", "blank": 23, "oKey": "options23", "chapter": "ch2", "point": "AM/DSB-SC/SSB/VSB 原理与带宽", "tags": ["调制效率", "计算"]},
    {"id": "2014-24", "num": 24, "type": "choice", "group": "g12", "blank": 24, "chapter": "ch2", "point": "相干解调与抗噪声性能", "tags": ["门限效应", "易错"]},
    {"id": "2014-25", "num": 25, "type": "choice", "group": "g13", "blank": 25, "chapter": "ch1", "point": "无线信道（多径/多普勒/相干带宽）", "tags": ["恒参信道", "畸变"]},
    {"id": "2014-26", "num": 26, "type": "choice", "group": "g14", "blank": 26, "oKey": "options26", "chapter": "ch1", "point": "无线信道（多径/多普勒/相干带宽）", "tags": ["多普勒频移", "计算"]},
    {"id": "2014-27", "num": 27, "type": "choice", "group": "g14", "blank": 27, "oKey": "options27", "chapter": "ch1", "point": "无线信道（多径/多普勒/相干带宽）", "tags": ["快衰落", "相关时间"]},
    {"id": "2014-28", "num": 28, "type": "choice", "group": "g15", "blank": 28, "oKey": "options28", "chapter": "ch6", "point": "扩频通信与处理增益", "tags": ["扩频系数", "计算"]},
    {"id": "2014-29", "num": 29, "type": "choice", "group": "g15", "blank": 29, "oKey": "options29", "chapter": "ch6", "point": "扩频通信与处理增益", "tags": ["主瓣带宽"]},
    {"id": "2014-30", "num": 30, "type": "choice", "group": "g15", "blank": 30, "oKey": "options30", "chapter": "ch6", "point": "扩频通信与处理增益", "tags": ["循环平稳", "易错"]},
    {"id": "2014-二-01", "num": "二-01", "type": "big", "score": 2,
     "stem": "在数字通信系统中能够采用线谱法进行定时同步的前提条件是基带信号的带宽要大于符号速率。（　）",
     "chapter": "ch8", "point": "位同步", "tags": ["位同步", "线谱法"]},
    {"id": "2014-二-02", "num": "二-02", "type": "big", "score": 2,
     "stem": "信息率失真函数 $R(D)$ 是在限定失真为最大允许值 $D$ 时信源给出的理论上最小信息率，它是限失真信源编码的理论基础。（　）",
     "chapter": "ch7", "point": "信息率失真函数", "tags": ["率失真理论"]},
    {"id": "2014-二-03", "num": "二-03", "type": "big", "score": 2,
     "stem": "数字通信系统的比特速率总是大于或等于符号速率。（　）",
     "chapter": "ch4", "point": "频带利用率", "tags": ["比特速率", "符号速率", "易错"]},
    {"id": "2014-二-04", "num": "二-04", "type": "big", "score": 2,
     "stem": "在基带传输系统中，若信道特性在信道带宽 $W$ 范围内幅频特性为常数，相位特性为线性，则接收机中的信号将不存在符号间干扰。（　）",
     "chapter": "ch3", "point": "奈奎斯特准则与无码间串扰", "tags": ["无失真传输", "码间串扰", "易错"]},
    {"id": "2014-二-05", "num": "二-05", "type": "big", "score": 2,
     "stem": "在匹配滤波器输出端采样时刻，输出信号的瞬时功率等于与之匹配的信号的能量。（　）",
     "chapter": "ch9", "point": "信号波形与能量关系", "tags": ["匹配滤波器", "易错"]},
    {"id": "2014-二-06", "num": "二-06", "type": "big", "score": 2,
     "stem": "在调频系统中，解调输出信噪比与调制指数的平方成正比。因此，只要在信号带宽允许的范围之内，就可以通过尽量增大调制指数从而增加调频信号带宽，来实现提高解调输出信噪比的目的。（　）",
     "chapter": "ch2", "point": "相干解调与抗噪声性能", "tags": ["调频", "门限效应", "易错"]},
    {"id": "2014-二-07", "num": "二-07", "type": "big", "score": 2,
     "stem": "根据香农信道容量公式，当信号带宽一定时，无限增大信噪比，信道容量将趋于无穷。同理，当信号功率与噪声功率谱密度一定时，无限增大信号带宽，信道容量也将趋于无穷。这说明信号带宽和信噪比可以互换。（　）",
     "chapter": "ch7", "point": "信道容量与香农公式", "tags": ["香农公式", "带宽极限", "易错"]},
    {"id": "2014-二-08", "num": "二-08", "type": "big", "score": 2,
     "stem": "DSB-SC AM 信号通过相干解调后获得的调制度增益为 2，而 SSB AM 信号相干解调后获得的调制度增益为 1。因此，DSB-SC AM 信号具有比 SSB AM 信号更强的抗噪声能力。（　）",
     "chapter": "ch2", "point": "相干解调与抗噪声性能", "tags": ["制度增益", "DSB与SSB", "易错"]},
    {"id": "2014-二-09", "num": "二-09", "type": "big", "score": 2,
     "stem": "沃尔什函数集是完备的非正弦正交函数集，长度为 $N$ 的沃尔什函数有 $N$ 个且相互正交。但是这 $N$ 个函数的频带宽度不同，因此用作扩频码时对应的扩频增益也是不同的。（　）",
     "chapter": "ch6", "point": "正交码与哈达玛矩阵", "tags": ["沃尔什函数", "扩频"]},
    {"id": "2014-二-10", "num": "二-10", "type": "big", "score": 2,
     "stem": "扩频系统具有抗窄带干扰、抗多址干扰和多径干扰、抗高斯白噪声的能力，扩频系数越大，抗干扰和抗高斯白噪声的能力就越强。（　）",
     "chapter": "ch6", "point": "扩频通信与处理增益", "tags": ["扩频", "白噪声", "易错"]},
    {"id": "2014-三", "num": "三", "type": "big", "score": 13,
     "stem": "已知某独立随机序列 $A_n$ 的均值为 0，方差为 $\\sigma^2$，定义随机过程 $X(t)$ 为：$$X(t)=\\sum_{n=-\\infty}^{+\\infty}A_n\\,\\mathrm{sinc}\\,2W(t-nT)。$$",
     "subs": [
       "(1) 求 $X(t)$ 的功率谱密度；",
       "(2) 若 $T=\\dfrac{1}{2W}$，求 $X(t)$ 的功率；",
       "(3) 令 $X_1(t)$ 是零均值平稳过程，其功率谱密度为 $P_{X_1}(f)=\\dfrac{N_0}{2}\\Pi\\!\\left(\\dfrac{f}{2W}\\right)$，取 $A_n=X_1(nT)$，$T=\\dfrac{1}{2W}$，求 $X(t)$ 的功率谱密度及其功率，问 $X_1(t)$ 和 $X(t)$ 有什么关系？（注：函数 $\\Pi(f)$ 定义为 $\\Pi(f)=\\begin{cases}1, & |f|<0.5\\\\ 0.5, & f=\\pm 0.5\\\\ 0, & \\text{其他}\\end{cases}$）"
     ],
     "fig": null, "chapter": "ch1", "point": "随机过程通过线性系统", "tags": ["PAM功率谱", "奈奎斯特抽样", "sinc内插"]},
    {"id": "2014-四", "num": "四", "type": "big", "score": 10,
     "stem": "某数字基带通信系统采用升余弦滚降波形进行信息传输，已知发送端采用的基带脉冲信号 $g(t)$ 及其频谱如下图 (a)(b) 所示，符号速率为 $1/T$ 波特。",
     "subs": [
       "(1) 求滚降因子 $\\beta$ 和符号速率的取值；",
       "(2) 若信道特性不理想，使得 $g(t)$ 经信道和接收端滤波后的脉冲波形 $x(t)$ 的采样值 $x(kT)$ 如图 (c) 所示。假设发送端发送的二进制信息序列的幅度值取为 $+1$ 或者 $-1$，请给出该系统存在的峰值符号间干扰及引起该峰值符号间干扰的发送序列；",
       "(3) 求出现上述峰值干扰的概率，假设所有二进制电平等概率出现且相互独立。"
     ],
     "fig": "q4figs", "chapter": "ch3", "point": "码间串扰分析", "tags": ["升余弦滚降", "峰值码间串扰", "计算"]},
    {"id": "2014-五", "num": "五", "type": "big", "score": 15,
     "stem": "某信源输出的模拟低通信号 $X(t)$ 的采样值 $x$ 的概率密度函数如下图所示，其带宽为 $5\\,\\mathrm{kHz}$，对该信源采样后进行均匀量化，并以二进制编码方式进行信息传输。",
     "subs": [
       "(1) 求采样值的平均功率 $S=E\\left[x^2\\right]$；",
       "(2) 若对该信号按奈奎斯特采样速率进行采样，并取量化电平数 $M=16$，求量化噪声的平均功率 $N_q$ 和量化编码后的信息传输速率；",
       "(3) 若可用的信道带宽为 $40\\,\\mathrm{kHz}$，求该量化器的可能的最大量化电平数。"
     ],
     "fig": "q5pdf", "chapter": "ch5", "point": "量化（均匀/最佳量化）", "tags": ["均匀量化", "量化噪声", "计算"]},
    {"id": "2014-六", "num": "六", "type": "big", "score": 12,
     "stem": "某线性分组码的生成矩阵为：$$G=\\begin{bmatrix}0&0&1&1&1&0&1\\\\0&1&0&0&1&1&1\\\\1&0&0&1&1&1&0\\end{bmatrix}$$",
     "subs": [
       "(1) 写出系统码生成矩阵表达式；",
       "(2) 写出典型监督矩阵 $H$；",
       "(3) 确定该编码的最小汉明距离；",
       "(4) 写出所有单个错误图样对应的伴随式；",
       "(5) 写出对应于信息序列 101 的输出码字 $c$，并计算 $cH^{\\mathrm T}$，$H^{\\mathrm T}$ 代表矩阵 $H$ 的转置。"
     ],
     "fig": null, "chapter": "ch6", "point": "线性分组码与生成矩阵", "tags": ["系统码", "监督矩阵", "伴随式"]},
    {"id": "2014-七", "num": "七", "type": "big", "score": 16,
     "stem": "某通信系统的四种发送信号波形如下图所示，各信号独立等概出现。经过信道后，信号叠加了单边功率谱密度为 $N_0$ 的白高斯噪声。",
     "subs": [
       "(1) 试确定一个合适的归一化正交函数集 $\\{f_n(t),\\ n=1,2,\\cdots,N\\}$ 以及各发送信号的矢量表示，并画出对应的 $N$ 维信号星座图；",
       "(2) 根据信号星座图计算平均比特能量 $E_b$；",
       "(3) 根据 MAP 准则画出最佳接收机结构，并在信号星座图上给出各信号的判决区域；",
       "(4) 已知最佳接收时 2ASK 系统的误码率为 $P_{2\\mathrm{ASK}}=Q\\!\\left(\\sqrt{\\dfrac{d_{\\min}^2}{2N_0}}\\right)$，其中 $d_{\\min}$ 为相邻信号点间的最小欧氏距离。试根据该式推导上述信号在最佳接收时的误码率上界。"
     ],
     "fig": "q7wave", "chapter": "ch9", "point": "相关接收机", "tags": ["信号空间", "星座图", "MAP接收", "联合界"]},
    {"id": "2014-八", "num": "八", "type": "big", "score": 13,
     "stem": "一个相干 2PSK 系统的发送信号定义如下：$s(t)=A_k\\sin(2\\pi f_c t)\\pm A_x\\sqrt{1-k^2}\\,\\cos(2\\pi f_c t)$，$0\\le t\\le T_b$。其中正号对应二进制信息比特 1，负号对应二进制信息比特 0，且 0、1 独立等概出现。信号中第一项代表用于实现接收机与发送机同步的载波分量。",
     "subs": [
       "(1) 画出对该信号进行相干解调的接收机框图；",
       "(2) 假设信号在信道上传输时叠加了单边功率谱密度为 $N_0$ 的白高斯噪声，试推导相干解调后的平均误比特率（其中信号带宽按零点带宽计算）；",
       "(3) 假设 10% 的发送信号功率分配在载波分量上，试求在相同的误比特率条件下本系统所需的信号功率是传统相干 2PSK 系统的多少倍？"
     ],
     "fig": null, "chapter": "ch4", "point": "2ASK/2FSK/2PSK/2DPSK", "tags": ["2PSK", "载波同步", "误比特率", "功率分配"]},
    {"id": "2014-九", "num": "九", "type": "big", "score": 11,
     "stem": "",
     "subs": [
       "1、假设某数字通信系统经过一个带宽受限的加性白高斯噪声信道。已知系统的频带利用率为 $4\\,\\mathrm{bps/Hz}$，问极限情况下所需的最小理论信噪比 $E_b/N_0$ 是多少？",
       "2、假设任意信号 $s(t)$ 通过一两径信道后的输出是 $As(t-t_0)+As(t-t_0-\\tau)$，其中 $A$、$t_0$、$\\tau$ 均为常数。试求该信道的时延特性和群时延特性。"
     ],
     "fig": null, "chapter": "ch7", "point": "信道容量与香农公式", "tags": ["香农极限", "Eb/N0", "两径信道", "群时延"]},
    {"id": "2014-十", "num": "十", "type": "big", "score": 10,
     "stem": "已知某单一正弦调制信号的频率 $f_m=1000\\,\\mathrm{Hz}$，对其进行角度调制，已调信号的表达式为：$$s(t)=10\\cos\\left(2\\pi f_c t+25\\cos 2\\pi f_m t\\right)$$",
     "subs": [
       "(1) 若已调信号为调频波，频率偏移常数为 $5\\,\\mathrm{Hz/V}$，试求调制信号的表达式？",
       "(2) 若已调信号为调相波，相位偏移常数为 $10\\,\\mathrm{rad/V}$，试求调制信号的表达式？",
       "(3) 当 $f_m$ 增加 5 倍，其他条件不变时，试求调频波的调制指数及已调信号的带宽？"
     ],
     "fig": null, "chapter": "ch2", "point": "FM/PM 角度调制", "tags": ["调频", "调相", "卡森公式", "调制指数"]}
  ]
};
