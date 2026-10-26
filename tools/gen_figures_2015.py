#!/usr/bin/env python3
# 生成 2015年试卷 SVG 图库（每图一个文件，输出用 ###FILE: 分隔）：
#   node tools/emit_figures.mjs 2015
import math

from svgkit import PAD, tighten  # 统一的 viewBox 收边（四边等宽留白）


# ---------------------------------------------------------------- 基础画笔（与 2016 完全一致）
def marker(mid='arR', color='#1a1a1a'):
    return (f"<defs><marker id='{mid}' markerWidth='8' markerHeight='8' refX='7' refY='3' orient='auto'>"
            f"<path d='M0,0 L7,3 L0,6 z' fill='{color}'/></marker></defs>")


def marker_l(mid='arL', color='#1a1a1a'):
    return (f"<defs><marker id='{mid}' markerWidth='8' markerHeight='8' refX='1' refY='3' orient='auto'>"
            f"<path d='M7,0 L0,3 L7,6 z' fill='{color}'/></marker></defs>")


MK = marker('arR') + marker_l('arL')


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


def dot(x, y, r=3.2, fill='#1a1a1a', stroke='none'):
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


def dimh(x1, x2, y, lbl=None, size=12, ly=None):
    """水平标注线（双箭头）+ 上方文字"""
    s = (f"<line x1='{x1:.1f}' y1='{y:.1f}' x2='{x2:.1f}' y2='{y:.1f}' stroke='#1a1a1a' stroke-width='1.1' "
         f"marker-start='url(#arL)' marker-end='url(#arR)'/>")
    if lbl:
        s += text((x1 + x2) / 2, (ly if ly is not None else y - 9), lbl, size=size)
    return s


def dimv(x, y1, y2, lbl=None, size=12, lx=None, anchor='start'):
    """竖直标注线（双箭头）+ 右侧文字"""
    s = (f"<line x1='{x:.1f}' y1='{y1:.1f}' x2='{x:.1f}' y2='{y2:.1f}' stroke='#1a1a1a' stroke-width='1.1' "
         f"marker-start='url(#arL)' marker-end='url(#arR)'/>")
    if lbl:
        s += text((lx if lx is not None else x + 7), (y1 + y2) / 2 + 4, lbl, size=size, anchor=anchor)
    return s


HEAD = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {w} {h}' "
        "font-family=\"Helvetica,Arial,'PingFang SC','Microsoft YaHei',sans-serif\" font-size='14'>")


# ================================================================ 三、SSB 接收链（题图）
def fig_p3ssb():
    Y = 56
    s = HEAD.format(w=780, h=140) + MK
    s += text(8, Y + 5, 'm(t)', anchor='start', style='i')
    s += line(44, Y, 66, Y, marker='arR')
    s += rect(66, Y - 24, 128, 48) + text(130, Y + 5, '上边带SSB调制', size=13)
    s += text(204, Y - 10, 's(t)', anchor='start', style='i')
    s += line(212, Y, 252, Y, marker='arR')
    s += adder(265, Y)
    s += text(257, 128, 'n_w(t)', anchor='end', style='i')
    s += line(265, 120, 265, Y + 13, marker='arR')
    s += line(278, Y, 322, Y, marker='arR')
    s += rect(322, Y - 21, 64, 42) + text(354, Y + 5, 'BPF')
    s += line(386, Y, 424, Y, marker='arR')
    s += mul(437, Y)
    s += text(437, 16, '2cos(2πf_c t)', size=13)
    s += line(437, 26, 437, Y - 13, marker='arR')
    s += line(450, Y, 494, Y, marker='arR')
    s += rect(494, Y - 21, 64, 42) + text(526, Y + 5, 'LPF')
    s += line(558, Y, 600, Y, marker='arR')
    return s


# ================================================================ 六、基带传输链（题图）
def fig_p6base():
    Y = 56
    s = HEAD.format(w=740, h=150) + MK
    s += text(6, Y - 12, 'd(t) = Σ a_n δ(t-nT_s)', anchor='start', size=13, style='i')
    s += line(210, Y, 240, Y, marker='arR')
    s += rect(240, Y - 24, 116, 48) + text(298, Y - 2, '发送滤波器', size=13) + text(298, Y + 16, 'G_T(f)', size=13, style='i')
    s += text(372, Y - 10, 's(t)', anchor='start', style='i')
    s += line(380, Y, 412, Y, marker='arR')
    s += rect(412, Y - 24, 116, 48) + text(470, Y - 2, '接收滤波器', size=13) + text(470, Y + 16, 'G_R(f)', size=13, style='i')
    s += text(544, Y - 10, 'y(t)', anchor='start', style='i')
    s += line(552, Y, 590, Y, marker='arR')
    s += text(596, Y - 12, '抽样', anchor='start', size=13)
    s += text(596, Y + 16, 't = nT_s', anchor='start', size=12, style='i')
    s += text(346, 128, 'X(f) = G_T(f)G_R(f)', size=12, color='#666')
    return s


# ================================================================ 八、相关接收机（题图）
def fig_p8recv():
    Y = 60
    s = HEAD.format(w=700, h=160) + MK
    s += text(6, Y - 26, 's_1(t), s_2(t)', anchor='start', size=13, style='i')
    s += line(112, Y - 20, 140, Y - 20, marker='arR')
    s += adder(153, Y - 20)
    s += line(153, Y + 44, 153, Y - 7, marker='arR')
    s += text(145, Y + 48, 'n_w(t)', anchor='end', size=13, style='i')
    s += text(178, Y - 29, 'r(t)', anchor='start', size=13, style='i')
    s += line(185, Y - 20, 222, Y - 20, marker='arR')
    s += mul(235, Y - 20)
    s += text(235, 137, '2cos(2πf_c t)', size=13)
    s += line(235, 120, 235, Y - 7, marker='arR')
    s += line(248, Y - 20, 286, Y - 20, marker='arR')
    s += rect(286, Y - 44, 128, 48)
    s += text(350, Y - 26, '积分', size=13)
    s += text(350, Y - 6, '(1/T_b)∫_0^{T_b}', size=12, style='i')
    s += text(432, Y - 30, 'y', anchor='start', style='i')
    s += line(414, Y - 20, 452, Y - 20, marker='arR')
    s += rect(452, Y - 44, 76, 48) + text(490, Y - 20, '判决', size=13)
    s += line(528, Y - 20, 566, Y - 20, marker='arR')
    return s


# ================================================================ 九、星座图（题图）
def fig_p9const():
    U = 92
    cx, cy = 250, 210
    s = HEAD.format(w=460, h=380) + MK
    # 正三角形（虚线辅助）
    tri = [(cx, cy - U), (cx - 0.866 * U, cy + 0.5 * U), (cx + 0.866 * U, cy + 0.5 * U)]
    s += poly(tri, close=True, width=1.2, dash='5,4', stroke='#888')
    # 坐标轴
    s += line(56, cy, 430, cy, marker='arR')
    s += line(cx, 356, cx, 40, marker='arR')
    s += text(436, cy + 5, 'f_1(t)', anchor='start', size=13, style='i')
    s += text(cx + 8, 36, 'f_2(t)', anchor='start', size=13, style='i')
    # 星座点
    pts = [(cx, cy, 's_1', -12, 18, 'end'),
           (cx, cy - U, 's_2', -12, -8, 'end'),
           (tri[1][0], tri[1][1], 's_3', -12, 16, 'end'),
           (tri[2][0], tri[2][1], 's_4', 12, 16, 'start')]
    for x, y, nm, dx, dy, an in pts:
        s += dot(x, y, 4)
        s += text(x + dx, y + dy, nm, size=13, anchor=an, style='i')
    return s


# ================================================================ 十、阶梯密度（题图）
def fig_p10pdf():
    X0, Y0 = 200, 230
    s = HEAD.format(w=480, h=300) + MK
    s += line(40, Y0, 452, Y0, marker='arR')
    s += line(X0, Y0 + 20, X0, 52, marker='arR')
    s += text(458, Y0 + 5, 'x', anchor='start', style='i')
    s += text(X0 + 8, 46, 'p(x)', anchor='start', size=13, style='i')
    s += text(X0 - 8, Y0 + 18, 'O', anchor='end', size=12)
    y1, y2 = Y0 - 60, Y0 - 120
    # 阶梯：-0.5→0 高 1；0→0.25 高 2
    s += line(X0 - 90, y1, X0, y1)
    s += line(X0 - 90, y1, X0 - 90, Y0)
    s += line(X0, y1, X0, y2)
    s += line(X0, y2, X0 + 45, y2)
    s += line(X0 + 45, y2, X0 + 45, Y0)
    for xx, lab in ((X0 - 90, '-0.5'), (X0 + 45, '0.25')):
        s += text(xx, Y0 + 20, lab, size=12)
    s += text(155, y1 - 9, '1', size=13)
    s += text(222, y2 - 9, '2', size=13)
    # b、a 两个电平点
    s += dot(X0 - 45, Y0, 3.6)
    s += text(X0 - 45, Y0 + 38, 'b', size=13, style='i')
    s += dot(X0 + 22, Y0, 3.6)
    s += text(X0 + 22, Y0 + 38, 'a', size=13, style='i')
    return s


# ================================================================ 十二、信道框图（题图）
def fig_p12chan():
    Y = 60
    s = HEAD.format(w=520, h=130) + MK
    s += text(6, Y + 5, 'X', anchor='start', style='i')
    s += line(22, Y, 60, Y, marker='arR')
    s += adder(73, Y)
    s += line(73, Y + 44, 73, Y + 13, marker='arR')
    s += text(73, Y + 60, 'Z_1', size=13, style='i')
    s += line(86, Y, 152, Y, marker='arR')
    s += adder(165, Y)
    s += line(165, Y + 44, 165, Y + 13, marker='arR')
    s += text(165, Y + 60, 'Z_2', size=13, style='i')
    s += line(178, Y, 248, Y, marker='arR')
    s += text(256, Y + 5, 'Y', anchor='start', style='i')
    return s


# ================================================================ 三(2) s(t) 功率谱（解析图）
def fig_a3ps():
    AX, CX = 210, 320
    s = HEAD.format(w=700, h=260) + MK
    s += line(40, AX, 664, AX, marker='arR')
    s += line(CX, AX, CX, 40, marker='arR')
    s += text(CX + 10, 36, 'P_s(f)', anchor='start', size=13, style='i')
    s += text(670, AX + 5, 'f', anchor='start', style='i')
    s += text(CX - 8, AX + 18, 'O', anchor='end', size=12)
    D, W, H = 190, 130, 130
    for c in (CX - D - W / 2, CX + D + W / 2):
        pts = [(c - W / 2 + W * i / 40, AX - H * math.sin(math.pi * i / 40) ** 2) for i in range(41)]
        s += poly(pts, width=1.8)
        s += line(c - W / 2, AX, c - W / 2, AX - H, width=1.2)
        s += line(c + W / 2, AX, c + W / 2, AX - H, width=1.2)
    s += line(CX - D - W, AX, CX - D - W, AX + 5, width=1.2)
    s += line(CX + D + W, AX, CX + D + W, AX + 5, width=1.2)
    s += text(CX - D - W / 2, AX + 20, '-f_c', size=12, style='i')
    s += text(CX + D + W / 2, AX + 20, 'f_c', size=12, style='i')
    s += text(CX - D - W - 14, AX + 20, '-f_c-1k', size=11, style='i', anchor='end')
    s += text(CX + D + W + 14, AX + 20, 'f_c+1k', size=11, style='i', anchor='start')
    s += text(CX + D + W / 2 + 8, AX - H - 10, '1/100', size=12, anchor='start', color='#c00')
    return s


# ================================================================ 四、16QAM 发送框图（解析图，抄 2016 a7tx）
def fig_a4tx():
    YI, YQ, YC = 74, 158, 116
    s = HEAD.format(w=760, h=230) + MK
    s += text(6, YC + 5, 'b_n', anchor='start', style='i')
    s += line(34, YC, 60, YC, marker='arR')
    s += rect(60, YC - 30, 64, 60) + text(92, YC - 4, '串并') + text(92, YC + 14, '转换')
    s += line(124, YC, 136, YC)
    s += line(136, YI, 136, YQ) + dot(136, YC, 3)
    s += line(136, YI, 152, YI, marker='arR')
    s += line(136, YQ, 152, YQ, marker='arR')
    for yy in (YI, YQ):
        s += rect(152, yy - 19, 96, 38) + text(200, yy + 5, '4 电平映射', size=13)
        s += line(248, yy, 276, yy, marker='arR')
        s += rect(276, yy - 19, 116, 38) + text(334, yy + 5, '根升余弦成形', size=13)
    s += text(334, YI - 28, 'α = 0.25', size=12)
    s += line(392, YI, 424, YI, marker='arR')
    s += line(392, YQ, 424, YQ, marker='arR')
    s += mul(438, YI, 13)
    s += mul(438, YQ, 13)
    s += text(438, 34, 'cos(2πf_c t)', size=13)
    s += line(438, 42, 438, YI - 14, marker='arR')
    s += text(426, 212, '-sin(2πf_c t)', size=13, anchor='end')
    s += line(438, 218, 438, YQ + 14, marker='arR')
    s += line(451, YI, 520, YI) + line(520, YI, 520, YC - 13, marker='arR')
    s += line(451, YQ, 520, YQ) + line(520, YQ, 520, YC + 13, marker='arR')
    s += adder(520, YC, 13)
    s += line(533, YC, 578, YC, marker='arR')
    s += text(586, YC + 5, 's_{QAM}(t)', anchor='start', style='i')
    return s


# ================================================================ 四、16QAM 接收框图（解析图，抄 2016 a7rx）
def fig_a4rx():
    YI, YQ, YC = 74, 158, 116
    s = HEAD.format(w=720, h=230) + MK
    s += text(2, YC + 5, 'r(t)', anchor='start', style='i')
    s += line(38, YC, 62, YC, marker='arR')
    s += dot(62, YC, 3)
    s += line(62, YI, 62, YQ)
    s += line(62, YI, 96, YI, marker='arR')
    s += line(62, YQ, 96, YQ, marker='arR')
    s += mul(110, YI, 13) + mul(110, YQ, 13)
    s += text(110, 34, 'cos(2πf_c t)', size=13)
    s += line(110, 42, 110, YI - 14, marker='arR')
    s += text(98, 212, '-sin(2πf_c t)', size=13, anchor='end')
    s += line(110, 218, 110, YQ + 14, marker='arR')
    for yy in (YI, YQ):
        s += line(123, yy, 152, yy, marker='arR')
        s += rect(152, yy - 19, 132, 38) + text(218, yy + 5, '根升余弦匹配滤波', size=13)
        s += line(284, yy, 312, yy, marker='arR')
        s += rect(312, yy - 19, 80, 38) + text(352, yy + 5, '四进制判决', size=13)
        s += line(392, yy, 428, yy, marker='arR')
    s += text(352, YI - 28, 'α = 0.25', size=12)
    s += rect(428, YI - 18, 64, YQ - YI + 36) + text(460, YC - 4, '并串') + text(460, YC + 14, '转换')
    s += line(492, YC, 536, YC, marker='arR')
    s += text(544, YC + 5, 'b_n', anchor='start', style='i')
    return s


# ================================================================ 五(3) FM 功率谱线族（解析图）
def fig_a5ps():
    AX, CX = 200, 330
    s = HEAD.format(w=700, h=250) + MK
    s += line(40, AX, 664, AX, marker='arR')
    s += line(40, AX, 40, 40, marker='arR')
    s += text(48, 36, 'P_s(f)', anchor='start', size=13, style='i')
    s += text(670, AX + 5, 'f', anchor='start', style='i')
    DX = 26
    for k in range(-5, 6):
        hgt = 150 if k == 0 else max(18, 128 - abs(k) * 24)
        s += line(CX + k * DX, AX, CX + k * DX, AX - hgt, width=1.8)
    s += text(CX, AX + 20, 'f_c', size=12, style='i')
    s += text(CX - 5 * DX - 6, AX + 20, 'f_c-10k', size=11, style='i', anchor='end')
    s += text(CX + 5 * DX + 6, AX + 20, 'f_c+10k', size=11, style='i', anchor='start')
    s += dimh(CX, CX + DX, 60)
    s += text(CX + DX + 10, 64, 'f_m = 2kHz', size=11, anchor='start')
    s += text(CX + 7 * DX + 20, AX - 60, '卡森带内间隔 f_m 的线谱', size=11, anchor='start', color='#666')
    return s


# ================================================================ 七(3) 卷积码编码器（解析图）
def fig_a7enc():
    Y = 124
    s = HEAD.format(w=560, h=250) + MK
    s += text(6, Y + 5, 'u', anchor='start', style='i')
    s += line(18, Y, 56, Y, marker='arR')
    s += rect(56, Y - 21, 56, 42) + text(84, Y + 6, 'D_0', style='i')
    s += line(112, Y, 142, Y, marker='arR')
    s += rect(142, Y - 21, 56, 42) + text(170, Y + 6, 'D_1', style='i')
    s += line(198, Y, 268, Y) + dot(268, Y, 3)
    # g1 = 1+x+x^2：抽头 u(左)、D_0 后(中)、D_1 后(右)
    A, AY = 350, 54
    s += adder(A, AY, 13)
    s += line(72, Y, 72, AY) + line(72, AY, A - 13, AY, marker='arR')
    s += dot(72, Y, 3)
    s += line(A, Y, A, AY + 13) + dot(A, Y, 3)
    s += line(268, Y, 268, AY) + line(268, AY, A + 13, AY, marker='arR')
    s += text(A + 22, AY - 16, 'g_1', anchor='start', style='i')
    s += line(A, AY - 13, A, 20) + line(A, 20, 470, 20, marker='arR')
    s += text(478, 25, 'c_1', anchor='start', style='i')
    # g2 = x+x^2：抽头 D_0 后、D_1 后（不含 u）
    BY = 194
    s += adder(A, BY, 13)
    s += line(128, Y, 128, BY) + line(128, BY, A - 13, BY, marker='arR')
    s += dot(128, Y, 3)
    s += line(268, Y, 268, BY) + line(268, BY, A + 13, BY, marker='arR')
    s += text(A + 22, BY + 20, 'g_2', anchor='start', style='i')
    s += line(A, BY + 13, A, 228) + line(A, 228, 470, 228, marker='arR')
    s += text(478, 233, 'c_2', anchor='start', style='i')
    return s


# ================================================================ 九(2) s_1 判决域（解析图）
def fig_a9region():
    U = 92
    cx, cy = 250, 210
    s = HEAD.format(w=480, h=400) + MK
    # D1：s1 的 Voronoi 单胞是有界三角形，顶点为三条中垂线的交点
    a1 = (cx - 0.866 * U, cy - 0.5 * U)   # b12 ∩ b13
    a2 = (cx + 0.866 * U, cy - 0.5 * U)   # b12 ∩ b14
    a3 = (cx, cy + U)                     # b13 ∩ b14
    s += f"<polygon points='{a1[0]:.1f},{a1[1]:.1f} {a2[0]:.1f},{a2[1]:.1f} {a3[0]:.1f},{a3[1]:.1f}' fill='#efefef' stroke='none'/>"
    # 三条中垂线（虚线，向两端略延伸）
    b12 = ((cx - 1.1 * U, cy - 0.5 * U), (cx + 1.1 * U, cy - 0.5 * U))
    e13 = 0.08
    b13 = ((a1[0] - e13 * (a3[0] - a1[0]), a1[1] - e13 * (a3[1] - a1[1])),
           (a3[0] + e13 * (a3[0] - a1[0]), a3[1] + e13 * (a3[1] - a1[1])))
    b14 = ((a2[0] - e13 * (a3[0] - a2[0]), a2[1] - e13 * (a3[1] - a2[1])),
           (a3[0] + e13 * (a3[0] - a2[0]), a3[1] + e13 * (a3[1] - a2[1])))
    for p1, p2 in (b12, b13, b14):
        s += line(p1[0], p1[1], p2[0], p2[1], width=1.2, dash='5,4', color='#888')
    # 坐标轴
    s += line(56, cy, 452, cy, marker='arR')
    s += line(cx, 376, cx, 40, marker='arR')
    s += text(458, cy + 5, 'f_1(t)', anchor='start', size=13, style='i')
    s += text(cx + 8, 36, 'f_2(t)', anchor='start', size=13, style='i')
    # 星座点 + 三角形
    tri = [(cx, cy - U), (cx - 0.866 * U, cy + 0.5 * U), (cx + 0.866 * U, cy + 0.5 * U)]
    s += poly(tri, close=True, width=1.2, dash='5,4', stroke='#888')
    for x, y, nm, dx, dy, an in [(cx, cy, 's_1', -12, 18, 'end'),
                                 (cx, cy - U, 's_2', -12, -8, 'end'),
                                 (tri[1][0], tri[1][1], 's_3', -12, 16, 'end'),
                                 (tri[2][0], tri[2][1], 's_4', 12, 16, 'start')]:
        s += dot(x, y, 4)
        s += text(x + dx, y + dy, nm, size=13, anchor=an, style='i')
    s += text(cx - 8, cy - 0.28 * U, 'D_1', size=12, color='#555', anchor='end')
    return s


# ---------------------------------------------------------------- 输出
FIGS = [
    ('p3ssb', '三', False, 'SSB 调制-解调系统框图'),
    ('p6base', '六', False, '数字基带传输系统框图'),
    ('p8recv', '八', False, '相关接收机框图'),
    ('p9const', '九', False, '四进制星座图（正三角形）'),
    ('p10pdf', '十', False, '阶梯形概率密度'),
    ('p12chan', '十二', False, 'X+Z1+Z2 信道框图'),
    ('a3ps', '三', True, 'SSB 已调信号功率谱'),
    ('a4tx', '四', True, '16QAM 发送端框图'),
    ('a4rx', '四', True, '16QAM 接收端框图'),
    ('a5ps', '五', True, 'FM 信号功率谱线族'),
    ('a7enc', '七', True, '(2,1,3) 卷积码编码器框图'),
    ('a9region', '九', True, 's1 的最佳判决域'),
]

SVGS = {
    'p3ssb': fig_p3ssb(), 'p6base': fig_p6base(), 'p8recv': fig_p8recv(),
    'p9const': fig_p9const(), 'p10pdf': fig_p10pdf(), 'p12chan': fig_p12chan(),
    'a3ps': fig_a3ps(), 'a4tx': fig_a4tx(), 'a4rx': fig_a4rx(),
    'a5ps': fig_a5ps(), 'a7enc': fig_a7enc(), 'a9region': fig_a9region(),
}
SVGS = {k: tighten(v + '</svg>', PAD) for k, v in SVGS.items()}

YEAR = '2015'
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
