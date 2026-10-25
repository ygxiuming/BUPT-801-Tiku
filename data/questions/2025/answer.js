// 2025 · 答案与解析（按题目 id 索引；加载后由 hydrateAnswers() 合并回题目）
window.BUPT801 = window.BUPT801 || {};
window.BUPT801.answers = window.BUPT801.answers || {};
window.BUPT801.answers["2025"] = {
  "2025-1": {
    "answer": "B",
    "exp": {
      "concl": "选B：非平稳的高斯过程。$s(t)=m(t)\\cos\\omega_c t$ 是对高斯过程 $m(t)$ 的线性运算，高斯性保持；但自相关函数中出现含绝对时间 $t$ 的项，不是广义平稳的。",
      "opts": {
        "A": "错误。“平稳”与“高斯”在此题中只能占一个：$s(t)$ 确是高斯的（见B），但非平稳。",
        "B": "正确。①高斯性：$m(t)$ 高斯，与确定信号 $\\cos\\omega_c t$ 相乘/线性组合后任意时刻边际仍是高斯分布，且过程任意有限维分布线性变换后仍联合高斯。②平稳性：$R_s(t,t+\\tau)=E[m(t)m(t+\\tau)]\\cos\\omega_ct\\cos\\omega_c(t+\\tau)=\\tfrac12 R_m(\\tau)\\left[\\cos\\omega_c\\tau+\\cos(2\\omega_ct+\\omega_c\\tau)\\right]$，第二项随 $t$ 变化，故非广义平稳。",
        "C": "错误。“非高斯”不成立：对高斯过程做线性（乘确定信号、线性滤波）运算不改变高斯性。",
        "D": "错误。“非高斯”不成立，理由同C。"
      },
      "note": "易错点：把“恒包络/周期性”误当平稳性。DSB-SC的非平稳性正是平方变换法能提取载波的根源——$s^2(t)$ 中含离散分量 $\\tfrac12 R_m(0)\\cos 2\\omega_c t$。"
    }
  },
  "2025-2": {
    "answer": "A",
    "exp": {
      "concl": "选A：平稳高斯过程。SSB信号 $s(t)=m(t)\\cos\\omega_c t\\mp\\hat m(t)\\sin\\omega_c t$ 仍是对 $m(t)$ 的线性运算 → 高斯；其自相关函数中的时间项恰好完全相消 → 广义平稳。",
      "opts": {
        "A": "正确。①高斯性：$\\hat m(t)=m(t)*\\frac{1}{\\pi t}$ 是LTI滤波输出，$(m,\\hat m)$ 联合高斯，线性组合 $s(t)$ 仍高斯。②平稳性：利用 $\\hat R_m(\\tau)=R_m(\\tau)$、$E[m(t)\\hat m(t+\\tau)]=\\hat R_m(\\tau)$（奇函数）及和差化积公式，$R_s(t,t+\\tau)=R_m(\\tau)\\cos\\omega_c\\tau\\mp\\hat R_m(\\tau)\\sin\\omega_c\\tau$，只与 $\\tau$ 有关。",
        "B": "错误。时间项相消是SSB的著名结论（与DSB对比记忆），非平稳不成立。",
        "C": "错误。$s(t)$ 是高斯的：线性运算不产生非高斯性。",
        "D": "错误。两个维度均不成立。"
      },
      "note": "对比记忆卡：DSB-SC→非平稳高斯；SSB→平稳高斯；FM→非高斯（平稳性与初相约定有关，本题组按确定初相处理为非平稳）。"
    }
  },
  "2025-3": {
    "answer": "D",
    "exp": {
      "concl": "选D：非平稳的非高斯过程。FM是非线性调制：相位中含 $\\int m(\\tau)\\mathrm d\\tau$，输出取值被压入 $[-A,A]$，高斯性被破坏；同时均值 $E[s(t)]$ 随 $t$ 周期变化，非广义平稳。",
      "opts": {
        "A": "错误。“平稳”与“高斯”均不成立。",
        "B": "错误。“高斯”不成立：$s(t)=A\\cos[\\omega_c t+\\theta(t)]$，余弦是非线性运算，$s$ 的取值范围为 $[-A,A]$，而高斯变量取值无界。",
        "C": "错误。“平稳”不成立：$E[s(t)]=A\\cos\\omega_ct\\cdot E[\\cos\\theta(t)]-A\\sin\\omega_ct\\cdot E[\\sin\\theta(t)]=A\\mathrm e^{-\\sigma_\\theta^2/2}\\cos\\omega_ct\\neq$ 常数，均值随 $t$ 变。",
        "D": "正确。非线性 → 非高斯；均值含 $\\cos\\omega_c t$ 项 → 非平稳。"
      },
      "note": "自洽性检验：本组按“载波初相确定”统一口径才同时成立。若给FM加随机均匀初相，FM变平稳，但DSB也会变成“平稳非高斯”，与第(1)题矛盾——故BAD三连是自洽的唯一组合。"
    }
  },
  "2025-4": {
    "answer": "B",
    "exp": {
      "concl": "选B：8 W。FM是恒包络信号，平均功率只由振幅决定：$P=A^2/2=4^2/2=8$ W。",
      "opts": {
        "A": "错误。3是最大频偏相关的量级混淆（$k_f=3000$ Hz/V、$\\Delta f=9$ kHz），与功率无关。",
        "B": "正确。$P=A^2/2=8$ W，与调制信号无关。",
        "C": "错误。误将“载波功率+双边带功率”重复相加；FM功率恒为 $A^2/2$。",
        "D": "错误。24是带宽(kHz)的数值，与功率无关。"
      },
      "note": "易错点：FM/PM恒包络 → 功率 $A^2/2$ 恒定，这正是FM可用限幅器去除寄生调幅、功率效率高的原因。"
    }
  },
  "2025-5": {
    "answer": "A",
    "exp": {
      "concl": "选A：3。瞬时频偏 $\\Delta f(t)=\\frac{k_f}{2\\pi}m(t)$，$k_f=6000\\pi/(2\\pi)=3000$ Hz/V，故 $\\Delta f_{\\max}=3000\\times3=9$ kHz；$m_f=\\Delta f_{\\max}/f_m=9\\,\text{kHz}/3\\,\text{kHz}=3$。",
      "opts": {
        "A": "正确。$m_f=\\Delta f_{\\max}/W=9000/3000=3$。",
        "B": "错误。8是功率的数值，张冠李戴。",
        "C": "错误。误将峰-峰幅度6 V代入，或误取 $\\Delta f_{\\max}=6$ kHz。",
        "D": "错误。24是卡森带宽，若误当作频偏会得出 $m_f=8$。"
      },
      "note": "读题技巧：$6000\\pi\\int m\\,\\mathrm d\\tau$ 中 $k_f\\cdot 2\\pi=6000\\pi$ → $k_f=3000$ Hz/V；最大频偏 $=k_f\\times|m|_{\\max}$，最大相偏 $=m_f$。"
    }
  },
  "2025-6": {
    "answer": "D",
    "exp": {
      "concl": "选D：24 kHz。卡森公式 $B\\approx 2(\\Delta f_{\\max}+f_m)=2(9+3)=24$ kHz。",
      "opts": {
        "A": "错误。3 kHz是基带信号带宽，FM带宽远大于它。",
        "B": "错误。8是功率数值，无关。",
        "C": "错误。典型错误：把基带带宽3 kHz当成最大频偏，$B=2(3+3)=12$——漏乘了幅度 $|m|_{\\max}=3$。",
        "D": "正确。$m_f=3>1$属宽带调频，$B\\approx 2(m_f+1)f_m=24$ kHz。"
      },
      "note": "卡森公式三种等价写法：$B=2(\\Delta f_{\\max}+f_m)=2(m_f+1)f_m=2\\Delta f_{\\max}(1+1/m_f)$。"
    }
  },
  "2025-7": {
    "answer": "D",
    "exp": {
      "concl": "选D：8 kHz。DSB-SC上下两个边带，带宽 $B=2W=2\\times4=8$ kHz。",
      "opts": {
        "A": "错误。2 kHz无对应公式。",
        "B": "错误。4 kHz是基带带宽 $W$，是SSB的带宽。",
        "C": "错误。6 kHz是VSB的可能取值（W~2W之间），不是DSB。",
        "D": "正确。双边带结构：$B=2W$。"
      },
      "note": "带宽公式族：DSB/AM：$2W$；SSB：$W$；VSB：$W\\sim2W$；FM：$2(\\Delta f+f_m)$。"
    }
  },
  "2025-8": {
    "answer": "D",
    "exp": {
      "concl": "选D：8 kHz。AM同样传送上下两个完整边带，$B=2W=8$ kHz。",
      "opts": {
        "A": "错误。无依据。",
        "B": "错误。4 kHz是SSB带宽。",
        "C": "错误。AM不因加入载波而改变带宽，2W=8。",
        "D": "正确。AM频谱=载波分量+上下边带，占用 $2W$。"
      },
      "note": "AM与DSB-SC带宽相同（8 kHz），区别在AM含载波分量→可包络检波，但功率效率低。"
    }
  },
  "2025-9": {
    "answer": "B",
    "exp": {
      "concl": "选B：4 kHz。SSB只传一个边带，带宽=基带带宽 $W=4$ kHz，频带利用率是AM/DSB的两倍。",
      "opts": {
        "A": "错误。$W/2$ 无对应调制方式。",
        "B": "正确。单边带 → $B=W$。",
        "C": "错误。6 kHz是VSB范围（残留边带介于单边与双边之间）。",
        "D": "错误。8 kHz是双边带方式的带宽。"
      },
      "note": "SSB频带利用率 $\\eta=1$ bit... 对模拟调制：$\\eta_{SSB}=W/W=1$，是模拟调制中最高的（VSB次之）。"
    }
  },
  "2025-10": {
    "answer": "C",
    "exp": {
      "concl": "选C：1.5 bit。哈夫曼：先合并最小的两个概率 $1/3+1/6=1/2$，再与 $1/2$ 合并。编码：$p=1/2\\to 0$（1位），$p=1/3\\to 10$（2位），$p=1/6\\to 11$（2位）。$L=1\\times\\tfrac12+2\\times\\tfrac13+2\\times\\tfrac16=1.5$ bit。",
      "opts": {
        "A": "错误。信源熵 $H=\\tfrac12\\log_22+\\tfrac13\\log_23+\\tfrac16\\log_26\\approx1.459$ bit，平均码长不可能低于熵（$L\\ge H$），1 bit连熵都不到。",
        "B": "错误。同样违反 $L\\ge H\\approx1.459$。",
        "C": "正确。哈夫曼码是最优前缀码，$L=1.5$ bit。",
        "D": "错误。2 bit是等长码（$\\lceil\\log_23\\rceil=2$）的码长，哈夫曼优于等长编码。"
      },
      "note": "校验习惯：哈夫曼平均码长满足 $H\\le L<H+1$。本题 $H\\approx1.46\\le1.5<2.46$ ✓。"
    }
  },
  "2025-11": {
    "answer": "D",
    "exp": {
      "concl": "选D：眼图。示波器以码元速率同步触发、将多个码元周期的波形重复扫描叠加，形成的“眼睛”状图形。",
      "opts": {
        "A": "错误。状态图（信号状态转移图）描述状态机/相位路径，不是示波器叠加波形。",
        "B": "错误。频谱图是频域测量结果。",
        "C": "错误。星座图是同相/正交两路基带采样点在IQ平面上的散点图（数字带通）。",
        "D": "正确。眼图是数字基带波形重复扫描叠加的轨迹。"
      },
      "note": "眼图判读：眼睛张开最大处=最佳采样时刻；张开度=噪声容限；过零点斜率=对定时抖动的敏感度；上下横线电平差受ISI与噪声共同影响。"
    }
  },
  "2025-12": {
    "answer": "D",
    "exp": {
      "concl": "选D：载波同步。科斯塔斯环（同相正交环）用于BPSK/DSB相干解调时在接收端恢复同频同相的本地载波。",
      "opts": {
        "A": "错误。频谱搬移是调制/变频完成的功能。",
        "B": "错误。定时同步（位同步）确定最佳采样时刻，由专门的位同步环实现。",
        "C": "错误。匹配滤波是最佳接收中使输出SNR最大的滤波器。",
        "D": "正确。科斯塔斯环 = 载波同步环。"
      },
      "note": "BPSK频谱无载波离散分量 → 不能用窄带滤波直接提载波 → 需非线性变换（平方环）或相乘反馈（科斯塔斯环）。"
    }
  },
  "2025-13": {
    "answer": "A",
    "exp": {
      "concl": "选A：相位模糊。科斯塔斯环/平方环锁定后恢复的载波存在 $0$、$\\pi$ 两种可能相位（环可能锁到两个稳定点中的任一个），导致解调输出0/1整体反转。",
      "opts": {
        "A": "正确。载波恢复的 $\\pm\\pi$ 不确定性即相位模糊（相位不确定性）。",
        "B": "错误。定时偏差是位同步问题。",
        "C": "错误。符号间干扰由带宽受限信道引起，与载波恢复无关。",
        "D": "错误。多普勒频移是相对运动引起的载频偏移。"
      },
      "note": "2DPSK的解决思路：用相邻码元的相位差携带信息，差分相干解调或相干解调+码反变换，使整体 $\\pi$ 反转对判决结果无影响。代价：误码可能成对扩散。"
    }
  },
  "2025-14": {
    "answer": "B",
    "exp": {
      "concl": "选B：1。高斯白噪声经LTI系统输出仍高斯，其方差=输出平均功率 $\\sigma^2=\\int_{-\\infty}^{\\infty}\\frac{N_0}{2}|H(f)|^2\\mathrm df=\\frac{N_0}{2}\\int_{-\\infty}^{\\infty}h^2(t)\\mathrm dt=\\frac{2}{2}\\times1=1$。",
      "opts": {
        "A": "错误。漏代 $N_0=2$（把 $N_0/2$ 当成了最终系数又再乘1/2）。",
        "B": "正确。帕塞瓦尔定理：$\\int|H(f)|^2\\mathrm df=\\int h^2(t)\\mathrm dt=E_h=1$ J，故 $\\sigma^2=(N_0/2)E_h=1$。",
        "C": "错误。误用单边谱 $N_0$ 直接乘能量得 $N_0E_h=2$——单边谱应对应 $\\int_0^{\\infty}$ 积分约定，换算后仍是 $N_0/2$ 系数。",
        "D": "错误。误用 $N_0^2$ 或把功率谱再平方。"
      },
      "note": "通用结论：单位冲激响应能量为 $E_h$ 的滤波器，白噪声(双边 $N_0/2$)通过后输出功率 $=N_0E_h/2$。"
    }
  },
  "2025-15": {
    "answer": "B",
    "exp": {
      "concl": "选B：高斯分布。带通滤波是线性运算，高斯过程通过线性系统后仍是高斯过程。",
      "opts": {
        "A": "错误。瑞利是窄带高斯过程“包络”的分布，不是 $n(t)$ 本身。",
        "B": "正确。线性系统保高斯性：$n(t)$ 的任意 $n$ 维分布仍联合高斯。",
        "C": "错误。指数分布是包络平方/瞬时功率的分布。",
        "D": "错误。均匀是“相位”的分布。"
      },
      "note": "记牢三件套：$n(t)$ 高斯；包络 $R(t)$ 瑞利；相位 $\\Theta(t)$ 均匀。叠加正弦载波后包络变莱斯、相位不再均匀。"
    }
  },
  "2025-16": {
    "answer": "D",
    "exp": {
      "concl": "选D：均匀分布。零均值窄带高斯过程的相位在 $[-\\pi,\\pi)$ 内均匀分布。",
      "opts": {
        "A": "错误。瑞利是包络的分布，不是相位。",
        "B": "错误。$n(t)$ 本身是高斯的，但相位的归一化分布均匀——这是窄带高斯过程的经典结论（对称性：$n_c,n_s$ 联合高斯、独立、同分布 → 极角均匀）。",
        "C": "错误。指数是包络平方的分布。",
        "D": "正确。$n_c,n_s$ 独立同分布 $N(0,\\sigma^2)$，$\\Theta=\\arctan(n_s/n_c)$ 均匀分布于 $[-\\pi,\\pi)$。"
      },
      "note": "推导抓手：$n(t)=n_c\\cos\\omega_0t-n_s\\sin\\omega_0t$，$(n_c,n_s)$ 联合PDF关于原点圆对称 → 相位均匀、包络瑞利。"
    }
  },
  "2025-17": {
    "answer": "A",
    "exp": {
      "concl": "选A：瑞利分布。包络 $R=\\sqrt{n_c^2+n_s^2}$，$p(R)=\\frac{R}{\\sigma^2}\\mathrm e^{-R^2/2\\sigma^2},\\ R\\ge0$。",
      "opts": {
        "A": "正确。零均值窄带高斯过程的包络服从瑞利分布（本题 $\\sigma^2=1$）。",
        "B": "错误。高斯是 $n(t)$、$n_c$、$n_s$ 的分布，包络非负且不对称。",
        "C": "错误。指数分布对应包络平方 $R^2$。",
        "D": "错误。均匀对应相位。"
      },
      "note": "推广：若叠加确定性正弦 $A\\cos\\omega_0t$，包络变为莱斯分布，$A\\to0$ 时退化为瑞利。"
    }
  },
  "2025-18": {
    "answer": "C",
    "exp": {
      "concl": "选C：11101111。极性码1（正）；段落码110（第7段 $[512,1024)$ mV）；段内码1111（$\\lfloor(1020-512)/32\\rfloor=15$）。",
      "opts": {
        "A": "错误。段落/段内划分错位的结果，如误用第6段起点256计算段内级数。",
        "B": "错误。段落码101对应第6段 $[256,512)$，1020不在其中——段落起点序列记错。",
        "C": "正确。段落起点（满量程2048 mV）：0, 16, 32, 64, 128, 256, 512, 1024。$1020\\in[512,1024)$=第7段 → 段落码110；段内16级，步长 $512/16=32$ mV，$(1020-512)/32=15.875\\to15$ 级 → 1111。码字 $1\\,110\\,1111$。",
        "D": "错误。段落码111是第8段 $[1024,2048)$，1020尚未达到1024。"
      },
      "note": "易错点：1020非常接近判决电平1024，但编码按“不超过样值的最大判决电平”归属第7段第15级，不能进位到第8段。段落码=段号−1的二进制（第1段000……第8段111）。"
    }
  },
  "2025-19": {
    "answer": "B",
    "exp": {
      "concl": "选B：10 Mbit/s。1024QAM 是频带（带通）传输，理想成形时已调信号带宽就等于符号速率：$R_s=B=1$ MBaud；每符号携带 $\\log_21024=10$ bit → $R_b=1\\times10=10$ Mbit/s。",
      "opts": {
        "A": "错误。8 Mbit/s 是第(20)问加了 $\\alpha=1/4$ 滚降后的结果，此处尚未滚降。",
        "B": "正确。带通系统无ISI条件 $R_s\\le\\dfrac{B}{1+\\alpha}$，取 $\\alpha=0$ 得 $R_s=B=1$ MBaud，$R_b=R_s\\log_2M=10$ Mbit/s。",
        "C": "错误。16 Mbit/s 对应 $R_s=1.6$ MBaud，是把 $2B$ 又除以 $1.25$ 拼出来的，两种口径混用。",
        "D": "错误。20 Mbit/s 是把**基带**奈奎斯特速率 $2W$ 直接搬到带通系统（$R_s=2B$）——QAM 的 I/Q 两路各自只占 $B/2$，合成已调信号带宽就是 $R_s$，没有那个额外的2倍。"
      },
      "note": "口径必须钉死：基带系统 $R_s\\le2W$（滚降后 $2W/(1+\\alpha)$）；带通（QAM/PSK）系统是载波双边带，$R_s\\le B/(1+\\alpha)$，理想时 $R_s=B$，即极限频带利用率 $\\log_2M$ bit/s/Hz（1024QAM→10）。2026 年第七题（64QAM、$R_b=6$ Mbit/s、RRC $\\alpha=1/4$、绝对带宽 $1.25$ MHz $=(1+\\alpha)R_s$）用的是同一口径，可交叉验证。"
    }
  },
  "2025-20": {
    "answer": "A",
    "exp": {
      "concl": "选A：8 Mbit/s。升余弦滚降把已调信号绝对带宽撑到 $B=(1+\\alpha)R_s$，故 $R_s=\\dfrac{B}{1+\\alpha}=\\dfrac{1}{1.25}=0.8$ MBaud，$R_b=0.8\\times10=8$ Mbit/s。",
      "opts": {
        "A": "正确。频带利用率由理想的 $\\log_2M=10$ 降为 $\\dfrac{\\log_2M}{1+\\alpha}=8$ bit/s/Hz。",
        "B": "错误。10 Mbit/s 是(19)问理想成形（$\\alpha=0$）的结果，滚降必然要付带宽代价。",
        "C": "错误。16 Mbit/s 相当于把 $R_s$ 算成 $1.6$ MBaud，是 $2B/(1+\\alpha)$ 的混算。",
        "D": "错误。20 Mbit/s 是 $2B\\log_2M$，既用了基带口径又漏了滚降。"
      },
      "note": "升余弦滚降“多花带宽买平滑”：$\\alpha$ 越大拖尾衰减越快、对定时误差越宽容，但频带利用率按 $\\dfrac{\\log_2M}{1+\\alpha}$ 打折。本题 $\\alpha=1/4$ 打八折。"
    }
  },
  "2025-21": {
    "answer": "A",
    "exp": {
      "concl": "选A：$c(x)$ 能被 $g(x)$ 整除。循环码 $(n,k)$ 的每个码多项式都是 $g(x)$ 的倍式：$c(x)=m(x)g(x)$（$\\deg m\\le k-1$）。",
      "opts": {
        "A": "正确。这是循环码的定义性性质，也是检错译码的依据：接收字 $r(x)$ 除以 $g(x)$，余式（伴随式）非零即判有错。",
        "B": "错误。$\\deg c=\\deg m+\\deg g$，与 $g$ 同次仅当 $m$ 为常数（全零信息组的特殊情形）。",
        "C": "错误。正确的关系是 $g(x)\\mid(x^n+1)$（$g$ 是 $x^n+1$ 的因式），而不是码字满足 $c(x)g(x)=x^n+1$。",
        "D": "错误。与循环码定义相反。"
      },
      "note": "循环码三要素：$g(x)$ 唯一确定码；$g(x)$ 首一、次数 $n-k$、整除 $x^n+1$；系统码 $c(x)=x^{n-k}m(x)+r(x)$。"
    }
  },
  "2025-22": {
    "answer": "A",
    "exp": {
      "concl": "选A：数字基带设备接口。HDB3是ITU-T G.703规定的PCM基群（2.048 Mbit/s）、二次群等数字中继线路接口码型。",
      "opts": {
        "A": "正确。用于基带数字传输的线路接口（电缆中继）。",
        "B": "错误。无线空中接口用射频调制（如QPSK/GMSK/OFDM）。",
        "C": "错误。电源接口与码型无关。",
        "D": "错误。时钟接口传输的是同步定时信号；HDB3传业务码流，其优点之一是便于从中提取定时。"
      },
      "note": "选码型四大要求：无直流/低频分量少、含足够定时信息、抗噪、透明传输。HDB3同时满足。"
    }
  },
  "2025-23": {
    "answer": "C",
    "exp": {
      "concl": "选C：没有长连零。AMI遇长串0时电平恒为零，接收端无法提取定时；HDB3把连0个数限制在不超过3个。",
      "opts": {
        "A": "错误。隔直流是AMI已经具备的性质（正负交替、均值为零），不是HDB3的改进点。",
        "B": "错误。HDB3插入破坏符后带宽与AMI相当，并未变窄。",
        "C": "正确。每4连0替换为000V或B00V，最长连0为3。",
        "D": "错误。HDB3要插入V符/B符，平均功率不低于AMI。"
      },
      "note": "HDB3规则要点：4连0 → “000V”（前一个破坏符V之后已传符号数为偶数时用“B00V”）；V与前一脉冲同极性（破坏交替规律，便于接收端识别），相邻V极性必须交替以保证无直流。"
    }
  },
  "2025-24": {
    "answer": "A",
    "exp": {
      "concl": "选A：希尔伯特变换。$\\hat s(t)$ 是 $s(t)$ 经冲激响应 $h(t)=1/(\\pi t)$ 的LTI滤波，相关函数经历同样的运算：$R_{\\hat ss}(\\tau)=\\pm\\hat R_s(\\tau)$，即 $R_s(\\tau)$ 的希尔伯特变换。",
      "opts": {
        "A": "正确。$E[\\hat s(t)s(t+\\tau)]=\\int E[s(t-\\alpha)s(t+\\tau)]h(\\alpha)\\mathrm d\\alpha=\\int R_s(\\tau+\\alpha)h(\\alpha)\\mathrm d\\alpha=\\hat R_s(\\tau)\\cdot(\\pm1)$——运算类型是希尔伯特变换（符号随时序约定）。",
        "B": "错误。拉普拉斯变换是确定性信号的复频域工具。",
        "C": "错误。傅里叶变换联系的是 $R_s(\\tau)$ 与功率谱 $S_s(f)$（维纳-辛钦），不是与互相关的关系。",
        "D": "错误。哈达玛变换是离散正交变换（码分复用/图像处理）。"
      },
      "note": "希尔伯特变换相关公式三件套：$\\hat R(\\tau)=R(\\tau)$（自相关不变）；$R_{s\\hat s}(\\tau)=\\hat R(\\tau)$；$R_{\\hat ss}(\\tau)=-\\hat R(\\tau)$。$\\hat R$ 为奇函数，$\\hat R(0)=0$ → 同一时刻的 $s$ 与 $\\hat s$ 不相关（高斯时还独立）。"
    }
  },
  "2025-25": {
    "answer": "C",
    "exp": {
      "concl": "选C：$(2^\\eta-1)/\\eta$。由 $\\eta=\\log_2(1+\\mathrm{SNR})$ 和 $\\mathrm{SNR}=(E_b/N_0)\\cdot\\eta$ 联立解出。",
      "opts": {
        "A": "错误。这是高 $\\eta$ 近似 $2^\\eta/\\eta$ 的变形，但连主要项形式都不对。",
        "B": "错误。把 $\\eta$ 直接当SNR代入香农公式，混淆了“频带利用率”与“信噪比”。",
        "C": "正确。推导：$R_b=C=B\\log_2(1+S/N)$，令 $\\eta=R_b/B$；$S/N=\\dfrac{E_bR_b}{N_0B}=\\dfrac{E_b}{N_0}\\eta$ → $\\eta=\\log_2\\left(1+\\eta\\dfrac{E_b}{N_0}\\right)$ → $\\dfrac{E_b}{N_0}=\\dfrac{2^\\eta-1}{\\eta}$。",
        "D": "错误。无此结论。"
      },
      "note": "两个极限要会背：$\\eta\\to0$ 时 $E_b/N_0\\to\\ln2\\approx0.693$（-1.6 dB，香农限）；$\\eta\\to\\infty$ 时 $E_b/N_0\\approx2^\\eta/\\eta$ 指数增长。"
    }
  },
  "2025-26": {
    "answer": "A",
    "exp": {
      "concl": "选A：3 dB。高 $\\eta$ 时 $E_b/N_0\\approx2^\\eta/\\eta$，$\\eta$ 每增加1，$2^\\eta$ 翻倍 → $E_b/N_0$ 至少翻倍，即 $+10\\lg2\\approx3$ dB。",
      "opts": {
        "A": "正确。$\\dfrac{\\mathrm d}{\\mathrm d\\eta}\\ln\\dfrac{2^\\eta-1}{\\eta}=\\dfrac{2^\\eta\\ln2}{2^\\eta-1}-\\dfrac1\\eta\\xrightarrow{\\eta\\to\\infty}\\ln2$，故每+1 bit/s/Hz需 $\\times2$，即3 dB。",
        "B": "错误。1 J是绝对能量，与无量纲的极限讨论无关。",
        "C": "错误。1 dB对应 $\\times1.26<2$，不满足翻倍要求。",
        "D": "错误。50%无依据。"
      },
      "note": "含义：带宽换功率的边际代价随 $\\eta$ 增大——这就是高谱效率调制（如1024QAM）对SNR要求苛刻的根源。"
    }
  },
  "2025-27": {
    "answer": "C",
    "exp": {
      "concl": "选C：相干带宽较小的时不变信道。OFDM把宽带频率选择性信道切成 $N$ 个窄带平坦子信道，专治“多径时延扩展大（=相干带宽小）”的信道；时不变保证子载波正交稳定。",
      "opts": {
        "A": "错误。多普勒扩展大=快时变，会破坏子载波正交性产生载波间干扰（ICI），OFDM反而需要频繁重训练/更大子载波间隔来对抗。",
        "B": "错误。相干带宽大=信道本身平坦衰落，普通单载波即可，无需OFDM的开销（CP、FFT）。",
        "C": "正确。相干带宽小=频率选择性衰落=OFDM的用武之地；加循环前缀（CP）即可消除ISI。",
        "D": "错误。时延扩展小=平坦衰落，无需OFDM。"
      },
      "note": "判断口诀：OFDM适合“频率选择（时延大）+ 相对慢变”的信道；时间选择性（多普勒大）是它的软肋。4G/5G、WiFi均如此设计。"
    }
  },
  "2025-28": {
    "answer": "C",
    "exp": {
      "concl": "选C：$1+x+x^3$。周期 $N=2^n-1=7\\Rightarrow n=3$，特征多项式应为3次本原多项式 $x^3+x+1$。",
      "opts": {
        "A": "错误。$x^3+1=(x+1)(x^2+x+1)$ 可约，非本原（含偶数个非零项必含因子 $x+1$），产生不了周期7的m序列。",
        "B": "错误。$1+x+x^2+x^3=(x+1)^3$ 可约，同样排除。",
        "C": "正确。$x^3+x+1$ 是GF(2)上的3次本原多项式，对应m序列周期 $2^3-1=7$。",
        "D": "错误。$x^4+x+1$ 虽是本原多项式但为4次，对应周期 $2^4-1=15\\ne7$。"
      },
      "note": "秒杀技巧：非零项个数为偶数的多项式必能被 $(x+1)$ 整除（代入 $x=1$ 为0），n≥2时必非本原——A、B直接出局；再由周期定次数：$2^n-1=7\\to n=3$。"
    }
  },
  "2025-29": {
    "answer": "C",
    "exp": {
      "concl": "选C：误符号率下降，带宽增大。MFSK是正交调制：$R_s=R_b/\\log_2M$ 下降，但占用 $M$ 个频率位置，带宽 $B\\approx(M+1)R_s\\approx M R_b/\\log_2M$ 随M增大；固定 $E_b/N_0$（超过约1.5 dB门限）时 $P_s=(M-1)Q\\left(\\sqrt{\\log_2M\\cdot E_b/N_0}\\right)$ 随M增大而下降。",
      "opts": {
        "A": "错误。带宽方向反了。",
        "B": "错误。两个方向都反。",
        "C": "正确。维数 $M$ 增加 → 信号空间欧氏距离增大 → 可靠性提升，代价是带宽线性增长。",
        "D": "错误。误符号率方向反了。"
      },
      "note": "严格条件：$P_s\\to0\\ (M\\to\\infty)$ 要求 $E_b/N_0>2\\ln2\\approx1.42$（1.5 dB）——正交信号逼近香农限的经典结论；考题默认工作在此区间。"
    }
  },
  "2025-30": {
    "answer": "B",
    "exp": {
      "concl": "选B：误符号率增大，带宽减小。$B=R_s(1+\\alpha)=R_b(1+\\alpha)/\\log_2M$ 随M减小（这点没有争议）；而固定 $E_b/N_0$ 时星座点越来越密，$P_s$ 上升。",
      "opts": {
        "A": "错误。“误符号率下降”方向反了：$P_s\\approx4\\left(1-\\tfrac1{\\sqrt M}\\right)Q\\!\\left(\\sqrt{\\tfrac{3\\log_2M}{M-1}\\cdot\\tfrac{E_b}{N_0}}\\right)$，$\\log_2M/(M-1)$ 随M减小 → Q自变量变小 → $P_s$ 增大。",
        "B": "正确。带宽减小+误符号率增大：MQAM是“带宽高效、功率低效”的典型。",
        "C": "错误。带宽方向反了。",
        "D": "错误。两个方向都反。"
      },
      "note": "与参考解析的差异说明：有资料将本题标为A，但其推导只涉及带宽方向。按固定 $E_b/N_0$ 数值验证（$E_b/N_0=10$ dB）：M=4时 $P_s\\approx8\\times10^{-6}$，M=16时 $\\approx7\\times10^{-3}$，M=64时 $\\approx0.16$——明显单调上升，故取B。这也与MFSK形成经典对比：MFSK用带宽换可靠性，MQAM用可靠性换带宽。"
    }
  },
  "2025-二": {
    "sol": {
      "intro": "本题是“随机过程+信号分析”综合题，四问层层递进：(1)(2)先把 $g(t)$ 的频域/相关性质算清，(3)把 $n_B(t)$ 的谱算清，(4)把 $Z_1,Z_2$ 当作滤波器输出采样，套用 $E[Z^2]=\\int P_n(f)|G(f)|^2\\mathrm df$。",
      "steps": [
        {
          "q": "(1) $g(t)$ 的能量谱密度、能量",
          "body": [
            "由变换对 $\\mathrm{sinc}(t/T_s)\\leftrightarrow T_s\\,\\mathrm{rect}(fT_s)$ 得",
            "$$G(f)=\\frac{1}{\\sqrt{T_s}}\\cdot T_s\\,\\mathrm{rect}(fT_s)=\\sqrt{T_s}\\,\\mathrm{rect}(fT_s)$$",
            "能量谱密度即 $|G(f)|^2$：$$E_g(f)=|G(f)|^2=T_s\\,\\mathrm{rect}(fT_s)$$（高为 $T_s$、宽为 $1/T_s$ 的矩形）",
            "能量用帕塞瓦尔定理：$$E_g=\\int_{-\\infty}^{\\infty}|G(f)|^2\\mathrm df=T_s\\cdot\\frac{1}{T_s}=1\\ \\mathrm J$$"
          ],
          "ans": "$G(f)=\\sqrt{T_s}\\,\\mathrm{rect}(fT_s)$；能量谱密度 $T_s\\,\\mathrm{rect}(fT_s)$；能量 $E_g=1$ J"
        },
        {
          "q": "(2) $g(t-T_s)$ 与 $g(t)$ 的内积",
          "body": [
            "$$\\langle g(t-T_s),g(t)\\rangle=\\int_{-\\infty}^{\\infty}g(t-T_s)g(t)\\,\\mathrm dt=R_g(T_s)$$",
            "即 $g$ 的自相关函数在 $\\tau=T_s$ 处的值。自相关与能量谱密度是变换对：",
            "$$R_g(\\tau)\\leftrightarrow E_g(f)=T_s\\,\\mathrm{rect}(fT_s)\\ \\Rightarrow\\ R_g(\\tau)=\\mathrm{sinc}\\!\\left(\\frac{\\tau}{T_s}\\right)$$",
            "$$R_g(T_s)=\\mathrm{sinc}(1)=\\frac{\\sin\\pi}{\\pi}=0$$"
          ],
          "ans": "内积为 0（$\\mathrm{sinc}$ 波形每隔 $T_s$ 恰好过零——奈奎斯特正交性）"
        },
        {
          "q": "(3) $n_B(t)$ 的功率、功率谱密度",
          "body": [
            "功率 = 自相关在零延迟处的值：$$P_{n_B}=R_{n_B}(0)=N_0B\\cdot\\mathrm{sinc}(0)=N_0B$$",
            "对 $R_{n_B}(\\tau)$ 做维纳-辛钦变换，利用 $\\mathrm{sinc}(2B\\tau)\\leftrightarrow\\frac{1}{2B}\\mathrm{rect}\\!\\left(\\frac{f}{2B}\\right)$：",
            "$$P_{n_B}(f)=N_0B\\cdot\\frac{1}{2B}\\,\\mathrm{rect}\\!\\left(\\frac{f}{2B}\\right)=\\frac{N_0}{2}\\,\\mathrm{rect}\\!\\left(\\frac{f}{2B}\\right)$$",
            "即带限白噪声：在 $|f|\\le B$ 内双边谱密度恒为 $N_0/2$，带外为0。"
          ],
          "ans": "$P_{n_B}=N_0B$；$P_{n_B}(f)=\\frac{N_0}{2}\\mathrm{rect}\\!\\left(\\frac{f}{2B}\\right)$",
          "fig": "q2psd"
        },
        {
          "q": "(4) $Z_1$、$Z_2$ 的均值、方差、协方差",
          "body": [
            "均值（$n_B$ 零均值，积分是线性运算）：$$E[Z_1]=\\int E[n_B(t)]g(t)\\,\\mathrm dt=0,\\qquad E[Z_2]=0$$",
            "方差 = $E[Z_1^2]$，把相关函数代入二重积分：",
            "$$D[Z_1]=E\\!\\left[\\iint n_B(t_1)n_B(t_2)g(t_1)g(t_2)\\,\\mathrm dt_1\\mathrm dt_2\\right]=\\iint R_{n_B}(t_1-t_2)\\,g(t_1)g(t_2)\\,\\mathrm dt_1\\mathrm dt_2$$",
            "频域做法（推荐）：$Z_1$ 相当于 $n_B$ 通过匹配滤波器 $g(-t)$ 后在 $t=0$ 的输出，",
            "$$D[Z_1]=\\int_{-\\infty}^{\\infty}P_{n_B}(f)\\,|G(f)|^2\\,\\mathrm df=\\int_{-1/2T_s}^{1/2T_s}\\frac{N_0}{2}\\cdot T_s\\,\\mathrm df=\\frac{N_0}{2}\\qquad(B\\gg1/T_s\\ 时\\ G\\ 全在通带内)$$",
            "时域等价做法：$B$ 充分大时 $R_{n_B}(\\tau)\\to\\frac{N_0}{2}\\delta(\\tau)$（白噪声），$$D[Z_1]=\\frac{N_0}{2}\\int g^2(t)\\,\\mathrm dt=\\frac{N_0}{2}E_g=\\frac{N_0}{2}$$",
            "同理 $D[Z_2]=\\frac{N_0}{2}\\int g^2(t-T_s)\\mathrm dt=\\frac{N_0}{2}$。",
            "协方差（用(2)的正交性）：",
            "$$\\mathrm{Cov}(Z_1,Z_2)=E[Z_1Z_2]=\\frac{N_0}{2}\\int g(t)\\,g(t-T_s)\\,\\mathrm dt=\\frac{N_0}{2}\\times0=0$$",
            "结论：$Z_1,Z_2$ 是零均值、方差 $N_0/2$ 的联合高斯变量且不相关 → 相互独立。"
          ],
          "ans": "$E[Z_1]=E[Z_2]=0$；$D[Z_1]=D[Z_2]=\\dfrac{N_0}{2}$；$\\mathrm{Cov}(Z_1,Z_2)=0$（从而 $Z_1\\perp Z_2$）"
        }
      ],
      "summary": "(1) $E_g(f)=T_s\\mathrm{rect}(fT_s)$，$E_g=1$ J；(2) 内积0；(3) $P=N_0B$，谱为高 $N_0/2$ 宽 $2B$ 的矩形；(4) 均值0、方差 $N_0/2$、协方差0。",
      "pitfalls": "①方差计算最容易错在漏掉 $\\tfrac{N_0}{2}$ 的双边谱系数；②“B充分大”的意义就是把带限白噪声当理想白噪声用 $\\delta$ 近似；③(2)的内积本质是 $\\mathrm{sinc}$ 的Nyquist零点，别去硬积分。"
    }
  },
  "2025-三": {
    "sol": {
      "intro": "SSB相干解调标准题。链路：功率按余弦 $A^2/2$ 拆算 → 希尔伯特逐分量相移 $-90^\\circ$ → 复包络直接写出 → 输出SNR用制度增益 $G_{SSB}=1$ 或逐级推算。",
      "steps": [
        {
          "q": "(1) $m(t)$ 的功率、功率谱密度",
          "body": [
            "余弦分量功率 $A^2/2$：",
            "$$P_m=\\frac{2^2}{2}+\\frac{1^2}{2}=2+0.5=2.5\\ \\mathrm W$$",
            "单频余弦 $A\\cos2\\pi f_0t$ 的功率谱为 $\\frac{A^2}{4}[\\delta(f-f_0)+\\delta(f+f_0)]$，故",
            "$$P_m(f)=\\big[\\delta(f-400)+\\delta(f+400)\\big]+\\frac14\\big[\\delta(f-900)+\\delta(f+900)\\big]$$",
            "（两条频率线：$f_1=800\\pi/2\\pi=400\\,$Hz，$f_2=1800\\pi/2\\pi=900\\,$Hz）"
          ],
          "ans": "$P_m=2.5$ W；$P_m(f)=\\delta(f\\mp400)+\\tfrac14\\delta(f\\mp900)$",
          "fig": "q3psd"
        },
        {
          "q": "(2) $\\hat m(t)$ 的时域表达式",
          "body": [
            "希尔伯特变换对实余弦是相移 $-90^\\circ$：$\\cos\\omega t\\to\\sin\\omega t$（对每个频率分量单独做）：",
            "$$\\hat m(t)=2\\sin(800\\pi t)+\\sin(1800\\pi t)$$"
          ],
          "ans": "$\\hat m(t)=2\\sin(800\\pi t)+\\sin(1800\\pi t)$"
        },
        {
          "q": "(3) 复包络 $s_L(t)$ 的时域表达式",
          "body": [
            "按定义：$$s_L(t)=m(t)+\\mathrm j\\hat m(t)$$",
            "代入得 $$s_L(t)=2\\mathrm e^{\\mathrm j800\\pi t}+\\mathrm e^{\\mathrm j1800\\pi t}$$",
            "展开验证：$2(\\cos800\\pi t+\\mathrm j\\sin800\\pi t)+(\\cos1800\\pi t+\\mathrm j\\sin1800\\pi t)$，实部虚部成对，只有正频率分量——这正是上边带SSB的特征。"
          ],
          "ans": "$s_L(t)=2\\mathrm e^{\\mathrm j800\\pi t}+\\mathrm e^{\\mathrm j1800\\pi t}$"
        },
        {
          "q": "(4) 解调输出信噪比",
          "body": [
            "①信号功率：SSB信号功率等于基带信号功率（$P_s=\\tfrac12P_{s_L}=\\tfrac12(P_m+P_{\\hat m})=P_m$）：",
            "$$P_s=P_m=2.5\\ \\mathrm W$$",
            "②带通滤波器5~6 kHz恰好覆盖上边带频谱（$f_c+f_m\\in[5.4,5.9]$ kHz），信号无损失通过；BPF带宽 $B=1\\,$kHz，输出窄带噪声功率：",
            "$$P_n=N_0B=5\\times10^{-7}\\times10^3=5\\times10^{-4}\\ \\mathrm W$$",
            "③相干解调（乘 $2\\cos$ 取低通）：输出信号为 $m(t)/2$、噪声为同相分量 $n_c(t)/2$，二者同除以4，",
            "$$\\left(\\frac SN\\right)_o=\\frac{P_m/4}{P_n/4}=\\frac{P_m}{P_n}=\\frac{2.5}{5\\times10^{-4}}=5000\\ (\\approx37\\,\\mathrm{dB})$$",
            "与制度增益法核对：$G_{SSB}=1$，$(S/N)_o=(S/N)_i=P_s/P_n=5000$ ✓"
          ],
          "ans": "输出信噪比 $=5000$（约37 dB）"
        }
      ],
      "summary": "(1) $P_m=2.5$ W；(2) $\\hat m=2\\sin800\\pi t+\\sin1800\\pi t$；(3) $s_L=2e^{j800\\pi t}+e^{j1800\\pi t}$；(4) 5000（37 dB）。",
      "pitfalls": "①单边谱 $N_0$ 直接乘BPF带宽得噪声功率（不要自己再除以2）；②SSB制度增益为1，DSB为2——但DSB信号功率只有 $P_m$ 的一半，两者最终输出SNR相同，这是经典结论；③(1)中两条谱线的强度是 $A^2/4$ 不是 $A^2/2$。"
    }
  },
  "2025-四": {
    "sol": {
      "intro": "模型：理想PAM链路 + 一个延迟 $2T_s$ 的反射回波（多径）。核心工具：PAM信号功率谱公式 $P(f)=\\frac{\\sigma_a^2}{T_s}|G(f)|^2$（零均值无离散线谱）、级联传递函数相乘、奈奎斯特采样无ISI。",
      "steps": [
        {
          "q": "(1) 信道传递函数 $C(f)$ 与冲激响应 $c(t)$",
          "body": [
            "$y(t)=s(t)*[\\delta(t)-\\delta(t-2T_s)]$，故",
            "$$c(t)=\\delta(t)-\\delta(t-2T_s)$$",
            "$$C(f)=1-\\mathrm e^{-\\mathrm j4\\pi fT_s}=\\mathrm e^{-\\mathrm j2\\pi fT_s}\\cdot2\\mathrm j\\sin(2\\pi fT_s)$$"
          ],
          "ans": "$C(f)=1-e^{-j4\\pi fT_s}$；$c(t)=\\delta(t)-\\delta(t-2T_s)$"
        },
        {
          "q": "(2) $d(t)$、$s(t)$、$y(t)$ 的功率谱密度",
          "body": [
            "$d(t)$：冲激序列携带零均值、不相关、方差 $\\sigma_a^2=1$ 的权重，PAM功率谱公式（无直流 → 无离散线谱项）：",
            "$$P_d(f)=\\frac{\\sigma_a^2}{T_s}=\\frac{1}{T_s}$$",
            "$s(t)$：线性调制谱 $P_s(f)=P_d(f)|G_T(f)|^2$：",
            "$$P_s(f)=\\frac{1}{T_s}\\cdot T_s\\,\\mathrm{rect}(fT_s)=\\mathrm{rect}(fT_s)$$",
            "$y(t)$：信道滤波 $P_y(f)=P_s(f)|C(f)|^2$，$|C(f)|^2=|1-e^{-j4\\pi fT_s}|^2=2-2\\cos4\\pi fT_s=4\\sin^2(2\\pi fT_s)$：",
            "$$P_y(f)=4\\sin^2(2\\pi fT_s)\\cdot\\mathrm{rect}(fT_s)$$"
          ],
          "ans": "$P_d(f)=1/T_s$；$P_s(f)=\\mathrm{rect}(fT_s)$；$P_y(f)=4\\sin^2(2\\pi fT_s)\\mathrm{rect}(fT_s)$"
        },
        {
          "q": "(3) A→B总体传递函数 $X(f)$ 与冲激响应 $x(t)$",
          "body": [
            "三级联相乘：$$X(f)=G_T(f)\\cdot C(f)\\cdot G_R(f)=T_s\\,\\mathrm{rect}(fT_s)\\left[1-\\mathrm e^{-\\mathrm j4\\pi fT_s}\\right]$$",
            "时域：先算 $g_T*g_R$：$G_TG_R=T_s\\mathrm{rect}(fT_s)\\leftrightarrow\\mathrm{sinc}(t/T_s)$，再卷 $c(t)$：",
            "$$x(t)=\\mathrm{sinc}\\!\\left(\\frac t{T_s}\\right)-\\mathrm{sinc}\\!\\left(\\frac{t-2T_s}{T_s}\\right)$$"
          ],
          "ans": "$X(f)=T_s\\mathrm{rect}(fT_s)(1-e^{-j4\\pi fT_s})$；$x(t)=\\mathrm{sinc}(t/T_s)-\\mathrm{sinc}((t-2T_s)/T_s)$",
          "fig": "q4x"
        },
        {
          "q": "(4) 采样值 $v_k$ 与噪声功率",
          "body": [
            "接收滤波器输出 $v(t)=\\sum_m a_m x(t-mT_s)+n_R(t)$，在 $t=kT_s$ 采样：",
            "$$v_k=\\sum_{m=-\\infty}^{\\infty}a_m\\,x\\big((k-m)T_s\\big)+n_k$$",
            "关键：算 $x$ 在抽样时刻的取值——",
            "$$x(jT_s)=\\mathrm{sinc}(j)-\\mathrm{sinc}(j-2)=\\begin{cases}1,&j=0\\\\-1,&j=2\\\\0,&\\text{其他}\\end{cases}$$",
            "于是 $$v_k=a_k-a_{k-2}+n_k$$",
            "$-a_{k-2}$ 正是延迟 $2T_s$ 的回波造成的码间串扰项。",
            "噪声：$n_R(t)=n_w(t)*g_R(t)$，输出噪声功率",
            "$$P_n=\\int_{-\\infty}^{\\infty}\\frac{N_0}{2}|G_R(f)|^2\\,\\mathrm df=\\frac{N_0}{2}\\,T_s\\cdot\\frac{1}{T_s}=\\frac{N_0}{2}$$"
          ],
          "ans": "$v_k=a_k-a_{k-2}+n_k$；噪声功率 $P_n=N_0/2$"
        }
      ],
      "summary": "(1) $C=1-e^{-j4\\pi fT_s}$；(2) $1/T_s$、$\\mathrm{rect}(fT_s)$、$4\\sin^2(2\\pi fT_s)\\mathrm{rect}(fT_s)$；(3) $X=T_s\\mathrm{rect}\\cdot C$，$x=\\mathrm{sinc}(t/T_s)-\\mathrm{sinc}((t-2T_s)/T_s)$；(4) $v_k=a_k-a_{k-2}+n_k$，$P_n=N_0/2$。",
      "pitfalls": "①零均值序列没有离散谱线项（$m_a=0$ → 第二项为0）；②$|C|^2$ 别忘乘4（$2-2\\cos\\theta=4\\sin^2\\frac\\theta2$）；③抽样时刻取值靠sinc整数零点秒算，不要硬代积分。"
    }
  },
  "2025-五": {
    "sol": {
      "intro": "相关接收机标准题：$y$ 在两种假设下是条件高斯变量（均值0或 $E_1$，方差相同）。等概取均值中点为门限；非等概时门限应偏移，本题固定门限，只需重新加权平均错误概率。",
      "steps": [
        {
          "q": "(1) $E_1$ 与 $E_b$",
          "body": [
            "$$E_1=\\int_0^{T_b}A^2\\cos^2(2\\pi f_ct)\\,\\mathrm dt=\\frac{A^2}{2}\\int_0^{T_b}\\big[\\cos(4\\pi f_ct)+1\\big]\\mathrm dt=\\frac{A^2T_b}{2}+\\underbrace{\\frac{A^2}{4f_c}\\sin(4\\pi f_cT_b)}_{\\approx0\\ (f_c\\gg1/T_b)}$$",
            "$$E_1=\\frac{A^2T_b}{2},\\qquad E_2=0$$",
            "平均比特能量按概率加权：$$E_b=pE_1+(1-p)E_2=\\frac{pA^2T_b}{2}\\ \\xrightarrow{\\ p=1/2\\ }\\ \\frac{A^2T_b}{4}=\\frac{E_1}{2}$$"
          ],
          "ans": "$E_1=A^2T_b/2$；$E_b=pE_1$（$p=1/2$ 时 $E_b=A^2T_b/4$）"
        },
        {
          "q": "(2) 噪声分量功率 $\\sigma^2$",
          "body": [
            "噪声分量 $Z=\\int_0^{T_b}n_w(t)s_1(t)\\,\\mathrm dt$。$n_w$ 双边谱为 $N_0/2$（题给单边 $N_0$），",
            "$$\\sigma^2=D[Z]=E[Z^2]=\\iint E[n_w(t_1)n_w(t_2)]\\,s_1(t_1)s_1(t_2)\\,\\mathrm dt_1\\mathrm dt_2=\\iint\\frac{N_0}{2}\\delta(t_2-t_1)s_1(t_1)s_1(t_2)\\,\\mathrm dt_1\\mathrm dt_2$$",
            "$$=\\frac{N_0}{2}\\int_0^{T_b}s_1^2(t)\\,\\mathrm dt=\\frac{N_0}{2}E_1=\\frac{N_0A^2T_b}{4}$$"
          ],
          "ans": "$\\sigma^2=\\dfrac{N_0}{2}E_1=\\dfrac{N_0A^2T_b}{4}=N_0E_b\\ (p=\\tfrac12)$"
        },
        {
          "q": "(3) 等概最佳门限与 $P_b$",
          "body": [
            "发“1”时 $y=E_1+Z\\sim N(E_1,\\sigma^2)$；发“0”时 $y=Z\\sim N(0,\\sigma^2)$。等先验时最佳门限取两条件PDF交点（均值中点）：",
            "$$V_T=\\frac{E_1}{2}=\\frac{A^2T_b}{4}=E_b$$",
            "两条件错误概率对称相等，各为尾部面积（用 $\\mathrm{erfc}$ 表示）：",
            "$$P(e|s_1)=P(y<V_T|s_1)=\\frac12\\,\\mathrm{erfc}\\!\\left(\\frac{V_T}{\\sqrt2\\,\\sigma}\\right)=\\frac12\\,\\mathrm{erfc}\\!\\left(\\sqrt{\\frac{E_1}{4N_0}}\\right)$$",
            "$$P_b=\\tfrac12P(e|s_1)+\\tfrac12P(e|s_2)=\\frac12\\,\\mathrm{erfc}\\!\\left(\\sqrt{\\frac{E_1}{4N_0}}\\right)=\\frac12\\,\\mathrm{erfc}\\!\\left(\\sqrt{\\frac{2E_b}{4N_0}}\\right)=\\frac12\\,\\mathrm{erfc}\\!\\left(\\sqrt{\\frac{E_b}{2N_0}}\\right)=Q\\!\\left(\\sqrt{\\frac{E_b}{N_0}}\\right)$$",
            "注意OOK相干解调比2PSK差3dB——因为“0”信号不含能量，星座距离只有 $E_1$ 而非 $2E_1$。"
          ],
          "ans": "$V_T=E_1/2=E_b=A^2T_b/4$；$P_b=\\frac12\\mathrm{erfc}\\!\\left(\\sqrt{E_b/2N_0}\\right)=Q(\\sqrt{E_b/N_0})$",
          "fig": "ookpdf"
        },
        {
          "q": "(4) $p<1/2$、门限不变时的 $P_b$",
          "body": [
            "门限仍固定在 $V_T=E_1/2$，两个条件错误概率依然相等（对称）：",
            "$$P(e|s_1)=P(e|s_2)=\\frac12\\,\\mathrm{erfc}\\!\\left(\\sqrt{\\frac{E_1}{4N_0}}\\right)$$",
            "按先验加权：",
            "$$P_b=pP(e|s_1)+(1-p)P(e|s_2)=\\frac12\\,\\mathrm{erfc}\\!\\left(\\sqrt{\\frac{E_1}{4N_0}}\\right)$$",
            "此时平均比特能量 $E_b=pE_1\\Rightarrow E_1=E_b/p$，代入：",
            "$$\\boxed{P_b=\\frac12\\,\\mathrm{erfc}\\!\\left(\\sqrt{\\frac{E_b}{4pN_0}}\\right)}$$",
            "讨论：$p$ 减小 → 同样的 $E_b/N_0$ 下 $P_b$ 变差（$1/4p$ 增大）；且此时 $E_1/2$ 已不是最佳门限——非等概的最佳门限应向“1”的均值 $E_1$ 方向偏移（$V^*=\\frac{\\sigma^2}{E_1}\\ln\\frac{1-p}{p}+\\frac{E_1}{2}>\\frac{E_1}{2}$），减小“多数符号”被错的机会。"
          ],
          "ans": "$P_b=\\dfrac12\\,\\mathrm{erfc}\\!\\left(\\sqrt{\\dfrac{E_b}{4pN_0}}\\right)$（门限固定于 $E_1/2$）"
        }
      ],
      "summary": "(1) $E_1=A^2T_b/2$、$E_b=pE_1$；(2) $\\sigma^2=N_0E_1/2$；(3) $V_T=E_1/2$，$P_b=\\frac12\\mathrm{erfc}\\sqrt{E_b/2N_0}$；(4) $P_b=\\frac12\\mathrm{erfc}\\sqrt{E_b/4pN_0}$。",
      "pitfalls": "①单边 $N_0$ → 二重积分里用 $\\frac{N_0}{2}\\delta$，别再除2；②erfc与Q换算 $\\frac12\\mathrm{erfc}(x)=Q(x\\sqrt2)$，代入时最容易差 $\\sqrt2$；③(4)的含义：先验不等时固定中点门限必非最佳。"
    }
  },
  "2025-六": {
    "sol": {
      "intro": "星座图三大件：能量（模方平均）、最小距离（相邻点弦长）、判决域（相邻点连线的垂直平分线围成的沃罗诺伊区域）。",
      "steps": [
        {
          "q": "(1) 星座图、ML判决域与格雷映射",
          "body": [
            "8个点均匀分布在单位圆上：$s_8$ 在 $0^\\circ$，$s_1$ 在 $45^\\circ$，……$s_6$ 在 $270^\\circ$。",
            "ML判决域：$s_i$ 的判决域是 $s_i$ 与相邻点连线的垂直平分线所围扇形——8PSK中即过原点、方位角为 $22.5^\\circ+45^\\circ k$ 的8条射线围成8个 $45^\\circ$ 扇区 $D_1\\sim D_8$。",
            "格雷映射：相邻星座点只差1个比特（沿圆周走一圈为格雷码序列）：",
            "$$s_1{=}000,\\ s_2{=}001,\\ s_3{=}011,\\ s_4{=}010,\\ s_5{=}110,\\ s_6{=}111,\\ s_7{=}101,\\ s_8{=}100$$"
          ],
          "ans": "见下图（8个 $45^\\circ$ 扇区，格雷码沿圆周排布）",
          "fig": "psk8"
        },
        {
          "q": "(2) $E_s$ 与 $d_{\\min}$",
          "body": [
            "所有点都在单位圆上：$$E_s=\\frac18\\sum_{i=1}^8|s_i|^2=\\frac18\\times8\\times1=1\\ \\mathrm J$$",
            "最小距离取相邻两点（圆心角 $\\Delta\\theta=45^\\circ$）的弦长——等腰三角形顶角 $\\Delta\\theta$、腰长1，故 $d=2\\sin\\frac{\\Delta\\theta}{2}$：",
            "$$d_{\\min}=|s_8-s_1|=2\\sin\\frac{45^\\circ}{2}=2\\sin\\frac{\\pi}{8}\\approx0.765$$"
          ],
          "ans": "$E_s=1$ J；$d_{\\min}=2\\sin(\\pi/8)\\approx0.765$"
        },
        {
          "q": "(3) 发 $s_8$ 错判为 $s_1$ 的近似概率",
          "body": [
            "$s_8=(1,0)$、$s_1=(\\tfrac{\\sqrt2}2,\\tfrac{\\sqrt2}2)$，两者距离 $d_{\\min}=2\\sin\\frac\\pi8$。",
            "$\\sigma^2\\ll1$ 时错误几乎只发生在与最近邻的边界上：错判为 $s_1$ ⇔ 二维高斯点越过 $s_8$、$s_1$ 连线的垂直平分线。该平分线到 $s_8$ 的距离为 $\\dfrac{d_{\\min}}2=\\sin\\dfrac\\pi8$，而 $z$ 沿该方向的投影是 $N(0,\\sigma^2)$，故",
            "$$P(s_1|s_8)\\approx Q\\!\\left(\\frac{d_{\\min}}{2\\sigma}\\right)=Q\\!\\left(\\frac{\\sin(\\pi/8)}{\\sigma}\\right)=\\frac12\\,\\mathrm{erfc}\\!\\left(\\frac{\\sin(\\pi/8)}{\\sqrt2\\,\\sigma}\\right)$$",
            "（等价写法 $\\frac12\\mathrm{erfc}\\sqrt{\\dfrac{(d_{\\min}/2)^2}{2\\sigma^2}}$；其余更远的点被忽略，这是小噪声下的标准近邻近似。）"
          ],
          "ans": "$P(s_1|s_8)\\approx Q\\left(\\dfrac{\\sin(\\pi/8)}{\\sigma}\\right)=\\dfrac12\\,\\mathrm{erfc}\\!\\left(\\dfrac{\\sin(\\pi/8)}{\\sqrt2\\sigma}\\right)$"
        },
        {
          "q": "(4) 新星座 $\\Omega'$ 的 $E_s'$、$d'_{\\min}$ 与判决域",
          "body": [
            "$s_1,s_3,s_5,s_7$（$45^\\circ$ 奇数方位）缩为半径 $1/2$，$s_2,s_4,s_6,s_8$（轴上）保持半径1。",
            "平均符号能量：$$E_s'=\\frac{4\\times1+4\\times\\frac14}{8}=\\frac{4+1}{8}=\\frac58\\ \\mathrm J$$",
            "候选距离只有三类（内点4个、外点4个）：内-内 $d_{13}=2\\times\\tfrac12\\times\\sin45^\\circ=\\dfrac{\\sqrt2}{2}\\approx0.707$；内-外（相邻）$d_{12}=\\sqrt{\\left(1-\\tfrac{\\sqrt2}{4}\\right)^2+\\tfrac18}=\\sqrt{\\tfrac54-\\tfrac{\\sqrt2}{2}}\\approx0.737$；外-外 $d_{82}=\\sqrt2\\approx1.414$。",
            "$$d'_{\\min}=\\frac{\\sqrt2}{2}\\approx0.707\\quad(\\text{出现在两个相邻内点之间})$$",
            "ML 判决域：内点（半径 $1/2$）之间仍以过原点的坐标轴为界，故 4 个内点各占原点附近的一个象限；内点与其最近的外点之间以中垂线为界，该中垂线与坐标轴的交点距原点 $\\dfrac{1^2-(1/2)^2}{2\\cdot(1-\\sqrt2/4)}=\\dfrac{0.375}{0.6464}\\approx0.580$，于是外点的判决域是顶点在 $(\\pm0.580,0)$、$(0,\\pm0.580)$、半张角约 $61.3^\\circ$ 的楔形（见图），边界不再过原点。"
          ],
          "ans": "$E_s'=\\dfrac58$ J；$d'_{\\min}=\\dfrac{\\sqrt2}2\\approx0.707$",
          "fig": "psk8new"
        }
      ],
      "summary": "(1) 见psk8图；(2) $E_s=1$、$d_{\\min}=2\\sin\\frac\\pi8$；(3) $\\frac12\\mathrm{erfc}\\left(\\frac{\\sin(\\pi/8)}{\\sqrt2\\sigma}\\right)$；(4) $E_s'=\\frac58$、$d'_{\\min}=\\frac{\\sqrt2}2$。",
      "pitfalls": "①弦长公式 $d=2\\sin(\\Delta\\theta/2)$；②(3)的关键几何量是“半距” $d_{\\min}/2$，Q与erfc换算别差 $\\sqrt2$；③(4)最小距离在内点之间，不是内外点之间；判决域边界不过原点。"
    }
  },
  "2025-七": {
    "sol": {
      "intro": "四电平最佳量化器题。p(x)是偶对称三角分布；(3)既可对 $f(a,b)$ 求偏导，也可直接引用Lloyd-Max条件“输出电平=区间条件均值”，两法互相验证。",
      "steps": [
        {
          "q": "(1) $E[X^2]$",
          "body": [
            "偶对称，取正半轴二倍：",
            "$$E[X^2]=\\int_{-4}^4x^2\\frac{4-|x|}{16}\\,\\mathrm dx=\\frac{2}{16}\\int_0^4x^2(4-x)\\,\\mathrm dx=\\frac18\\left[\\frac{4x^3}{3}-\\frac{x^4}{4}\\right]_0^4$$",
            "$$=\\frac18\\left(\\frac{256}{3}-64\\right)=\\frac18\\times\\frac{64}{3}=\\frac83$$"
          ],
          "ans": "$E[X^2]=\\dfrac83$"
        },
        {
          "q": "(2) $E[Y^2]$、$E[XY]$、$E[(X-Y)^2]$",
          "body": [
            "输出电平的概率（先算右半轴再翻倍）：",
            "$$P(Y=a)=P(0<X<2)=\\int_0^2\\frac{4-x}{16}\\mathrm dx=\\frac{1}{16}\\left(8-2\\right)=\\frac38,\\qquad P(Y=-a)=\\frac38$$",
            "$$P(Y=b)=P(2\\le X\\le4)=\\frac1{16}\\int_2^4(4-x)\\mathrm dx=\\frac18,\\qquad P(Y=-b)=\\frac18$$",
            "$$E[Y^2]=2\\left(a^2\\cdot\\frac38+b^2\\cdot\\frac18\\right)=\\frac{3a^2+b^2}{4}$$",
            "$E[XY]$：",
            "$$E[XY]=2\\left[\\int_0^2ax\\,p(x)\\mathrm dx+\\int_2^4bx\\,p(x)\\mathrm dx\\right]$$",
            "$$\\int_0^2x\\frac{4-x}{16}\\mathrm dx=\\frac1{16}\\left[2x^2-\\frac{x^3}3\\right]_0^2=\\frac13,\\qquad \\int_2^4x\\frac{4-x}{16}\\mathrm dx=\\frac1{16}\\left[2x^2-\\frac{x^3}3\\right]_2^4=\\frac13$$",
            "$$E[XY]=2\\left(\\frac a3+\\frac b3\\right)=\\frac23(a+b)$$",
            "量化噪声功率（展开式）：",
            "$$E[(X-Y)^2]=E[X^2]-2E[XY]+E[Y^2]=\\frac83-\\frac43(a+b)+\\frac{3a^2+b^2}{4}\\equiv f(a,b)$$"
          ],
          "ans": "$E[Y^2]=\\frac{3a^2+b^2}4$；$E[XY]=\\frac23(a+b)$；$E[(X-Y)^2]=\\frac83-\\frac43(a+b)+\\frac{3a^2+b^2}4$",
          "fig": "q7quant"
        },
        {
          "q": "(3) 最小化 $f(a,b)$",
          "body": [
            "一阶条件：$$\\frac{\\partial f}{\\partial a}=-\\frac43+\\frac32a=0\\ \\Rightarrow\\ a=\\frac89,\\qquad \\frac{\\partial f}{\\partial b}=-\\frac43+\\frac b2=0\\ \\Rightarrow\\ b=\\frac83$$",
            "二阶判定：$\\dfrac{\\partial^2f}{\\partial a^2}=\\dfrac32>0,\\ \\dfrac{\\partial^2f}{\\partial b^2}=\\dfrac12>0,\\ \\dfrac{\\partial^2f}{\\partial a\\partial b}=0$ → Hessian正定，为极小值；且 $0<\\frac89<2$、$2<\\frac83<4$ 满足约束 ✓。",
            "交叉验证（Lloyd-Max条件：输出电平=划分区间的条件均值）：",
            "$$a=\\frac{\\int_0^2x\\,p(x)\\mathrm dx}{\\int_0^2p(x)\\mathrm dx}=\\frac{1/3}{3/8}=\\frac89\\ ✓,\\qquad b=\\frac{\\int_2^4x\\,p(x)\\mathrm dx}{\\int_2^4p(x)\\mathrm dx}=\\frac{1/3}{1/8}=\\frac83\\ ✓$$"
          ],
          "ans": "$a=\\dfrac89,\\ b=\\dfrac83$"
        }
      ],
      "summary": "(1) $8/3$；(2) $\\frac{3a^2+b^2}4$、$\\frac23(a+b)$、$f(a,b)$；(3) $a=8/9$、$b=8/3$（Lloyd-Max最佳量化器）。",
      "pitfalls": "①区间概率 $3/8$ 与 $1/8$ 别搞反（内侧宽、外侧窄）；②$E[(X-Y)^2]$ 直接展开比先求 $Y$ 分布再积分快得多；③(3)用条件均值秒算并可反验偏导法。"
    }
  },
  "2025-八": {
    "sol": {
      "intro": "信息论基础题。信道把每个输入以概率1/2“原样输出”、概率1/2“打成3”——画转移图后逐项套定义即可。",
      "steps": [
        {
          "q": "(1) $Y$ 的分布",
          "body": [
            "$$P(Y=0)=P(Y=1)=P(Y=2)=P(X=i)\\cdot P(Y=i|X=i)=\\frac13\\times\\frac12=\\frac16$$",
            "$$P(Y=3)=\\sum_iP(X=i,Y=3)=3\\times\\frac13\\times\\frac12=\\frac12$$",
            "校验：$\\frac16\\times3+\\frac12=1$ ✓"
          ],
          "ans": "$P(Y)=\\{1/6,\\,1/6,\\,1/6,\\,1/2\\}$",
          "fig": "q8chan"
        },
        {
          "q": "(2) 联合分布",
          "body": [
            "$$P(X=i,Y=i)=\\frac13\\times\\frac12=\\frac16,\\qquad P(X=i,Y=3)=\\frac13\\times\\frac12=\\frac16\\quad(i=0,1,2)$$",
            "其余 $P(X=i,Y=j)=0$（$j\\ne i,3$）。非零格共6个、均匀为 $1/6$。"
          ],
          "ans": "联合分布：对角格 $(i,i)$ 与末行格 $(i,3)$ 各 $1/6$，其余为0"
        },
        {
          "q": "(3) 各熵",
          "body": [
            "$$H(X)=\\log_23\\approx1.585\\ \\mathrm{bit/符号}$$",
            "$$H(Y)=3\\times\\frac16\\log_26+\\frac12\\log_22=\\frac12\\log_26+\\frac12=\\frac12\\log_2{12}\\approx1.79\\ \\mathrm{bit/符号}$$",
            "$$H(X,Y)=6\\times\\frac16\\log_26=\\log_26\\approx2.585\\ \\mathrm{bit/符号对}$$",
            "条件熵用链式法则：$$H(Y|X)=H(X,Y)-H(X)=\\log_26-\\log_23=\\log_22=1\\ \\mathrm{bit/符号对}$$",
            "直观验证：固定 $X=i$ 后，$Y$ 以1/2取 $i$、1/2取3——恰是1 bit的不确定性 ✓"
          ],
          "ans": "$H(X)=\\log_23$；$H(Y)=\\frac12\\log_2{12}$；$H(X,Y)=\\log_26$；$H(Y|X)=1$ bit"
        },
        {
          "q": "(4) 互信息",
          "body": [
            "$$I(X;Y)=H(Y)-H(Y|X)=\\frac12\\log_2{12}-1=\\frac12\\log_2{12}-\\frac12\\log_24=\\frac12\\log_23\\approx0.792\\ \\mathrm{bit/符号}$$",
            "合理性：$Y$ 只有1/2的“原样直通”概率携带关于 $X$ 的信息，$\\frac12H(X)=\\frac12\\log_23$ 与结果吻合。"
          ],
          "ans": "$I(X;Y)=\\dfrac12\\log_23\\approx0.792$ bit/符号"
        }
      ],
      "summary": "(1) $\\{1/6,1/6,1/6,1/2\\}$；(2) 6个 $1/6$；(3) $\\log_23$、$\\frac12\\log_2{12}$、$\\log_26$、1 bit；(4) $\\frac12\\log_23$。",
      "pitfalls": "①$H(Y)$ 别漏 $P(Y=3)=1/2$ 的贡献；②$H(Y|X)$ 用 $H(X,Y)-H(X)$ 比按定义逐格求和快；③熵单位统一写“bit/符号”。"
    }
  },
  "2025-九": {
    "sol": {
      "intro": "两级编码：$\\boldsymbol b=\\boldsymbol uG_1$（线性变换），$\\boldsymbol c=\\boldsymbol b\\circledast g$（与 $g=(1101)$ 的离散卷积/多项式乘法，模2）。伴随式译码：$\\boldsymbol s=\\boldsymbol yH^\\mathrm T$，非零 $\\boldsymbol s$ 等于 $H$ 的某一列时按列定位错误。",
      "steps": [
        {
          "q": "(1) $\\boldsymbol b$ 为1000/0100/0010/0001的编码",
          "body": [
            "卷积 $\\boldsymbol c=\\boldsymbol b*g$，$g=(1,1,0,1)$——$\\boldsymbol b$ 的每个1在其位置及其后1、后3位“铺”出 $g$ 的图样：",
            "$$1000\\to1101000,\\quad 0100\\to0110100,\\quad 0010\\to0011010,\\quad 0001\\to0001101$$"
          ],
          "ans": "1101000、0110100、0011010、0001101"
        },
        {
          "q": "(2) $\\boldsymbol u$ 为1000/0100/0010/0001的编码",
          "body": [
            "先 $\\boldsymbol b=\\boldsymbol uG_1$（= $G_1$ 的行：1110、0111、0011、0001），再卷 $g$：",
            "$$1000\\to b=1110\\to c=1101000\\oplus0110100\\oplus0011010=1000110$$",
            "$$0100\\to b=0111\\to c=0110100\\oplus0011010\\oplus0001101=0100011$$",
            "$$0010\\to b=0011\\to c=0011010\\oplus0001101=0010111$$",
            "$$0001\\to b=0001\\to c=0001101$$",
            "（四个结果恰为 $G=G_1G_2$ 的四行）"
          ],
          "ans": "1000110、0100011、0010111、0001101"
        },
        {
          "q": "(3) $G_2$、$G$ 与校验矩阵 $H$",
          "body": [
            "卷积生成矩阵（$g$ 的Toeplitz阶梯）：",
            "$$G_2=\\begin{pmatrix}1&1&0&1&0&0&0\\\\0&1&1&0&1&0&0\\\\0&0&1&1&0&1&0\\\\0&0&0&1&1&0&1\\end{pmatrix}$$",
            "$$G=G_1G_2=\\begin{pmatrix}1&0&0&0&1&1&0\\\\0&1&0&0&0&1&1\\\\0&0&1&0&1&1&1\\\\0&0&0&1&1&0&1\\end{pmatrix}=(I_4\\,|\\,Q),\\qquad Q=\\begin{pmatrix}1&1&0\\\\0&1&1\\\\1&1&1\\\\1&0&1\\end{pmatrix}$$",
            "（$G$ 恰为系统形式，前4位即信息位——两问(2)的结果可直接核对。）",
            "标准型校验矩阵：",
            "$$H=(Q^\\mathrm T|I_3)=\\begin{pmatrix}1&0&1&1&1&0&0\\\\1&1&1&0&0&1&0\\\\0&1&1&1&0&0&1\\end{pmatrix}$$"
          ],
          "ans": "$G_2$ 如上；$G=(I_4|Q)$；$H=(Q^T|I_3)$"
        },
        {
          "q": "(4) 最小码距",
          "body": [
            "系统码的最小码距 = 最小码字重量。生成矩阵各行重量为4、4、4、3；任意行组合的重量均 $\\ge3$（如行4单独为3），且 $H$ 的7列两两互异 → 任意两列线性无关 → 无重量1、2的码字。",
            "$$d_{\\min}=3\\quad(\\text{可纠}1\\text{位错、检}2\\text{位错})$$"
          ],
          "ans": "$d_{\\min}=3$"
        },
        {
          "q": "(5) 伴随式译码 $y=1110111$",
          "body": [
            "$$\\boldsymbol s=\\boldsymbol yH^\\mathrm T$$",
            "逐行：$s_1=1{+}0{+}1{+}0{+}1{+}0{+}0=1$（模2），$s_2=1{+}1{+}1{+}0{+}0{+}1{+}0=0$，$s_3=0{+}1{+}1{+}0{+}0{+}0{+}1=1$，",
            "$$\\boldsymbol s=(1,0,1)$$",
            "$\\boldsymbol s$ 恰等于 $H$ 的第4列 $(1,0,1)^\\mathrm T$ → 第4位最可能出错：",
            "$$\\boldsymbol e=(0001000),\\qquad \\hat{\\boldsymbol y}=\\boldsymbol y\\oplus\\boldsymbol e=1111111$$",
            "$\\hat{\\boldsymbol y}$ 为系统码 → 信息位直接读出前4位：$\\boldsymbol u=(1111)$。",
            "核对：$\\boldsymbol u=1111\\Rightarrow\\boldsymbol c=G$ 四行之异或 $=1111111$ ✓"
          ],
          "ans": "$\\boldsymbol s=(101)$；第4位错；$\\boldsymbol u=(1111)$"
        }
      ],
      "summary": "(1) 1101000/0110100/0011010/0001101；(2) 1000110/0100011/0010111/0001101；(3) $G_2$、$G=(I|Q)$、$H=(Q^T|I)$；(4) $d_{\\min}=3$；(5) $s=(101)$→第4位错→$u=1111$。",
      "pitfalls": "①(2)要先做 $G_1$ 变换再卷积，顺序别反；②$H$ 的列向量与伴随式一一对应是定位错误的关键，列顺序勿错位；③$d_{\\min}$ 也可由“$H$ 任意 $d-1$ 列线性无关”论证。"
    }
  }
};
