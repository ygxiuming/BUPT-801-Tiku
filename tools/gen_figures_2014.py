#!/usr/bin/env python3
# 生成 2014年试卷 SVG 图库（每图一个文件，输出用 ###FILE: 分隔）：
#   node tools/emit_figures.mjs 2014
import math

from svgkit import PAD, tighten  # 统一的 viewBox 收边（四边等宽留白）

# ---------------------------------------------------------------- 基础画笔（与 2026 同一套）
def marker(mid, color='#1a1a1a'):
    return (f"<defs><marker id='{mid}' markerWidth='8' markerHeight='8' refX='7' refY='3' orient='auto'>"
            f"<path d='M0,0 L7,3 L0,6 z' fill='{color}'/></marker></defs>")


def poly(pts, stroke='#1a1a1a', width=1.6, dash=None, fill='none', close=False):
    d = ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)
    dd = ' Z' if close else ''
    da = f" stroke-dasharray='{dash}'" if dash else ''
    return f"<path d='M{d}{dd}' fill='{fill}' stroke='{stroke}' stroke-width='{width}'{da}/>"


def line(x1, y1, x2, y2, width=1.6, dash=None, color='#1a1a1a', marker=None):
    da = f" stroke-dasharray='{dash}'" if dash else ''
    mk = f" marker-end='url(#{marker})'" if marker else ''
    return (f"<line x1='{x1:.1f}' y1='{y1:.1f}' x2='{x2:.1f}' y2='{y2:.1f}' "
            f"stroke='{color}' stroke-width='{width}'{da}{mk}/>")


def _tokens(s):
    out, i = [], 0
    while i < len(s):
        c = s[i]
        if c in '_^':
            kind = 'sub' if c == '_' else 'sup'
            i += 1
            if i < len(s) and s[i] == '{':
                j = s.index('}', i)
                out.append((s[i + 1:j], kind)); i = j + 1
            elif i < len(s):
                out.append((s[i], kind)); i += 1
        else:
            j = i
            while j < len(s) and s[j] not in '_^':
                j += 1
            out.append((s[i:j], 'n')); i = j
    return out


def text(x, y, s, size=14, anchor='middle', style='', color='#1a1a1a'):
    st = " font-style='italic'" if 'i' in style else ''
    wt = " font-weight='bold'" if 'b' in style else ''
    small = f" font-size='{size}'" if size != 14 else ''
    toks = _tokens(s)
    if len(toks) == 1:
        return f"<text x='{x:.1f}' y='{y:.1f}' text-anchor='{anchor}'{small}{st}{wt} fill='{color}'>{s}</text>"
    body, shift = '', 0
    for t, k in toks:
        if k == 'n':
            body += f"<tspan dy='{-shift}' font-size='{size}'>{t}</tspan>"
            shift = 0
        elif k == 'sub':
            d = round(size * 0.30)
            body += f"<tspan dy='{d}' font-size='{round(size * 0.72)}'>{t}</tspan>"
            shift += d
        else:
            d = -round(size * 0.42)
            body += f"<tspan dy='{d}' font-size='{round(size * 0.72)}'>{t}</tspan>"
            shift += d
    return f"<text x='{x:.1f}' y='{y:.1f}' text-anchor='{anchor}'{small}{st}{wt} fill='{color}'>{body}</text>"


def dot(x, y, r=4, fill='#1a1a1a', stroke='none'):
    return f"<circle cx='{x:.1f}' cy='{y:.1f}' r='{r}' fill='{fill}' stroke='{stroke}'/>"


def circle(cx, cy, r, dash=None, color='#1a1a1a', width=1.6, fill='none'):
    da = f" stroke-dasharray='{dash}'" if dash else ''
    return (f"<circle cx='{cx:.1f}' cy='{cy:.1f}' r='{r:.1f}' fill='{fill}' "
            f"stroke='{color}' stroke-width='{width}'{da}/>")


def rect(x, y, w, h, dash=None, fill='none', width=1.6):
    da = f" stroke-dasharray='{dash}'" if dash else ''
    return (f"<rect x='{x:.1f}' y='{y:.1f}' width='{w:.1f}' height='{h:.1f}' fill='{fill}' "
            f"stroke='#1a1a1a' stroke-width='{width}'{da}/>")


def mul(cx, cy, r=13):
    return (circle(cx, cy, r)
            + line(cx - r * .71, cy - r * .71, cx + r * .71, cy + r * .71)
            + line(cx + r * .71, cy - r * .71, cx - r * .71, cy + r * .71))


def adder(cx, cy, r=13):
    return (circle(cx, cy, r)
            + line(cx - r * .77, cy, cx + r * .77, cy)
            + line(cx, cy - r * .77, cx, cy + r * .77))


HEAD = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {w} {h}' "
        "font-family=\"Helvetica,Arial,'PingFang SC','Microsoft YaHei',sans-serif\" font-size='14'>")

SINC = math.sinc if hasattr(math, 'sinc') else (lambda x: math.sin(math.pi * x) / (math.pi * x) if x else 1.0)


def curve(fn, x0, x1, n=160, **kw):
    pts = []
    for i in range(n + 1):
        x = x0 + (x1 - x0) * i / n
        pts.append(fn(x))
    return poly(pts, **kw)


# ---------------------------------------------------------------- 一、PAM 功率谱（单极性 NRZ：δ 线 + sinc² 零点 ±Rb）
def fig_q1psd():
    s = HEAD.format(w=560, h=250) + marker('a14a')
    OX, OY, SC, H = 262, 196, 95, 120   # 原点、基线、每 Rb 像素、主瓣高
    # 坐标轴
    s += line(24, OY, 536, OY, marker='a14a')
    s += text(500, 180, 'f / R_{b}', size=13, anchor='start', style='i')
    s += line(OX, OY, OX, 40, marker='a14a')
    s += text(OX + 12, 52, 'P(f)', size=13, anchor='start', style='i')
    # 连续谱：主瓣 sinc² + 侧瓣（按原卷夸张画出），区间外截止
    def seg(lo, hi, amp, phase_lo):
        def f(x):
            v = amp * math.sin(math.pi * (x - phase_lo) / (hi - lo)) ** 2
            return (OX + x * SC, OY - H * v)
        return f
    s += curve(seg(-1, 1, 1.0, -1), -1, 1, 120)
    s += curve(seg(1, 2, 0.18, 1), 1, 2, 60)
    s += curve(seg(-2, -1, 0.18, -2), -2, -1, 60)
    s += curve(seg(2, 2.6, 0.07, 2), 2, 2.6, 40)
    s += curve(seg(-2.6, -2, 0.07, -2.6), -2.6, -2, 40)
    # f=0 离散谱线（δ），短于主瓣
    s += line(OX, OY, OX, OY - 66, width=2.2, marker='a14a')
    # 刻度
    for f, lab in ((-2, '−2'), (-1, '−1'), (0, 'O'), (1, '1'), (2, '2')):
        s += text(OX + f * SC, OY + 22, lab, size=12, style='' if lab == 'O' else 'i')
    return s + '</svg>'


# ---------------------------------------------------------------- 四、(a) sinc 脉冲 (b) 升余弦频谱 (c) 抽样值杆图
def fig_q4figs():
    s = HEAD.format(w=1080, h=290) + marker('a14b')
    # ---- (a) g(t)=sinc(t/T)
    OX, OY = 205, 196
    s += line(OX, OY, OX, 62, marker='a14b')
    s += text(OX, 50, 'g(t)', style='i')
    s += line(48, OY, 386, OY, marker='a14b')
    s += curve(lambda x: (OX + x * 42, OY - 112 * SINC(x)), -3.45, 3.45, 180)
    for t, lab in ((-3, '−3T'), (-2, '−2T'), (-1, '−T'), (0, 'O'), (1, 'T'), (2, '2T'), (3, '3T')):
        s += text(OX + t * 42, OY + 26, lab, size=12, style='' if lab == 'O' else 'i')
    s += text(OX, 262, '(a)')
    # ---- (b) 升余弦 G(f)：平顶到 600，0.5 在 900，零点 1200
    BX, BY, FS = 600, 196, 0.158   # 每Hz像素
    s += line(BX, BY, BX, 62, marker='a14b')
    s += text(BX, 50, 'G(f)', style='i')
    s += line(BX, BY, 836, BY, marker='a14b')
    s += text(848, BY + 5, 'f', size=13, anchor='start', style='i')
    s += text(BX - 12, BY - 90 + 5, '1', size=12, anchor='end')
    s += text(BX - 12, BY - 45 + 5, '0.5', size=12, anchor='end')
    s += line(BX, BY - 45, BX + 900 * FS, BY - 45, width=1.1, dash='3,4', color='#999')
    s += line(BX + 900 * FS, BY - 45, BX + 900 * FS, BY, width=1.1, dash='3,4', color='#999')
    s += line(BX, BY - 90, BX + 600 * FS, BY - 90)
    s += curve(lambda x: (BX + x * FS, BY - 90 * 0.5 * (1 + math.cos(math.pi * (x - 600) / 600))), 600, 1200, 80)
    s += text(BX, BY + 22, 'O', size=12)
    s += text(BX + 900 * FS, BY + 22, '900', size=12)
    s += text(BX + 1200 * FS, BY + 22, '1200', size=12)
    s += text(BX + 100, 262, '(b)')
    # ---- (c) x(kT) 杆图：x(-2T)=0.2, x(-T)=-0.4, x(0)=1.0, x(T)=0.6, x(2T)=-0.3, x(3T)=0.1
    CX, CY, KS = 948, 196, 40
    s += line(860, CY, 1058, CY, marker='a14b')
    vals = {k: v for k, v in ((-2, 0.2), (-1, -0.4), (0, 1.0), (1, 0.6), (2, -0.3), (3, 0.1))}
    for k, v in vals.items():
        x = CX + k * KS
        h = v * 70
        s += line(x, CY, x, CY - h, width=1.8)
        if k == 0:
            s += text(x, CY + 22, 'O', size=12)
        lab = ('%.1f' % v)
        if v >= 0:
            s += text(x, CY - h - 8, lab, size=12)
        else:
            s += text(x, CY - h + 20, lab, size=12)
    s += text(950, 262, '(c)')
    return s + '</svg>'

# ---------------------------------------------------------------- 五、概率密度 p(x)：1/3 于 |x|≤1，1/6 于 1<|x|≤2
def fig_q5pdf():
    s = HEAD.format(w=430, h=240) + marker('a14c')
    OX, OY, SC = 212, 172, 70
    Y13, Y16 = OY - 62, OY - 31
    s += line(28, OY, 402, OY, marker='a14c')
    s += text(394, OY + 24, 'x', size=13, anchor='start', style='i')
    s += line(OX, OY, OX, 34, marker='a14c')
    s += text(OX + 12, 46, 'p(x)', size=13, anchor='start', style='i')
    # 阶梯密度轮廓
    s += poly([(OX - 2 * SC, OY), (OX - 2 * SC, Y16), (OX - SC, Y16), (OX - SC, Y13),
               (OX + SC, Y13), (OX + SC, Y16), (OX + 2 * SC, Y16), (OX + 2 * SC, OY)])
    # 参考虚线：1/6 水平线与 ±1 台阶沿
    s += line(OX - SC, Y16, OX + SC, Y16, width=1.1, dash='3,4', color='#999')
    s += line(OX - SC, Y13, OX - SC, OY, width=1.1, dash='3,4', color='#999')
    s += line(OX + SC, Y13, OX + SC, OY, width=1.1, dash='3,4', color='#999')
    s += text(OX + 10, Y13 - 6, '1/3', size=12, anchor='start')
    s += text(OX + 10, Y16 - 6, '1/6', size=12, anchor='start')
    for x, lab in ((-2, '−2'), (-1, '−1'), (0, 'O'), (1, '1'), (2, '2')):
        s += text(OX + x * SC, OY + 22, lab, size=12, style='' if lab == 'O' else 'i')
    return s + '</svg>'


# ---------------------------------------------------------------- 七、四个发送波形（s1=0、s2=A、s3/s4=A/2±(A/2)sin）
def fig_q7wave():
    s = HEAD.format(w=1030, h=240) + marker('a14d')
    OY, HPA = 178, 88            # 基线、A 的高度
    for i, ox in enumerate((118, 358, 598, 838), start=1):
        s += line(ox, OY, ox + 152, OY, marker='a14d')
        s += line(ox, OY, ox, 58, marker='a14d')
        s += text(ox, 46, 's_%d(t)' % i, style='i')
        s += text(ox + 166, OY + 5, 't', size=13, anchor='start', style='i')
        s += text(ox, OY + 22, 'O', size=12)
        s += text(ox + 120, OY + 22, 'T', size=12, style='i')
        s += line(ox - 5, OY - HPA, ox + 5, OY - HPA)
        s += text(ox - 12, OY - HPA + 5, 'A', size=12, anchor='end', style='i')
        if i >= 3:
            ymid = OY - HPA // 2
            s += line(ox, ymid, ox + 120, ymid, width=1.1, dash='3,4', color='#999')
            s += text(ox - 12, ymid + 5, 'A/2', size=12, anchor='end', style='i')
        if i == 2:
            s += line(ox, OY - HPA, ox + 120, OY - HPA)
        elif i == 3:
            s += curve(lambda t: (ox + t * 120, OY - HPA // 2 - HPA // 2 * math.sin(2 * math.pi * t)), 0, 1, 80)
        elif i == 4:
            s += curve(lambda t: (ox + t * 120, OY - HPA // 2 + HPA // 2 * math.sin(2 * math.pi * t)), 0, 1, 80)
    return s + '</svg>'


# ---------------------------------------------------------------- 三(3)、奈奎斯特抽样—sinc 内插重建框图（解析图）
def fig_q3block():
    s = HEAD.format(w=470, h=110) + marker('a14e')
    YC = 62
    s += line(24, YC, 78, YC, marker='a14e')
    s += text(48, YC - 12, 'X_1(t)', style='i')
    s += rect(82, YC - 17, 66, 34)
    s += text(115, YC + 5, '抽样')
    s += line(148, YC, 196, YC, marker='a14e')
    s += text(172, YC - 12, 'A_n', style='i')
    s += rect(200, YC - 17, 66, 34)
    s += text(233, YC + 5, 'δ(t)', style='i')
    s += line(266, YC, 296, YC, marker='a14e')
    s += rect(300, YC - 17, 66, 34)
    s += text(333, YC + 5, 'g(t)', style='i')
    s += line(366, YC, 414, YC, marker='a14e')
    s += text(422, YC + 5, 'X(t)', anchor='start', style='i')
    return s + '</svg>'


# ---------------------------------------------------------------- 七(1)、星座图（解析图）
def fig_q7const():
    s = HEAD.format(w=450, h=320) + marker('a14f')
    OX, OY, A = 150, 178, 92     # 原点；a=√(A²T/4) 的像素
    B = A / math.sqrt(2)         # √(A²T/8)
    s += line(58, OY, 416, OY, marker='a14f')
    s += text(424, OY + 5, 'f_1(t)', size=13, anchor='start', style='i')
    s += line(OX, 300, OX, 34, marker='a14f')
    s += text(OX + 10, 40, 'f_2(t)', size=13, anchor='start', style='i')
    # 四个信号点
    s += dot(OX, OY, 4)
    s += dot(OX + 2 * A, OY, 4)
    s += dot(OX + A, OY - B, 4)
    s += dot(OX + A, OY + B, 4)
    s += text(OX - 14, OY + 24, 's_1', style='i')
    s += text(OX + 2 * A + 6, OY - 10, 's_2', anchor='start', style='i')
    s += text(OX + A + 10, OY - B - 8, 's_3', anchor='start', style='i')
    s += text(OX + A + 10, OY + B + 18, 's_4', anchor='start', style='i')
    # 坐标虚线与标注
    s += line(OX + A, OY - B, OX + A, OY, width=1.1, dash='3,4', color='#999')
    s += line(OX + A, OY - B, OX, OY - B, width=1.1, dash='3,4', color='#999')
    s += line(OX + A, OY + B, OX, OY + B, width=1.1, dash='3,4', color='#999')
    s += text(OX + 2 * A, OY + 24, '√(A^2T)', size=12, style='i')
    s += text(OX + A, OY + 24, '√(A^2T/4)', size=12, style='i')
    s += text(OX - 10, OY - B + 5, '√(A^2T/8)', size=12, anchor='end', style='i')
    s += text(OX - 10, OY + B + 5, '−√(A^2T/8)', size=12, anchor='end', style='i')
    return s + '</svg>'


# ---------------------------------------------------------------- 七(3)、判决区域（解析图）
def fig_q7decide():
    s = HEAD.format(w=450, h=330) + marker('a14g')
    OX, OY, A = 150, 172, 92
    B = A / math.sqrt(2)
    s += line(58, OY, 416, OY, marker='a14g')
    s += text(424, OY + 5, 'f_1(t)', size=13, anchor='start', style='i')
    s += line(OX, 306, OX, 34, marker='a14g')
    s += text(OX + 10, 40, 'f_2(t)', size=13, anchor='start', style='i')
    # Voronoi 边界：x=a 竖线 + 四条斜中垂线（#888 虚线，判决域用）
    s += line(OX + A, 44, OX + A, 300, width=1.2, dash='5,4', color='#888')
    R2, R4 = 3 * math.sqrt(2) / 4, 5 * math.sqrt(2) / 4
    # s1–s3 / s1–s4：Y = ±(3√2/4 − √2·X)，画 X∈[−0.31, 1.2]
    X0, X1 = -0.31, 1.2
    s += line(OX + X0 * A, OY - A * (R2 + math.sqrt(2) * 0.31), OX + X1 * A, OY - A * (R2 - math.sqrt(2) * X1), width=1.2, dash='5,4', color='#888')
    s += line(OX + X0 * A, OY + A * (R2 + math.sqrt(2) * 0.31), OX + X1 * A, OY + A * (R2 - math.sqrt(2) * X1), width=1.2, dash='5,4', color='#888')
    # s2–s3 / s2–s4：Y = ±(√2·X − 5√2/4)，画 X∈[1.25, 2.3]
    X0, X1 = 1.25, 2.3
    s += line(OX + X0 * A, OY - A * (math.sqrt(2) * X0 - R4), OX + X1 * A, OY - A * (math.sqrt(2) * X1 - R4), width=1.2, dash='5,4', color='#888')
    s += line(OX + X0 * A, OY + A * (math.sqrt(2) * X0 - R4), OX + X1 * A, OY + A * (math.sqrt(2) * X1 - R4), width=1.2, dash='5,4', color='#888')
    # 信号点与标号
    s += dot(OX, OY, 4)
    s += dot(OX + 2 * A, OY, 4)
    s += dot(OX + A, OY - B, 4)
    s += dot(OX + A, OY + B, 4)
    s += text(OX - 14, OY + 24, 's_1', style='i')
    s += text(OX + 2 * A + 6, OY - 10, 's_2', anchor='start', style='i')
    s += text(OX + A + 10, OY - B - 8, 's_3', anchor='start', style='i')
    s += text(OX + A + 10, OY + B + 18, 's_4', anchor='start', style='i')
    return s + '</svg>'


# ---------------------------------------------------------------- 七(3)、MAP 最佳接收机结构（解析图）
def fig_q7recv():
    s = HEAD.format(w=560, h=160) + marker('a14h')
    Y1, Y2 = 52, 112
    s += line(24, 82, 88, 82)
    s += line(88, Y1, 88, Y2)
    s += line(88, Y1, 122, Y1, marker='a14h')
    s += line(88, Y2, 122, Y2, marker='a14h')
    s += text(52, 74, 'r(t)', anchor='start', style='i')
    # 两个匹配滤波/相关支路
    s += rect(126, Y1 - 15, 118, 30)
    s += text(185, Y1 + 5, '与 f_1(t) 匹配', size=13)
    s += rect(126, Y2 - 15, 118, 30)
    s += text(185, Y2 + 5, '与 f_2(t) 匹配', size=13)
    # 抽样开关
    for yy, yl in ((Y1, 'y_1'), (Y2, 'y_2')):
        s += line(244, yy, 300, yy, marker='a14h')
        s += dot(306, yy, 2.5, fill='#1a1a1a')
        s += dot(338, yy, 2.5, fill='#1a1a1a')
        s += line(306, yy, 336, yy - 8)
        s += text(322, yy - 22, 't=T_s', size=12)
        s += text(352, yy - 8, yl, anchor='start', style='i')
        s += line(344, yy, 386, yy, marker='a14h')
    # 联合判决（竖排）
    s += rect(390, 34, 36, 96)
    for j, ch in enumerate('联合判决'):
        s += text(408, 50 + j * 23, ch, size=13)
    s += line(426, 82, 484, 82, marker='a14h')
    s += text(492, 87, '输出', anchor='start')
    return s + '</svg>'


# ---------------------------------------------------------------- 八(1)、相干解调接收机框图（解析图）
def fig_q8block():
    s = HEAD.format(w=940, h=190) + marker('a14i')
    YC = 70
    # 主链
    s += line(24, YC, 58, YC, marker='a14i')
    s += rect(62, YC - 16, 62, 32)
    s += text(93, YC + 5, 'BPF', size=13)
    s += line(124, YC, 540, YC, marker='a14i')
    s += text(300, YC - 12, 'r(t)', style='i')
    s += mul(558, YC, 13)
    s += line(571, YC, 614, YC, marker='a14i')
    s += rect(618, YC - 16, 62, 32)
    s += text(649, YC + 5, 'LPF', size=13)
    s += line(680, YC, 742, YC, marker='a14i')
    s += text(710, YC - 12, 'y(t)', style='i')
    s += dot(752, YC, 2.5, fill='#1a1a1a')
    s += dot(784, YC, 2.5, fill='#1a1a1a')
    s += line(752, YC, 782, YC - 8)
    s += text(768, YC - 22, 't=T_b', size=12)
    s += text(798, YC - 8, 'y', anchor='start', style='i')
    s += line(790, YC, 830, YC, marker='a14i')
    s += rect(834, YC - 16, 62, 32)
    s += text(865, YC + 5, '判决')
    s += line(896, YC, 924, YC, marker='a14i')
    # 载波恢复支路：r(t) → NBF → 移相 → cos2πf_ct 入乘法器
    s += line(320, YC, 320, 142)
    s += line(320, 142, 372, 142, marker='a14i')
    s += rect(376, 126, 62, 32)
    s += text(407, 147, 'NBF', size=13)
    s += line(438, 142, 468, 142, marker='a14i')
    s += rect(472, 126, 62, 32)
    s += text(503, 147, '移相')
    s += line(534, 142, 558, 142)
    s += line(558, 142, 558, YC + 16, marker='a14i')
    s += text(568, 120, 'cos 2πf_c t', size=13, anchor='start', style='i')
    return s + '</svg>'


# (key, 题号, 是否解析配图, 描述)。题目原图放 data/figures/<年>/，解析配图放 answer/ 子目录。
FIGS = [
    ('q1psd', '一', False, 'PAM功率谱'),
    ('q4figs', '四', False, 'sinc脉冲与升余弦频谱、抽样值'),
    ('q5pdf', '五', False, '概率密度'),
    ('q7wave', '七', False, '四信号波形'),
    ('q3block', '三', True, '抽样重建框图'),
    ('q7const', '七', True, '星座图'),
    ('q7recv', '七', True, '最佳接收机'),
    ('q7decide', '七', True, '判决区域'),
    ('q8block', '八', True, '相干解调框图'),
]
SVGS = {
    'q1psd': fig_q1psd(), 'q4figs': fig_q4figs(), 'q5pdf': fig_q5pdf(),
    'q7wave': fig_q7wave(), 'q3block': fig_q3block(), 'q7const': fig_q7const(),
    'q7recv': fig_q7recv(), 'q7decide': fig_q7decide(), 'q8block': fig_q8block(),
}
# 全部图统一把 viewBox 收到内容边界（四边各留 18px），与 2025/2026 同一套口径。
SVGS = {k: tighten(v, PAD) for k, v in SVGS.items()}

# 每张图一个文件；输出用 ###FILE: 分隔，落盘用 node tools/emit_figures.mjs 2014。
YEAR = '2014'
requires = []
for key, qnum, is_ans, desc in FIGS:
    sub = 'answer/' if is_ans else ''
    fname = YEAR + '-' + qnum + '-' + key + '.js'
    requires.append('./' + sub + fname)
    kind = '解析配图' if is_ans else '题目原图'
    meta_kind = 'answer' if is_ans else 'paper'
    print('###FILE:data/figures/' + YEAR + '/' + sub + fname)
    print('// ' + YEAR + ' · 题' + qnum + ' ' + kind + ' · ' + desc + ' —— 由 tools/gen_figures_' + YEAR + '.py 生成，勿手改')
    print('window.BUPT801 = window.BUPT801 || {};')
    print('window.BUPT801.figures = window.BUPT801.figures || {};')
    print('(window.BUPT801.figures["' + YEAR + '"] = window.BUPT801.figures["' + YEAR + '"] || {}).' + key + ' = ' + repr(SVGS[key]) + ';')
    print('window.BUPT801.figureMeta = window.BUPT801.figureMeta || {};')
    print('(window.BUPT801.figureMeta["' + YEAR + '"] = window.BUPT801.figureMeta["' + YEAR + '"] || {}).' + key + ' = { q: "题' + qnum + '", kind: "' + meta_kind + '", desc: "' + desc + '" };')

# Node 端索引（顺序提示；emit 的 rebuildIndex 以此为序）
print('###FILE:data/figures/' + YEAR + '/_index.js')
print('// ' + YEAR + ' 图库索引 —— 由 tools/gen_figures_' + YEAR + '.py 生成；Node 端 require 用，不进浏览器 bundle')
for r in requires:
    print('require("' + r + '");')
