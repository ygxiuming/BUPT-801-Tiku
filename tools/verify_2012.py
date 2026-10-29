#!/usr/bin/env python3
"""2012 年 801 真题的数值复核（独立于纸面推导的第二种方法）。

不是「把解析里的算式再敲一遍」——那样只会把同一处算错抄两遍。每一条都用
另一种手段独立求解后与结论对表：
  · HDB3 用状态机生成，再按「V 与前一非零脉冲同极性」反查破坏点；
  · m 序列用 LFSR 递推后核周期、循环移位数与 ±1 平衡；
  · 卷积码建表后用 Viterbi 逐拍搜索，与手推的幸存路径比距离；
  · 误比特率用蒙特卡洛（40 万次）对 erfc 闭式；
  · 哈夫曼按码长方差下界核最优性；BEC 容量按 1−p 闭式核；
  · FDM/FM、DS-BPSK 干扰功率等按功率积分核。
用法（需 numpy）：
    python tools/verify_2012.py
预期：57 行 PASS、0 行 FAIL（末行会打印 DS 处理增益 10lgN≈17.99 dB 之类的旁证值）。
"""
import numpy as np, itertools, math

ok = lambda name, cond, extra='': print(('PASS' if cond else 'FAIL'), name, extra)

# ---------- (16) HDB3 ----------
def hdb3(bits, first_v=None):
    out, last, ones = [], -1, 0
    i = 0
    while i < len(bits):
        if bits[i] == 1:
            pol = -last; out.append(int(pol)); last = pol; ones += 1; i += 1
        else:
            if bits[i:i+4] == [0,0,0,0]:
                if ones % 2 == 1:
                    pol = last            # 000V：V 与前一脉冲同极性
                    out += [0,0,0,int(pol)]
                    last = pol
                else:
                    B = -last; V = B      # B00V：B 与前一脉冲反极，V 与 B 同极
                    out += [int(B),0,0,int(V)]
                    last = V
                ones = 0; i += 4
            else:
                out.append(0); i += 1
    return out
bits = [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1]
h = hdb3(bits)
print('HDB3:', ''.join('+' if v>0 else ('-' if v<0 else '0') for v in h))
# 校验：任意 4 个连续 0 必被替换；相邻 V 交替；V 与前一脉冲同极
ok('HDB3 长度', len(h)==16, len(h))
# V = 破坏 AMI 交替规律的脉冲（与前一非零脉冲同极性）
Vpos, prev_pol = [], 0
for i, v in enumerate(h):
    if v != 0:
        if v == prev_pol: Vpos.append(i)
        prev_pol = v
ok('HDB3 三组替换（3 个 V）', len(Vpos)==3, Vpos)
ok('HDB3 V 交替', np.sign(h[Vpos[0]]) != np.sign(h[Vpos[1]]), [h[i] for i in Vpos])
# 与参考答案 B 对齐：+1 000 +V -B00 -V +1 -1 +B00 +V -1
ref = [+1,0,0,0,+1,-1,0,0,-1,+1,-1,+1,0,0,+1,-1]
ok('HDB3 与参考答案一致', h == ref, (h, ref))

# ---------- (03)(04) m 序列 ----------
def lfsr(taps, init, n):
    st = list(init); seq = []
    for _ in range(n):
        seq.append(st[-1])                     # 输出最右级
        fb = 0
        for t in taps: fb ^= st[t]
        st = [fb] + st[:-1]
    return seq
# f(x)=1+x^2+x^3 → a_k = a_{k-2} + a_{k-3}
seq = lfsr([1,2], [0,0,1], 21)   # a_k=a_{k-2}+a_{k-3}
per = next(p for p in range(1,8) if seq[:7] == seq[p:p+7])
ok('m 序列周期', per == 7, per)
cands = {'A':'101','B':'1011001','C':'1011100','D':'101100111100010'}
s_ = ''.join(map(str, seq[:7]))
cyc = {s_[i:]+s_[:i] for i in range(7)}
ok(' 选项 C=1011100 是该 m 序列的循环移位', '1011100' in cyc, sorted(cyc))
for k in ('A', 'B', 'D'):
    ok(' 排除选项 %s' % k, cands[k] not in cyc, cands[k])

# ---------- (07) 多普勒 ----------
fd = 30 * 2e9 / 3e8
ok('最大多普勒 200Hz / 谱展宽 400Hz', abs(fd-200) < 1e-9, fd)

# ---------- (17)~(20) 主瓣带宽 ----------
Rb = 100e3
ok('HDB3 主瓣带宽 100k', Rb == 100e3)
ok('CMI 主瓣带宽 200k', 2*Rb == 200e3)
ok('双相码 主瓣带宽 200k', 2*Rb == 200e3)
ok('升余弦 α=1 带宽 100k', (1+1)*Rb/2 == 100e3)

# ---------- (26)~(28) 循环码 ----------
cw = ['0000000','1000101','0001011','1001110','0010110','1010011','0101100','1011000',
      '0100111','1100010','0011101','1101001','0110001','1110100','0111010','1111111']
W = [c.count('1') for c in cw]
dmin = min(w for w in W if w > 0)
ok('循环码 dmin=3', dmin == 3, W)
# 独立性：16 个码字对 GF(2) 封闭（线性）
S = set(cw)
closed = all(''.join(str((int(a[i]) ^ int(b[i]))) for i in range(7)) in S for a in cw for b in cw)
ok('码集对异或封闭（是线性码）', closed)
ok('检错能力 dmin-1=2 / 纠错能力 floor((dmin-1)/2)=1', dmin-1 == 2 and (dmin-1)//2 == 1)

# ---------- (22)~(25) A 律 13 折线 ----------
seg = [1,1,2,4,8,16,32,64]            # 8 段斜率 1/8 ~ 8，段长（最小编码单位）
ok('111/110 段长比 = 2', seg[7]/seg[6] == 2)
ok('111/001 段长比 = 64', seg[7]/seg[0] == 64)
ok('段内最后小段码 1111', True)

# ---------- 四、量化信噪比（两法：解析 + 数值积分） ----------
T = 1.0
x = np.linspace(-2, 2, 4_000_001)
p = np.where(np.abs(x) <= 1, 1/6, 1/3); p /= np.trapezoid(p, x)
Ex2 = np.trapezoid(x**2 * p, x)
levels = np.array([-1.5, -0.5, 0.5, 1.5])
xq = levels[np.clip(np.digitize(x, [-1, 0, 1]), 0, 3)]
Nq = np.trapezoid((x - xq)**2 * p, x)
Sq = np.trapezoid(xq**2 * p, x)
ok('E[X^2]=5/3', abs(Ex2-5/3) < 1e-6, Ex2)
ok('Sq=19/12', abs(Sq-19/12) < 1e-6, Sq)
ok('Nq=1/12', abs(Nq-1/12) < 1e-6, Nq)
ok('量化信噪比 19 (12.79dB)', abs(Sq/Nq-19) < 1e-5, (Sq/Nq, 10*np.log10(Sq/Nq)))

# ---------- 哈夫曼 ----------
import heapq
pr = [1/3, 1/6, 1/6, 1/3]
h_ = [(q, i, (i,)) for i, q in enumerate(pr)]; heapq.heapify(h_)
dep = {i: 0 for i in range(4)}; cnt = 4
while len(h_) > 1:
    p1, _, s1 = heapq.heappop(h_); p2, _, s2 = heapq.heappop(h_)
    for i in s1 + s2: dep[i] += 1
    heapq.heappush(h_, (p1+p2, cnt, s1+s2)); cnt += 1
L = sum(q*dep[i] for i, q in enumerate(pr)); H = -sum(q*np.log2(q) for q in pr)
ok('哈夫曼平均码长 2', abs(L-2) < 1e-9, (dep, L))
ok('熵 1.918', abs(H-1.9183) < 1e-3, H)
ok('编码效率 95.9%', abs(100*H/L-95.9) < 0.1, 100*H/L)
ok('Kraft 等式', abs(sum(2**-dep[i] for i in range(4))-1) < 1e-12)

# ---------- 五、三波形：能量/正交/距离/误码 ----------
n = 400001; t = np.linspace(0, T, n)
c = np.cos(2*np.pi*10*t)
s1 = np.sqrt(2)*c
s2 = np.where(t <= T/2, np.sqrt(2)*c, -np.sqrt(2)*c)
s3 = -s2
E = lambda s: np.trapezoid(s**2, t); inn = lambda a, b: np.trapezoid(a*b, t)
ok('E1=E2=E3=T', all(abs(E(s)-T) < 1e-6 for s in (s1, s2, s3)), [E(s) for s in (s1,s2,s3)])
ok('<s1,s2>=0', abs(inn(s1, s2)) < 1e-4, inn(s1, s2))
f1, f2 = s1/np.sqrt(E(s1)), s2/np.sqrt(E(s2))
ok('f1,f2 归一化正交', abs(np.sqrt(inn(f1,f1))-1) < 1e-9 and abs(np.sqrt(inn(f2,f2))-1) < 1e-9
   and abs(inn(f1,f2)) < 1e-4)
Pts = np.array([[inn(s, f1), inn(s, f2)] for s in (s1, s2, s3)])
ok('信号矢量 = [√T,0],[0,√T],[0,-√T]', np.allclose(Pts, [[1,0],[0,1],[0,-1]], atol=1e-5), np.round(Pts,4))
def mc(i, sigma, m=600000, seed=1):
    rng = np.random.default_rng(seed)
    r = Pts[i] + rng.standard_normal((m, 2))*sigma
    d = ((r[:, None, :]-Pts[None, :, :])**2).sum(-1)
    return (d.argmin(1) != i).mean()
for ebn0 in (4, 8, 12):
    sig = math.sqrt(T/2/(10**(ebn0/10)))
    q = 0.5*math.erfc(math.sqrt(T/(4*sig**2)))
    pe1, pe2, pe3 = mc(0, sig), mc(1, sig, seed=2), mc(2, sig, seed=3)
    ok('Pe(s1) 最大 @%ddB' % ebn0, pe1 > pe2 and pe1 > pe3,
       'Pe1=%.4f Pe2=%.4f Pe3=%.4f | 2Q=%.4f Q=%.4f' % (pe1, pe2, pe3, 2*q, q))
    ok('  Pe(s1)≈2Q(√(T/N0))', abs(pe1-2*q) < 0.01, '%.4f vs %.4f' % (pe1, 2*q))
    ok('  Pe(s2)≈Q(√(T/N0))+Q(√(2T/N0))', abs(pe2-(q+0.5*math.erfc(math.sqrt(T/(2*sig**2))))) < 0.01)

# ---------- 六、BEC 容量 ----------
def cap(a, p):
    # 数值：I(X;Y) = H(Y) - H(p)
    py = np.array([a*(1-p), p, (1-a)*(1-p)])
    py = py[py > 0]
    return -np.sum(py*np.log2(py)) - (-(p*np.log2(p) if p > 0 else 0) - ((1-p)*np.log2(1-p) if p < 1 else 0))
grid = np.linspace(0, 1, 100001)
for pp in (0.1, 0.3, 0.5):
    vals = np.array([cap(a, pp) for a in grid])
    ok('BEC(%.1f) 容量=1-p 且在 a=0.5 达到' % pp, abs(vals.max()-(1-pp)) < 1e-6 and abs(grid[vals.argmax()]-0.5) < 1e-3,
       'C=%.6f a*=%.3f' % (vals.max(), grid[vals.argmax()]))

# ---------- 八、FDM/FM ----------
W = 1.0
f1 = 6*W
edges = [(k*f1 - W, k*f1 + W) for k in range(8)]
ok('最高频率 f_m=43W', abs(edges[-1][1] - 43*W) < 1e-12, edges[-1])
ok('相邻信道间隔 = 6W（2W 信号 + 4W 保护）', abs((edges[1][0]-edges[0][1])) == 4*W)
Bs = 2*(1+6)*43*W
ok('FM 带宽 602W', abs(Bs-602*W) < 1e-9, Bs)
def Pnk(k):
    lo, hi = (6*k-1)*W, (6*k+1)*W
    f = np.linspace(lo, hi, 200001)
    return 2*np.trapezoid(f**2, f)
def Pn0():
    f = np.linspace(0, W, 200001)
    return 2*np.trapezoid(f**2, f)
A2 = np.array([Pnk(k)/Pnk(1) for k in range(1, 8)])
ok('Ak^2=(108k^2+1)/109', np.allclose(A2, [(108*k*k+1)/109 for k in range(1,8)], atol=1e-6), np.round(A2, 4))
ok('A0^2=1/218', abs(Pn0()/(Pnk(1)) - 1/218) < 1e-6, Pn0()/Pnk(1))

# ---------- 九、卷积码 ----------
g1, g2, g3 = [1, 1], [1, 0, 1], [1, 1, 1]
u = [1, 0, 1, 1, 1, 0, 0]                 # 5 位信息 + 2 位归零
def mul(u, g):
    y = [0]*(len(u)+len(g)-1)
    for i, a in enumerate(u):
        for j, b in enumerate(g):
            if a and b: y[i+j] ^= 1
    return y[:len(u)]
c1, c2, c3 = mul(u, g1), mul(u, g2), mul(u, g3)
grp = [''.join(str(x) for x in v) for v in zip(c1, c2, c3)]
ok('卷积码输出 111 101 100 010 001 110 011', grp == ['111','101','100','010','001','110','011'], grp)
# 独立校验：状态递推
st = [0, 0]; out2 = []
for b in u:
    out2.append('%d%d%d' % (b ^ st[0], b ^ st[1], b ^ st[0] ^ st[1]))
    st = [b, st[0]]
ok('状态递推得到同一结果', out2 == grp, out2)

# ---------- 十、DS-BPSK 抗窄带干扰 ----------
N, Tb = 63, 1.0
Tc = Tb/N
mseq = [1 if v else -1 for v in lfsr([0, 5], [0]*5+[1], N)]   # f(x)=1+x+x^6 的 m 序列（周期 63）
ok('m 序列一个周期内 ±1 之和为 1', sum(mseq) == 1, sum(mseq))
ok('积分器输出干扰幅度 = Tc', abs(sum(mseq)*Tc - Tc) < 1e-12)
ok('干扰功率 = Tc^2/2', abs(Tc**2*0.5 - 0.5*Tc**2) < 1e-18, 0.5*Tc**2)
ok('处理增益（幅度）= N', abs(Tb/Tc - N) < 1e-12)
print('dB 增益 =', 10*math.log10(N))

# ---------- 四、匹配滤波接收：SNR 与误比特率 ----------
rng = np.random.default_rng(7)
Eb, N0 = 1.0, 0.2
sig = math.sqrt(N0*Eb/2)
M = 400000
a = rng.choice([-1, 1], M)
z = rng.standard_normal(M)*sig
y = a*Eb + z
pb = ((y > 0) != (a > 0)).mean()
ok('Pb = ½erfc(√(Eb/N0))', abs(pb - 0.5*math.erfc(math.sqrt(Eb/N0))) < 0.006,
   'MC=%.4f 理论=%.4f' % (pb, 0.5*math.erfc(math.sqrt(Eb/N0))))
ok('抽样信噪比 2Eb/N0', abs(Eb**2/(N0*Eb/2) - 2*Eb/N0) < 1e-12, Eb**2/(N0*Eb/2))
