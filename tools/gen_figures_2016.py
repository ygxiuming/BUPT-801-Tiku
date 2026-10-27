#!/usr/bin/env python3
# 生成 2016年试卷 SVG 图库（每图一个文件，输出用 ###FILE: 分隔）：
#   node tools/emit_figures.mjs 2016
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


def dimv(x, y1, y2, lbl=None, size=12, lx=None, anchor='start'):
    """竖直标注线（双箭头）+ 右侧文字"""
    s = (f"<line x1='{x:.1f}' y1='{y1:.1f}' x2='{x:.1f}' y2='{y2:.1f}' stroke='#1a1a1a' stroke-width='1.1' "
         f"marker-start='url(#arL)' marker-end='url(#arR)'/>")
    if lbl:
        s += text((lx if lx is not None else x + 7), (y1 + y2) / 2 + 4, lbl, size=size, anchor=anchor)
    return s


HEAD = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {w} {h}' "
        "font-family=\"Helvetica,Arial,'PingFang SC','Microsoft YaHei',sans-serif\" font-size='14'>")


# ================================================================ 三、题干 H(f)
def fig_p3H():
    AX, CX, H = 136, 356, 74
    F, B3 = 118, 40               # fc 离原点像素、B/3 像素（B = 3*B3）
    s = HEAD.format(w=620, h=210) + MK
    s += line(46, AX, 596, AX, marker='arR')
    s += line(CX, AX, CX, 40, marker='arR')
    s += text(CX + 10, 36, 'H(f)', anchor='start')
    s += text(602, AX + 5, 'f', anchor='start', style='i')
    # 左块 [-fc-2B/3, -fc+B/3]、右块 [fc-B/3, fc+2B/3]，均宽 B；±fc 虚线在块内
    s += poly([(CX - F - 2 * B3, AX), (CX - F - 2 * B3, AX - H), (CX - F + B3, AX - H), (CX - F + B3, AX)], close=True)
    s += poly([(CX + F - B3, AX), (CX + F - B3, AX - H), (CX + F + 2 * B3, AX - H), (CX + F + 2 * B3, AX)], close=True)
    s += line(CX - F + B3, AX - H, CX + F - B3, AX - H, width=1.1, dash='3,4', color='#999')
    s += line(CX - F, AX, CX - F, AX - H, width=1.1, dash='5,4', color='#888')
    s += line(CX + F, AX, CX + F, AX - H, width=1.1, dash='5,4', color='#888')
    s += text(CX + 8, AX - H - 4, '1', anchor='start', size=12)
    s += dimh(CX - F - 2 * B3, CX - F + B3, AX - H - 16, 'B', ly=AX - H - 26)
    s += dimh(CX + F - B3, CX + F, AX - H - 16, 'B/3', size=11, ly=AX - H - 26)
    s += text(CX - F, AX + 18, '-f_c', style='i')
    s += text(CX + F, AX + 18, 'f_c', style='i')
    s += text(CX - 8, AX + 18, 'O', anchor='end')
    return s + '</svg>'


# ================================================================ 四、PAM 系统框图 + Eg(f)
def fig_p4fig():
    """(a) PAM 系统框图；(b) 基带脉冲能量谱（上下叠放，窄画布在页面里不被缩小）"""
    s = HEAD.format(w=580, h=460) + MK
    Y = 128
    s += text(6, Y + 5, 'a_k', anchor='start', style='i')
    s += line(30, Y, 62, Y, marker='arR')
    s += rect(62, Y - 24, 78, 48) + text(101, Y + 6, 'g(t)', style='i')
    s += text(101, Y - 32, '发送滤波器')
    s += line(140, Y, 176, Y, marker='arR')
    s += text(150, Y - 10, 's(t)', anchor='start', style='i')
    s += adder(190, Y, 14)
    s += line(190, 204, 190, Y + 14, marker='arR')
    s += text(190, 220, 'n_w(t)', style='i')
    s += line(204, Y, 236, Y, marker='arR')
    s += rect(236, Y - 24, 78, 48) + text(275, Y + 6, 'h(t)', style='i')
    s += text(275, Y - 32, '接收滤波器')
    s += line(314, Y, 360, Y, marker='arR')
    s += dot(366, Y, 3)
    s += line(366, Y, 386, Y - 18)
    s += line(386, Y - 26, 386, Y - 10)
    s += line(386, Y, 448, Y, marker='arR')
    s += text(392, Y - 34, 't = kT', size=13)
    s += text(456, Y + 5, 'y_k', anchor='start', style='i')
    s += text(240, 246, '(a)', anchor='middle', size=12, style='i', color='#555')

    # (b) Eg(f)
    AX, CX, U = 384, 258, 56
    s += line(70, AX, 470, AX, marker='arR')
    s += line(CX, AX, CX, 296, marker='arR')
    s += text(CX + 8, 288, 'E_g(f)', anchor='start')
    s += text(478, AX + 5, 'f', anchor='start', style='i')
    s += poly([(CX - 3 * U, AX), (CX - U, AX - 76), (CX + U, AX - 76), (CX + 3 * U, AX)], close=True)
    for v in (-1, 1):   # 肩点参考虚线（原卷 ±T_b/4 处各一条）
        s += line(CX + v * U, AX, CX + v * U, AX - 76, width=1.1, dash='5,4', color='#888')
    for v in (-3, -1, 1, 3):
        s += line(CX + v * U, AX, CX + v * U, AX + 5, width=1.2)
        s += text(CX + v * U, AX + 20,
                  ('-3/(4T_b)' if v == -3 else '-1/(4T_b)' if v == -1
                   else '1/(4T_b)' if v == 1 else '3/(4T_b)'), size=11)
    s += text(CX - 8, AX + 20, 'O', anchor='end')
    s += text(CX - 54, AX - 84, 'T_b', size=13)
    s += text(274, AX + 62, '(b)', anchor='middle', size=12, style='i', color='#555')
    return s + '</svg>'


# ================================================================ 五、系统框图 + s1/s2 波形
def fig_p5fig():
    """(a) 二进制传输系统框图；(b) s_1(t)、s_2(t) 波形"""
    s = HEAD.format(w=580, h=450) + MK
    YT, YB, YC = 96, 168, 132
    s += text(6, YC - 14, 's_1(t), s_2(t)', anchor='start', style='i')
    s += text(6, YC + 8, '0 ≤ t ≤ T_b', anchor='start', size=12)
    s += line(118, YC, 152, YC, marker='arR')
    s += adder(166, YC, 13)
    s += line(166, 206, 166, YC + 13, marker='arR')
    s += text(166, 222, 'n_w(t)', style='i')
    s += line(179, YC, 214, YC, marker='arR')
    s += text(184, YC - 10, 'r(t)', anchor='start', style='i')
    s += line(214, YT, 214, YB)
    s += line(214, YT, 238, YT, marker='arR')
    s += line(214, YB, 238, YB, marker='arR')
    s += dot(214, YC, 3)
    s += rect(238, YT - 18, 66, 36) + text(271, YT + 5, 'h_1(t)', style='i')
    s += rect(238, YB - 18, 66, 36) + text(271, YB + 5, 'h_2(t)', style='i')
    for yy in (YT, YB):
        s += line(304, yy, 340, yy, marker='arR')
        s += dot(346, yy, 3)
        s += line(346, yy, 366, yy - 18)
        s += line(366, yy - 26, 366, yy - 10)
        s += line(366, yy, 402, yy)
    s += text(372, 60, 't = kT_b', size=12, anchor='start')
    s += line(402, YT, 440, YT) + line(440, YT, 440, YC - 13, marker='arR')
    s += line(402, YB, 440, YB) + line(440, YB, 440, YC + 13, marker='arR')
    s += adder(440, YC, 13)
    s += text(422, YC - 6, '+', size=15, anchor='end')
    s += line(453, YC, 496, YC, marker='arR')
    s += text(502, YC + 5, 'y', anchor='start', style='i')
    s += text(254, 246, '(a)', anchor='middle', size=12, style='i', color='#555')

    # (b) 两路波形
    for k, (nm, v1, v2) in enumerate([('s_1(t)', 1, 2), ('s_2(t)', 2, 1)]):
        x0 = 46 + k * 270
        AX, LV = 386, 44
        s += line(x0, AX, x0 + 220, AX, marker='arR')
        s += line(x0, AX, x0, 280, marker='arR')
        s += text(x0 + 12, 272, nm, anchor='start', style='i')
        s += text(x0 + 228, AX + 5, 't', anchor='start', style='i')
        s += text(x0 - 8, AX + 18, 'O', anchor='end', size=12)
        s += text(x0 - 8, AX - 44 + 5, '1', anchor='end', size=12)
        s += text(x0 - 8, AX - 2 * 44 + 5, '2', anchor='end', size=12)
        s += line(x0, AX - v2 * LV, x0 + 110, AX - v2 * LV, width=1.1, dash='3,4', color='#999')
        y_first, y_second = AX - v1 * LV, AX - v2 * LV
        s += poly([(x0, y_first), (x0 + 110, y_first), (x0 + 110, y_second), (x0 + 220, y_second)])
        s += line(x0 + 110, AX, x0 + 110, AX + 5, width=1.2)
        s += line(x0 + 220, AX, x0 + 220, AX + 5, width=1.2)
        s += text(x0 + 110, AX + 20, 'T_b/2', size=12)
        s += text(x0 + 220, AX + 20, 'T_b', size=12)
    s += text(290, AX + 46, '(b)', anchor='middle', size=12, style='i', color='#555')
    return s + '</svg>'


# ================================================================ 六、QPSK 判决域（题干）
def fig_p6const():
    cx, cy, U = 210, 190, 44
    s = HEAD.format(w=440, h=380) + MK
    # 阴影十字：两臂半宽 1 个 U，臂长到 3U
    s += f"<polygon points='{cx-3*U},{cy-U} {cx+3*U},{cy-U} {cx+3*U},{cy+U} {cx-3*U},{cy+U}' fill='#e9e9e9' stroke='none'/>"
    s += f"<polygon points='{cx-U},{cy-3*U} {cx+U},{cy-3*U} {cx+U},{cy+3*U} {cx-U},{cy+3*U}' fill='#e9e9e9' stroke='none'/>"
    s += line(cx - 3 * U - 26, cy, cx + 3 * U + 26, cy, marker='arR')
    s += line(cx, cy + 3 * U + 26, cx, cy - 3 * U - 26, marker='arR')
    s += text(cx + 3 * U + 32, cy + 5, 'I', anchor='start', style='i')
    s += text(cx + 7, cy - 3 * U - 30, 'Q', anchor='start', style='i')
    pts = {(-2, 2): ('s_1', -1, -1), (2, 2): ('s_2', 1, -1), (2, -2): ('s_3', 1, 1), (-2, -2): ('s_4', -1, 1)}
    for (i, j), (nm, ax, ay) in pts.items():
        s += dot(cx + i * U, cy - j * U, 4)
        s += text(cx + i * U + ax * 10, cy - j * U + ay * 12, nm, size=13,
                  anchor='end' if ax < 0 else 'start', style='i')
    # 四点投影虚线框（原卷：四个星座点由虚线两两相连）
    for (x1, y1, x2, y2) in [(cx - 2 * U, cy - 2 * U, cx + 2 * U, cy - 2 * U),
                             (cx - 2 * U, cy + 2 * U, cx + 2 * U, cy + 2 * U),
                             (cx - 2 * U, cy - 2 * U, cx - 2 * U, cy + 2 * U),
                             (cx + 2 * U, cy - 2 * U, cx + 2 * U, cy + 2 * U)]:
        s += line(x1, y1, x2, y2, width=1.2, dash='5,4', color='#888')
    # 尺寸标注：左=阴影带宽度 2；右=星座点到 I 轴距离 2
    s += dimv(cx - 3 * U - 14, cy - U, cy + U)
    s += text(cx - 3 * U - 14, cy - U - 8, '2', size=12)
    s += dimv(cx + 3 * U + 16, cy - 2 * U, cy)
    s += text(cx + 3 * U + 16, cy - 2 * U - 8, '2', size=12)
    return s + '</svg>'


# ================================================================ 六、判决域分区（解析）
def fig_a6reg():
    cx, cy, U = 200, 180, 40
    s = HEAD.format(w=420, h=360) + MK
    s += f"<polygon points='{cx-3*U},{cy-U} {cx+3*U},{cy-U} {cx+3*U},{cy+U} {cx-3*U},{cy+U}' fill='#efefef' stroke='none'/>"
    s += f"<polygon points='{cx-U},{cy-3*U} {cx+U},{cy-3*U} {cx+U},{cy+3*U} {cx-U},{cy+3*U}' fill='#efefef' stroke='none'/>"
    for v in (-1, 1):
        s += line(cx + v * U, cy - 3 * U, cx + v * U, cy + 3 * U, width=1.2, dash='5,4', color='#888')
        s += line(cx - 3 * U, cy + v * U, cx + 3 * U, cy + v * U, width=1.2, dash='5,4', color='#888')
    s += line(cx - 3 * U - 22, cy, cx + 3 * U + 22, cy, marker='arR')
    s += line(cx, cy + 3 * U + 22, cx, cy - 3 * U - 22, marker='arR')
    s += text(cx + 3 * U + 28, cy + 5, 'I', anchor='start', style='i')
    s += text(cx + 7, cy - 3 * U - 26, 'Q', anchor='start', style='i')
    s += text(cx - 8, cy + 18, 'O', anchor='end', size=12)
    pts = {(-2, 2): ('s_1', 1, 1), (2, 2): ('s_2', -1, 1), (2, -2): ('s_3', -1, -1), (-2, -2): ('s_4', 1, -1)}
    for (i, j), (nm, ax, ay) in pts.items():
        s += dot(cx + i * U, cy - j * U, 4)
        s += text(cx + i * U + ax * 12, cy - j * U + ay * 16, nm, size=12,
                  anchor='start' if ax > 0 else 'end', style='i')
    # 四个象限区 -> 判为对应星座点；十字区 -> 判为删除 e
    for (i, j), lbl in {(-2.7, 2.7): 'D_1', (2.7, 2.7): 'D_2',
                        (2.7, -2.7): 'D_3', (-2.7, -2.7): 'D_4'}.items():
        s += text(cx + i * U, cy - j * U + 4, lbl, size=12, color='#555')
    s += text(cx + int(0.52 * U), cy - 2.2 * U, '判 e', size=12, color='#555')
    return s + '</svg>'


# ================================================================ 三(1) n(t) 的功率谱
def fig_a3pn():
    AX, CX, H = 136, 330, 74
    F, B3 = 118, 40               # 同 p3H：左块 [-fc-2B/3, -fc+B/3]、右块 [fc-B/3, fc+2B/3]
    s = HEAD.format(w=580, h=200) + MK
    s += line(46, AX, 566, AX, marker='arR')
    s += line(CX, AX, CX, 40, marker='arR')
    s += text(CX + 10, 36, 'P_n(f)', anchor='start')
    s += text(572, AX + 5, 'f', anchor='start', style='i')
    s += poly([(CX - F - 2 * B3, AX), (CX - F - 2 * B3, AX - H), (CX - F + B3, AX - H), (CX - F + B3, AX)], close=True)
    s += poly([(CX + F - B3, AX), (CX + F - B3, AX - H), (CX + F + 2 * B3, AX - H), (CX + F + 2 * B3, AX)], close=True)
    s += line(CX - F + B3, AX - H, CX + F - B3, AX - H, width=1.1, dash='3,4', color='#999')
    s += line(CX - F, AX, CX - F, AX - H, width=1.1, dash='5,4', color='#888')
    s += line(CX + F, AX, CX + F, AX - H, width=1.1, dash='5,4', color='#888')
    s += text(CX + 12, AX - H - 5, 'N_0/2', anchor='start', size=13)
    s += dimh(CX - F - 2 * B3, CX - F + B3, AX - H - 16, 'B', ly=AX - H - 26)
    s += dimh(CX + F - B3, CX + F, AX - H - 16, 'B/3', size=11, ly=AX - H - 26)
    s += text(CX - F, AX + 18, '-f_c', style='i')
    s += text(CX + F, AX + 18, 'f_c', style='i')
    s += text(CX - 8, AX + 18, 'O', anchor='end')
    return s + '</svg>'


# ================================================================ 三(2) 复包络功率谱
def fig_a3pnl():
    AX, CX, H = 150, 226, 78
    B3 = 34                        # 框 [−B/3, 2B/3]，与 P_n(f+fc)u(f+fc) 的右块平移一致
    s = HEAD.format(w=400, h=230) + MK
    s += line(46, AX, 386, AX, marker='arR')
    s += line(CX, AX, CX, 48, marker='arR')
    s += text(CX + 10, 44, 'P_{nL}(f)', anchor='start')
    s += text(392, AX + 5, 'f', anchor='start', style='i')
    s += poly([(CX - B3, AX), (CX - B3, AX - H), (CX + 2 * B3, AX - H), (CX + 2 * B3, AX)], close=True)
    s += text(CX + 12, AX - H - 10, '2N_0', anchor='start', size=13)
    s += line(CX - B3, AX, CX - B3, AX + 5, width=1.2)
    s += line(CX + 2 * B3, AX, CX + 2 * B3, AX + 5, width=1.2)
    s += text(CX - B3, AX + 20, '-B/3', size=12)
    s += text(CX + 2 * B3, AX + 20, '2B/3', size=12)
    s += text(CX - 8, AX + 20, 'O', anchor='end')
    return s + '</svg>'


# ================================================================ 三(3) 同相分量功率谱
def fig_a3pnc():
    AX, CX, H1, H2 = 150, 250, 44, 88
    W1, W2 = 100, 50          # 2B/3、B/3 对应像素
    s = HEAD.format(w=520, h=220) + MK
    s += line(46, AX, 486, AX, marker='arR')
    s += line(CX, AX, CX, 40, marker='arR')
    s += text(CX + 10, 36, 'P_{nc}(f)', anchor='start')
    s += text(492, AX + 5, 'f', anchor='start', style='i')
    s += poly([(CX - W1, AX), (CX - W1, AX - H1), (CX - W2, AX - H1), (CX - W2, AX - H2),
               (CX + W2, AX - H2), (CX + W2, AX - H1), (CX + W1, AX - H1), (CX + W1, AX)])
    s += text(CX + 10, AX - H2 - 6, 'N_0', size=13, anchor='start')
    s += line(CX - 4, AX - H1, CX + 4, AX - H1, width=1.2)
    s += text(CX + 10, AX - H1 + 5, 'N_0/2', size=13, anchor='start')
    for v in (-W1, -W2, W2, W1):
        s += line(CX + v, AX, CX + v, AX + 5, width=1.2)
    s += text(CX - W1, AX + 20, '-2B/3', size=12)
    s += text(CX - W2, AX + 20, '-B/3', size=12)
    s += text(CX + W2, AX + 20, 'B/3', size=12)
    s += text(CX + W1, AX + 20, '2B/3', size=12)
    s += text(CX - 8, AX + 20, 'O', anchor='end')
    return s + '</svg>'


# ================================================================ 七、16QAM 发送端
def fig_a7tx():
    YI, YQ, YC = 74, 158, 116
    s = HEAD.format(w=760, h=230) + MK
    s += text(6, YC + 5, 'b_n', anchor='start', style='i')
    s += line(34, YC, 60, YC, marker='arR')
    s += rect(60, YI - 24, 64, YQ - YI + 48) + text(92, YC - 4, '串并') + text(92, YC + 14, '转换')
    # 原卷：高框右缘直接引出，每支路两根平行线
    s += line(124, YI - 5, 152, YI - 5, marker='arR')
    s += line(124, YI + 5, 152, YI + 5, marker='arR')
    s += line(124, YQ - 5, 152, YQ - 5, marker='arR')
    s += line(124, YQ + 5, 152, YQ + 5, marker='arR')
    for yy in (YI, YQ):
        s += rect(152, yy - 19, 96, 38) + text(200, yy - 3, '2/4 电平', size=13) + text(200, yy + 12, '变换', size=13)
        s += line(248, yy, 276, yy, marker='arR')
        s += rect(276, yy - 19, 116, 38) + text(334, yy - 3, '根升余弦', size=13) + text(334, yy + 12, '频谱成型', size=13)
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
    s += text(586, YC + 5, 's(t)', anchor='start', style='i')
    return s + '</svg>'


# ================================================================ 七、16QAM 接收端
def fig_a7rx():
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
        s += line(284, yy, 292, yy)
        s += dot(292, yy, 3)
        s += line(292, yy, 312, yy - 18)
        s += line(312, yy - 26, 312, yy - 10)
        s += line(312, yy, 330, yy, marker='arR')
        s += rect(330, yy - 19, 80, 38) + text(370, yy + 5, '四进制判决', size=13)
        for dy in (-8, 0, 8):   # 原卷：每支路三根平行线进并串
            s += line(410, yy + dy, 428, yy + dy, marker='arR')
    s += text(184, YI - 28, 'α = 0.25', size=12)
    s += rect(428, YI - 18, 64, YQ - YI + 36) + text(460, YC - 4, '并串') + text(460, YC + 14, '转换')
    s += line(492, YC, 536, YC, marker='arR')
    s += text(544, YC + 5, 'b_n', anchor='start', style='i')
    return s + '</svg>'


# ================================================================ 八、量化（PDF + 量化特性）
def fig_a8pdf():
    s = HEAD.format(w=700, h=250) + MK
    # (a) 概率密度
    x0, y0, UX, UY = 60, 190, 90, 130      # UX: 每单位 x；UY: 每单位 f
    s += line(x0 - 26, y0, x0 + 3 * UX + 34, y0, marker='arR')
    s += line(x0, y0 + 16, x0, y0 - 132, marker='arR')
    s += text(x0 - 8, y0 + 18, 'O', anchor='end', size=12)
    s += text(x0 - 10, y0 - 138, 'f(x)', anchor='end', size=13)
    s += text(x0 + 3 * UX + 40, y0 + 5, 'x', anchor='start', style='i')
    s += poly([(x0, y0), (x0 + 3 * UX, y0 - 2 / 3 * UY * 1.0)], close=False)
    s += line(x0 + 3 * UX, y0, x0 + 3 * UX, y0 - 2 / 3 * UY, width=1.1, dash='3,4', color='#999')
    s += text(x0 + 3 * UX + 4, y0 - 2 / 3 * UY + 12, '2/3', size=11, anchor='start')
    for v in (1, 2):
        s += line(x0 + v * UX, y0, x0 + v * UX, y0 + 5, width=1.2)
        s += line(x0 + v * UX, y0, x0 + v * UX, y0 - 2 / 3 * UY * (v / 3), width=1.1, dash='5,4', color='#888')
    for v, t in ((1, '1'), (2, '2'), (3, '3')):
        s += text(x0 + v * UX, y0 + 20, t, size=12)
    s += text(x0 + 1.5 * UX, y0 + 40, 'f(x) = 2x/9', size=12, color='#555')
    # (b) 量化特性
    X0 = 470
    s += line(X0 - 24, y0, X0 + 3 * UX + 26, y0, marker='arR')
    s += line(X0, y0 + 16, X0, y0 - 132, marker='arR')
    s += text(X0 - 8, y0 + 18, 'O', anchor='end', size=12)
    s += text(X0 - 8, y0 - 138, 'Q(x)', anchor='end', size=13)
    s += text(X0 + 3 * UX + 30, y0 + 5, 'x', anchor='start', style='i')
    LV = [0.5, 1.5, 2.5]
    for i, lv in enumerate(LV):
        yy = y0 - lv * 44
        xa, xb = X0 + i * UX, X0 + (i + 1) * UX
        s += line(xa, yy, xb, yy)
        if i < 2:
            s += line(xb, yy, xb, y0 - LV[i + 1] * 44, width=1.1, dash='5,4', color='#888')
    for i, lv in enumerate(LV):
        s += text(X0 - 8, y0 - lv * 44 + 5, ('%g' % lv), size=11, anchor='end')
    for v, t in ((1, '1'), (2, '2'), (3, '3')):
        s += text(X0 + v * UX, y0 + 20, t, size=12)
    return s + '</svg>'


# ================================================================ 十一(1) 卷积码编码器
def fig_a11enc():
    """(2,1,3) 卷积码编码器：g_1 = 1+x+x^2（三抽头），g_2 = 1+x^2（两抽头）"""
    Y, YG1, YG2, A = 124, 54, 194, 155
    s = HEAD.format(w=470, h=250) + MK
    s += line(6, Y, 96, Y, marker='arR')
    s += rect(96, Y - 21, 56, 42) + text(124, Y + 6, 'D_0', style='i')
    s += line(152, Y, 182, Y, marker='arR')
    s += rect(182, Y - 21, 56, 42) + text(210, Y + 6, 'D_1', style='i')
    # g1：u（左）、D0 后（下）、D1 后（右）
    s += adder(A, YG1, 13)
    s += line(72, Y, 72, YG1) + line(72, YG1, A - 13, YG1, marker='arR')
    s += line(A, Y, A, YG1 + 13) + dot(A, Y, 3)
    s += line(238, Y, 300, Y) + dot(300, Y, 3)
    s += line(300, Y, 300, YG1) + line(300, YG1, A + 13, YG1, marker='arR')
    s += text(A - 20, YG1 - 10, 'g_1', anchor='end', style='i')
    # g2：u（左）、D1 后（右）
    s += adder(A, YG2, 13)
    s += line(48, Y, 48, YG2) + line(48, YG2, A - 13, YG2, marker='arR')
    s += line(300, Y, 300, YG2) + line(300, YG2, A + 13, YG2, marker='arR')
    s += text(A - 20, YG2 + 18, 'g_2', anchor='end', style='i')
    # 两路输出 -> 并串开关
    s += line(A, YG1 - 13, A, 24) + line(A, 24, 330, 24) + line(330, 24, 330, 92)
    s += line(A, YG2 + 13, A, 222) + line(A, 222, 330, 222) + line(330, 222, 330, 140)
    s += dot(330, 92, 2.6) + dot(330, 140, 2.6)
    s += dot(410, Y, 3) + line(346, 96, 407, Y - 2)
    s += line(410, Y, 452, Y, marker='arR')
    s += text(456, Y + 5, '输出', anchor='start', size=13)
    return s + '</svg>'


# ================================================================ 十一(2) 网格图
def fig_a11trellis():
    """4 状态网格图（与原卷一致：col0 只有 00、末段只画 u=0 支路、8 处转移标输出码；
    维特比路径见解析第 (3) 问文字，不在图上叠加）"""
    ST = [('00', 54), ('10', 124), ('01', 194), ('11', 264)]
    COL0, DX = 40, 78
    s = HEAD.format(w=700, h=330) + MK
    yof = dict(ST)
    TR = {
        ('00', 0): ('00', '00'), ('00', 1): ('10', '11'),
        ('10', 0): ('01', '10'), ('10', 1): ('11', '01'),
        ('01', 0): ('00', '11'), ('01', 1): ('10', '00'),
        ('11', 0): ('01', '01'), ('11', 1): ('11', '10'),
    }   # (state, u) -> (次态, 输出)
    ALL = [nm for nm, _ in ST]
    cols = [{'00'}, {'00', '10'}] + [set(ALL)] * 5 + [{'00', '10', '01'}, {'00'}]
    # 末两列与原卷一致：col7 无 11、col8 只剩 00（11 行到 col6 止，01 行到 col7 止）
    for c, states in enumerate(cols):
        for nm in (n for n in ALL if n in states):
            s += circle(COL0 + c * DX, yof[nm], 15, fill='#ffffff')
            s += text(COL0 + c * DX, yof[nm] + 4, nm, size=11)
    for c in range(8):
        x1, x2 = COL0 + c * DX, COL0 + (c + 1) * DX
        for nm, u in TR:
            nxt = TR[(nm, u)][0]
            if nm not in cols[c] or nxt not in cols[c + 1]:
                continue
            if u == 0:
                s += line(x1 + 15, yof[nm], x2 - 15, yof[nxt], width=1.3)
            else:
                s += line(x1 + 15, yof[nm], x2 - 15, yof[nxt], width=1.3, dash='5,4', color='#888')
    # 转移输出码：与原卷同位，各标一次（01→00 的输出 11 已由 00→10 处标出）
    for c, nm, u, x, y, anc in [
            (0, '00', 0, 79, 44, 'middle'), (0, '00', 1, 73, 104, 'end'),
            (1, '10', 0, 170, 150, 'start'), (1, '10', 1, 150, 216, 'end'),
            (2, '00', 1, 210, 76, 'end'), (2, '01', 1, 215, 165, 'end'),
            (5, '11', 1, 472.5, 255, 'middle'), (6, '11', 0, 565, 248, 'end')]:
        s += text(x, y, TR[(nm, u)][1], size=12, anchor=anc)
    return s + '</svg>'


# ================================================================ 十二(1) m 序列发生器
def fig_a12gen():
    """两个 m 序列发生器：⊕ 悬在近端抽头正下方，近端从上、远端从右侧汇入，输出从左侧折回 D_0 输入"""
    s = HEAD.format(w=800, h=280) + MK
    for k, (near, far, tag) in enumerate([(1, 2, '(a)'), (0, 2, '(b)')]):
        ox = k * 420
        Y, YS, W, G = 88, 196, 58, 30
        D0 = ox + 96
        xs = [D0 + i * (W + G) for i in range(3)]
        xn, xf = xs[near] + W, xs[far] + W
        AXC = xn
        s += line(ox + 6, Y, D0, Y, marker='arR') + dot(ox + 60, Y, 3)
        for i, x in enumerate(xs):
            s += rect(x, Y - 21, W, 42) + text(x + W / 2, Y + 6, 'D_%d' % i, style='i')
            if i < 2:
                s += line(x + W, Y, x + W + G, Y, marker='arR')
        s += line(xf, Y, xf + 44, Y, marker='arR')
        s += text(xf + 50, Y + 5, '输出', anchor='start', size=13)
        # ⊕ 与两路抽头：近端从上入顶，远端降到 ⊕ 高度从右侧入
        s += adder(AXC, YS, 14)
        s += line(xn, Y, xn, YS - 14) + dot(xn, Y, 3)
        s += line(xf, Y, xf, YS) + dot(xf, Y, 3)
        s += line(xf, YS, AXC + 14, YS, marker='arR')
        # ⊕ 输出 -> 左折 -> D_0 输入
        s += line(AXC - 14, YS, ox + 60, YS) + line(ox + 60, YS, ox + 60, Y)
        s += text(ox + 205, YS + 36, tag, anchor='middle', size=12, style='i', color='#555')
    return s + '</svg>'


# ================================================================ 十二(2) a(t) 自相关
def fig_a12ra():
    CX, AX, UX, UY = 318, 96, 27, 52
    s = HEAD.format(w=650, h=210) + MK
    s += line(CX - 10.4 * UX, AX, CX + 10.4 * UX, AX, marker='arR')
    s += line(CX, AX + 26, CX, 34, marker='arR')
    s += text(CX - 8, AX + 22, 'O', anchor='end', size=12)
    s += text(CX + 10.4 * UX + 6, AX + 5, 'τ/ms', anchor='start', size=12)
    yv = lambda v: AX - v * UY
    pts = [(-10.4, -1 / 7), (-8, -1 / 7), (-7, 1), (-6, -1 / 7), (-1, -1 / 7),
           (0, 1), (1, -1 / 7), (6, -1 / 7), (7, 1), (8, -1 / 7), (10.4, -1 / 7)]
    s += poly([(CX + t * UX, yv(v)) for t, v in pts])
    s += text(CX + 8, yv(1) + 5, '1', size=12, anchor='start')
    for t in range(-9, 10):
        s += line(CX + t * UX, AX, CX + t * UX, AX + 5, width=1.2)
    s += text(CX + UX, AX + 20, '1', size=12)
    s += text(CX + 7 * UX, AX + 20, '7', size=12)
    s += text(CX - 9.7 * UX, AX - 18, '···', size=13, anchor='middle')
    s += text(CX + 9.7 * UX, AX - 18, '···', size=13, anchor='middle')
    s += _level_note(CX, AX, UX, yv)
    return s + '</svg>'


def _level_note(CX, AX, UX, yv):
    """-1/7 电平标注：上下小箭头 + 斜指引线 + 文字（与原卷同款）；返回片段由调用方拼接"""
    lvl = yv(-1 / 7)
    frag = line(CX + 3.2 * UX, AX - 16, CX + 3.2 * UX, lvl - 3, width=1.1, marker='arR')
    frag += line(CX + 3.45 * UX, lvl + 18, CX + 3.45 * UX, lvl + 4, width=1.1, marker='arR')
    frag += line(CX + 4.35 * UX, lvl + 26, CX + 3.65 * UX, lvl + 2, width=1.1)
    frag += text(CX + 4.45 * UX, lvl + 40, '-1/7', size=11, anchor='start')
    return frag


# ================================================================ 十二(3) c(t) 波形
def fig_a12c():
    X0, AX, UC, UY = 40, 108, 38, 32
    s = HEAD.format(w=420, h=210) + MK
    s += line(X0 - 26, AX, X0 + 7.4 * UC, AX, marker='arR')
    s += line(X0, AX + 34, X0, AX - 62, marker='arR')
    s += text(X0 - 8, AX + 34, '-1', size=12, anchor='end')
    s += text(X0 - 8, AX - 32 + 5, '+1', size=12, anchor='end')
    s += text(X0 - 8, AX + 16, 'O', size=12, anchor='end')
    s += text(X0 + 7.4 * UC + 8, AX + 5, 't/ms', anchor='start', size=12)
    pts = [(0, -1), (1, -1), (1, 1), (6, 1), (6, -1), (7, -1)]
    s += poly([(X0 + t * UC, AX - v * UY) for t, v in pts])
    for t in (1, 6, 7):
        s += line(X0 + t * UC, AX, X0 + t * UC, AX + 5, width=1.2)
        s += text(X0 + t * UC + 7, AX + 20, str(t), size=12, anchor='start')
    return s + '</svg>'


# ================================================================ 十二(4) c(t) 自相关
def fig_a12rc():
    CX, AX, UX, UY = 318, 96, 27, 52
    s = HEAD.format(w=650, h=210) + MK
    s += line(CX - 10.4 * UX, AX, CX + 10.4 * UX, AX, marker='arR')
    s += line(CX, AX + 26, CX, 34, marker='arR')
    s += text(CX - 8, AX + 22, 'O', anchor='end', size=12)
    s += text(CX + 10.4 * UX + 6, AX + 5, 'τ/ms', anchor='start', size=12)
    yv = lambda v: AX - v * UY
    pts = [(-10.4, -1 / 7), (-9, -1 / 7), (-8, 3 / 7), (-7, 1), (-6, 3 / 7), (-5, -1 / 7),
           (-2, -1 / 7), (-1, 3 / 7), (0, 1), (1, 3 / 7), (2, -1 / 7), (5, -1 / 7),
           (6, 3 / 7), (7, 1), (8, 3 / 7), (9, -1 / 7), (10.4, -1 / 7)]
    s += poly([(CX + t * UX, yv(v)) for t, v in pts])
    s += text(CX + 8, yv(1) + 5, '1', size=12, anchor='start')
    for t in range(-9, 10):
        s += line(CX + t * UX, AX, CX + t * UX, AX + 5, width=1.2)
    for t, lbl in [(1, '1'), (2, '2'), (5, '5'), (6, '6'), (7, '7'), (8, '8'), (9, '9')]:
        s += text(CX + t * UX, AX + 20, lbl, size=11)
    s += text(CX - 9.7 * UX, AX - 18, '···', size=13, anchor='middle')
    s += text(CX + 9.7 * UX, AX - 18, '···', size=13, anchor='middle')
    s += _level_note(CX, AX, UX, yv)
    return s + '</svg>'


# ================================================================ 十二、题干系统框图
def fig_p12sys():
    YT, YB, YC = 70, 152, 111
    s = HEAD.format(w=640, h=220) + MK
    s += circle(44, YC, 15) + text(44, YC + 5, '~', size=15)
    s += text(44, YC + 34, '1000Hz', size=12)
    s += line(59, YC, 86, YC)
    s += line(86, YT, 86, YB)
    s += line(86, YT, 100, YT, marker='arR')
    s += line(86, YB, 100, YB, marker='arR')
    s += dot(86, YC, 3)
    s += rect(100, YT - 19, 122, 38) + text(161, YT + 5, 'm 序列发生器 1', size=13)
    s += rect(100, YB - 19, 122, 38) + text(161, YB + 5, 'm 序列发生器 2', size=13)
    s += line(222, YT, 296, YT, marker='arR')
    s += line(222, YB, 296, YB, marker='arR')
    s += text(259, YT - 8, '{a_n}', size=13)
    s += text(259, YB + 20, '{b_n}', size=13)
    s += rect(296, YT - 19, 108, 38) + text(350, YT + 5, 'NRZ 发生器 1', size=13)
    s += rect(296, YB - 19, 108, 38) + text(350, YB + 5, 'NRZ 发生器 2', size=13)
    s += line(404, YT, 530, YT) + line(530, YT, 530, YC - 15, marker='arR')
    s += line(404, YB, 530, YB) + line(530, YB, 530, YC + 15, marker='arR')
    s += text(468, YT - 9, 'a(t)', style='i')
    s += text(468, YB + 18, 'b(t)', style='i')
    s += mul(530, YC, 15)
    s += line(545, YC, 590, YC, marker='arR')
    s += text(598, YC + 5, 'c(t)', anchor='start', style='i')
    return s + '</svg>'


# (key, 题号, 是否解析配图, 描述)。题目原图放 data/figures/<年>/；解析配图放 answer/ 子目录。
FIGS = [
    ('p3H', '三', False, '带通滤波器 H(f)'),
    ('p4fig', '四', False, 'PAM 系统框图与 E_g(f)'),
    ('p5fig', '五', False, '传输系统框图与 s_1(t)、s_2(t)'),
    ('p6const', '六', False, 'QPSK 判决域与删除区'),
    ('p12sys', '十二', False, 'm 序列相乘系统框图'),
    ('a3pn', '三', True, '窄带噪声功率谱 P_n(f)'),
    ('a3pnl', '三', True, '复包络功率谱 P_nL(f)'),
    ('a3pnc', '三', True, '同相分量功率谱 P_nc(f)'),
    ('a6reg', '六', True, '判决域分区'),
    ('a7tx', '七', True, '16QAM 发送端框图'),
    ('a7rx', '七', True, '16QAM 接收端框图'),
    ('a8pdf', '八', True, '概率密度与量化特性'),
    ('a11enc', '十一', True, '卷积码编码器框图'),
    ('a11trellis', '十一', True, '4 状态网格图'),
    ('a12gen', '十二', True, '两个 m 序列发生器'),
    ('a12ra', '十二', True, 'a(t) 自相关函数'),
    ('a12c', '十二', True, 'c(t) 波形'),
    ('a12rc', '十二', True, 'c(t) 自相关函数'),
]

SVGS = {
    'p3H': fig_p3H(), 'p4fig': fig_p4fig(), 'p5fig': fig_p5fig(),
    'p6const': fig_p6const(),
    'p12sys': fig_p12sys(),
    'a3pn': fig_a3pn(), 'a3pnl': fig_a3pnl(), 'a3pnc': fig_a3pnc(),
    'a6reg': fig_a6reg(), 'a7tx': fig_a7tx(), 'a7rx': fig_a7rx(),
    'a8pdf': fig_a8pdf(), 'a11enc': fig_a11enc(), 'a11trellis': fig_a11trellis(),
    'a12gen': fig_a12gen(), 'a12ra': fig_a12ra(), 'a12c': fig_a12c(),
    'a12rc': fig_a12rc(),
}
SVGS = {k: tighten(v, PAD) for k, v in SVGS.items()}

YEAR = '2016'
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
