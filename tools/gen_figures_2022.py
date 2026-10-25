#!/usr/bin/env python3
# 生成 2022年试卷 SVG 图库（每图一个文件，输出用 ###FILE: 分隔）：
#   node tools/emit_figures.mjs 2022
import math

from svgkit import PAD, tighten  # 统一的 viewBox 收边（四边等宽留白）

INK = '#1a1a1a'
AUX = '#555'
HOT = '#a8322a'


# ---------------------------------------------------------------- 基础画笔
def marker(mid, color=INK):
    return (f"<defs><marker id='{mid}' markerWidth='8' markerHeight='8' refX='7' refY='3' orient='auto'>"
            f"<path d='M0,0 L7,3 L0,6 z' fill='{color}'/></marker></defs>")


def line(x1, y1, x2, y2, width=1.6, dash=None, color=INK, marker=None):
    da = f" stroke-dasharray='{dash}'" if dash else ''
    mk = f" marker-end='url(#{marker})'" if marker else ''
    return (f"<line x1='{x1:.1f}' y1='{y1:.1f}' x2='{x2:.1f}' y2='{y2:.1f}' "
            f"stroke='{color}' stroke-width='{width}'{da}{mk}/>")


def path(d, width=1.6, dash=None, color=INK, marker=None, fill='none'):
    da = f" stroke-dasharray='{dash}'" if dash else ''
    mk = f" marker-end='url(#{marker})'" if marker else ''
    return f"<path d='{d}' fill='{fill}' stroke='{color}' stroke-width='{width}'{da}{mk}/>"


def poly(pts, stroke=INK, width=1.6, dash=None, fill='none', close=False):
    d = ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)
    dd = ' Z' if close else ''
    da = f" stroke-dasharray='{dash}'" if dash else ''
    return f"<path d='M{d}{dd}' fill='{fill}' stroke='{stroke}' stroke-width='{width}'{da}/>"


def area(pts, fill=INK, opacity=0.10):
    d = ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)
    return f"<polygon points='{d}' fill='{fill}' fill-opacity='{opacity}' stroke='none'/>"


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


def _cw(c, size):
    """字宽估算（与 svgkit / check_figure_overlap 同口径）"""
    if '\u4e00' <= c <= '\u9fff' or '\uff00' <= c <= '\uffef':
        return size * 1.0
    if c.isupper() or c.isdigit():
        return size * 0.62
    return size * 0.52


def _tw(s, size):
    return sum(_cw(c, size) for c in s)


def text(x, y, s, size=14, anchor='middle', style='', color=INK):
    """文字；'_x'/'_{xx}' 排成下标、'^x'/'^{xx}' 排成上标。

    含上下标的文字一律左对齐输出（x 由估算字宽反推），
    这样 cairosvg 预览不会把每个 tspan 各自居中（浏览器里两者等价）。
    """
    st = " font-style='italic'" if 'i' in style else ''
    wt = " font-weight='bold'" if 'b' in style else ''
    small = f" font-size='{size}'" if size != 14 else ''
    toks = _tokens(s)
    if len(toks) == 1:
        return f"<text x='{x:.1f}' y='{y:.1f}' text-anchor='{anchor}'{small}{st}{wt} fill='{color}'>{s}</text>"
    W = sum(_tw(t, size * 0.72 if k != 'n' else size) for t, k in toks)
    xs = x - W / 2 if anchor == 'middle' else (x - W if anchor == 'end' else x)
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
    return (f"<text x='{xs:.1f}' y='{y:.1f}' text-anchor='start'{small}{st}{wt} "
            f"fill='{color}'>{body}</text>")


def dot(x, y, r=3.2, fill=INK):
    return f"<circle cx='{x:.1f}' cy='{y:.1f}' r='{r}' fill='{fill}'/>"


def circle(cx, cy, r, dash=None, color=INK, width=1.6, fill='none'):
    da = f" stroke-dasharray='{dash}'" if dash else ''
    return (f"<circle cx='{cx:.1f}' cy='{cy:.1f}' r='{r:.1f}' fill='{fill}' "
            f"stroke='{color}' stroke-width='{width}'{da}/>")


def rect(x, y, w, h, dash=None, fill='none', width=1.6):
    da = f" stroke-dasharray='{dash}'" if dash else ''
    return (f"<rect x='{x:.1f}' y='{y:.1f}' width='{w:.1f}' height='{h:.1f}' fill='{fill}' "
            f"stroke='{INK}' stroke-width='{width}'{da}/>")


def mul(cx, cy, r=14):
    """乘法器 ⊗：圆 + 对角线（不用字符，避免与圆重叠）"""
    return (circle(cx, cy, r)
            + line(cx - r * .71, cy - r * .71, cx + r * .71, cy + r * .71)
            + line(cx + r * .71, cy - r * .71, cx - r * .71, cy + r * .71))


def adder(cx, cy, r=14):
    """相加器 ⊕：圆 + 十字线"""
    return (circle(cx, cy, r)
            + line(cx - r * .78, cy, cx + r * .78, cy)
            + line(cx, cy - r * .78, cx, cy + r * .78))


def edge(x1, y1, x2, y2, r=24, dash=None, color=INK, width=1.6, mid='arC', pad2=0):
    """从圆到圆的连线：两端各让开半径 r（+pad2），末端带箭头"""
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy)
    ux, uy = dx / L, dy / L
    return line(x1 + ux * r, y1 + uy * r, x2 - ux * (r + pad2), y2 - uy * (r + pad2),
                width=width, dash=dash, color=color, marker=mid)


HEAD = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {w} {h}' "
        "font-family=\"Helvetica,Arial,'PingFang SC','Microsoft YaHei',sans-serif\" font-size='14'>")


# ---------------------------------------------------------------- 二、AM 系统框图
def fig_q2am():
    s = HEAD.format(w=700, h=200) + marker('a22')
    Y = 100
    # 发送端框
    s += rect(8, 44, 116, 96, dash='6 4')
    s += text(66, 36, '发送端', size=13)
    # 输入 m(t)
    s += line(20, Y, 56, Y, marker='a22')
    s += text(38, 84, 'm(t)', size=13, style='i')
    s += mul(78, Y)
    s += line(92, Y, 126, Y)
    s += text(106, 84, 's(t)', size=13, style='i')
    s += adder(140, Y)
    s += line(154, Y, 182, Y)
    # 接收端框
    s += rect(168, 44, 372, 96, dash='6 4')
    s += text(354, 36, '接收端', size=13)
    s += rect(182, 78, 80, 44)
    s += text(222, 106, 'BPF', size=13)
    s += line(262, Y, 290, Y)
    s += text(276, 84, 'r(t)', size=12, style='i')
    s += mul(304, Y)
    s += line(318, Y, 340, Y)
    s += rect(340, 78, 80, 44)
    s += text(380, 106, 'LPF', size=13)
    s += line(420, Y, 446, Y)
    s += rect(446, 78, 76, 44)
    s += text(484, 106, '隔直流', size=12)
    s += line(522, Y, 562, Y, marker='a22')
    s += text(570, 105, 'y(t)', size=13, anchor='start', style='i')
    # 三路注入
    s += line(78, 138, 78, Y + 17, marker='a22')
    s += text(126, 156, 'A cos(2πf_ct)', size=11.5, anchor='end')
    s += line(140, 138, 140, Y + 17, marker='a22')
    s += text(148, 156, 'n_w(t)', size=12, anchor='start')
    s += line(304, 138, 304, Y + 17, marker='a22')
    s += text(304, 156, '2cos(2πf_ct)', size=11.5)
    return tighten(s + '</svg>')


# ---------------------------------------------------------------- 四、二进制调制接收框图
def fig_q4rx():
    s = HEAD.format(w=560, h=190) + marker('a42')
    Y = 96
    s += line(14, Y, 88, Y, marker='a42')
    s += text(58, 66, 's_1(t) 或 s_2(t)', size=12)
    s += adder(104, Y)
    s += line(118, Y, 148, Y)
    s += text(132, 80, 'r(t)', size=12, style='i')
    s += mul(170, Y)
    s += line(184, Y, 212, Y)
    s += rect(212, 74, 106, 44)
    s += text(265, 102, '∫_0^T(·)dt', size=14)
    s += line(318, Y, 338, Y)
    s += text(328, 80, 'y', size=13, style='i')
    s += rect(338, 70, 76, 52)
    s += text(376, 102, '判决', size=13)
    s += line(414, Y, 474, Y, marker='a42')
    s += text(482, 101, '输出', size=12, anchor='start')
    # 噪声与门限（自下注入）
    s += line(104, 146, 104, Y + 17, marker='a42')
    s += text(98, 162, '白高斯噪声', size=12, anchor='end')
    s += line(170, 146, 170, Y + 17, marker='a42')
    s += text(170, 162, 'cos(2πf_ct)', size=11.5)
    s += line(376, 154, 376, 126, marker='a42')
    s += text(376, 170, 'V_{th}', size=13)
    return tighten(s + '</svg>')


# ---------------------------------------------------------------- 五、八进制星座图
BC, BY = 250, 200   # 原点
US = 30             # 每单位幅度像素
B = 2.0
INNER = [(B, 0, 's_1'), (0, B, 's_3'), (-B, 0, 's_5'), (0, -B, 's_7')]
OUTER = [(B * 1.41421356, B * 1.41421356, 's_2'), (-B * 1.41421356, B * 1.41421356, 's_4'),
         (-B * 1.41421356, -B * 1.41421356, 's_6'), (B * 1.41421356, -B * 1.41421356, 's_8')]


def px(u, v):
    return BC + u * US, BY - v * US


def fig_q5const():
    s = HEAD.format(w=520, h=400) + marker('a52')
    s += line(BC - 150, BY, BC + 152, BY, width=1.4, marker='a52')
    s += line(BC, BY + 150, BC, BY - 152, width=1.4, marker='a52')
    s += text(BC + 156, BY + 16, 'Re', size=12, anchor='start')
    s += text(BC + 10, BY - 140, 'Im', size=12, anchor='start')
    # 两个正方形的虚线框
    ox, oy = px(B * 1.41421356, B * 1.41421356)
    s += rect(ox, oy, 2 * (BC - ox), 2 * (BY - oy), dash='5 4', width=1.3)
    pts = [px(*p) for p in [(B, 0), (0, B), (-B, 0), (0, -B)]]
    s += poly(pts, dash='5 4', width=1.3, close=True)
    # 星座点
    for u, v, name in INNER + OUTER:
        x, y = px(u, v)
        s += dot(x, y, 4.2)
    # 标签（都让开虚线框与星座点）
    s += text(318, 212, 's_1', size=13, anchor='start')
    s += text(345, 108, 's_2', size=13, anchor='start')
    s += text(262, 132, 's_3', size=13, anchor='start')
    s += text(155, 108, 's_4', size=13, anchor='end')
    s += text(182, 212, 's_5', size=13, anchor='end')
    s += text(155, 291, 's_6', size=13, anchor='end')
    s += text(262, 275, 's_7', size=13, anchor='start')
    s += text(345, 291, 's_8', size=13, anchor='start')
    return tighten(s + '</svg>')


# ---------------------------------------------------------------- 七、量化器框图
def fig_q7block():
    s = HEAD.format(w=380, h=120) + marker('a72')
    Y = 78
    s += line(46, Y, 84, Y, marker='a72')
    s += text(34, 84, 'X', size=14, style='i')
    s += rect(84, 56, 78, 44)
    s += text(123, 84, '√(·)', size=14)
    s += line(162, Y, 190, Y)
    s += text(176, 66, 'W', size=13, style='i')
    s += rect(190, 56, 78, 44)
    s += text(229, 84, 'Q(·)', size=14)
    s += line(268, Y, 316, Y, marker='a72')
    s += text(330, 84, 'Z', size=14, style='i')
    s += text(229, 40, '量化', size=12)
    return tighten(s + '</svg>')


# ---------------------------------------------------------------- 九、状态转移图
def fig_q9sd():
    s = HEAD.format(w=580, h=330) + marker('a92')
    R = 25
    P = {'00': (120, 160), '10': (300, 66), '11': (480, 160), '01': (300, 254)}

    def node(k):
        x, y = P[k]
        return circle(x, y, R, fill='#fff') + text(x, y + 6, k, size=14)

    # 自环（贝塞尔，避免圆弧方向歧义）
    x, y = P['00']
    s += path(f"M{x-6:.1f},{y-21:.1f} C{x-64:.1f},{y-34:.1f} {x-64:.1f},{y+34:.1f} {x-6:.1f},{y+21:.1f}",
              marker='a92')
    s += text(x - 62, y + 6, '00', size=13)
    x, y = P['11']
    s += path(f"M{x+6:.1f},{y-21:.1f} C{x+64:.1f},{y-34:.1f} {x+64:.1f},{y+34:.1f} {x+6:.1f},{y+21:.1f}",
              dash='6 4', marker='a92')
    s += text(x + 74, y + 6, '01', size=13, anchor='start')
    # 主边
    E = lambda a, b, dash=None: edge(*P[a], *P[b], r=R, dash=dash, mid='a92')
    s += E('00', '10', dash='6 4')                            # 1 → 11
    s += text(186, 92, '11', size=13)
    s += E('10', '11', dash='6 4')                            # 1 → 10
    s += text(414, 92, '10', size=13)
    s += E('01', '00')                                        # 0 → 11
    s += text(186, 232, '11', size=13)
    s += E('11', '01')                                        # 0 → 10
    s += text(414, 232, '10', size=13)
    # 中间两条竖线（错开 9px 以免重叠）
    s += line(309, P['10'][1] + R, 309, P['01'][1] - R, marker='a92')                       # 10 --0--> 01
    s += text(320, 166, '01', size=13, anchor='start')
    s += line(291, P['01'][1] - R, 291, P['10'][1] + R, dash='6 4', marker='a92')           # 01 --1--> 10
    s += text(280, 166, '00', size=13, anchor='end')
    for k in P:
        s += node(k)
    return tighten(s + '</svg>')


# ---------------------------------------------------------------- 五(3)、s2 判决域
def fig_q5region():
    s = HEAD.format(w=540, h=580) + marker('a5r')
    cx, cy, K = 170, 390, 34

    def P2(u, v):
        return cx + u * K, cy - v * K

    # 阴影区：两条中垂线之“上”（含两条正半轴），向第一象限张开
    L1a = P2(7.243, 0)          # L1 与 Re 轴交点
    L2b = P2(0, 7.243)          # L2 与 Im 轴交点
    cross = P2(1.641, 1.641)    # 两条中垂线的交点
    s += area([P2(0, 9.8), L2b, cross, L1a, P2(9.8, 0), P2(9.8, 9.8)])
    # 坐标轴
    s += line(cx - 140, cy, cx + 324, cy, width=1.3, marker='a5r')
    s += line(cx, cy + 140, cx, cy - 324, width=1.3, marker='a5r')
    s += text(cx + 316, cy + 18, 'Re', size=12, anchor='start')
    s += text(cx + 10, cy - 314, 'Im', size=12, anchor='start')
    # 星座与两个虚线框
    ox, oy = P2(2.0 * 1.41421356, 2.0 * 1.41421356)
    s += rect(ox, oy, 2 * (cx - ox), 2 * (cy - oy), dash='5 4', width=1.2)
    s += poly([P2(2, 0), P2(0, 2), P2(-2, 0), P2(0, -2)], dash='5 4', width=1.2, close=True)
    for u, v in [(2, 0), (0, 2), (-2, 0), (0, -2)]:
        s += dot(*P2(u, v), 4.2)
    for u, v in [(2.83, 2.83), (-2.83, 2.83), (-2.83, -2.83), (2.83, -2.83)]:
        s += dot(*P2(u, v), 4.2)
    # 两条中垂线（沿自身方向向两端延长）
    s += line(120, 303.3, 460, 402.8, color=HOT, width=1.8)
    s += line(152, 82.2, 254, 430, color=HOT, width=1.8)
    # 标注
    s += text(250, 384, 's_1', size=13, anchor='start')
    s += text(276, 288, 's_2', size=13, anchor='start')
    s += text(182, 314, 's_3', size=13, anchor='start')
    s += text(64, 288, 's_4', size=13, anchor='end')
    s += text(94, 402, 's_5', size=13, anchor='end')
    s += text(64, 492, 's_6', size=13, anchor='end')
    s += text(182, 472, 's_7', size=13, anchor='start')
    s += text(276, 492, 's_8', size=13, anchor='start')
    s += text(318, 226, 's_2 的判决域', size=13, color=HOT)
    return tighten(s + '</svg>')


# ---------------------------------------------------------------- 九(1)、编码器框图
def fig_q9enc():
    s = HEAD.format(w=500, h=300) + marker('a93')
    Y = 74          # 移位寄存器所在水平线
    B1, B2 = 152, 236
    s += line(16, Y, 62, Y, marker='a93')
    s += text(30, 66, 'u', size=13, style='i')
    s += rect(62, 52, 58, 44)
    s += text(91, 80, 'D', size=14)
    s += line(120, Y, 162, Y)
    s += rect(162, 52, 58, 44)
    s += text(191, 80, 'D', size=14)
    s += line(220, Y, 250, Y)
    # 抽头与母线
    for tx in (40, 150, 250):
        s += dot(tx, Y)
    s += line(40, Y, 40, B2)
    s += line(150, Y, 150, B2)
    s += line(250, Y, 250, B2)
    s += line(40, B1, 306, B1, marker='a93')
    s += line(40, B2, 306, B2, marker='a93')
    s += dot(40, B1) + dot(250, B1)
    s += dot(40, B2) + dot(150, B2) + dot(250, B2)
    # 两个相加器
    s += adder(320, B1) + adder(320, B2)
    s += line(334, B1, 408, B1, marker='a93')
    s += line(334, B2, 408, B2, marker='a93')
    s += text(420, B1 + 5, 'c_1', size=13, anchor='start')
    s += text(420, B2 + 5, 'c_2', size=13, anchor='start')
    # 抽头说明
    s += text(36, 268, 'u_n', size=12, anchor='middle')
    s += text(150, 268, 'u_{n-1}', size=12)
    s += text(250, 268, 'u_{n-2}', size=12)
    return tighten(s + '</svg>')


# ---------------------------------------------------------------- 九(3)、网格图
def fig_q9trellis():
    s = HEAD.format(w=560, h=340) + marker('a94')
    rows = {'00': 62, '01': 122, '10': 182, '11': 242}
    X0, DX = 52, 74
    N = 6

    def X(t):
        return X0 + t * DX

    trans = {'00': [('00', '0'), ('10', '1')],
             '01': [('00', '0'), ('10', '1')],
             '10': [('01', '0'), ('11', '1')],
             '11': [('01', '0'), ('11', '1')]}
    for t in range(N):
        for st, outs in trans.items():
            for to, u in outs:
                dash = '5 4' if u == '1' else None
                s += line(X(t), rows[st], X(t + 1), rows[to], width=1.1, dash=dash, color=AUX)
    # 节点
    for t in range(N + 1):
        for st, y in rows.items():
            s += f"<circle cx='{X(t):.1f}' cy='{y:.1f}' r='2.6' fill='{INK}'/>"
    # 状态标签与列号
    for st, y in rows.items():
        s += text(X0 - 14, y + 5, st, size=12.5, anchor='end')
    for t in range(N + 1):
        s += text(X(t), rows['11'] + 30, str(t), size=11.5, color=AUX)
    s += text(X0 - 44, rows['11'] + 30, 't', size=11.5, anchor='end', color=AUX, style='i')
    # 接收码组
    recv = ['10', '00', '10', '11', '10', '00']
    for t in range(N):
        s += text((X(t) + X(t + 1)) / 2, 26, recv[t], size=12.5)
    s += text(X0 - 14, 26, '接收', size=11.5, anchor='end', color=AUX)
    # 最优路径（单条折线，只在末端一个箭头，避免箭头堆叠）
    win = ['00', '10', '11', '01', '00', '00', '00']
    pts = [(X(t), rows[win[t]]) for t in range(N + 1)]
    d = 'M' + ' L'.join(f'{px:.1f},{py:.1f}' for px, py in pts)
    s += path(d, width=2.8, color=HOT, marker='a94')
    s += text(X0, rows['11'] + 66, '实线＝输入 0，虚线＝输入 1；粗线＝最优路径', size=11.5, anchor='start', color=AUX)
    s += text(X0, rows['11'] + 90, '最优路径输出 11 10 10 11 00 00', size=11.5, anchor='start', color=HOT)
    s += text(X0, rows['11'] + 112, '与接收码组距 3 位 → 译码 1100', size=11.5, anchor='start', color=HOT)
    return tighten(s + '</svg>')


# (key, 题号, 是否解析配图, 描述)
FIGS = [
    ('q2am', '二', False, 'AM 系统框图'),
    ('q4rx', '四', False, '二进制调制系统接收框图'),
    ('q5const', '五', False, '八进制星座图'),
    ('q7block', '七', False, '量化器框图'),
    ('q9sd', '九', False, '卷积码状态转移图'),
    ('q5region', '五', True, 's2 最佳判决域'),
    ('q9enc', '九', True, '编码器原理框图'),
    ('q9trellis', '九', True, '网格图与维特比路径'),
]
SVGS = {
    'q2am': fig_q2am(), 'q4rx': fig_q4rx(), 'q5const': fig_q5const(),
    'q7block': fig_q7block(), 'q9sd': fig_q9sd(), 'q5region': fig_q5region(),
    'q9enc': fig_q9enc(), 'q9trellis': fig_q9trellis(),
}

YEAR = '2022'
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
