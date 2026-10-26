#!/usr/bin/env python3
# 生成 2017 年试卷 SVG 图库（每图一个文件，输出用 ###FILE: 分隔）：
#   node tools/emit_figures.mjs 2017
import math

from svgkit import PAD, tighten  # 统一的 viewBox 收边（四边等宽留白）

INK = '#1a1a1a'


# ---------------------------------------------------------------- 基础画笔
def marker(mid, color=INK):
    return (f"<defs><marker id='{mid}' markerWidth='8' markerHeight='8' refX='7' refY='3' orient='auto'>"
            f"<path d='M0,0 L7,3 L0,6 z' fill='{color}'/></marker></defs>")


def poly(pts, stroke=INK, width=1.6, dash=None, fill='none', close=False):
    d = ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)
    dd = ' Z' if close else ''
    da = f" stroke-dasharray='{dash}'" if dash else ''
    return f"<path d='M{d}{dd}' fill='{fill}' stroke='{stroke}' stroke-width='{width}'{da}/>"


def line(x1, y1, x2, y2, width=1.6, dash=None, color=INK, marker=None):
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


def text(x, y, s, size=14, anchor='middle', style='', color=INK):
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


def dot(x, y, r=4, fill=INK, stroke='none'):
    return f"<circle cx='{x:.1f}' cy='{y:.1f}' r='{r}' fill='{fill}' stroke='{stroke}'/>"


def circle(cx, cy, r, dash=None, color=INK, width=1.6, fill='none'):
    da = f" stroke-dasharray='{dash}'" if dash else ''
    return (f"<circle cx='{cx:.1f}' cy='{cy:.1f}' r='{r:.1f}' fill='{fill}' "
            f"stroke='{color}' stroke-width='{width}'{da}/>")


def rect(x, y, w, h, dash=None, fill='none', width=1.6):
    da = f" stroke-dasharray='{dash}'" if dash else ''
    return (f"<rect x='{x:.1f}' y='{y:.1f}' width='{w:.1f}' height='{h:.1f}' fill='{fill}' "
            f"stroke='{INK}' stroke-width='{width}'{da}/>")


def mul(cx, cy, r=13):
    """乘法器 ⊗：圆 + 对角线"""
    return (circle(cx, cy, r)
            + line(cx - r * .71, cy - r * .71, cx + r * .71, cy + r * .71)
            + line(cx + r * .71, cy - r * .71, cx - r * .71, cy + r * .71))


def adder(cx, cy, r=13):
    """相加器 ⊕：圆 + 十字线"""
    return (circle(cx, cy, r)
            + line(cx - r * .77, cy, cx + r * .77, cy)
            + line(cx, cy - r * .77, cx, cy + r * .77))


def curve(p, q, bow, marker_id=None, width=1.6, color=INK, steps=7):
    """二次贝塞尔（离散成折线）；bow 为法向偏移，正负决定凸向。
    末段用 <line> 画，以便挂箭头 marker（箭头沿曲线切线）。"""
    x1, y1 = p
    x2, y2 = q
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy) or 1.0
    nx, ny = -dy / L, dx / L
    cxp, cyp = (x1 + x2) / 2 + nx * bow, (y1 + y2) / 2 + ny * bow
    pts = []
    for i in range(steps):
        t = i / steps
        bx = (1 - t) ** 2 * x1 + 2 * t * (1 - t) * cxp + t * t * x2
        by = (1 - t) ** 2 * y1 + 2 * t * (1 - t) * cyp + t * t * y2
        pts.append((bx, by))
    out = poly(pts, width=width, stroke=color)
    out += line(pts[-1][0], pts[-1][1], x2, y2, width=width, color=color, marker=marker_id)
    return out


def trim(p, q, r):
    """把 p→q 的连线两端各缩进 r（让线从圆周出发）"""
    dx, dy = q[0] - p[0], q[1] - p[1]
    L = math.hypot(dx, dy) or 1.0
    ux, uy = dx / L, dy / L
    return (p[0] + ux * r, p[1] + uy * r), (q[0] - ux * r, q[1] - uy * r)


def arrow(cx, cy, dx, dy, ln=9, color=INK):
    """指向 (dx,dy) 方向的小三角箭头"""
    L = math.hypot(dx, dy) or 1.0
    ux, uy = dx / L, dy / L
    bx, by = cx - ux * ln, cy - uy * ln
    px, py = -uy, ux
    return poly([(cx, cy), (bx + px * 4, by + py * 4), (bx - px * 4, by - py * 4)],
                fill=color, close=True, width=1)


HEAD = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {w} {h}' "
        "font-family=\"Helvetica,Arial,'PingFang SC','Microsoft YaHei',sans-serif\" font-size='14'>")


# ================================================================ 二、解调框图 + 噪声谱
def fig_q2sys():
    s = HEAD.format(w=580, h=420) + marker('a17a')
    # ---- (a) 相干解调框图 ----
    s += text(12, 92, 'r(t)=s(t)+n(t)', size=13, anchor='start')
    s += line(12, 105, 150, 105)
    s += line(150, 75, 150, 135)
    s += dot(150, 105, 3)
    # 上支路
    s += line(150, 75, 162, 75, marker='a17a')
    s += mul(175, 75, 13)
    s += line(188, 75, 210, 75, marker='a17a')
    s += rect(210, 57, 56, 36) + text(238, 81, 'LPF', size=13)
    s += line(266, 75, 290, 75, marker='a17a')
    s += text(298, 80, 'y_1(t)', size=13, anchor='start')
    # 下支路
    s += line(150, 135, 162, 135, marker='a17a')
    s += mul(175, 135, 13)
    s += line(188, 135, 210, 135, marker='a17a')
    s += rect(210, 117, 56, 36) + text(238, 141, 'LPF', size=13)
    s += line(266, 135, 278, 135, marker='a17a')
    s += rect(278, 117, 60, 36) + text(308, 141, '−90°', size=13)
    s += line(338, 135, 362, 135, marker='a17a')
    s += text(370, 140, 'y_2(t)', size=13, anchor='start')
    # 载波标注
    s += text(175, 42, '2cos 2πf_ct', size=13)
    s += line(175, 52, 175, 61, marker='a17a')
    s += text(175, 182, '2sin 2πf_ct', size=13)
    s += line(175, 165, 175, 149, marker='a17a')
    s += text(320, 200, '(a)', size=13, color='#666')

    # ---- (b) 窄带噪声功率谱 ----
    s += line(50, 360, 490, 360, marker='a17a')
    s += line(270, 360, 270, 240, marker='a17a')
    s += text(276, 246, 'P_n(f)', size=13, anchor='start')
    s += poly([(60, 360), (120, 290), (150, 360)])
    s += poly([(390, 360), (420, 290), (480, 360)])
    s += line(120, 290, 420, 290, width=1.1, dash='3,4', color='#999')
    for xx in (120, 420):
        s += line(xx, 290, xx, 360, width=1.1, dash='3,4', color='#999')
    s += text(262, 280, '1/1000', size=12, anchor='end')
    for xx, tt in ((60, '−7'), (120, '−5'), (150, '−4'), (270, '0'), (390, '4'), (420, '5'), (480, '7')):
        s += text(xx, 378, tt, size=12)
    s += text(506, 365, 'f /kHz', size=12, anchor='start')
    s += text(300, 400, '(b)', size=13, color='#666')
    return s + '</svg>'


# ================================================================ 三、波形 + 接收框图
def fig_q3sys():
    s = HEAD.format(w=545, h=195) + marker('a17b')
    # (a) s(t) 波形
    s += line(40, 125, 230, 125, marker='a17b')
    s += line(95, 155, 95, 80, marker='a17b')
    s += text(88, 74, 's(t)', size=13, anchor='end')
    s += poly([(95, 125), (95, 105), (155, 105), (155, 145), (215, 145), (215, 125)])
    s += text(86, 110, '+1', size=12, anchor='end')
    s += text(86, 150, '−1', size=12, anchor='end')
    s += text(155, 165, '2', size=12)
    s += text(215, 165, '4', size=12)
    s += text(126, 168, 't', size=12, anchor='start')
    s += text(130, 186, '(a)', size=13, color='#666')

    # (b) 接收框图
    s += text(240, 130, 'y(t)', size=13, anchor='start')
    s += line(272, 125, 300, 125, marker='a17b')
    s += rect(300, 107, 56, 36) + text(328, 131, 'h(t)', size=13, style='i')
    s += line(356, 125, 380, 125, marker='a17b')
    s += dot(383, 125, 3.2)
    s += line(383, 125, 395, 113)
    s += text(402, 108, 't=t_0', size=12, anchor='start')
    s += line(395, 125, 425, 125, marker='a17b')
    s += rect(425, 107, 64, 36) + text(457, 131, '判决', size=13)
    s += text(457, 176, 'V_T=0', size=12)
    s += line(457, 158, 457, 144, marker='a17b')
    s += line(489, 125, 520, 125, marker='a17b')
    s += text(370, 186, '(b)', size=13, color='#666')
    return s + '</svg>'


# ================================================================ 六、编码调制链路（题图）
def fig_q6sys():
    s = HEAD.format(w=700, h=245) + marker('a17c')
    # m 序列发生器
    s += rect(40, 93, 80, 48)
    s += text(80, 112, 'm 序列') + text(80, 130, '发生器')
    # 虚线框（右边框在三条输出线处留缺口）
    s += line(175, 25, 545, 25, width=1.2, dash='5,4')
    s += line(175, 210, 545, 210, width=1.2, dash='5,4')
    s += line(175, 25, 175, 210, width=1.2, dash='5,4')
    for y0, y1 in ((25, 31), (46, 54), (70, 192), (208, 210)):
        s += line(545, y0, 545, y1, width=1.2, dash='5,4')
    s += text(360, 15, '卷积码编码器', size=13)
    # 三级寄存器
    for bx in (235, 315, 395):
        s += rect(bx, 100, 44, 34)
        s += text(bx + 22, 122, 'D', size=14, style='i')
    # 输入主线 + 总线
    s += line(120, 117, 235, 117, marker='a17c')
    s += line(200, 40, 200, 178)
    s += dot(200, 117, 3)
    # 级间连线
    s += line(279, 117, 315, 117, marker='a17c')
    s += line(359, 117, 395, 117, marker='a17c')
    s += dot(279, 117, 3) + dot(359, 117, 3) + dot(439, 117, 3)
    # b1：直通
    s += line(200, 40, 595, 40, marker='a17c')
    s += text(574, 30, 'b_1', size=13)
    # 中间加法器 → b2
    s += adder(372, 84, 13)
    s += line(200, 84, 359, 84)
    s += line(372, 117, 372, 97, marker='a17c')
    s += line(439, 117, 439, 84) + line(439, 84, 385, 84, marker='a17c')
    s += line(372, 71, 372, 68) + line(372, 68, 595, 68, marker='a17c')
    s += text(574, 58, 'b_2', size=13)
    # 下方加法器 → b3
    s += adder(279, 178, 13)
    s += line(279, 117, 279, 165, marker='a17c')
    s += line(439, 117, 439, 178) + line(439, 178, 292, 178, marker='a17c')
    s += line(200, 178, 266, 178, marker='a17c')
    s += line(279, 191, 279, 200) + line(279, 200, 595, 200, marker='a17c')
    s += text(574, 190, 'b_3', size=13)
    # 8PSK 调制
    s += rect(600, 20, 88, 195)
    s += text(644, 110, '8PSK', size=14) + text(644, 128, '调制', size=14)
    s += line(688, 117, 698, 117, marker='a17c')
    return s + '</svg>'


# ================================================================ 二(4)、同相分量功率谱
def fig_q2nc():
    s = HEAD.format(w=440, h=400) + marker('a17d')
    s += line(180, 380, 400, 380, marker='a17d')
    s += line(280, 380, 280, 240, marker='a17d')
    s += text(286, 246, 'P_nc(f)', size=13, anchor='start')
    s += poly([(200, 380), (240, 357.5), (280, 290), (320, 357.5), (360, 380)])
    s += line(280, 290, 240, 290, width=1.1, dash='3,4', color='#999')
    s += text(272, 284, '1/500', size=12, anchor='end')
    s += text(330, 344, '1/2000', size=12, anchor='start')
    s += line(320, 357.5, 320, 380, width=1.1, dash='3,4', color='#999')
    for xx, tt in ((200, '−2'), (240, '−1'), (280, '0'), (320, '1'), (360, '2')):
        s += text(xx, 398, tt, size=12)
    s += text(406, 385, 'f /kHz', size=12, anchor='start')
    return s + '</svg>'


# ================================================================ 六(1)、8PSK 功率谱
def fig_q6psd():
    s = HEAD.format(w=520, h=395) + marker('a17e')
    s += line(130, 330, 450, 330, marker='a17e')
    s += line(290, 330, 290, 250, marker='a17e')
    s += text(284, 240, 'P(f)', size=13, anchor='end')
    s += poly([(130, 330), (162, 300), (180, 272), (190, 250)])
    s += poly([(390, 250), (400, 272), (418, 300), (450, 330)])
    s += line(190, 250, 390, 250)
    s += line(190, 250, 190, 330, width=1.1, dash='3,4', color='#999')
    s += line(390, 250, 390, 330, width=1.1, dash='3,4', color='#999')
    for xx, tt in ((130, '−30'), (190, '−20'), (290, '0'), (390, '20'), (450, '30')):
        s += text(xx, 348, tt, size=12)
    s += text(290, 372, 'f − f_c / kHz', size=12)
    return s + '</svg>'


# ================================================================ 六(1)、调制框图
def fig_q6mod():
    s = HEAD.format(w=560, h=225) + marker('a17f')
    s += text(10, 110, 'b_1b_2b_3', size=13, anchor='start')
    s += line(64, 105, 90, 105, marker='a17f')
    s += rect(90, 83, 80, 46)
    s += text(130, 103, '三比特') + text(130, 121, '变换')
    s += line(170, 105, 200, 105) + line(200, 60, 200, 150)
    s += dot(200, 105, 3)
    s += line(200, 60, 240, 60, marker='a17f')
    s += text(220, 50, 'a_i', size=13, style='i')
    s += line(200, 150, 240, 150, marker='a17f')
    s += text(220, 142, 'a_q', size=13, style='i')
    s += rect(240, 39, 112, 42)
    s += text(296, 56, 'α=0.5 根升') + text(296, 74, '余弦滤波器')
    s += rect(240, 129, 112, 42)
    s += text(296, 146, 'α=0.5 根升') + text(296, 164, '余弦滤波器')
    s += line(352, 60, 367, 60) + mul(380, 60, 13)
    s += line(352, 150, 367, 150) + mul(380, 150, 13)
    s += text(380, 28, 'cos 2πf_ct', size=13)
    s += line(380, 38, 380, 46, marker='a17f')
    s += text(380, 196, '−sin 2πf_ct', size=13)
    s += line(380, 178, 380, 164, marker='a17f')
    s += line(393, 60, 430, 60) + line(430, 60, 430, 91)
    s += line(393, 150, 430, 150) + line(430, 150, 430, 119)
    s += adder(440, 105, 14)
    s += line(454, 105, 490, 105, marker='a17f')
    s += text(498, 110, '8PSK', size=13, anchor='start')
    return s + '</svg>'


# ================================================================ 六(2)、m 序列发生器
def fig_q6mseq():
    s = HEAD.format(w=400, h=215) + marker('a17g')
    for bx in (60, 140, 220):
        s += rect(bx, 80, 44, 34)
        s += text(bx + 22, 102, 'D', size=14, style='i')
    s += line(104, 97, 140, 97, marker='a17g')
    s += line(184, 97, 220, 97, marker='a17g')
    s += dot(184, 97, 3) + dot(264, 97, 3)
    # 输出
    s += line(264, 97, 290, 97) + line(290, 97, 290, 50)
    s += line(290, 50, 330, 50, marker='a17g')
    s += text(338, 55, '输出', size=13, anchor='start')
    # 反馈：D2 ⊕ D3
    s += adder(160, 160, 13)
    s += line(184, 97, 184, 160) + line(184, 160, 173, 160, marker='a17g')
    s += line(290, 97, 290, 180) + line(290, 180, 160, 180) + line(160, 180, 160, 173, marker='a17g')
    s += line(147, 160, 30, 160) + line(30, 160, 30, 97) + line(30, 97, 60, 97, marker='a17g')
    return s + '</svg>'


# ================================================================ 六(3)、状态转移图
def fig_q6state():
    s = HEAD.format(w=1000, h=450) + marker('a17h')
    R = 24
    nodes = {
        '000': (120, 100), '001': (380, 100), '010': (640, 100), '011': (900, 100),
        '100': (120, 340), '101': (380, 340), '110': (640, 340), '111': (900, 340),
    }
    # (from, to, bow, label, lx, ly, anchor)
    edges = [
        ('000', '100', 0, '1/111', 138, 220, 'start'),
        ('001', '000', 0, '0/011', 250, 82, 'middle'),
        ('001', '100', 0, '1/100', 285, 246, 'middle'),
        ('010', '001', 0, '0/010', 510, 86, 'middle'),
        ('010', '101', -25, '1/101', 468, 160, 'middle'),
        ('101', '010', 25, '0/010', 545, 258, 'middle'),
        ('011', '001', 110, '0/001', 640, 40, 'middle'),
        ('011', '101', -60, '1/110', 600, 232, 'middle'),
        ('100', '010', 0, '0/001', 415, 240, 'middle'),
        ('100', '110', 80, '1/110', 380, 402, 'middle'),
        ('101', '110', 0, '1/101', 510, 320, 'middle'),
        ('110', '011', 0, '0/011', 810, 244, 'middle'),
        ('110', '111', 0, '1/100', 770, 362, 'middle'),
        ('111', '011', 0, '1/111', 918, 220, 'start'),
    ]
    for a, b, bow, lbl, lx, ly, anc in edges:
        p0, p1 = trim(nodes[a], nodes[b], R)
        if abs(bow) < 0.01:
            s += line(p0[0], p0[1], p1[0], p1[1], marker='a17h')
        else:
            s += curve(p0, p1, bow, marker_id='a17h')
        s += text(lx, ly, lbl, size=12, anchor=anc)
    # 两个自环
    s += circle(120, 52, 17) + circle(900, 392, 17)
    s += arrow(120, 74, 0, 1) + arrow(900, 370, 0, -1)
    s += text(120, 22, '0/000', size=12)
    s += text(900, 428, '1/111', size=12)
    # 节点
    for name, (cx, cy) in nodes.items():
        s += circle(cx, cy, R)
        s += text(cx, cy + 4, name, size=12)
    s += text(500, 20, '边标注：输入 / 输出 b_1b_2b_3', size=12, color='#666')
    return s + '</svg>'


# ================================================================ 七、二元熵函数
def fig_q7h():
    s = HEAD.format(w=380, h=235) + marker('a17i')
    s += line(60, 200, 340, 200, marker='a17i')
    s += line(60, 200, 60, 55, marker='a17i')
    s += text(52, 50, 'H(p_1)', size=13, anchor='end')
    s += text(346, 205, 'p_1', size=13, anchor='start')
    s += line(200, 200, 200, 70, width=1.1, dash='3,4', color='#999')
    s += line(60, 70, 200, 70, width=1.1, dash='3,4', color='#999')
    pts = []
    for i in range(1, 100):
        p = i / 100.0
        h = -(p * math.log(p, 2) + (1 - p) * math.log(1 - p, 2))
        pts.append((60 + p * 280, 200 - h * 130))
    s += poly(pts)
    s += text(52, 74, '1', size=12, anchor='end')
    s += text(52, 204, '0', size=12, anchor='end')
    s += text(60, 218, '0', size=12)
    s += text(200, 218, '1/2', size=12)
    s += text(340, 218, '1', size=12)
    return s + '</svg>'


# ================================================================ 八(1)、星座图
def fig_q8const():
    s = HEAD.format(w=380, h=340) + marker('a17j')
    s += line(60, 200, 340, 200, marker='a17j')
    s += line(200, 340, 200, 60, marker='a17j')
    s += text(210, 54, 'r_2', size=13, anchor='start')
    s += text(346, 205, 'r_1', size=13, anchor='start')
    s += dot(260, 140, 4.5) + dot(140, 260, 4.5)
    s += text(272, 130, 's_1=(+1,+1)', size=13, anchor='start')
    s += text(128, 280, 's_2=(−1,−1)', size=13, anchor='end')
    s += text(258, 218, '1', size=12)
    s += text(136, 218, '−1', size=12)
    s += text(190, 146, '1', size=12, anchor='end')
    s += text(190, 268, '−1', size=12, anchor='end')
    return s + '</svg>'


# ================================================================ 八(3)、最大似然判决域
def fig_q8dom():
    s = HEAD.format(w=380, h=340) + marker('a17k')
    s += line(60, 200, 340, 200, marker='a17k')
    s += line(200, 340, 200, 60, marker='a17k')
    s += text(210, 54, 'r_2', size=13, anchor='start')
    s += text(346, 205, 'r_1', size=13, anchor='start')
    s += line(100, 100, 300, 300, width=1.2, dash='5,4', color='#888')
    s += dot(260, 140, 4.5) + dot(140, 260, 4.5)
    s += text(272, 130, 's_1', size=13, anchor='start', style='i')
    s += text(128, 280, 's_2', size=13, anchor='end', style='i')
    s += text(312, 152, 'D_1', size=12, color='#555')
    s += text(98, 316, 'D_2', size=12, color='#555')
    s += text(258, 218, '1', size=12)
    s += text(136, 218, '−1', size=12)
    s += text(190, 146, '1', size=12, anchor='end')
    s += text(190, 268, '−1', size=12, anchor='end')
    return s + '</svg>'


# (key, 题号, 是否解析配图, 描述)
FIGS = [
    ('q2sys', '二', False, '相干解调框图与窄带噪声功率谱'),
    ('q3sys', '三', False, '信号波形与匹配滤波接收框图'),
    ('q6sys', '六', False, 'm 序列—卷积码—8PSK 编码调制链路'),
    ('q2nc', '二', True, '同相分量功率谱'),
    ('q6psd', '六', True, '8PSK 功率谱密度'),
    ('q6mod', '六', True, '8PSK 调制框图'),
    ('q6mseq', '六', True, 'm 序列发生器'),
    ('q6state', '六', True, '卷积码状态转移图'),
    ('q7h', '七', True, '二元熵函数曲线'),
    ('q8const', '八', True, '信号星座图'),
    ('q8dom', '八', True, '最大似然判决域'),
]
SVGS = {
    'q2sys': fig_q2sys(), 'q3sys': fig_q3sys(), 'q6sys': fig_q6sys(),
    'q2nc': fig_q2nc(), 'q6psd': fig_q6psd(), 'q6mod': fig_q6mod(),
    'q6mseq': fig_q6mseq(), 'q6state': fig_q6state(), 'q7h': fig_q7h(),
    'q8const': fig_q8const(), 'q8dom': fig_q8dom(),
}
SVGS = {k: tighten(v, PAD) for k, v in SVGS.items()}

YEAR = '2017'
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
