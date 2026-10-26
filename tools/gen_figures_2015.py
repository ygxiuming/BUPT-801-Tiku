#!/usr/bin/env python3
# 生成 2015年试卷 SVG 图库（每图一个文件，输出用 ###FILE: 分隔）：
#   node tools/emit_figures.mjs 2015
# 2026-10-26 全部 12 张对照原卷（待解析/灰虎考研北邮801历年真题答案2015年.pdf）重绘：
#   拓扑、器件、标注以原卷为准（三题调制器补 cos 载波、六题补抽样开关与 X(f) 标距线、
#   八题积分器 1/T_b∫( )dt、五题双驼峰包络+离散谱线、七题编码器抽头+换接开关、
#   九题判决域=实线三角形+虚线圆+斜线阴影、四题 2/4 电平变换+抽样开关+双线并拢）。
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


def sigma_adder(cx, cy, r=13):
    """原卷画法的 Σ 相加器（2015 四/十二）：圆圈内写 Σ"""
    return circle(cx, cy, r) + text(cx, cy + 5, 'Σ', size=13)


def term(cx, cy, r=4.5):
    """开关端子／换接端子：小空圆"""
    return circle(cx, cy, r, fill='#fff')


def switch_sample(xl, xr, y):
    """抽样开关：两端子空圆 + 自右上摆向左端子的闸柄（箭头落在左端子上）"""
    return (term(xl, y) + term(xr, y)
            + line(xr + 6, y - 34, xl + 4, y - 5, marker='arR'))


def dimh(x1, x2, y, lbl=None, size=12, ly=None):
    """水平标注线（双箭头）+ 上方文字"""
    s = (f"<line x1='{x1:.1f}' y1='{y:.1f}' x2='{x2:.1f}' y2='{y:.1f}' stroke='#1a1a1a' stroke-width='1.1' "
         f"marker-start='url(#arL)' marker-end='url(#arR)'/>")
    if lbl:
        s += text((x1 + x2) / 2, (ly if ly is not None else y - 9), lbl, size=size)
    return s


def hatch_poly(pts, step=9, holes=(), width=1.0, color='#1a1a1a'):
    """凸多边形内 45° 斜线阴影（不用 pattern，几何自查可见），holes 为 (x0,y0,x1,y1) 挖空矩形"""
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    out = []
    n = len(pts)
    c = min(xs) - max(ys)
    while c <= max(xs) - min(ys):
        ts = []
        for i in range(n):
            x1p, y1p = pts[i]
            x2p, y2p = pts[(i + 1) % n]
            den = (y2p - y1p) - (x2p - x1p)
            if abs(den) < 1e-9:
                continue
            s_ = (x1p - y1p - c) / den
            if -1e-9 <= s_ <= 1 + 1e-9:
                ts.append(x1p + s_ * (x2p - x1p))
        ts.sort()
        segs = [(ts[i], ts[i + 1]) for i in range(0, len(ts) - 1, 2)]
        for (hx0, hy0, hx1, hy1) in holes:
            new = []
            for (a, b) in segs:
                lo = max(hx0, hy0 + c)
                hi = min(hx1, hy1 + c)
                if hi <= a or lo >= b:
                    new.append((a, b))
                    continue
                if a < lo:
                    new.append((a, min(lo, b)))
                if hi < b:
                    new.append((max(hi, a), b))
            segs = new
        for (a, b) in segs:
            if b - a > 2:
                out.append(line(a, a - c, b, b - c, width=width, color=color))
        c += step
    return ''.join(out)


HEAD = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {w} {h}' "
        "font-family=\"Helvetica,Arial,'PingFang SC','Microsoft YaHei',sans-serif\" font-size='14'>")


# ================================================================ 三、SSB 接收链（题图）
# 原卷：m(t)→[上边带SSB调制](cos 2πf_c t 自下方入)→s(t)→⊕(n_w 自下)→BPF→⊗(2cos 自下)→LPF→
def fig_p3ssb():
    Y = 56
    s = HEAD.format(w=640, h=150) + MK
    s += text(6, Y + 5, 'm(t)', anchor='start', style='i')
    s += line(44, Y, 66, Y, marker='arR')
    s += rect(66, Y - 24, 150, 48) + text(141, Y + 5, '上边带SSB调制', size=13)
    # 调制器载波自下方汇入
    s += text(141, 124, 'cos(2πf_c t)', size=13)
    s += line(141, 112, 141, Y + 25, marker='arR')
    s += text(224, Y - 10, 's(t)', anchor='start', style='i')
    s += line(232, Y, 252, Y, marker='arR')
    s += adder(265, Y)
    s += text(257, 128, 'n_w(t)', anchor='end', size=13, style='i')
    s += line(265, 118, 265, Y + 13, marker='arR')
    s += line(278, Y, 322, Y, marker='arR')
    s += rect(322, Y - 21, 64, 42) + text(354, Y + 5, 'BPF')
    s += line(386, Y, 424, Y, marker='arR')
    s += mul(437, Y)
    s += text(437, 124, '2cos(2πf_c t)', size=13)
    s += line(437, 112, 437, Y + 13, marker='arR')
    s += line(450, Y, 494, Y, marker='arR')
    s += rect(494, Y - 21, 64, 42) + text(526, Y + 5, 'LPF')
    s += line(558, Y, 600, Y, marker='arR')
    return s


# ================================================================ 六、基带传输链（题图）
# 原卷：d(t)=Σaₙδ(t−nT_s)→[发送滤波器 G_T(f)]→s(t)→[接收滤波器 G_R(f)]→y(t)→抽样开关(t=nT_s)；
# 下方 X(f) 双箭头标距线横跨两只滤波器
def fig_p6base():
    Y = 56
    s = HEAD.format(w=700, h=150) + MK
    s += text(206, Y + 5, 'd(t) = Σ a_n δ(t-nT_s)', anchor='end', size=13, style='i')
    s += line(214, Y, 244, Y, marker='arR')
    s += rect(244, Y - 24, 116, 48) + text(302, Y - 4, '发送滤波器', size=13) + text(302, Y + 16, 'G_T(f)', size=13, style='i')
    s += text(368, Y - 10, 's(t)', anchor='start', style='i')
    s += line(366, Y, 402, Y, marker='arR')
    s += rect(408, Y - 24, 116, 48) + text(466, Y - 4, '接收滤波器', size=13) + text(466, Y + 16, 'G_R(f)', size=13, style='i')
    s += text(532, Y - 10, 'y(t)', anchor='start', style='i')
    s += line(530, Y, 566, Y, marker='arR')
    s += switch_sample(578, 608, Y)
    s += line(612, Y, 648, Y, marker='arR')
    s += text(552, Y - 48, 't = nT_s', anchor='start', size=13, style='i')
    s += dimh(244, 524, Y + 58)
    s += text(384, Y + 49, 'X(f)', size=13, style='i')
    return s


# ================================================================ 八、相关接收机（题图）
# 原卷：s₁,s₂→⊕(n_w 自下)→r(t)→⊗(2cos 自下)→[1/T_b·∫₀^Tb ( )dt]→y→判决
def fig_p8recv():
    Y = 60
    s = HEAD.format(w=620, h=160) + MK
    s += text(6, Y + 5, 's_1(t), s_2(t)', anchor='start', size=13, style='i')
    s += line(110, Y, 138, Y, marker='arR')
    s += adder(152, Y)
    s += text(144, Y + 64, 'n_w(t)', anchor='end', size=13, style='i')
    s += line(152, Y + 54, 152, Y + 13, marker='arR')
    s += text(172, Y - 10, 'r(t)', anchor='start', style='i')
    s += line(168, Y, 206, Y, marker='arR')
    s += mul(220, Y)
    s += text(220, Y + 70, '2cos(2πf_c t)', size=13)
    s += line(220, Y + 58, 220, Y + 13, marker='arR')
    s += line(233, Y, 268, Y, marker='arR')
    # 积分器：1/T_b（上下分式） + ∫ 上下限 + ( )dt
    s += rect(268, Y - 24, 156, 48)
    s += text(296, Y - 5, '1', size=11)
    s += line(285, Y + 2, 307, Y + 2, width=1.1)
    s += text(287, Y + 20, 'T_b', size=11, anchor='start', style='i')
    s += text(330, Y + 11, '∫', size=30)
    s += text(344, Y - 11, 'T_b', size=10, anchor='start', style='i')
    s += text(344, Y + 24, '0', size=10, anchor='start')
    s += text(366, Y + 6, '( )dt', size=13, anchor='start')
    s += line(424, Y, 458, Y, marker='arR')
    s += text(466, Y - 10, 'y', anchor='start', style='i')
    s += line(462, Y, 494, Y, marker='arR')
    s += rect(494, Y - 21, 64, 42) + text(526, Y + 5, '判决', size=13)
    s += line(558, Y, 594, Y, marker='arR')
    return s


# ================================================================ 九、星座图（题图）
# 原卷：实线正三角形 s₂s₃s₄（重心在原点），s₁ 在原点；f₂ 轴向下穿过三角形底边
def fig_p9const():
    U = 92
    cx, cy = 250, 210
    s = HEAD.format(w=490, h=400) + MK
    tri = [(cx, cy - U), (cx - 0.866 * U, cy + 0.5 * U), (cx + 0.866 * U, cy + 0.5 * U)]
    s += poly(tri, close=True, width=1.6)
    s += line(60, cy, 446, cy, marker='arR')
    s += line(cx, 282, cx, 44, marker='arR')
    s += text(452, cy + 5, 'f_1(t)', anchor='start', size=13, style='i')
    s += text(cx + 8, 40, 'f_2(t)', anchor='start', size=13, style='i')
    for x, y, nm, dx, dy, an in [(cx, cy, 's_1', 10, -8, 'start'),
                                 (cx, cy - U, 's_2', -11, -6, 'end'),
                                 (tri[1][0], tri[1][1], 's_3', -11, 5, 'end'),
                                 (tri[2][0], tri[2][1], 's_4', 11, 5, 'start')]:
        s += dot(x, y, 4)
        s += text(x + dx, y + dy, nm, size=13, anchor=an, style='i')
    return s


# ================================================================ 十、阶梯密度（题图）
# 原卷：p(x) 轴立在 x=0；高度 1、2 标在轴左侧对应高度处；b、a 两点在轴上，x 刻度同一行
def fig_p10pdf():
    X0, Y0 = 210, 240
    y1, y2 = Y0 - 70, Y0 - 140
    s = HEAD.format(w=400, h=320) + MK
    s += line(60, Y0, 330, Y0, marker='arR')
    s += line(X0, Y0 + 24, X0, 58, marker='arR')
    s += text(338, Y0 + 5, 'x', anchor='start', style='i')
    s += text(X0, 50, 'p(x)', size=13, style='i')
    # 阶梯：[-0.5,0) 高 1；[0,0.25] 高 2（轴身兼两步的内侧边）
    s += line(X0 - 120, y1, X0, y1)
    s += line(X0 - 120, y1, X0 - 120, Y0)
    s += line(X0, y1, X0, y2)
    s += line(X0, y2, X0 + 60, y2)
    s += line(X0 + 60, y2, X0 + 60, Y0)
    s += text(X0 - 10, y2 - 6, '2', size=13, anchor='end')
    s += text(X0 - 10, y1 - 6, '1', size=13, anchor='end')
    for xx, lab, sz, st, an in [(90, '-0.5', 12, '', 'middle'), (160, 'b', 13, 'i', 'middle'),
                                (202, 'O', 12, '', 'end'), (240, 'a', 13, 'i', 'middle'),
                                (270, '0.25', 12, '', 'middle')]:
        s += text(xx, Y0 + 22, lab, size=sz, style=st, anchor=an)
    s += dot(160, Y0, 3.6)
    s += dot(240, Y0, 3.6)
    return s


# ================================================================ 十二、信道框图（题图）
# 原卷：X→Σ(Z₁ 自下)→Σ(Z₂ 自下)→Y，相加器为圆圈内 Σ
def fig_p12chan():
    Y = 60
    s = HEAD.format(w=310, h=145) + MK
    s += text(10, Y + 5, 'X', anchor='start', style='i')
    s += line(24, Y, 58, Y, marker='arR')
    s += sigma_adder(72, Y)
    s += line(86, Y, 152, Y, marker='arR')
    s += sigma_adder(166, Y)
    s += line(180, Y, 246, Y, marker='arR')
    s += text(256, Y + 5, 'Y', anchor='start', style='i')
    s += line(72, Y + 52, 72, Y + 13, marker='arR')
    s += text(63, Y + 68, 'Z_1', anchor='start', size=13, style='i')
    s += line(166, Y + 52, 166, Y + 13, marker='arR')
    s += text(157, Y + 68, 'Z_2', anchor='start', size=13, style='i')
    return s


# ================================================================ 三(2) s(t) 功率谱（解析图）
# 原卷：P_s(f) 轴立在中央 O，±f_c 处两个 sin² 驼峰，轴上 1/100 刻度（分式），刻度 f_c−1000…f_c+1000
def fig_a3ps():
    AX, CX = 210, 360
    D, W, H = 215, 190, 105   # 载波间距、驼峰全宽、峰高
    s = HEAD.format(w=790, h=280) + MK
    s += line(50, AX, 730, AX, marker='arR')
    s += line(CX, AX, CX, 48, marker='arR')
    s += text(CX + 10, 44, 'P_s(f)', anchor='start', size=13, style='i')
    s += text(738, AX + 5, 'f', anchor='start', style='i')
    s += text(748, AX + 5, '(Hz)', anchor='start', size=12)
    s += text(CX - 8, AX + 18, 'O', anchor='end', size=12)
    for c in (CX - D, CX + D):
        pts = [(c - W / 2 + W * i / 40, AX - H * math.sin(math.pi * i / 40) ** 2) for i in range(41)]
        s += poly(pts, width=1.8)
    # 峰值 1/100：轴上刻度 + 右侧分式
    s += line(CX - 5, AX - H, CX + 5, AX - H, width=1.2)
    s += text(CX + 12, AX - H - 1, '1', size=12, anchor='start')
    s += line(CX + 11, AX - H + 5, CX + 31, AX - H + 5, width=1.1)
    s += text(CX + 12, AX - H + 19, '100', size=12, anchor='start')
    s += text(CX - D, AX + 22, '-f_c', size=12, style='i')
    s += text(CX + D, AX + 22, 'f_c', size=12, style='i')
    s += text(CX - D - W / 2, AX + 22, '-f_c-1000', size=11, style='i')
    s += text(CX + D + W / 2, AX + 22, 'f_c+1000', size=11, style='i')
    return s


# ================================================================ 四、16QAM 发送框图（解析图）
# 原卷：→[串并转换](竖排字)→两路各 [2/4 电平变换]→[根升余/弦成型](α=0.25)→⊗(cos 上/−sin 下)→Σ(+、+)→S_QAM(t)
def fig_a4tx():
    YI, YQ, YC = 74, 162, 118
    s = HEAD.format(w=580, h=245) + MK
    s += line(16, YC, 46, YC, marker='arR')
    s += rect(46, YI - 12, 46, YQ - YI + 24)
    for k, ch in enumerate('串并转换'):
        s += text(69, YI + 10 + 25 * k, ch, size=13)
    for yy, carr, clbl in ((YI, 'top', 'cos(2πf_c t)'), (YQ, 'bot', '-sin(2πf_c t)')):
        s += line(92, yy, 124, yy, marker='arR')
        s += rect(124, yy - 19, 84, 38) + text(166, yy - 4, '2/4', size=13) + text(166, yy + 11, '电平变换', size=13)
        s += line(208, yy, 238, yy, marker='arR')
        s += rect(238, yy - 19, 76, 38) + text(276, yy - 4, '根升余', size=13) + text(276, yy + 11, '弦成型', size=13)
        s += text(276, yy - 30, 'α = 0.25', size=12)
        s += line(314, yy, 346, yy, marker='arR')
        s += mul(360, yy, 13)
        if yy == YI:
            s += text(360, yy - 54, clbl, size=13)
            s += line(360, yy - 46, 360, yy - 13, marker='arR')
        else:
            s += text(360, yy + 62, clbl, size=13)
            s += line(360, yy + 46, 360, yy + 13, marker='arR')
        s += line(373, yy, 428, yy)
    s += line(428, YI, 428, YC - 13, marker='arR')
    s += line(428, YQ, 428, YC + 13, marker='arR')
    s += sigma_adder(428, YC, 13)
    s += text(418, YI - 7, '+', size=12)
    s += text(418, YQ + 16, '+', size=12)
    s += line(441, YC, 488, YC, marker='arR')
    s += text(496, YC + 5, 'S_QAM(t)', anchor='start', style='i')
    return s


# ================================================================ 四、16QAM 接收框图（解析图）
# 原卷：r(t)→分路→⊗(cos 上/−sin 下)→[根升余/弦匹配](α=0.25)→抽样开关→[四进制判决]
#       →双线并入 [并串转换](竖排字)→
def fig_a4rx():
    YI, YQ, YC = 74, 162, 118
    s = HEAD.format(w=550, h=245) + MK
    s += text(8, YC + 5, 'r(t)', anchor='start', style='i')
    s += line(40, YC, 60, YC, marker='arR')
    s += dot(60, YC, 3)
    s += line(60, YI, 60, YQ)
    for yy, clbl in ((YI, 'cos(2πf_c t)'), (YQ, '-sin(2πf_c t)')):
        s += line(60, yy, 88, yy, marker='arR')
        s += mul(102, yy, 13)
        if yy == YI:
            s += text(102, yy - 54, clbl, size=13)
            s += line(102, yy - 46, 102, yy - 13, marker='arR')
        else:
            s += text(102, yy + 62, clbl, size=13)
            s += line(102, yy + 46, 102, yy + 13, marker='arR')
        s += line(115, yy, 146, yy, marker='arR')
        s += rect(146, yy - 19, 76, 38) + text(184, yy - 4, '根升余', size=13) + text(184, yy + 11, '弦匹配', size=13)
        s += text(184, yy - 30, 'α = 0.25', size=12)
        s += line(222, yy, 250, yy, marker='arR')
        s += switch_sample(260, 290, yy)
        s += line(294, yy, 322, yy, marker='arR')
        s += rect(322, yy - 19, 76, 38) + text(360, yy - 4, '四进制', size=13) + text(360, yy + 11, '判决', size=13)
        # 四进制判决每路出 2 bit：双线并入并串转换
        s += line(398, yy - 7, 434, yy - 7, marker='arR')
        s += line(398, yy + 7, 434, yy + 7, marker='arR')
    s += rect(438, YI - 16, 46, YQ - YI + 32)
    for k, ch in enumerate('并串转换'):
        s += text(461, YI + 10 + 25 * k, ch, size=13)
    s += line(484, YC, 518, YC, marker='arR')
    return s


# ================================================================ 五(3) FM 功率谱（解析图）
# 原卷：P_s(f) 轴立在中央 O，±f_c 两个驼峰包络，峰内两根超出包络的离散谱线（箭头）
#       与自线根内弯落轴的虚线；右驼峰下标 f_c-10k、f_c、f_c+10k
def fig_a5ps():
    AX, CX = 210, 360
    W, H = 110, 100   # 半宽(=10k)、峰高
    s = HEAD.format(w=770, h=285) + MK
    s += line(26, AX, 724, AX, marker='arR')
    s += line(CX, AX, CX, 48, marker='arR')
    s += text(CX + 10, 44, 'P_s(f)', anchor='start', size=13, style='i')
    s += text(732, AX + 5, 'f', anchor='start', style='i')
    s += text(CX - 8, AX + 18, 'O', anchor='end', size=12)
    for c in (CX - 215, CX + 215):
        pts = [(c + W * t, AX - H * (1 - t * t)) for t in [i * 0.05 for i in range(-20, 21)]]
        s += poly(pts, width=1.8)
        # 两根最高的离散谱线（±0.6W 处）穿出包络
        for dx in (-0.6 * W, 0.6 * W):
            s += line(c + dx, AX - 0.64 * H, c + dx, AX - 1.2 * H, width=1.6, marker='arR')
            # 自线根内弯落至轴的虚线
            sx = c + dx + (14 if dx < 0 else -14)
            ex = c + dx * 0.42
            s += (f"<path d='M{c + dx:.1f},{AX - 0.64 * H:.1f} Q{sx:.1f},{AX - 0.15 * H:.1f} {ex:.1f},{AX:.1f}' "
                  f"fill='none' stroke='#888' stroke-width='1.2' stroke-dasharray='5,4'/>")
    s += line(CX + 215, AX - 5, CX + 215, AX + 5, width=1.2)
    s += text(CX + 215 - W, AX + 22, 'f_c-10k', size=12, style='i')
    s += text(CX + 215, AX + 22, 'f_c', size=12, style='i')
    s += text(CX + 215 + W, AX + 22, 'f_c+10k', size=12, style='i')
    s += text(CX - 215, AX + 22, '-f_c', size=12, style='i')
    return s


# ================================================================ 七(3) 卷积码编码器（解析图）
# 原卷：u→D₀→D₁，上下两只 ⊕；上路抽头 u、D₀ 后、D₁ 后（g₁=1+x+x²），
#       下路抽头 D₀ 后、D₁ 后（g₂=x+x²）；c₁/c₂ 经换接开关（X 形双闸柄）合并输出
def fig_a7enc():
    Y, AY, BY, A = 130, 56, 204, 280
    s = HEAD.format(w=600, h=265) + MK
    s += text(10, Y + 5, 'u', anchor='start', style='i')
    s += line(22, Y, 52, Y, marker='arR')
    s += rect(52, Y - 21, 56, 42) + text(80, Y + 6, 'D_0', style='i')
    s += line(108, Y, 138, Y, marker='arR')
    s += rect(138, Y - 21, 56, 42) + text(166, Y + 6, 'D_1', style='i')
    s += line(194, Y, 320, Y) + dot(320, Y, 3)
    # 寄存器间抽头：上入上路 ⊕、下入下路 ⊕
    s += line(123, Y, 123, AY + 13, marker='arR')
    s += line(123, Y, 123, BY - 13, marker='arR')
    s += dot(123, Y, 3)
    # 输入抽头：上摆后从左入上路 ⊕
    s += dot(37, Y, 3)
    s += line(37, Y, 37, AY) + line(37, AY, A - 13, AY, marker='arR')
    # D₁ 后抽头：右端上下分叉，从右入两只 ⊕
    s += line(320, AY, 320, BY)
    s += line(320, AY, A + 13, AY, marker='arR')
    s += line(320, BY, A + 13, BY, marker='arR')
    s += adder(A, AY, 13)
    s += adder(A, BY, 13)
    # 上路输出 c₁、下路输出 c₂，引至右侧换接端子
    s += line(A, AY - 13, A, 24) + line(A, 24, 452, 24) + line(452, 24, 452, 86)
    s += line(A, BY + 13, A, 236) + line(A, 236, 452, 236) + line(452, 236, 452, 174)
    s += term(452, 92) + text(438, 97, 'c_1', anchor='end', size=13, style='i')
    s += term(452, 168) + text(438, 173, 'c_2', anchor='end', size=13, style='i')
    # 换接开关：枢轴空圆 + 交叉双闸柄分别指向 c₁/c₂
    s += term(508, Y)
    s += line(522, 148, 466, 98, marker='arR')
    s += line(522, 112, 466, 162, marker='arR')
    s += line(512, Y, 556, Y, marker='arR')
    return s


# ================================================================ 九(2) s₁ 判决域（解析图）
# 原卷：D₁ 为倒三角（顶点 (±0.866U,−0.5U)、(0,+U)），斜线阴影 + 实线轮廓；
#       虚线等能量圆过 s₂s₃s₄；b₁₃/b₁₄ 过上顶点的虚线延长线；实线三角形 s₂s₃s₄
def fig_a9region():
    U = 92
    cx, cy = 250, 205
    a1 = (cx - 0.866 * U, cy - 0.5 * U)
    a2 = (cx + 0.866 * U, cy - 0.5 * U)
    a3 = (cx, cy + U)
    s = HEAD.format(w=510, h=370) + MK
    # 等能量虚线圆
    s += circle(cx, cy, U, dash='5,4', color='#888', width=1.2)
    # b₁₃/b₁₄ 越过上顶点的虚线延长
    for p_top in (a1, a2):
        dx, dy = p_top[0] - a3[0], p_top[1] - a3[1]
        n = math.hypot(dx, dy)
        s += line(p_top[0], p_top[1], p_top[0] + 55 * dx / n, p_top[1] + 55 * dy / n,
                  width=1.2, dash='5,4', color='#888')
    # D₁ 斜线阴影（s₁ 标注处挖空）
    hole = (255, 182, 285, 204)
    s += hatch_poly([a1, a2, a3], step=9, holes=[hole])
    s += f"<polygon points='{a1[0]:.1f},{a1[1]:.1f} {a2[0]:.1f},{a2[1]:.1f} {a3[0]:.1f},{a3[1]:.1f}' fill='none' stroke='#1a1a1a' stroke-width='1.6'/>"
    # 实线正三角形 s₂s₃s₄
    tri = [(cx, cy - U), (cx - 0.866 * U, cy + 0.5 * U), (cx + 0.866 * U, cy + 0.5 * U)]
    s += poly(tri, close=True, width=1.6)
    # 坐标轴：f₂ 轴至倒三角下顶点，随后虚线穿出圆
    s += line(58, cy, 446, cy, marker='arR')
    s += line(cx, 46, cx, a3[1], marker='arR')
    s += line(cx, a3[1], cx, a3[1] + 39, width=1.1, dash='3,4', color='#999')
    s += text(452, cy + 5, 'f_1(t)', anchor='start', size=13, style='i')
    s += text(cx + 8, 42, 'f_2(t)', anchor='start', size=13, style='i')
    for x, y, nm, dx, dy, an in [(cx, cy, 's_1', 10, -8, 'start'),
                                 (cx, cy - U, 's_2', -11, -6, 'end'),
                                 (tri[1][0], tri[1][1], 's_3', -11, 5, 'end'),
                                 (tri[2][0], tri[2][1], 's_4', 11, 5, 'start')]:
        s += dot(x, y, 4)
        s += text(x + dx, y + dy, nm, size=13, anchor=an, style='i')
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
    ('a5ps', '五', True, 'FM 信号功率谱（包络+离散谱线）'),
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
