#!/usr/bin/env python3
# 生成 2013年试卷 SVG 图库（每图一个文件，输出用 ###FILE: 分隔）：
#   node tools/emit_figures.mjs 2013
import math

from svgkit import PAD, tighten  # 统一的 viewBox 收边（四边等宽留白）


# ---------------------------------------------------------------- 基础画笔
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


def curve(d, width=1.6, dash=None, marker='arR', color='#1a1a1a'):
    """自由曲线（Bézier），默认带箭头"""
    da = f" stroke-dasharray='{dash}'" if dash else ''
    mk = f" marker-end='url(#{marker})'" if marker else ''
    return f"<path d='{d}' fill='none' stroke='{color}' stroke-width='{width}'{da}{mk}/>"


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
    """文字；'_x'/'_{xx}' 排成下标、'^x'/'^{xx}' 排成上标（用 tspan，不用 T_b 这种下划线写法）"""
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


def odot(x, y, r=3.2):
    """空心小圆（开关触点）"""
    return f"<circle cx='{x:.1f}' cy='{y:.1f}' r='{r}' fill='white' stroke='#1a1a1a' stroke-width='1.4'/>"


def circle(cx, cy, r, dash=None, color='#1a1a1a', width=1.6, fill='none'):
    da = f" stroke-dasharray='{dash}'" if dash else ''
    return (f"<circle cx='{cx:.1f}' cy='{cy:.1f}' r='{r:.1f}' fill='{fill}' "
            f"stroke='{color}' stroke-width='{width}'{da}/>")


def rect(x, y, w, h, dash=None, fill='none', width=1.6):
    da = f" stroke-dasharray='{dash}'" if dash else ''
    return (f"<rect x='{x:.1f}' y='{y:.1f}' width='{w:.1f}' height='{h:.1f}' fill='{fill}' "
            f"stroke='#1a1a1a' stroke-width='{width}'{da}/>")


def rrect(cx, cy, w, h, **kw):
    return rect(cx - w / 2, cy - h / 2, w, h, **kw)


def mul(cx, cy, r=13):
    """乘法器 ⊗：圆 + 对角线（不用字符，避免与圆重叠）"""
    return (circle(cx, cy, r)
            + line(cx - r * .71, cy - r * .71, cx + r * .71, cy + r * .71)
            + line(cx + r * .71, cy - r * .71, cx - r * .71, cy + r * .71))


def adder(cx, cy, r=13):
    """相加器 ⊕：圆 + 十字线"""
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


def vtext(x, ys, s, size=14):
    """竖排文字：一列字，从上往下"""
    return ''.join(text(x, y, ch, size=size) for y, ch in zip(ys, s))


HEAD = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {w} {h}' "
        "font-family=\"Helvetica,Arial,'PingFang SC','Microsoft YaHei',sans-serif\" font-size='14'>")


# ================================================================ 一(21~24)、|H(f)|² 带通滤波器
def fig_q1bpf():
    AX, CX = 170, 300
    F, H2 = 140, 50           # f0 离原点、三角形高
    HB = 60                   # 半宽（B = 120px）
    s = HEAD.format(w=620, h=230) + MK
    s += line(60, AX, 590, AX, marker='arR')
    s += line(CX, AX, CX, 52, marker='arR')
    s += text(CX + 12, 58, '|H(f)|^2', anchor='start')
    s += text(600, AX + 5, 'f', anchor='start', style='i')
    s += line(CX - 4, AX - H2, CX + 4, AX - H2, width=1.2)
    s += text(CX + 11, AX - H2 + 5, '1', anchor='start', size=12)
    # 右对（f0 处 V 形缺口，±B/2 处上升到 1）
    s += poly([(CX + F - HB, AX), (CX + F - HB, AX - H2), (CX + F, AX), (CX + F + HB, AX - H2), (CX + F + HB, AX)])
    # 左对（-f0）
    s += poly([(CX - F - HB, AX), (CX - F - HB, AX - H2), (CX - F, AX), (CX - F + HB, AX - H2), (CX - F + HB, AX)])
    s += dimh(CX + F - HB, CX + F + HB, AX - H2 - 22, 'B', ly=AX - H2 - 32)
    s += text(CX - F, AX + 20, '-f_0', style='i')
    s += text(CX + F, AX + 20, 'f_0', style='i')
    s += text(CX - 9, AX + 20, 'O', anchor='end')
    return s + '</svg>'


# ================================================================ 三、矩形脉冲 g(t)
def fig_q3gt():
    AX, X0 = 160, 90
    W = 130
    s = HEAD.format(w=360, h=220) + MK
    s += line(40, AX, 320, AX, marker='arR')
    s += line(X0, AX, X0, 50, marker='arR')
    s += text(X0 + 12, 58, 'g(t)', anchor='start', style='i')
    s += text(330, AX + 5, 't', anchor='start', style='i')
    s += line(X0, AX - 55, X0 + W, AX - 55)
    s += line(X0 + W, AX - 55, X0 + W, AX)
    s += text(X0 - 10, AX - 50, 'A', anchor='end', style='i')
    s += text(X0 - 10, AX + 20, 'O', anchor='end')
    s += text(X0 + W, AX + 20, 'T', style='i')
    return s + '</svg>'


# ================================================================ 四、MQAM 发送框图
def fig_q4mqam():
    s = HEAD.format(w=680, h=260) + MK
    YT, YB = 85, 185           # 上/下支路
    # 输入 Rb → 串并变换
    s += line(40, YT + 40, 92, YT + 40, marker='arR')
    s += text(52, YT + 26, 'R_b', anchor='start', style='i')
    s += rect(92, YT - 10, 38, 100)
    s += vtext(111, [YT + 12, YT + 32, YT + 52, YT + 72], '串并变换')
    # 两支路：D/A → 根升余弦脉冲成型（原卷串并变换引 3 根箭头：上支路 2 + 下支路 1）
    s += line(130, YT - 7, 165, YT - 7, marker='arR')
    s += line(130, YT + 7, 165, YT + 7, marker='arR')
    s += line(130, YB, 165, YB, marker='arR')
    for y in (YT, YB):
        s += rect(165, y - 22, 64, 44) + text(197, y + 6, 'D/A', style='i')
        s += line(229, y, 266, y, marker='arR')
        s += rect(266, y - 29, 132, 58)
        s += text(332, y - 7, '根升余弦', size=13)
        s += text(332, y + 11, '脉冲成型', size=13)
        s += line(398, y, 434, y, marker='arR')
    s += text(418, YT - 15, 'I(t)', style='i')
    s += text(418, YB - 15, 'Q(t)', style='i')
    # 乘法器与载波
    s += mul(450, YT) + mul(450, YB)
    s += line(450, YT + 43, 450, YT + 14, marker='arR')
    s += text(450, YT + 61, 'cos 2π f_c t', size=13)
    s += line(450, YB + 41, 450, YB + 14, marker='arR')
    s += text(450, YB + 61, '-sin 2π f_c t', size=13)
    # Σ 相加（原卷为圆圈内 Σ 字样）
    CX = 560
    s += poly([(463, YT), (CX, YT)])
    s += line(CX, YT, CX, YT + 38, marker='arR')
    s += poly([(463, YB), (CX, YB)])
    s += line(CX, YB, CX, YB - 38, marker='arR')
    s += circle(CX, (YT + YB) / 2, 14)
    s += text(CX, (YT + YB) / 2 + 5, 'Σ', size=13)
    s += text(CX - 9, YT + 30, '+', anchor='end', size=13)
    s += text(CX - 9, YB - 18, '+', anchor='end', size=13)
    s += line(CX + 13, (YT + YB) / 2, 620, (YT + YB) / 2, marker='arR')
    s += text(628, (YT + YB) / 2 + 5, 's(t)', anchor='start', style='i')
    return s + '</svg>'


# ================================================================ 五、三个正交矩形
def fig_q5rect():
    s = HEAD.format(w=700, h=240) + MK
    TOP, BOT = 95, 205         # ±1/2 电平
    for k, (x0, name) in enumerate([(50, 'f_1(t)'), (280, 'f_2(t)'), (510, 'f_3(t)')]):
        s += line(x0 - 20, 150, x0 + 185, 150, marker='arR')
        s += line(x0, 150, x0, 42, marker='arR')
        s += text(x0 + 12, 50, name, anchor='start', style='i')
        s += text(x0 + 193, 155, 't', anchor='start', style='i')
        s += text(x0 - 8, TOP + 5, '1/2', anchor='end', size=12)
        s += text(x0 - 8, 167, '0', anchor='end', size=12)
        s += text(x0 - 8, BOT + 5, '-1/2', anchor='end', size=12)
    U = 30                     # 每 t 单位 30px
    x0 = 50                    # f1：1/2 on [0,2]，-1/2 on [2,4]
    s += poly([(x0, TOP), (x0 + 2 * U, TOP), (x0 + 2 * U, BOT), (x0 + 4 * U, BOT), (x0 + 4 * U, 150)])
    s += text(x0 + 2 * U + 9, 142, '2', anchor='start', size=12)
    s += text(x0 + 4 * U, 139, '4', size=12)
    x0 = 280                   # f2：1/2 on [0,4]
    s += poly([(x0, TOP), (x0 + 4 * U, TOP), (x0 + 4 * U, 150)])
    s += line(x0 + 2 * U, 150, x0 + 2 * U, 157, width=1.2)
    s += line(x0 + 4 * U, 150, x0 + 4 * U, 157, width=1.2)
    s += text(x0 + 2 * U, 176, '2', size=12)
    s += text(x0 + 4 * U, 176, '4', size=12)
    x0 = 510                   # f3：+ - + -，各 1 单位
    s += poly([(x0, TOP), (x0 + U, TOP), (x0 + U, BOT), (x0 + 2 * U, BOT), (x0 + 2 * U, TOP),
               (x0 + 3 * U, TOP), (x0 + 3 * U, BOT), (x0 + 4 * U, BOT), (x0 + 4 * U, 150)])
    s += text(x0 + U - 6, 174, '1', anchor='end', size=12)
    s += text(x0 + 2 * U + 9, 142, '2', anchor='start', size=12)
    s += text(x0 + 3 * U - 6, 174, '3', anchor='end', size=12)
    s += text(x0 + 4 * U, 139, '4', size=12)
    return s + '</svg>'


# ================================================================ 六、s1/s2 波形 (a) + 相关接收机 (b)
def _switch(x1, x2, y, lbl, ly):
    """原卷式开关：两个触点 + 向左上扳的杠杆 + t=T 标注"""
    s = odot(x1, y) + odot(x2, y)
    s += line(x1, y - 2, x1 - 11, y - 15, width=1.4, marker='arR')
    s += text(x1 - 13, ly, lbl, size=12, anchor='end')
    return s


def fig_q6fig():
    s = HEAD.format(w=660, h=530) + MK
    # ---- (a) 两路波形
    for x0, nm, pts in [
        (80, 's_1(t)', [(0, 1), (4, 1), (4, 0)]),
        (340, 's_2(t)', [(0, 1), (3, 1), (3, -1), (4, -1), (4, 0)]),
    ]:
        s += line(x0 - 20, 140, x0 + 185, 140, marker='arR')
        s += line(x0, 140, x0, 48, marker='arR')
        s += text(x0 + 12, 56, nm, anchor='start', style='i')
        s += text(x0 + 193, 145, 't', anchor='start', style='i')
        s += text(x0 - 10, 76, 'A', anchor='end', style='i')
        s += line(x0 - 4, 71, x0, 71, width=1.2)
        s += text(x0 - 8, 158, 'O', anchor='end', size=12)
        s += text(x0 - 10, 198, '-A', anchor='end', style='i')
        s += line(x0 - 4, 193, x0, 193, width=1.2)
        U, lev = 40, {1: 71, 0: 140, -1: 193}
        path = [(x0, 140)] + [(x0 + t * U, lev[v]) for t, v in pts]
        s += poly(path)
        if nm == 's_1(t)':
            s += text(x0 + 4 * U, 162, 'T', style='i')
        else:
            s += text(x0 + 3 * U + 8, 162, 'T_1', anchor='start', style='i')
            s += text(x0 + 4 * U + 12, 162, 'T', style='i')
    s += text(290, 222, '(a)', size=12, style='i', color='#555')
    # ---- (b) 相关接收机
    X1, X2 = 290, 440           # 上下支路 y
    s += text(50, (X1 + X2) / 2 + 5, 'r(t)', anchor='end', style='i')
    s += line(56, (X1 + X2) / 2, 92, (X1 + X2) / 2)
    s += dot(92, (X1 + X2) / 2, 3)
    s += line(92, (X1 + X2) / 2, 92, X1)
    s += line(92, X1, 122, X1, marker='arR')
    s += line(92, (X1 + X2) / 2, 92, X2)
    s += line(92, X2, 122, X2, marker='arR')
    s += mul(140, X1) + mul(140, X2)
    s += line(140, X1 + 32, 140, X1 + 13, marker='arR')
    s += text(140, X1 + 50, 's_1(t)', style='i')
    s += line(140, X2 + 32, 140, X2 + 13, marker='arR')
    s += text(140, X2 + 50, 's_2(t)', style='i')
    for y in (X1, X2):
        s += line(153, y, 190, y, marker='arR')
        s += rect(190, y - 18, 88, 36)
        s += text(234, y + 5, '∫_0^T(·)dt', size=13)
        s += line(278, y, 308, y, marker='arR')
        s += _switch(314, 334, y, 't = T', y - 26)
        s += line(334, y, 402, y, marker='arR')
    s += text(368, X1 - 9, 'r_1', style='i')
    s += text(368, X2 - 9, 'r_2', style='i')
    s += rect(402, X1 - 18, 66, (X2 - X1) + 36)
    for y, chs in [(X1 + 12, '选取'), (X1 + 32, '最大'), (X1 + 52, '相关'), (X1 + 72, '度量')]:
        s += text(444, y, chs, size=13)
    oy = (X1 + X2) / 2
    s += line(468, oy, 526, oy, marker='arR')
    s += text(532, oy + 5, '输出', anchor='start')
    s += text(290, 512, '(b)', size=12, style='i', color='#555')
    return s + '</svg>'


# ================================================================ 十、m(t) 波形
def fig_q10mt():
    AX, X0 = 150, 90
    TAU, TEND = 240, 290       # τ 与 T 的像素位置
    P5, M1 = 85, 175           # +5 与 -1 电平
    s = HEAD.format(w=440, h=250) + MK
    s += line(50, AX, 390, AX, marker='arR')
    s += line(X0, 210, X0, 45, marker='arR')
    s += text(X0 + 12, 52, 'm(t)', anchor='start', style='i')
    s += text(400, AX + 5, 't', anchor='start', style='i')
    s += line(X0, P5, TAU, P5, width=1.1, dash='3,4', color='#999')
    s += line(X0 - 6, P5, X0, P5, width=1.2)
    s += text(X0 - 12, P5 + 5, '5', anchor='end')
    s += text(X0 - 10, AX + 17, 'O', anchor='end', size=12)
    s += text(X0 - 10, M1 + 11, '-1', anchor='end')
    s += poly([(X0, M1), (TAU, M1), (TAU, P5), (TEND, P5), (TEND, AX)])
    s += text(TAU - 12, 167, 'τ', anchor='end', style='i')
    s += text(TEND, AX + 22, 'T', style='i')
    return s + '</svg>'


# ================================================================ 四(2)解析、s(t) 功率谱（升余弦滚降）
def fig_a4psd():
    AX, CX, U = 170, 300, 40   # 1.5MHz ↔ U=40px → 4.5MHz ↔ 3U
    H = 72
    s = HEAD.format(w=620, h=240) + MK
    s += line(50, AX, 575, AX, marker='arR')
    s += line(CX, AX, CX, 55, marker='arR')
    s += text(CX + 12, 62, 'P_s(f)', anchor='start', style='i')
    pts = []
    for i in range(9):         # 左滚降（cos 圆滑）
        t = i / 8
        pts.append((CX - 3 * U + 2 * U * t, AX - H * (1 - 0.5 * (1 + math.cos(math.pi * t)))))
    pts.append((CX - U, AX - H))
    pts.append((CX + U, AX - H))
    for i in range(1, 9):      # 右滚降
        t = i / 8
        pts.append((CX + U + 2 * U * t, AX - H * 0.5 * (1 + math.cos(math.pi * t))))
    s += poly(pts)
    for v, c, da in [(-1, '#888', '5,4'), (1, '#888', '5,4'), (-2, '#999', '3,4'), (2, '#999', '3,4')]:
        s += line(CX + v * U, AX, CX + v * U, AX - H, width=1.1, dash=da, color=c)
    for v, lb in [(-3, '-4.5'), (-2, '-3'), (-1, '-1.5'), (1, '1.5'), (2, '3'), (3, '4.5')]:
        s += line(CX + v * U, AX, CX + v * U, AX + 5, width=1.2)
        s += text(CX + v * U, AX + 20, lb, size=11)
    s += text(CX - 8, AX + 20, 'O', anchor='end', size=11)
    s += text(570, AX + 20, 'f - f_c /MHz', anchor='end', size=12)
    return s + '</svg>'


# ================================================================ 九(2)解析、卷积码编码器
def fig_a9enc():
    s = HEAD.format(w=660, h=215) + MK
    XI, YC = 75, 100           # 输入节点
    # c1 顶轨（直通）
    s += line(XI, YC, XI, 55)
    s += line(XI, 55, 505, 55)
    # 主线：D → D → ⊕(c2)
    s += line(XI, YC, 110, YC, marker='arR')
    s += rect(110, YC - 15, 40, 30) + text(130, YC + 5, 'D', style='i')
    s += line(150, YC, 185, YC, marker='arR')
    s += rect(185, YC - 15, 40, 30) + text(205, YC + 5, 'D', style='i')
    s += line(225, YC, 262, YC, marker='arR')
    s += adder(275, YC, 13)
    s += line(275, 55, 275, YC - 14, marker='arR')      # b_i 从顶轨引入 c2
    s += line(288, YC, 505, YC)
    # c3 底轨 + 两个抽头
    s += line(XI, YC, XI, 150)
    s += line(XI, 150, 227, 150)
    s += dot(167, YC, 2.6)
    s += line(167, YC, 167, 150)
    s += dot(167, 150, 2.6)
    s += dot(240, YC, 2.6)
    s += line(240, YC, 240, 137, marker='arR')
    s += adder(240, 150, 13)
    s += line(253, 150, 505, 150)
    # 触点与转换开关
    s += odot(509, 55) + odot(509, YC) + odot(509, 150)
    s += text(497, 46, 'c_1', anchor='end')
    s += text(497, YC - 9, 'c_2', anchor='end')
    s += text(497, 141, 'c_3', anchor='end')
    s += line(513, 57, 545, 97, width=1.3)
    s += line(513, YC, 544, YC, width=1.3)
    s += line(513, 148, 545, 103, width=1.3)
    s += dot(548, YC, 2.6)
    s += line(548, YC, 585, YC, marker='arR')
    s += text(592, YC + 5, '输出', anchor='start')
    s += text(26, YC + 5, '输入', anchor='start')
    return s + '</svg>'


# ================================================================ 九(3)解析、状态图
def fig_a9state():
    s = HEAD.format(w=680, h=340) + MK
    P = {'00': (120, 165), '10': (340, 85), '11': (560, 165), '01': (340, 250)}
    for k, (x, y) in P.items():
        s += rrect(x, y, 46, 28) + text(x, y + 5, k, size=14)
    # 00 自环 000(0)
    s += curve('M' + f'{P["00"][0]-23},{P["00"][1]-8}' +
               f' C {P["00"][0]-70},{P["00"][1]-30} {P["00"][0]-70},{P["00"][1]+34} {P["00"][0]-23},{P["00"][1]+8}')
    s += text(P['00'][0] - 84, P['00'][1] + 2, '000(0)', size=12)
    # 00 → 10：111(1)
    s += curve(f'M{P["00"][0]+16},{P["00"][1]-12} Q 210,38 {P["10"][0]-18},{P["10"][1]+10}')
    s += text(196, 66, '111(1)', size=12)
    s += text(150, 105, 'a', size=13, style='i')
    # 10 → 11：110(1)
    s += curve(f'M{P["10"][0]+16},{P["10"][1]-12} Q 460,42 {P["11"][0]-18},{P["11"][1]-22}')
    s += text(468, 62, '110(1)', size=12)
    s += text(508, 86, 'd', size=13, style='i')
    # 11 自环 101(1)
    s += curve(f'M{P["11"][0]+23},{P["11"][1]-8}' +
               f' C {P["11"][0]+70},{P["11"][1]-30} {P["11"][0]+70},{P["11"][1]+34} {P["11"][0]+23},{P["11"][1]+8}')
    s += text(P['11'][0] + 88, P['11'][1] + 2, '101(1)', size=12)
    # 11 → 01：010(0)
    s += curve(f'M{P["11"][0]-16},{P["11"][1]+14} Q 460,268 {P["01"][0]+18},{P["01"][1]-8}')
    s += text(482, 270, '010(0)', size=12)
    # 01 → 00：011(0)
    s += curve(f'M{P["01"][0]-16},{P["01"][1]+12} Q 200,290 {P["00"][0]+16},{P["00"][1]+20}')
    s += text(196, 288, '011(0)', size=12)
    s += text(330, 292, 'c', size=13, style='i')
    # 01 → 10：100(1)（左弧上行）
    s += curve(f'M{P["01"][0]-10},{P["01"][1]-13} Q 282,167 {P["10"][0]-10},{P["10"][1]+13}')
    s += text(282, 172, '100(1)', size=12, anchor='end')
    # 10 → 01：001(0)（右弧下行）
    s += curve(f'M{P["10"][0]+10},{P["10"][1]+13} Q 398,167 {P["01"][0]+10},{P["01"][1]-13}')
    s += text(398, 172, '001(0)', size=12)
    s += text(340, 46, 'b', size=13, style='i')
    return s + '</svg>'


# ================================================================ 十(3)解析、超外差接收机
def fig_a10recv():
    s = HEAD.format(w=700, h=250) + MK
    AXy = 120
    s += text(20, AXy + 5, 'r(t)', anchor='start', style='i')
    s += line(56, AXy, 95, AXy, marker='arR')
    s += rect(95, AXy - 22, 72, 44) + text(131, AXy + 5, '混频器')
    # 本振
    s += circle(131, 190, 13)
    s += curve(f'M123,190 q 4,-9 8,0 q 4,9 8,0', width=1.2, marker=None)
    s += text(131, 222, '1575kHz', size=12)
    s += line(131, 177, 131, AXy + 23, marker='arR')
    # 中频 BPF
    s += line(167, AXy, 205, AXy, marker='arR')
    s += rect(205, AXy - 22, 84, 44) + text(247, AXy + 5, 'BPF', style='i')
    s += text(247, AXy - 32, '445 ~ 465kHz', size=12)
    # 分路：主路进相干乘法器；支路 NBF 提取载波
    s += line(289, AXy, 377, AXy, marker='arR')
    s += dot(322, AXy, 2.6)
    s += line(322, AXy, 322, 165)
    s += rect(282, 165, 80, 36) + text(322, 188, 'NBF', style='i')
    s += text(322, 220, '455kHz', size=12)
    s += line(362, 183, 382, 183)
    s += line(382, 183, 382, AXy + 14, marker='arR')
    s += mul(382, AXy)
    s += line(395, AXy, 440, AXy, marker='arR')
    s += rect(440, AXy - 22, 68, 44) + text(474, AXy + 5, 'LPF', style='i')
    s += text(474, AXy + 42, '0 ~ 10kHz', size=12)
    s += line(508, AXy, 540, AXy, marker='arR')
    s += rect(540, AXy - 22, 76, 44) + text(578, AXy + 5, '隔直流')
    s += line(616, AXy, 650, AXy, marker='arR')
    s += text(656, AXy + 5, '输出', anchor='start')
    return s + '</svg>'


FIGS = [
    ('q1bpf', '一', False, '带通滤波器功率传递函数 |H(f)|²'),
    ('q3gt', '三', False, '矩形脉冲 g(t)'),
    ('q4mqam', '四', False, 'MQAM 发送框图'),
    ('q5rect', '五', False, '三个正交矩形 f_1、f_2、f_3'),
    ('q6fig', '六', False, 's_1/s_2 波形 (a) 与相关接收机 (b)'),
    ('q10mt', '十', False, '消息信号 m(t) 波形'),
    ('a4psd', '四', True, 's(t) 功率谱（升余弦滚降）'),
    ('a9enc', '九', True, '卷积码编码器'),
    ('a9state', '九', True, '卷积码状态图'),
    ('a10recv', '十', True, '超外差接收机框图'),
]

SVGS = {
    'q1bpf': fig_q1bpf(), 'q3gt': fig_q3gt(), 'q4mqam': fig_q4mqam(),
    'q5rect': fig_q5rect(), 'q6fig': fig_q6fig(), 'q10mt': fig_q10mt(),
    'a4psd': fig_a4psd(), 'a9enc': fig_a9enc(), 'a9state': fig_a9state(),
    'a10recv': fig_a10recv(),
}
SVGS = {k: tighten(v, PAD) for k, v in SVGS.items()}

YEAR = '2013'
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
