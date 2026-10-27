#!/usr/bin/env python3
# 生成 2019年试卷 SVG 图库（每图一个文件，输出用 ###FILE: 分隔）：
#   node tools/emit_figures.mjs 2019
import math

from svgkit import PAD, tighten  # 统一的 viewBox 收边（四边等宽留白）


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
    """乘法器 ⊗：圆 + 对角线（不用字符，避免与圆重叠）"""
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


# ---------------------------------------------------------------- 一、第2题 总体传输函数 X(f)
def fig_c2spec():
    """三角谱 X(f)：顶点在 f=0、幅度 1，|f|=2000 Hz 处为零"""
    s = HEAD.format(w=400, h=200) + marker('a19a')
    YB, XC, U = 140, 190, 60          # U=60px 对应 2000 Hz
    s += line(60, YB, 350, YB, marker='a19a')          # f 轴
    s += line(XC, YB, XC, 56, marker='a19a')           # 幅度轴
    s += poly([(XC - U, YB), (XC, 62), (XC + U, YB)])
    s += text(XC + 10, 54, 'X(f)', anchor='start', style='i')
    # 刻度与标注
    for v, lbl in ((-U, '-2000'), (U, '2000')):
        s += line(XC + v, YB - 5, XC + v, YB + 5, width=1.2)
        s += text(XC + v, YB + 24, lbl)
    s += text(XC - 10, YB + 24, 'O', anchor='end')
    s += text(356, YB + 5, 'f', anchor='start', style='i')
    return s + '</svg>'


# ---------------------------------------------------------------- 二、DSB-SC 相干解调框图
def fig_q2block():
    """s(t)+n_w(t) → 理想带通 → ×2cos2πf_c t → 理想低通 → s_o(t)+n_o(t)"""
    s = HEAD.format(w=680, h=210) + marker('a19b')
    Y = 100
    s += text(8, Y + 5, 's(t)', anchor='start', style='i')
    s += line(46, Y, 88, Y, marker='a19b')
    s += adder(104, Y, 14)
    s += text(104, 190, 'n_w(t)', style='i')
    s += line(104, 168, 104, Y + 15, marker='a19b')
    s += line(118, Y, 158, Y, marker='a19b')
    s += rect(160, Y - 24, 116, 48)
    s += text(218, Y - 4, '理想带通') + text(218, Y + 14, '滤波器')
    s += line(276, Y, 316, Y, marker='a19b')
    s += text(296, 77, 's(t)', style='i')
    s += text(296, 93, 'n(t)', style='i')
    s += mul(330, Y, 13)
    s += text(330, 170, '2cos(2πf_c t)', size=13)
    s += line(330, 152, 330, Y + 14, marker='a19b')
    s += line(343, Y, 384, Y, marker='a19b')
    s += rect(386, Y - 24, 106, 48)
    s += text(439, Y - 4, '理想低通') + text(439, Y + 14, '滤波器')
    s += line(492, Y, 532, Y, marker='a19b')
    s += text(538, 91, 's_o(t)', anchor='start', style='i')
    s += text(538, 111, 'n_o(t)', anchor='start', style='i')
    return s + '</svg>'


# ---------------------------------------------------------------- 三、信道转移概率表
def fig_q6table():
    """六：P(Y|X) 三列两行的转移概率表（X 行、Y 列，左上角对角线分格）"""
    s = HEAD.format(w=290, h=150)
    xs = [20, 84, 142, 200, 258]
    ys = [20, 56, 92, 128]
    s += poly([(xs[0], ys[0]), (xs[-1], ys[0]), (xs[-1], ys[-1]), (xs[0], ys[-1])], close=True)
    for x in xs[1:-1]:
        s += line(x, ys[0], x, ys[-1], width=1.2)
    for y in ys[1:-1]:
        s += line(xs[0], y, xs[-1], y, width=1.2)
    s += line(xs[0], ys[0], xs[1], ys[1], width=1.2)      # 左上角斜线
    s += text(26, 51, 'X', anchor='start', style='i')
    s += text(78, 31, 'Y', anchor='end', style='i')
    for i, lbl in enumerate(('0', '1', '2')):            # 表头
        s += text((xs[i + 1] + xs[i + 2]) / 2, 44, lbl, size=13)
    s += text(52, 80, '0', size=13) + text(52, 116, '1', size=13)
    rows = [('0.8', '0', '0.2'), ('0', '0.8', '0.2')]
    for r, row in enumerate(rows):
        for c, v in enumerate(row):
            s += text((xs[c + 1] + xs[c + 2]) / 2, 80 + 36 * r, v, size=13)
    return s + '</svg>'


# ---------------------------------------------------------------- 四、幅度谱 / 功率谱双子图
def _spec_panel(ax, yb, xc, u, y_hi, y_lo, title, lab_hi, lab_lo, mk, kind='step', mid_above=False):
    """一个谱子图：右向 f 轴 + f=0 短刻度 + 电平标注（原卷：标注都在轴右侧）

    kind='step'：两段电平的折线（|f|<1/2T 为 y_hi，其余到 1/T 为 y_lo）
    kind='rect'：±1/T 上的矩形（功率谱只有一个电平 y_hi，y_lo 传 yb）
    mid_above：−1/2T、1/2T 刻度标在轴上方（G_3 的轴下方被负电平占用时）
    """
    o = ''
    xr = xc + u + 60
    o += line(ax, yb, xr, yb, marker=mk)
    o += line(xc, yb - 6, xc, yb + 6, width=1.2)
    if kind == 'step':
        o += poly([(xc - u, y_lo), (xc - u / 2, y_lo), (xc - u / 2, y_hi),
                   (xc + u / 2, y_hi), (xc + u / 2, y_lo), (xc + u, y_lo)])
    else:
        o += poly([(xc - u, yb), (xc - u, y_hi), (xc + u, y_hi), (xc + u, yb)])
    o += text(xc, 8, title, style='i')
    o += text(xc + 8, y_hi - 8, lab_hi, anchor='start')
    if lab_lo:
        o += text(xc + 8, y_lo + 4, lab_lo, anchor='start')
    for v in (-u, u):
        o += line(xc + v, yb - 5, xc + v, yb + 5, width=1.2)
    if kind == 'step':
        my = yb - 10 if mid_above else yb + 22
        o += text(xc - u / 2 - 3, my, '-1/2T', size=12, anchor='end')
        o += text(xc + u / 2 + 3, my, '1/2T', size=12, anchor='start')
    o += text(xc - u, yb + 22, '-1/T', size=12)
    o += text(xc + u, yb + 22, '1/T', size=12)
    o += text(xc, yb + 22, 'O', size=12)
    o += text(xr + 8, yb + 5, 'f', anchor='start', style='i')
    return o


def fig_q3s1():
    """三(3)：G_3(f)（上/下两段反号）与 P_s1(f)（±1/T 上的矩形）"""
    mk = 'a19c'
    s = HEAD.format(w=720, h=210) + marker(mk)
    s += _spec_panel(30, 100, 170, 100, 52, 148, 'G_3(f)', 'T/2', '-T/2', mk, mid_above=True)
    s += _spec_panel(390, 100, 530, 100, 52, 100, 'P_{s1}(f)', 'T/4', '', mk, kind='rect')
    return s + '</svg>'


def fig_q3s2():
    """三(4)：|G_4(f)|^2（中心 5T^2/4、外侧 T²/4）与 P_s2(f)（5T/4、T/4，同为阶梯）"""
    mk = 'a19d'
    s = HEAD.format(w=720, h=260) + marker(mk)
    s += _spec_panel(30, 160, 170, 120, 34, 132, '|G_4(f)|^2', '5T^2/4', 'T^2/4', mk)
    s += _spec_panel(390, 160, 530, 120, 34, 132, 'P_{s2}(f)', '5T/4', 'T/4', mk)
    return s + '</svg>'


# ---------------------------------------------------------------- 五、匹配滤波器冲激响应
def fig_q4h():
    """四(1)：h(t) = -sin(2πt/T)，0≤t≤T"""
    s = HEAD.format(w=340, h=200) + marker('a19e')
    X0, XT, Y0, A = 80, 260, 95, 42
    s += line(60, Y0, 306, Y0, marker='a19e')
    s += line(X0, 158, X0, 26, marker='a19e')
    pts = []
    for i in range(61):
        t = i / 60
        pts.append((X0 + (XT - X0) * t, Y0 - A * (-math.sin(2 * math.pi * t))))
    s += poly(pts)
    s += text(72, 53, '+1', anchor='end')
    s += text(72, 141, '-1', anchor='end')
    s += line(XT, Y0 - 4, XT, Y0 + 4, width=1.2)
    s += text(XT, Y0 + 22, 'T', style='i')
    s += text(312, Y0 + 5, 't', anchor='start', style='i')
    s += text(88, 22, 'h(t)', anchor='start', style='i')
    return s + '</svg>'


# ---------------------------------------------------------------- 六、四进制星座图 / 判决域
def _axes_const(s, mk):
    o = line(40, 220, 352, 220, marker=mk)
    o += line(110, 300, 110, 68, marker=mk)
    o += text(358, 225, 'f_1(t)', anchor='start', style='i')
    o += text(114, 62, 'f_2(t)', anchor='start', style='i')
    o += text(98, 238, 'O', anchor='end')
    return o


PTS = {'s_3': (266, 220), 's_1': (188, 175), 's_2': (188, 265), 's_4': (110, 130)}


def fig_q5const():
    """五(3)：以 f_1=s_3/√3、f_2=s_4 为基的星座图"""
    mk = 'a19f'
    s = HEAD.format(w=380, h=320) + marker(mk)
    s += _axes_const(s, mk)
    for lbl, (x, y) in PTS.items():
        s += dot(x, y, 4.2)
    s += text(180, 169, 's_1', anchor='end', style='i')
    s += text(180, 278, 's_2', anchor='end', style='i')
    s += text(274, 214, 's_3', anchor='start', style='i')
    s += text(120, 124, 's_4', anchor='start', style='i')
    for x, y in ((188, 220), (266, 220)):
        s += line(x, 215, x, 225, width=1.2)
    for y in (130, 175, 265):
        s += line(105, y, 115, y, width=1.2)
    # 原卷：1/2、−1/2 水平虚线与 √3/2 竖直虚线（轴 → 星座点）
    s += line(110, 175, 188, 175, width=1.1, dash='5,4')
    s += line(110, 265, 188, 265, width=1.1, dash='5,4')
    s += line(188, 175, 188, 265, width=1.1, dash='5,4')
    s += text(184, 240, '√3/2', size=12, anchor='end')
    s += text(266, 240, '√3', size=12)
    s += text(102, 179, '1/2', anchor='end', size=12)
    s += text(102, 134, '1', anchor='end', size=12)
    s += text(102, 269, '-1/2', anchor='end', size=12)
    return s + '</svg>'


def fig_q5region():
    """五(3)：s_3 的最佳判决域 —— 顶点在 (2/√3,0)、张角 120° 的右向楔形 |y|≤√3x-2

    与 s_1、s_2 的两条垂直平分线 y=√3x-2 与 y=2-√3x 是真正起作用的边界；
    与 s_4 的平分线 y=√3x-1 整体位于前者之上，约束更松，不起作用（s_4 更远）。
    """
    mk = 'a19g'
    s = HEAD.format(w=440, h=340) + marker(mk)
    ORX, ORY, U = 110, 220, 90

    def px(X):
        return ORX + U * X

    # 原卷：坐标轴 + √3/2 小刻度，无 O/刻度值/区域名/填充
    s += line(40, 220, 352, 220, marker=mk)
    s += line(110, 300, 110, 68, marker=mk)
    s += text(358, 225, 'f_1(t)', anchor='start', style='i')
    s += text(114, 62, 'f_2(t)', anchor='start', style='i')
    s += line(px(math.sqrt(3) / 2), 215, px(math.sqrt(3) / 2), 225, width=1.2)
    apex = (px(2 / math.sqrt(3)), 220)
    up_x = ORX + (400 - 64) / math.sqrt(3)
    lo_x = ORX + (292 - 40) / math.sqrt(3)
    # 两条起作用的平分线（黑色虚线）：从顶点出发各向右上方/右下方延伸
    s += line(apex[0], apex[1], up_x, 64, width=1.2, dash='5,4')
    s += line(apex[0], apex[1], lo_x, 292, width=1.2, dash='5,4')
    for lbl, (x, y) in PTS.items():
        s += dot(x, y, 4.2)
    s += text(180, 169, 's_1', anchor='end', style='i')
    s += text(180, 278, 's_2', anchor='end', style='i')
    s += text(274, 214, 's_3', anchor='start', style='i')
    s += text(120, 124, 's_4', anchor='start', style='i')
    return s + '</svg>'


# ---------------------------------------------------------------- 七、量化器输入分布与量化特性
def fig_q7pdf():
    """七(1)：p(x)=1-|x| 三角分布"""
    s = HEAD.format(w=360, h=200) + marker('a19h')
    YB, XC = 150, 140
    s += line(40, YB, 322, YB, marker='a19h')
    s += line(XC, YB, XC, 34, marker='a19h')
    s += poly([(80, YB), (XC, 60), (200, YB)], fill='#f5f5f5', close=True)
    s += text(128, 56, '1', anchor='end')
    s += text(150, 44, 'p(x)', anchor='start', style='i')
    s += text(330, YB + 5, 'x', anchor='start', style='i')
    for v in (80, 200):
        s += line(v, YB - 5, v, YB + 5, width=1.2)
    s += text(80, YB + 22, '-1')
    s += text(200, YB + 22, '1')
    s += text(132, YB + 22, 'O', anchor='end')
    return s + '</svg>'


def fig_q7quant():
    """七(3)：四电平台阶（±a、±b），门限在 0 与 ±1/2"""
    s = HEAD.format(w=330, h=250) + marker('a19i')
    X0 = 130
    s += line(100, 210, 300, 210, marker='a19i')
    s += line(200, 210, 200, 46, marker='a19i')
    s += poly([(130, 190), (165, 190), (165, 150), (200, 150), (200, 110),
               (235, 110), (235, 70), (270, 70)])
    for y, nm, ty in ((70, 'b', 60), (110, 'a', 104), (150, '-a', 140), (190, '-b', 180)):
        s += text(188, ty, nm, anchor='end', style='i')
    for x, lbl in ((130, '-1'), (165, '-1/2'), (200, '0'), (235, '1/2'), (270, '1')):
        s += line(x, 205, x, 215, width=1.2)
        s += text(x, 232, lbl, size=12)
    s += text(200, 34, 'Y=Q(x)', style='i')
    s += text(306, 215, 'x', anchor='start', style='i')
    return s + '</svg>'


# ---------------------------------------------------------------- 八、卷积码编码器
def fig_q8enc():
    """八2(1)：(2,1,3) 卷积码编码器，g_1=1+x+x^3、g_2=1+x^2+x^3"""
    s = HEAD.format(w=600, h=310) + marker('a19j')
    YS, R = 150, 14
    D0, DW, DG = 180, 44, 30
    s += line(30, YS, D0, YS, marker='a19j')
    for i in range(3):
        x = D0 + i * (DW + DG)
        s += rect(x, YS - 22, DW, 44) + text(x + DW / 2, YS + 6, 'D', style='i')
        if i < 2:
            s += line(x + DW, YS, x + DW + DG, YS, marker='a19j')
    AX1, AX2 = 239, 313           # ⊕1 在 D1/D2 之间上方，⊕2 在 D2/D3 之间下方
    YA, YB = 70, 235
    for x in (AX1, AX2):
        s += dot(x, YS, 3)
    s += line(D0 + 2 * (DW + DG) + DW, YS, 400, YS)          # D3 之后
    s += dot(390, YS, 3)
    # 抽头：u → 两个 ⊕ 的左侧
    s += dot(160, YS, 3)
    s += line(160, YA, 160, YB)
    s += line(160, YA, AX1 - R, YA, marker='a19j')
    s += line(160, YB, AX2 - R, YB, marker='a19j')
    # D1 输出 → ⊕1 底部
    s += line(AX1, YS, AX1, YA + R, marker='a19j')
    # D3 输出 → 两个 ⊕ 的右侧
    s += line(390, YS, 390, YA)
    s += line(390, YS, 390, YB)
    s += line(390, YA, AX1 + R, YA, marker='a19j')
    s += line(390, YB, AX2 + R, YB, marker='a19j')
    # D2 输出 → ⊕2 顶部
    s += line(AX2, YS, AX2, YB - R, marker='a19j')
    s += adder(AX1, YA, R) + adder(AX2, YB, R)
    # 输出 → 转换开关（原卷样式：双触点 + 掷向上一路的臂）
    s += line(AX1, YA - R, AX1, 36) + line(AX1, 36, 470, 36) + line(470, 36, 470, 50)
    s += line(AX2, YB + R, AX2, 270) + line(AX2, 270, 470, 270) + line(470, 270, 470, 256)
    s += dot(470, 52, 2.6) + dot(470, 254, 2.6)
    s += dot(505, 153, 3)
    s += line(505, 153, 473, 54)
    s += line(505, 153, 548, 153, marker='a19j')
    return s + '</svg>'


# (key, 题号, 是否解析配图, 描述)。题目原图放 data/figures/<年>/，解析配图放 answer/ 子目录。
FIGS = [
    ('c2spec', '2', False, '总体传输函数 X(f)'),
    ('q2block', '二', False, 'DSB-SC 相干解调框图'),
    ('q6table', '六', False, '信道转移概率表'),
    ('q3s1', '三', True, 'G_3(f) 与 P_s1(f)'),
    ('q3s2', '三', True, '|G_4(f)|^2 与 P_s2(f)'),
    ('q4h', '四', True, '匹配滤波器冲激响应'),
    ('q5const', '五', True, '四进制星座图'),
    ('q5region', '五', True, 's_3 的最佳判决域'),
    ('q7pdf', '七', True, '量化器输入概率密度'),
    ('q7quant', '七', True, '量化特性'),
    ('q8enc', '八', True, '卷积码编码器'),
]
SVGS = {
    'c2spec': fig_c2spec(), 'q2block': fig_q2block(), 'q6table': fig_q6table(),
    'q3s1': fig_q3s1(), 'q3s2': fig_q3s2(), 'q4h': fig_q4h(),
    'q5const': fig_q5const(), 'q5region': fig_q5region(),
    'q7pdf': fig_q7pdf(), 'q7quant': fig_q7quant(), 'q8enc': fig_q8enc(),
}
# 全部图统一把 viewBox 收到内容边界（四边各留 18px），与 2025/2026 同一套口径
SVGS = {k: tighten(v, PAD) for k, v in SVGS.items()}

YEAR = '2019'
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
