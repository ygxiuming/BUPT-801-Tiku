#!/usr/bin/env python3
# 生成 2021 年试卷 SVG 图库（每图一个文件，输出用 ###FILE: 分隔）：
#   node tools/emit_figures.mjs 2021
import math

from svgkit import PAD, tighten  # 统一的 viewBox 收边（四边等宽留白 18px）


# ---------------------------------------------------------------- 基础画笔
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
    """把 'x_c' / 'T_{b}' / 'y^2' 这类迷你标记切成 [(文字, 'n'|'sub'|'sup'), ...]"""
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
    """文字；'_x'/'_{xx}' 排下标、'^x'/'^{xx}' 排上标（tspan），不写下划线/Unicode 下标"""
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


def rect(x, y, w, h, dash=None, fill='none', width=1.6, color='#1a1a1a'):
    da = f" stroke-dasharray='{dash}'" if dash else ''
    return (f"<rect x='{x:.1f}' y='{y:.1f}' width='{w:.1f}' height='{h:.1f}' fill='{fill}' "
            f"stroke='{color}' stroke-width='{width}'{da}/>")


def mul(cx, cy, r=13):
    """乘法器 ⊗：圆 + 两条对角线"""
    return (circle(cx, cy, r)
            + line(cx - r * .71, cy - r * .71, cx + r * .71, cy + r * .71)
            + line(cx + r * .71, cy - r * .71, cx - r * .71, cy + r * .71))


def adder(cx, cy, r=13):
    """相加器 ⊕：圆 + 十字线"""
    return (circle(cx, cy, r)
            + line(cx - r * .77, cy, cx + r * .77, cy)
            + line(cx, cy - r * .77, cx, cy + r * .77))


HEAD = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {w} {h}' "
        "font-family=\"Helvetica,Arial,'PingFang SC','Microsoft YaHei',sans-serif\" font-size='14'>")


# ------------------------------------------------------------------ 选择题 14：升余弦滚降谱
def fig_q14rc():
    """双边谱：中心 10 MHz，平顶 7~13 MHz，余弦过渡到 6/14 MHz（滚降系数 1/3）"""
    s = HEAD.format(w=640, h=220) + marker('m21a')
    X = lambda f: 100 + (f - 5) * 50
    Y0, YT = 170, 90

    def rise(f0, f1, y_from, y_to, n=24):
        return [(X(f0 + (f1 - f0) * i / n),
                 y_from + (y_to - y_from) * 0.5 * (1 - math.cos(math.pi * i / n)))
                for i in range(n + 1)]

    pts = rise(6, 7, Y0, YT) + [(X(13), YT)] + rise(13, 14, YT, Y0)
    s += poly(pts)
    s += line(80, Y0, 600, Y0, marker='m21a')                 # 频率轴
    s += line(X(10), Y0, X(10), 40, marker='m21a')            # 幅度轴（不带箭头会像谱线）
    # 半幅参考虚线 + 两个带宽边界的垂线
    s += line(X(7), 130, X(13), 130, width=1.1, dash='3,4', color='#999')
    s += line(X(7), 130, X(7), Y0, width=1.1, dash='3,4', color='#999')
    s += line(X(13), 130, X(13), Y0, width=1.1, dash='3,4', color='#999')
    for f in (6, 7, 10, 13, 14):
        s += text(X(f), 190, str(f), size=12, color='#555')
    s += text(575, 190, 'f / MHz', size=13, anchor='start', color='#666')
    s += text(X(10) - 14, 36, 'P(f)', size=13, anchor='end', color='#666')
    return s + '</svg>'


# ------------------------------------------------------------------ 题二：SSB 相干解调框图
def fig_q2block():
    s = HEAD.format(w=680, h=195) + marker('m21b')
    Y = 85
    s += text(30, Y + 5, 's(t)', size=14, anchor='start', style='i')
    s += line(68, Y, 127, Y, marker='m21b')
    s += adder(140, Y, 13)
    s += line(140, 155, 140, 99, marker='m21b')
    s += text(140, 176, '加性高斯白噪声', size=13)
    s += line(153, Y, 198, Y, marker='m21b')
    s += rect(200, 66, 80, 38)
    s += text(240, Y + 6, 'BPF', size=13, style='i')
    s += line(280, Y, 386, Y, marker='m21b')
    s += dot(345, Y, 3.2)
    s += text(345, 70, 'A', size=13)
    s += mul(400, Y, 13)
    s += line(400, 155, 400, 99, marker='m21b')
    s += text(400, 176, '2cos(2πf_c t)', size=13)
    s += line(413, Y, 458, Y, marker='m21b')
    s += rect(460, 66, 82, 38)
    s += text(501, Y + 6, 'LPF', size=13, style='i')
    s += line(542, Y, 606, Y, marker='m21b')
    s += dot(578, Y, 3.2)
    s += text(578, 70, 'B', size=13)
    return s + '</svg>'


# ------------------------------------------------------------------ 题三：双极性 PAM 系统框图
def fig_q3block():
    s = HEAD.format(w=760, h=195) + marker('m21c')
    Y = 85
    s += text(24, Y + 5, '{a_n}', size=13, anchor='start', style='i')
    s += line(58, Y, 118, Y, marker='m21c')
    s += rect(120, 61, 100, 48)
    s += text(170, 82, '发送', size=13)
    s += text(170, 101, '滤波器', size=13)
    s += text(170, 52, 'g(t)', size=13, style='i', color='#555')
    s += line(220, Y, 255, Y, marker='m21c')
    s += dot(243, Y, 3.2)
    s += text(243, 68, 's(t)', size=13, style='i')
    s += text(243, 108, 'A', size=13)
    s += adder(270, Y, 13)
    s += line(270, 155, 270, 99, marker='m21c')
    s += text(270, 176, '加性高斯白噪声', size=13)
    s += line(283, Y, 328, Y, marker='m21c')
    s += rect(330, 61, 100, 48)
    s += text(380, 82, '接收', size=13)
    s += text(380, 101, '滤波器', size=13)
    s += text(380, 52, 'g(t)', size=13, style='i', color='#555')
    s += line(430, Y, 498, Y, marker='m21c')
    s += dot(455, Y, 3.2)
    s += text(455, 68, 'B', size=13)
    # 采样器（开关符号）
    s += dot(500, Y, 2.6)
    s += line(500, Y, 512, 67)
    s += line(516, 59, 516, 75)
    s += line(522, Y, 596, Y, marker='m21c')
    s += dot(560, Y, 3.2)
    s += text(560, 68, 'C', size=13)
    s += text(520, 112, '采样', size=12, color='#666')
    return s + '</svg>'


# ------------------------------------------------------------------ 题四：2PSK 相关接收框图
def fig_q4rx():
    s = HEAD.format(w=730, h=195) + marker('m21d')
    Y = 85
    s += text(26, Y + 5, 's(t)', size=14, anchor='start', style='i')
    s += line(64, Y, 107, Y, marker='m21d')
    s += adder(120, Y, 13)
    s += line(120, 155, 120, 99, marker='m21d')
    s += text(120, 176, 'n_w(t)', size=13, style='i')
    s += line(133, Y, 237, Y, marker='m21d')
    s += text(188, 68, 'r(t)', size=13, style='i')
    s += mul(250, Y, 13)
    s += line(250, 155, 250, 99, marker='m21d')
    s += text(250, 176, '2cos(2πf_c t)', size=13)
    s += line(263, Y, 348, Y, marker='m21d')
    s += text(306, 68, 'y(t)', size=13, style='i')
    s += rect(350, 63, 120, 44)
    s += text(410, 82, '积分清洗', size=13)
    s += text(410, 101, '1/T_s ∫ dt', size=12)
    s += line(470, Y, 533, Y, marker='m21d')
    s += text(504, 68, 'l', size=13, style='i')
    s += rect(535, 65, 70, 40)
    s += text(570, Y + 6, '判决', size=13)
    s += line(605, Y, 652, Y, marker='m21d')
    s += text(662, Y + 5, 'â', size=14, anchor='start')
    return s + '</svg>'


# ------------------------------------------------------------------ 题五：12 进制星座
def fig_q5stem():
    s = HEAD.format(w=620, h=480) + marker('m21e')
    CX, CY, U = 310, 240, 50
    s += line(80, CY, 540, CY, marker='m21e')
    s += line(CX, 440, CX, 40, marker='m21e')
    s += text(550, CY + 5, 'X_I', size=13, anchor='start', style='ib')
    s += text(CX, 30, 'X_Q', size=13, style='ib')
    for xi in (-3, -1, 1, 3):
        for xq in (-3, -1, 1, 3):
            if abs(xi) == 3 and abs(xq) == 3:
                continue
            s += dot(CX + U * xi, CY - U * xq, 5)
    return s + '</svg>'


# ------------------------------------------------------------------ 题二解析图：噪声双边谱
def psd_axis(s, y, x0, x1, mid):
    s += line(mid, y, x1, y, marker='m21f')
    s += line(mid, y, x0, y, marker='m21f')
    return s


def fig_q2psd2():
    s = HEAD.format(w=700, h=330) + marker('m21f')
    AY, BY = 120, 290
    # A 点：±[1000,1100] Hz，0.25 px/Hz
    s = psd_axis(s, AY, 60, 660, 360)
    for x1, x2 in ((610, 635), (85, 110)):
        s += rect(x1, AY - 55, x2 - x1, 55, color='#1a1a1a')
    s += text(622, 55, 'N_0/2', size=13, color='#555')
    s += text(622, 145, '1000~1100', size=12, color='#555')
    s += text(97, 145, '-1100~-1000', size=12, color='#555')
    s += text(360, 145, '0', size=12, color='#555')
    s += text(60, 35, 'A 点：S_A(f)', size=13, anchor='start', color='#666')
    # B 点：|f|≤100 Hz，1 px/Hz
    s = psd_axis(s, BY, 220, 500, 360)
    s += rect(260, BY - 55, 200, 55, color='#1a1a1a')
    s += text(360, 225, 'N_0/2', size=13, color='#555')
    for xv in (-100, 0, 100):
        s += text(360 + xv, 315, str(xv), size=12, color='#555')
    s += text(60, 205, 'B 点：S_B(f)', size=13, anchor='start', color='#666')
    return s + '</svg>'


def fig_q2psd3():
    s = HEAD.format(w=700, h=330) + marker('m21f')
    AY, BY = 120, 290
    # A 点：±[950,1100] Hz
    s = psd_axis(s, AY, 60, 660, 360)
    for x1, x2 in ((597.5, 635), (85, 122.5)):
        s += rect(x1, AY - 55, x2 - x1, 55, color='#1a1a1a')
    s += text(616, 55, 'N_0/2', size=13, color='#555')
    s += text(616, 145, '950~1100', size=12, color='#555')
    s += text(104, 145, '-1100~-950', size=12, color='#555')
    s += text(360, 145, '0', size=12, color='#555')
    s += text(60, 35, 'A 点：S_A(f)', size=13, anchor='start', color='#666')
    # B 点：|f|<50 高 N0；50<|f|<100 高 N0/2
    s = psd_axis(s, BY, 220, 500, 360)
    s += rect(310, BY - 55, 100, 55, color='#1a1a1a')
    s += rect(260, BY - 27.5, 50, 27.5, color='#1a1a1a')
    s += rect(410, BY - 27.5, 50, 27.5, color='#1a1a1a')
    s += text(360, 225, 'N_0', size=13, color='#555')
    s += text(435, 252, 'N_0/2', size=12, color='#555')
    for xv in (-100, -50, 0, 50, 100):
        s += text(360 + xv, 315, str(xv), size=12, color='#555')
    s += text(60, 205, 'B 点：S_B(f)', size=13, anchor='start', color='#666')
    return s + '</svg>'


# ------------------------------------------------------------------ 题三解析图：眼图
def fig_q3eye1():
    s = HEAD.format(w=520, h=270) + marker('m21h')
    Y0, HI = 210, 60
    s += line(60, Y0, 480, Y0, marker='m21h')
    s += line(265, 288, 265, 45, marker='m21h')
    s += text(492, Y0 + 5, 't', size=13, anchor='start', style='i')
    s += text(238, 35, '幅度', size=13, anchor='end', color='#666')
    # 上下两条“眼睑”
    s += line(145, Y0 - HI, 385, Y0 - HI)
    s += line(145, Y0 + HI, 385, Y0 + HI)
    # 两条过渡曲线，在 t=±T/2 处过零
    s += ("<path d='M145,270 C205,270 205,150 265,150 C325,150 325,270 385,270' "
          "fill='none' stroke='#1a1a1a' stroke-width='1.6'/>")
    s += ("<path d='M145,150 C205,150 205,270 265,270 C325,270 325,150 385,150' "
          "fill='none' stroke='#1a1a1a' stroke-width='1.6'/>")
    s += line(265, 132, 265, 288, width=1.1, dash='3,4', color='#999')
    s += line(265, 90, 385, 90, marker='m21h')
    s += text(325, 78, 'T_b=1 s', size=12, color='#555')
    s += text(275, 305, '最佳采样时刻', size=12, anchor='start', color='#666')
    return s + '</svg>'


def fig_q3eye2():
    s = HEAD.format(w=560, h=280) + marker('m21i')
    Y0, HI = 210, 50
    s += line(60, Y0, 500, Y0, marker='m21i')
    s += line(265, 288, 265, 45, marker='m21i')
    s += text(512, Y0 + 5, 't', size=13, anchor='start', style='i')
    s += text(238, 35, '幅度', size=13, anchor='end', color='#666')
    for ph in (0, math.pi / 4, math.pi / 2, 3 * math.pi / 4,
               math.pi, 5 * math.pi / 4, 3 * math.pi / 2, 7 * math.pi / 4):
        pts = []
        for i in range(49):
            x = 145 + 240 * i / 48
            y = Y0 + HI * math.cos(math.pi * (x - 265) / 60 + ph)
            pts.append((x, y))
        s += poly(pts, width=1.3)
    for xv in (205, 265, 325):
        s += line(xv, 150, xv, 280, width=1.1, dash='3,4', color='#999')
    s += line(265, 90, 325, 90, marker='m21i')
    s += text(295, 78, 'T_b=0.5 s', size=12, color='#555')
    s += text(335, 305, '最佳采样时刻', size=12, anchor='start', color='#666')
    return s + '</svg>'


# ------------------------------------------------------------------ 题五解析图：最佳判决域
def fig_q5region():
    s = HEAD.format(w=620, h=480) + marker('m21j')
    CX, CY, U = 310, 240, 40
    s += line(CX, CY, 540, CY, marker='m21j')
    s += line(CX, CY, 80, CY, marker='m21j')
    s += line(CX, 440, CX, 40, marker='m21j')
    s += text(552, CY + 5, 'X_I', size=13, anchor='start', style='ib')
    s += text(CX, 30, 'X_Q', size=13, style='ib')

    def vd(x, y1, y2):
        return line(x, y1, x, y2, width=1.2, dash='5,4', color='#888')

    def hd(y, x1, x2):
        return line(x1, y, x2, y, width=1.2, dash='5,4', color='#888')

    # 内正方形
    s += vd(CX - 2 * U, CY - 2 * U, CY + 2 * U) + vd(CX + 2 * U, CY - 2 * U, CY + 2 * U)
    s += hd(CY - 2 * U, CX - 2 * U, CX + 2 * U) + hd(CY + 2 * U, CX - 2 * U, CX + 2 * U)
    # 向外延伸的边
    s += vd(CX - 2 * U, CY - 4.2 * U, CY - 2 * U) + vd(CX + 2 * U, CY - 4.2 * U, CY - 2 * U)
    s += vd(CX - 2 * U, CY + 2 * U, CY + 4.2 * U) + vd(CX + 2 * U, CY + 2 * U, CY + 4.2 * U)
    s += hd(CY - 2 * U, CX - 4.2 * U, CX - 2 * U) + hd(CY + 2 * U, CX - 4.2 * U, CX - 2 * U)
    s += hd(CY - 2 * U, CX + 2 * U, CX + 4.2 * U) + hd(CY + 2 * U, CX + 2 * U, CX + 4.2 * U)
    # 四条对角分界
    for sx, sy in ((1, -1), (-1, -1), (-1, 1), (1, 1)):
        s += line(CX + sx * 2 * U, CY + sy * 2 * U,
                  CX + sx * 4.2 * U, CY + sy * 4.2 * U, width=1.2, dash='5,4', color='#888')
    for xi in (-3, -1, 1, 3):
        for xq in (-3, -1, 1, 3):
            if abs(xi) == 3 and abs(xq) == 3:
                continue
            s += dot(CX + U * xi, CY - U * xq, 4.6)
    return s + '</svg>'


# ------------------------------------------------------------------ 题六解析图：p(x)
def fig_q6pdf():
    s = HEAD.format(w=600, h=340) + marker('m21k')
    X0, Y0 = 100, 280
    X = lambda v: X0 + 100 * v
    Yp = lambda p: Y0 - 360 * p
    s += line(80, Y0, 560, Y0, marker='m21k')
    s += line(X0, Y0, X0, 60, marker='m21k')
    s += line(X(0), Y0, X(0), Yp(1 / 3))
    s += line(X(0), Yp(1 / 3), X(2), Yp(1 / 3))
    s += line(X(2), Yp(1 / 3), X(2), Yp(1 / 6))
    s += line(X(2), Yp(1 / 6), X(4), Yp(1 / 6))
    s += line(X(4), Yp(1 / 6), X(4), Y0)
    s += text(X(1), Yp(1 / 3) - 10, '1/3', size=13, color='#555')
    s += text(X(3), Yp(1 / 6) - 10, '1/6', size=13, color='#555')
    for v in (0, 2, 4):
        s += text(X(v), Y0 + 20, str(v), size=12, color='#555')
    s += text(552, 268, 'x', size=13, anchor='start', style='i')
    s += text(X0 - 14, 74, 'p(x)', size=13, anchor='end', color='#666', style='i')
    return s + '</svg>'


# ------------------------------------------------------------------ 题七解析图：卷积码编码器
def fig_q7enc():
    s = HEAD.format(w=760, h=440) + marker('m21l')
    Y = 120
    # 输入与 D 链
    s += text(38, Y + 5, 'u', size=14, anchor='end', style='i')
    s += line(50, Y, 140, Y, marker='m21l')
    s += dot(100, Y, 3.2)
    for i, (x, nm) in enumerate(((140, 'D_1'), (210, 'D_2'), (280, 'D_3'))):
        s += rect(x, Y - 18, 44, 36)
        s += text(x + 22, Y + 5, nm, size=13, style='i')
        if i < 2:
            s += line(x + 44, Y, x + 70, Y, marker='m21l')
            s += dot(x + 57, Y, 3.2)
    s += line(324, Y, 450, Y)

    # 三个加法器：右下到左上错开，避免连线交叉
    C1, C2, C3 = (620, 80), (560, 180), (500, 280)
    for cx, cy in (C1, C2, C3):
        s += adder(cx, cy, 15)

    # u 母线：左侧下行，底部横线，三路上升进加法器底部
    s += line(100, Y, 100, 350)
    s += line(100, 350, 620, 350)
    for cx, cy in (C1, C2, C3):
        s += line(cx, 350, cx, cy + 15, marker='m21l')
        s += dot(cx, 350, 3.2)

    # D3 抽头：右侧竖干线，分别进入三个加法器左侧
    s += dot(450, Y, 3.2)
    s += line(450, 80, 450, 280)
    for cx, cy in (C1, C2, C3):
        s += line(450, cy, cx - 15, cy, marker='m21l')
    for cy in (80, 180, 280):
        s += dot(450, cy, 3.2)

    # D1、D2 抽头从上方分别进入 c1、c2 顶部
    s += line(197, Y, 197, 40) + line(197, 40, 620, 40) + line(620, 40, 620, 65, marker='m21l')
    s += line(267, Y, 267, 50) + line(267, 50, 560, 50) + line(560, 50, 560, 165, marker='m21l')

    # 输出
    for cx, cy, nm in ((C1[0], C1[1], 'c_1'), (C2[0], C2[1], 'c_2'), (C3[0], C3[1], 'c_3')):
        s += line(cx + 15, cy, cx + 45, cy, marker='m21l')
        s += text(cx + 40, cy - 10, nm, size=13, style='i')

    s += text(60, 410, 'c_1 = u + D_1 + D_3,   c_2 = u + D_2 + D_3,   c_3 = u + D_3   (模 2 和)',
              size=12, anchor='start', color='#666')
    return s + '</svg>'


# (key, 题号, 是否解析配图, 描述)
FIGS = [
    ('q14rc', '一', False, '升余弦滚降功率谱'),
    ('q2block', '二', False, 'SSB 相干解调框图'),
    ('q3block', '三', False, '双极性 PAM 传输系统框图'),
    ('q4rx', '四', False, '2PSK 相关接收框图'),
    ('q5stem', '五', False, '12 进制星座图'),
    ('q2psd2', '二', True, 'BPF 1000~1100 Hz 时 A/B 点噪声谱'),
    ('q2psd3', '二', True, 'BPF 950~1100 Hz 时 A/B 点噪声谱'),
    ('q3eye1', '三', True, 'T_b=1 s 眼图'),
    ('q3eye2', '三', True, 'T_b=0.5 s 眼图'),
    ('q5region', '五', True, '12 进制最佳判决域'),
    ('q6pdf', '六', True, '量化器输出概率密度'),
    ('q7enc', '七', True, '(3,1,4) 卷积码编码器'),
]
SVGS = {
    'q14rc': fig_q14rc(), 'q2block': fig_q2block(), 'q3block': fig_q3block(),
    'q4rx': fig_q4rx(), 'q5stem': fig_q5stem(), 'q2psd2': fig_q2psd2(),
    'q2psd3': fig_q2psd3(), 'q3eye1': fig_q3eye1(), 'q3eye2': fig_q3eye2(),
    'q5region': fig_q5region(), 'q6pdf': fig_q6pdf(), 'q7enc': fig_q7enc(),
}
# 统一收边：四边各留 18px
SVGS = {k: tighten(v, PAD) for k, v in SVGS.items()}

YEAR = '2021'
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

print('###FILE:data/figures/' + YEAR + '/_index.js')
print('// ' + YEAR + ' 图库索引 —— 由 tools/gen_figures_' + YEAR + '.py 生成；Node 端 require 用，不进浏览器 bundle')
for r in requires:
    print('require("' + r + '");')
