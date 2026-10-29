#!/usr/bin/env python3
# 生成 2012年试卷 SVG 图库（每图一个文件，输出用 ###FILE: 分隔）：
#   node tools/emit_figures.mjs 2012
import math

from svgkit import PAD, tighten  # 统一的 viewBox 收边（四边等宽留白）

# ---------------------------------------------------------------- 基础画笔（与 2014/2026 同一套）
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


def qcur(p0, cp, p1, dash=None, marker=None, width=1.6, color='#1a1a1a'):
    da = f" stroke-dasharray='{dash}'" if dash else ''
    mk = f" marker-end='url(#{marker})'" if marker else ''
    return (f"<path d='M{p0[0]:.1f},{p0[1]:.1f} Q{cp[0]:.1f},{cp[1]:.1f} {p1[0]:.1f},{p1[1]:.1f}' "
            f"fill='none' stroke='{color}' stroke-width='{width}'{da}{mk}/>")


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

SINC = lambda x: math.sin(math.pi * x) / (math.pi * x) if abs(x) > 1e-12 else 1.0


def curve(fn, x0, x1, n=160, **kw):
    pts = []
    for i in range(n + 1):
        x = x0 + (x1 - x0) * i / n
        pts.append(fn(x))
    return poly(pts, **kw)


def smooth(knots, n=26):
    """按余弦缓动穿过控制点（两端导数为 0），用于画"草图感"的波形。"""
    pts = []
    for (t0, v0), (t1, v1) in zip(knots, knots[1:]):
        for i in range(n):
            u = i / n
            v = v0 + (v1 - v0) * (1 - math.cos(math.pi * u)) / 2
            pts.append((t0 + (t1 - t0) * u, v))
    pts.append(knots[-1])
    return pts


# ================================================================ 题图
# ---------------------------------------------------------------- 四、(a) 基带系统框图 + (b) x1(t)
def fig_q4figs():
    s = HEAD.format(w=880, h=500) + marker('a12a')
    Y = 130
    # ---- 输入
    s += text(84, 74, 'Σa_nδ(t−nT_b)', size=14, style='i')
    s += text(84, 98, 'a_n∈{±1}', size=12, style='i')
    s += line(24, Y, 146, Y, marker='a12a')
    # ---- G_T / C / ⊕ / G_R / 采样 / 判决
    s += rect(150, Y - 20, 74, 40) + text(187, Y + 5, 'G_T(f)', size=13, style='i')
    s += line(224, Y, 266, Y, marker='a12a')
    s += rect(270, Y - 20, 58, 40) + text(299, Y + 5, 'C(f)', size=13, style='i')
    s += line(328, Y, 390, Y, marker='a12a')
    s += adder(404, Y, 13)
    s += line(404, 206, 404, 146, marker='a12a')
    s += text(414, 190, 'n(t)', size=13, anchor='start', style='i')
    s += line(417, Y, 470, Y, marker='a12a')
    s += dot(452, Y, 2.6)
    s += text(446, 152, 'A', size=13, anchor='end', style='i')
    s += rect(474, Y - 20, 74, 40) + text(511, Y + 5, 'G_R(f)', size=13, style='i')
    s += line(548, Y, 598, Y)
    s += text(572, 116, 'y(t)', size=13, style='i')
    # 采样开关
    s += dot(602, Y, 2.6) + dot(648, Y, 2.6)
    s += line(602, Y, 646, Y - 9)
    s += text(626, 100, 't_0+kT_b', size=12, style='i')
    s += line(648, Y, 692, Y, marker='a12a')
    s += rect(696, Y - 20, 62, 40) + text(727, Y + 5, '判决', size=13)
    s += line(758, Y, 796, Y, marker='a12a')
    # 符号同步支路
    s += rect(372, 206, 84, 34) + text(414, Y + 99, '符号同步', size=13)
    s += line(452, 133, 452, 203, marker='a12a')
    s += line(456, 223, 626, 223) + line(626, 223, 626, 143, marker='a12a')
    s += text(440, 250, '(a)', size=13)
    # ---- (b) x1(t)：带框线的坐标区（照原卷：左侧标幅值、下方标 t/Tb）
    OX, OY = 480, 392          # 原点（t=0，x=0）
    TX, SY = 110.0, 600.0      # 每 Tb 像素、每单位幅值像素
    FX0, FX1, FY0, FY1 = 150, 810, 262, 434
    s += rect(FX0, FY0, FX1 - FX0, FY1 - FY0, width=1.2)
    for k in range(-3, 4):
        s += line(OX + k * TX, FY0, OX + k * TX, FY1, width=1.1, dash='3,4', color='#999')
    for v in (0.2, 0.15, 0.1, 0.05, 0.0, -0.05):
        s += line(FX0, OY - v * SY, FX1, OY - v * SY, width=1.1, dash='3,4', color='#999')
    s += text(FX1 + 10, OY + 26, 't/T_b', size=13, anchor='start', style='i')
    s += text(56, 336, 'x_1(t)', size=13, anchor='middle', style='i')
    for v in (0.2, 0.15, 0.1, 0.05, -0.05):
        s += text(FX0 - 10, OY - v * SY + 4, ('%g' % v), size=12, anchor='end')
    s += text(FX0 - 10, OY + 4, '0', size=12, anchor='end')
    for k in range(-3, 4):
        s += text(OX + k * TX, FY1 + 20, ('%d' % k) if k else 'O', size=12,
                  style='' if k == 0 else 'i')
    # x1(t)：支撑 6Tb、峰 0.2 的衰减振荡（按原卷草图的关键点插值）
    kn = [(0.0, 0.2), (0.25, 0.152), (0.5, 0.072), (0.78, 0.0), (1.0, -0.05),
          (1.4, 0.0), (1.72, 0.022), (2.0, 0.0), (2.4, -0.02), (2.7, 0.0), (3.0, 0.012)]
    pts = [(-t, v) for t, v in reversed(kn[1:])] + kn
    s += poly([(OX + t * TX, OY - v * SY) for t, v in smooth(pts, 18)])
    s += text(480, 474, '(b)', size=13)
    return s + '</svg>'


# ---------------------------------------------------------------- 六、二进制删除信道
def fig_q6bec():
    s = HEAD.format(w=400, h=280) + marker('a12b')
    NX0, NX1 = 92, 300
    P = {'0': (NX0, 82), '1': (NX0, 200)}
    Q = {'0': (NX1, 82), 'e': (NX1, 141), '1': (NX1, 200)}
    # 转移支路
    s += line(NX0 + 8, 78, NX1 - 8, 62, marker='a12b')
    s += text(196, 50, '1−p', size=13)
    s += line(NX0 + 8, 92, NX1 - 8, 133, marker='a12b')
    s += text(152, 134, 'p', size=13)
    s += line(NX0 + 8, 190, NX1 - 8, 149, marker='a12b')
    s += text(152, 162, 'p', size=13)
    s += line(NX0 + 8, 204, NX1 - 8, 220, marker='a12b')
    s += text(196, 234, '1−p', size=13)
    # 节点
    for k, (x, y) in P.items():
        s += circle(x, y, 15, fill='#ffffff') + text(x, y + 5, k, size=13)
    for k, (x, y) in Q.items():
        s += circle(x, y, 15, fill='#ffffff') + text(x, y + 5, k, size=13, style='i')
    s += text(46, 142, 'X', size=15, style='i')
    s += text(348, 146, 'Y', size=15, style='i')
    return s + '</svg>'


# ---------------------------------------------------------------- 七、p(x)：1/6 于 |x|≤1，1/3 于 1<|x|≤2
def fig_q7pdf():
    s = HEAD.format(w=440, h=250) + marker('a12c')
    OX, OY, SC = 218, 178, 72
    Y13, Y16 = OY - 66, OY - 33
    s += line(24, OY, 412, OY, marker='a12c')
    s += text(402, OY + 24, 'x', size=13, anchor='start', style='i')
    s += line(OX, OY, OX, 34, marker='a12c')
    s += text(OX + 12, 46, 'p(x)', size=13, anchor='start', style='i')
    s += poly([(OX - 2 * SC, OY), (OX - 2 * SC, Y13), (OX - SC, Y13), (OX - SC, Y16),
               (OX + SC, Y16), (OX + SC, Y13), (OX + 2 * SC, Y13), (OX + 2 * SC, OY)])
    s += text(OX - 1.5 * SC, Y13 - 10, '1/3', size=12)
    s += text(OX + 0.5 * SC, Y16 - 10, '1/6', size=12)
    for x, lab in ((-2, '−2'), (-1, '−1'), (0, 'O'), (1, '1'), (2, '2')):
        s += text(OX + x * SC, OY + 22, lab, size=12, style='' if lab == 'O' else 'i')
    return s + '</svg>'


# ---------------------------------------------------------------- 十、DS-BPSK 接收机（解调 + 解扩）
def fig_q10rx():
    s = HEAD.format(w=520, h=232) + marker('a12d')
    Y = 82
    s += text(22, Y + 5, 's(t)+i(t)', size=13, anchor='start', style='i')
    s += line(108, Y, 148, Y, marker='a12d')
    s += mul(166, Y, 14)
    s += line(180, Y, 236, Y, marker='a12d')
    s += text(206, Y - 12, 'r(t)', size=13, style='i')
    s += rect(240, Y - 19, 82, 38) + text(281, Y + 5, '∫_0^{T_b}', size=14, style='i')
    s += line(322, Y, 366, Y, marker='a12d')
    s += rect(370, Y - 19, 64, 38) + text(402, Y + 5, '判决', size=13)
    s += line(434, Y, 486, Y, marker='a12d')
    # 本地扩频码
    s += rect(60, 168, 196, 34) + text(158, 190, '本地扩频码产生及同步', size=13)
    s += line(166, 168, 166, 96, marker='a12d')
    s += text(156, 132, 'c(t)', size=13, anchor='end', style='i')
    # 载波同步
    s += rect(302, 168, 152, 34) + text(378, 190, '载波同步电路', size=13)
    s += line(378, 168, 378, 122) + line(378, 122, 192, 122)
    s += line(192, 122, 184, 96, marker='a12d')
    s += text(206, 110, '2cos2πf_ct', size=13, anchor='start', style='i')
    return s + '</svg>'


# ================================================================ 解析图
# ---------------------------------------------------------------- 三(1) Py(f)
def fig_q3psd():
    s = HEAD.format(w=420, h=238) + marker('a12e')
    BASE, YC = 186, 78            # 基线、块顶高度（0.5 单位）
    # 三段轴（中间断轴）
    s += line(28, BASE, 150, BASE)
    s += line(166, BASE, 196, BASE)
    s += line(212, BASE, 372, BASE, marker='a12e')
    for x in (158, 204):          # 断轴记号
        s += line(x - 4, BASE + 7, x + 4, BASE - 7, width=1.4)
    s += line(300, BASE, 300, 44, marker='a12e')
    s += text(310, 44, 'P_y(f)/10^{−8}', size=13, anchor='start', style='i')
    s += text(376, BASE + 22, 'f/MHz', size=12, anchor='start', style='i')
    # 负频率块 [−51,−49] 与正频率块 [49,51]（顶边 0.51→0.49 的微斜梯形）
    def blk(x0, x1):
        return poly([(x0, BASE), (x0, BASE - 102), (x1, BASE - 98), (x1, BASE)], close=True)
    s += blk(62, 142)
    s += blk(228, 308)
    s += line(140, BASE - 98, 142, BASE - 98, width=1.0)
    # 刻度与标注
    s += text(102, BASE + 22, '−50', size=12)
    s += text(181, BASE + 22, 'O', size=12)
    s += text(62, BASE + 22, '−51', size=11)
    s += text(142, BASE + 22, '−49', size=11)
    s += text(228, BASE + 22, '49', size=11)
    s += text(308, BASE + 22, '51', size=11)
    s += text(268, BASE + 22, '50', size=12)
    s += text(222, BASE - 112, '5.1', size=12, anchor='end')
    s += text(320, BASE - 112, '4.9', size=12)
    return s + '</svg>'


# ---------------------------------------------------------------- 三(2) 同相/正交分量
def fig_q3iq():
    s = HEAD.format(w=400, h=210) + marker('a12f')
    OX, OY, SC, H = 200, 158, 78, 92
    s += line(36, OY, 366, OY, marker='a12f')
    s += text(352, OY + 24, 'f/MHz', size=12, anchor='start', style='i')
    s += line(OX, OY, OX, 34, marker='a12f')
    s += text(OX + 10, 46, 'P_{y_c}(f)', size=13, anchor='start', style='i')
    s += line(OX, OY - H, OX, OY - H, width=1.0)
    s += poly([(OX - SC, OY), (OX - SC, OY - H), (OX + SC, OY - H), (OX + SC, OY)], close=True)
    s += text(OX - 8, OY - H - 10, '10^{−8}', size=12, anchor='end')
    for x, lab in ((-1, '−1'), (0, 'O'), (1, '1')):
        s += text(OX + x * SC, OY + 22, lab, size=12, style='' if lab == 'O' else 'i')
    s += text(200, 198, 'P_{y_s}(f) 与 P_{y_c}(f) 完全相同', size=12, anchor='middle', color='#666')
    return s + '</svg>'


# ---------------------------------------------------------------- 五(1) 三个波形
def fig_q5wave():
    s = HEAD.format(w=470, h=190) + marker('a12g')
    A = 38                         # 幅值 √2 对应的像素
    for i, ox in enumerate((56, 200, 344), start=1):
        OY = 104
        # 波形起点要比纵轴右移一点：s1/s3 在 t=0 分别取 +√2 / −√2，
        # 起点压在纵轴线上会被线宽吃掉，读者看不出这两条是从峰值/谷值起振的
        X0 = ox + 3
        XM = X0 + 52                   # T/2
        X1 = X0 + 104                  # T
        s += line(ox - 10, OY, X1 + 6, OY, marker='a12g')
        s += line(ox, OY, ox, 34, marker='a12g')
        s += text(ox + 4, 26, 's_%d(t)' % i, size=13, style='i')
        s += line(XM, 40, XM, OY + 6, width=1.1, dash='3,4', color='#999')
        s += text(XM, OY + 60, 'T/2', size=11)
        s += text(X1, OY + 60, 'T', size=11, style='i')
        s += text(ox + 5, OY + 60, 'O', size=11)
        s += text(ox - 6, OY - A + 4, '√2', size=11, anchor='end')
        s += text(ox - 6, OY + A + 4, '−√2', size=11, anchor='end')
        # 每半段 2 个载波周期（全段 4 个）；s1=[+,+] s2=[+,−] s3=[−,+]，
        # 即 s2 = −s3（题面），s3 前半段是 −cos
        sg = [[1, 1], [1, -1], [-1, 1]][i - 1]
        for half in (0, 1):
            sgn = sg[half]
            x0 = X0 + half * 52
            pts = [(x0 + 52 * k / 40,
                    OY - sgn * A * math.cos(2 * math.pi * 2 * (k / 40))) for k in range(41)]
            s += poly(pts)
        # 跳变标记：s2、s3 都在 T/2 处从 ±√2 跳到 ∓√2（t=0 处 s3 没有跳变，
        # 它是连续地从 −√2 起振），所以只给 i=2,3 在 T/2 画上下两段短横
        if i in (2, 3):
            s += line(XM, OY - A, XM + 6, OY - A)
            s += line(XM, OY + A, XM + 6, OY + A)
    return s + '</svg>'


# ---------------------------------------------------------------- 五(2) 星座图
def fig_q5const():
    s = HEAD.format(w=310, h=310) + marker('a12h')
    OX, OY, U = 138, 158, 88
    s += line(46, OY, 272, OY, marker='a12h')
    s += text(280, OY + 5, 'f_1(t)', size=13, anchor='start', style='i')
    s += line(OX, 290, OX, 34, marker='a12h')
    s += text(OX + 10, 40, 'f_2(t)', size=13, anchor='start', style='i')
    s += text(OX - 10, OY + 20, 'O', size=12, anchor='end')
    s += dot(OX + U, OY) + dot(OX, OY - U) + dot(OX, OY + U)
    s += text(OX + U + 8, OY + 20, 's_1', size=13, anchor='start', style='i')
    s += text(OX + 10, OY - U - 8, 's_2', size=13, anchor='start', style='i')
    s += text(OX + 10, OY + U + 16, 's_3', size=13, anchor='start', style='i')
    s += text(OX + U, OY + 20, '1', size=12, style='i')
    s += text(OX - 10, OY - U + 4, '1', size=12, anchor='end', style='i')
    s += text(OX - 10, OY + U + 4, '−1', size=12, anchor='end', style='i')
    return s + '</svg>'


# ---------------------------------------------------------------- 五(3) 判决域
def fig_q5decide():
    s = HEAD.format(w=330, h=330) + marker('a12i')
    OX, OY, U = 148, 168, 88
    s += line(46, OY, 292, OY, marker='a12i')
    s += text(300, OY + 5, 'f_1(t)', size=13, anchor='start', style='i')
    s += line(OX, 310, OX, 34, marker='a12i')
    s += text(OX + 10, 40, 'f_2(t)', size=13, anchor='start', style='i')
    # 两条中垂线 y1=y2、y1=−y2（第三条边界就是 f1 轴本身）
    s += line(OX - U * 1.15, OY + U * 1.15, OX + U * 1.15, OY - U * 1.15, width=1.2, dash='5,4', color='#888')
    s += line(OX - U * 1.15, OY - U * 1.15, OX + U * 1.15, OY + U * 1.15, width=1.2, dash='5,4', color='#888')
    s += dot(OX + U, OY) + dot(OX, OY - U) + dot(OX, OY + U)
    s += text(OX + U + 8, OY + 20, 's_1', size=13, anchor='start', style='i')
    s += text(OX + 10, OY - U - 8, 's_2', size=13, anchor='start', style='i')
    s += text(OX + 10, OY + U + 16, 's_3', size=13, anchor='start', style='i')
    s += text(OX + U * 0.80, OY - U * 0.42, 'R_1', size=13, color='#555', style='i')
    s += text(OX - U * 0.35, OY - U * 0.60, 'R_2', size=13, color='#555', style='i')
    s += text(OX - U * 0.35, OY + U * 0.80, 'R_3', size=13, color='#555', style='i')
    s += text(OX + U * 0.62, OY + 22, 'y_2=0', size=11, color='#555', style='i')
    return s + '</svg>'


# ---------------------------------------------------------------- 七(3) 哈夫曼树
def fig_q7huff():
    s = HEAD.format(w=500, h=290) + marker('a12j')
    L = {'a': (86, 52, '1/3'), 'b': (86, 118, '1/6'), 'c': (86, 158, '1/6'), 'd': (86, 226, '1/3')}
    Y = (176, 138)          # b、c 合并点
    X = (300, 96)           # a 与 Y 合并点
    R = (414, 158)          # 根
    s += line(96, 52, 288, 96)                  # a→X
    s += line(96, 118, 164, 138)                # b→Y
    s += line(96, 158, 164, 138)                # c→Y
    s += line(176, 138, 288, 96)                # Y→X
    s += line(312, 96, 402, 158)                # X→root
    s += line(96, 226, 402, 158)                # d→root
    for (x, y), lab, off in (((150, 66), '0', (-6, -8)), ((112, 122), '0', (-4, -8)),
                             ((112, 154), '1', (-4, 16)), ((220, 108), '1', (4, -8)),
                             ((360, 118), '0', (-4, -8)), ((250, 200), '1', (-6, 14))):
        s += text(x + off[0], y + off[1], lab, size=12)
    for k, (x, y, p) in L.items():
        s += text(x - 30, y + 5, k, size=14, anchor='end', style='i')
        s += text(x - 6, y + 5, p, size=12, anchor='end')
    for (x, y), p in ((Y, '1/3'), (X, '2/3'), (R, '1')):
        s += dot(x, y, 3.2)
        s += text(x, y - 10, p, size=12)
    s += text(440, 160, '根', size=12, anchor='start', color='#555')
    return s + '</svg>'


# ---------------------------------------------------------------- 八(1) m(t) 功率谱
def fig_q8psd():
    s = HEAD.format(w=640, h=190) + marker('a12k')
    BASE, H = 148, 62
    U = 13.4                       # 每个 W 的像素
    OX = 46
    s += line(OX, BASE, OX + 44 * U + 26, BASE, marker='a12k')
    s += line(OX, BASE, OX, 52, marker='a12k')
    s += text(OX + 10, 64, 'P_m(f)', size=13, anchor='start', style='i')
    s += text(OX + 44 * U + 30, BASE + 22, 'f', size=13, anchor='start', style='i')
    # 第 0 路基带 [0,W]
    s += poly([(OX, BASE), (OX, BASE - H), (OX + U, BASE - H), (OX + U, BASE)], close=True)
    # 第 k 路 DSB：[6kW−W, 6kW+W]
    for k in range(1, 8):
        x0 = OX + (6 * k - 1) * U
        s += poly([(x0, BASE), (x0, BASE - H), (x0 + 2 * U, BASE - H), (x0 + 2 * U, BASE)], close=True)
    s += text(OX + U / 2, BASE + 20, 'W', size=12, anchor='middle', style='i')
    s += text(OX - 12, BASE + 5, 'O', size=12, anchor='end')
    for k in range(1, 8):
        s += text(OX + 6 * k * U, BASE + 20, '%dW' % (6 * k), size=12, style='i')
    s += text(OX + 43 * U, BASE - H - 8, '43W', size=11, anchor='end', color='#555')
    return s + '</svg>'


# ---------------------------------------------------------------- 八(3) 解调框图
def fig_q8block():
    s = HEAD.format(w=560, h=330) + marker('a12l')
    YM = 46
    s += text(20, YM + 5, 'r(t)', size=13, anchor='start', style='i')
    s += line(58, YM, 78, YM, marker='a12l')
    s += rect(82, YM - 16, 56, 32) + text(110, YM + 5, 'BPF', size=13)
    s += line(138, YM, 158, YM, marker='a12l')
    s += rect(162, YM - 16, 68, 32) + text(196, YM + 5, '鉴频', size=13)
    # 分路母线
    s += line(230, YM, 246, YM)
    s += line(240, YM, 240, 268)
    rows = [(96, '0'), (168, '1'), (250, '7')]
    for y, k in rows:
        s += line(240, y, 256, y, marker='a12l')
        if k == '0':
            s += rect(260, y - 16, 58, 32) + text(289, y + 5, 'LPF_0', size=13, style='i')
            s += line(318, y, 348, y, marker='a12l')
            s += text(358, y + 5, 'm_0(t)', size=13, anchor='start', style='i')
        else:
            s += rect(260, y - 16, 58, 32) + text(289, y + 5, 'BPF_%s' % k, size=13, style='i')
            s += line(318, y, 356, y, marker='a12l')
            s += mul(370, y, 13)
            s += line(383, y, 416, y, marker='a12l')
            s += rect(420, y - 16, 58, 32) + text(449, y + 5, 'LPF_%s' % k, size=13, style='i')
            s += line(478, y, 508, y, marker='a12l')
            s += text(518, y + 5, 'm_%s(t)' % k, size=13, anchor='start', style='i')
            s += line(370, y + 52, 370, y + 13, marker='a12l')
            s += text(378, y + 46, 'cos2π%sf_1t' % ('' if k == '1' else '7'), size=12, anchor='start', style='i')
        if k != '7':
            s += dot(240, y, 2.6)
    for dy in (204, 216, 228):
        s += dot(226, dy, 2.2)
    return s + '</svg>'


# ---------------------------------------------------------------- 九(1) 编码器
def fig_q9enc():
    s = HEAD.format(w=740, h=410) + marker('a12m')
    Y = 120
    s += text(34, Y + 5, 'u', size=14, anchor='end', style='i')
    s += line(44, Y, 132, Y, marker='a12m')
    s += dot(96, Y, 3.2)
    for x, nm in ((132, 'D_1'), (202, 'D_2')):
        s += rect(x, Y - 18, 44, 36) + text(x + 22, Y + 5, nm, size=13, style='i')
    s += line(176, Y, 202, Y, marker='a12m')
    s += dot(189, Y, 3.2)
    s += line(246, Y, 300, Y)
    s += dot(268, Y, 3.2)
    # 三个加法器（右下到左上错开）
    C1, C2, C3 = (620, 80), (560, 180), (500, 280)
    for cx, cy in (C1, C2, C3):
        s += adder(cx, cy, 15)
    # u 母线：下行到底部再上折进各加法器
    s += line(96, Y, 96, 350)
    s += line(96, 350, 620, 350)
    for cx, cy in (C2, C3):
        s += dot(cx, 350, 3.2)
    for cx, cy in (C1, C2, C3):
        s += line(cx, 350, cx, cy + 15, marker='a12m')
    # D1 抽头：上翻后右行，一路进 c1 左侧、一路下行进 c3 左侧
    s += line(189, Y, 189, 80)
    s += line(189, 80, 605, 80, marker='a12m')
    s += dot(189, 80, 3.2)
    s += line(189, 80, 189, 280)
    s += line(189, 280, 485, 280, marker='a12m')
    # D2 抽头：下行，一路进 c2 左侧、一路右行进 c3 顶部
    s += line(268, Y, 268, 250)
    s += dot(268, 180, 3.2)
    s += line(268, 180, 545, 180, marker='a12m')
    s += dot(268, 250, 3.2)
    s += line(268, 250, 500, 250)
    s += line(500, 250, 500, 265, marker='a12m')
    # 输出
    for cx, cy, nm in ((620, 80, 'c_1'), (560, 180, 'c_2'), (500, 280, 'c_3')):
        s += line(cx + 15, cy, cx + 52, cy, marker='a12m')
        s += text(cx + 32, cy - 10, nm, size=13, style='i')
    s += text(60, 390, 'c_1 = u ⊕ D_1,   c_2 = u ⊕ D_2,   c_3 = u ⊕ D_1 ⊕ D_2   （模 2 和）',
              size=12, anchor='start', color='#666')
    return s + '</svg>'


# ---------------------------------------------------------------- 九(2) 状态图
def fig_q9state():
    s = HEAD.format(w=620, h=330) + marker('a12n') + marker('a12o')
    N = {'a': (110, 168), 'b': (330, 78), 'c': (330, 262), 'd': (540, 168)}
    R = 22
    E = [
        # (起点, 控制点, 终点, 标签, 标签偏移, 是否虚线(输入1))
        ('a', (232, 108), 'b', '1/111', (-30, -20), True),
        ('b', (404, 96), 'd', '1/010', (10, -22), True),
        ('a', (232, 236), 'c', '0/011', (-26, 22), False),
        ('d', (448, 236), 'c', '0/110', (14, 24), False),
        ('b', (256, 150), 'c', '0/101', (-45, -8), False),
        ('c', (408, 150), 'b', '1/100', (24, 0), True),
    ]
    for a, cp, b, lbl, off, dashed in E:
        s += qcur(N[a], cp, N[b], dash='6,4' if dashed else None,
                  marker='a12o' if dashed else 'a12n')
        mid = ((N[a][0] + 2 * cp[0] + N[b][0]) / 4, (N[a][1] + 2 * cp[1] + N[b][1]) / 4)
        s += text(mid[0] + off[0], mid[1] + off[1], lbl, size=12)
    # 自环
    s += "<path d='M92,152 C44,132 44,204 92,184' fill='none' stroke='#1a1a1a' stroke-width='1.6' marker-end='url(#a12n)'/>"
    s += text(68, 118, '0/000', size=12)
    s += "<path d='M558,152 C606,132 606,204 558,184' fill='none' stroke='#1a1a1a' stroke-width='1.6' stroke-dasharray='6,4' marker-end='url(#a12o)'/>"
    s += text(586, 118, '1/001', size=12)
    for k, (x, y) in N.items():
        s += circle(x, y, R, fill='#ffffff') + text(x, y + 5, k, size=13, style='i')
    s += text(24, 40, '虚线：输入 1　　实线：输入 0　　支路标号：输入/输出', size=12,
              anchor='start', color='#555')
    return s + '</svg>'


# ---------------------------------------------------------------- 九(3) 网格图（含 1011100 的路径）
def fig_q9trellis():
    s = HEAD.format(w=760, h=300) + marker('a12p')
    X0, DX = 62, 92
    ROW = {'00': 62, '10': 124, '01': 186, '11': 248}
    states = ['00', '10', '01', '11']
    TR = {'00': [('00', '0'), ('10', '1')], '10': [('01', '0'), ('11', '1')],
          '01': [('00', '0'), ('10', '1')], '11': [('01', '0'), ('11', '1')]}
    for t in range(8):
        x = X0 + t * DX
        s += line(x, 40, x, 272, width=1.1, color='#ccc')
        for st in states:
            s += dot(x, ROW[st], 3.2, fill='#ffffff', stroke='#1a1a1a')
    for t in range(7):
        for st in states:
            for nx, b in TR[st]:
                s += line(X0 + t * DX, ROW[st], X0 + (t + 1) * DX, ROW[nx],
                          width=1.0, color='#bbb')
    for st in states:
        s += text(X0 - 14, ROW[st] + 4, st, size=12, anchor='end')
    for t in range(8):
        s += text(X0 + t * DX, 288, 't=%d' % t if t < 4 else '', size=11)
    # 高亮路径：00→10→01→10→11→11→01→00
    path = ['00', '10', '01', '10', '11', '11', '01', '00']
    outs = ['111', '101', '100', '010', '001', '110', '011']
    for t in range(7):
        s += line(X0 + t * DX, ROW[path[t]], X0 + (t + 1) * DX, ROW[path[t + 1]],
                  width=2.4)
    for t in range(7):
        s += text(X0 + (t + 0.5) * DX, 314, outs[t], size=11)
    s += text(X0 + 3.5 * DX, 332, '每拍输出的 3 bit', size=11, anchor='middle', color='#666')
    s += text(24, 30, '粗线为输入 1011100 的编码路径（00→10→01→10→11→11→01→00）', size=11,
              anchor='start', color='#555')
    return s + '</svg>'


# ---------------------------------------------------------------- 十(1) 扩频信号与干扰的功率谱
def fig_q10psd():
    """接收机输入端。横轴取 f−f_c，所以只画 +f_c 那一瓣：两条谱都以 f=0 为峰。
    干扰 P_i 窄而高（零点 ±1/T_b），扩频 P_s 矮而宽（首个零点 ±N/T_b，中间无零点）。"""
    s = HEAD.format(w=640, h=240) + marker('a12q')
    CX, BASE = 300, 186
    U, V = 56, 224                     # 1/T_b、N/T_b 对应的像素（N=4）
    s += line(56, BASE, 560, BASE, marker='a12q')
    s += line(CX, BASE, CX, 40, marker='a12q')
    s += text(CX - 10, 52, 'P(f)', size=13, anchor='end', style='i')
    s += text(592, BASE + 22, 'f−f_c', size=12, anchor='end', style='i')
    # 扩频信号：以 0 为峰的宽瓣，首个零点在 ±N/T_b（sinc 型衰减，中间不落零）
    for sgn in (1, -1):
        pts = [(CX + sgn * V * i / 40, BASE - 26 * abs(SINC(i / 40.0))) for i in range(41)]
        s += poly(pts)
    # 窄带干扰：以 0 为峰的高三角瓣，零点 ±1/T_b
    s += poly([(CX - U, BASE), (CX, BASE - 118), (CX + U, BASE)], close=True, fill='#e8e8e8')
    s += poly([(CX - U, BASE), (CX, BASE - 118), (CX + U, BASE)], close=True)
    s += text(CX + 12, BASE - 126, 'P_i(f)', size=12, anchor='start', style='i')
    s += text(CX + 96, BASE - 48, 'P_s(f)', size=12, anchor='start', style='i')
    s += line(CX + 100, BASE - 42, CX + 126, BASE - 16, width=1.0, color='#555')
    for x, lab, anc in ((U, '1/T_b', 'middle'), (-U, '−1/T_b', 'middle'),
                        (V, 'N/T_b', 'middle'), (-V, '−N/T_b', 'middle')):
        s += text(CX + x, BASE + 20, lab, size=11, anchor=anc)
    s += text(CX - 10, BASE + 20, 'O', size=11, anchor='end')
    return s + '</svg>'


# ---------------------------------------------------------------- 十(2) r(t) 基带分量功率谱
def fig_q10bb():
    """解扩后：有用分量 P_d 窄而高（T_b·sinc²，零点 ±1/T_b），
    干扰分量被扩频码摊平、铺到 ±N/T_b，谱极低——两者形状正好互换。"""
    s = HEAD.format(w=600, h=220) + marker('a12r')
    CX, BASE = 278, 166
    U, V = 56, 224
    s += line(40, BASE, 520, BASE, marker='a12r')
    s += line(CX, BASE, CX, 38, marker='a12r')
    s += text(CX - 10, 50, 'P(f)', size=13, anchor='end', style='i')
    s += text(560, BASE + 22, 'f', size=12, anchor='end', style='i')
    # 干扰分量：宽而极低，|f|<1/T_c 内近似平坦，两端圆滑收尾
    H, FLAT = 18, 176
    pts = []
    for i in range(121):
        x = -V + 2 * V * i / 120.0
        ax = abs(x)
        v = H if ax <= FLAT else H * math.cos(math.pi / 2 * (ax - FLAT) / (V - FLAT))
        pts.append((CX + x, BASE - v))
    s += poly(pts, fill='#e8e8e8')
    s += poly(pts)
    # 有用分量：以 0 为峰的高三角瓣，零点 ±1/T_b
    s += poly([(CX - U, BASE), (CX, BASE - 122), (CX + U, BASE)], close=True)
    s += text(CX + 14, BASE - 128, 'P_d(f)', size=12, anchor='start', style='i')
    s += text(CX + 120, BASE - 44, '干扰分量', size=11, anchor='middle', color='#555')
    s += line(CX + 120, BASE - 38, CX + 120, BASE - 22, width=1.0, color='#555')
    for x, lab, anc in ((U, '1/T_b', 'middle'), (-U, '−1/T_b', 'middle'),
                        (V, 'N/T_b', 'middle'), (-V, '−N/T_b', 'middle')):
        s += text(CX + x, BASE + 20, lab, size=11, anchor=anc)
    s += text(CX - 10, BASE + 20, 'O', size=11, anchor='end')
    return s + '</svg>'


# (key, 题号, 是否解析配图, 描述)。题目原图放 data/figures/<年>/，解析配图放 answer/ 子目录。
FIGS = [
    ('q4figs', '四', False, '基带系统框图与 x1(t) 波形'),
    ('q6bec', '六', False, '二进制删除信道'),
    ('q7pdf', '七', False, '采样值概率密度'),
    ('q10rx', '十', False, 'DS-BPSK 解调与解扩框图'),
    ('q3psd', '三', True, 'y(t) 的功率谱'),
    ('q3iq', '三', True, '同相与正交分量的功率谱'),
    ('q5wave', '五', True, '三个信号波形'),
    ('q5const', '五', True, '信号星座图'),
    ('q5decide', '五', True, '最佳判决区域'),
    ('q7huff', '七', True, '哈夫曼树'),
    ('q8psd', '八', True, 'm(t) 的功率谱'),
    ('q8block', '八', True, 'FDM/FM 解调框图'),
    ('q9enc', '九', True, '卷积码编码器框图'),
    ('q9state', '九', True, '状态转移图'),
    ('q9trellis', '九', True, '网格图与编码路径'),
    ('q10psd', '十', True, '扩频信号与窄带干扰的功率谱'),
    ('q10bb', '十', True, 'r(t) 基带分量的功率谱'),
]

SVGS = {
    'q4figs': fig_q4figs(), 'q6bec': fig_q6bec(), 'q7pdf': fig_q7pdf(), 'q10rx': fig_q10rx(),
    'q3psd': fig_q3psd(), 'q3iq': fig_q3iq(), 'q5wave': fig_q5wave(),
    'q5const': fig_q5const(), 'q5decide': fig_q5decide(), 'q7huff': fig_q7huff(),
    'q8psd': fig_q8psd(), 'q8block': fig_q8block(), 'q9enc': fig_q9enc(),
    'q9state': fig_q9state(), 'q9trellis': fig_q9trellis(),
    'q10psd': fig_q10psd(), 'q10bb': fig_q10bb(),
}
# 全部图统一把 viewBox 收到内容边界（四边各留 18px），与 2025/2026 同一套口径。
SVGS = {k: tighten(v, PAD) for k, v in SVGS.items()}

# 每张图一个文件；输出用 ###FILE: 分隔，落盘用 node tools/emit_figures.mjs 2012。
YEAR = '2012'
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
