#!/usr/bin/env python3
# 生成 2023 年试卷 SVG 图库（每图一个文件，输出用 ###FILE: 分隔）：
#   node tools/emit_figures.mjs 2023
import math

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


def head(x, y, dx, dy, size=6.0):
    """实心箭头：尖端在 (x,y)，方向 (dx,dy)"""
    L = math.hypot(dx, dy) or 1.0
    ux, uy = dx / L, dy / L
    bx, by = x - ux * size * 1.7, y - uy * size * 1.7
    px, py = -uy * size * 0.8, ux * size * 0.8
    return poly([(x, y), (bx + px, by + py), (bx - px, by - py)], fill='#1a1a1a', stroke='#1a1a1a', width=0.6)


# --------------------------------------------------- 文字（支持嵌套上下标）
def _parse(s, i=0, stop=False):
    """把 'e^{-j2πf_ct}' / 'T_{b}' / 'u^2' 解析成节点树；支持嵌套"""
    nodes, buf = [], ''
    while i < len(s):
        c = s[i]
        if c == '}' and stop:
            if buf:
                nodes.append(('t', buf))
            return nodes, i + 1
        if c in '_^':
            if buf:
                nodes.append(('t', buf)); buf = ''
            i += 1
            if i < len(s) and s[i] == '{':
                sub, i = _parse(s, i + 1, True)
            elif i < len(s):
                sub, i = [('t', s[i])], i + 1
            else:
                continue
            nodes.append(('sub' if c == '_' else 'sup', sub))
        else:
            buf += c; i += 1
    if buf:
        nodes.append(('t', buf))
    return nodes, i


def _flatten(nodes, size, dy=0.0, out=None):
    if out is None:
        out = []
    for kind, val in nodes:
        if kind == 't':
            out.append((val, dy, size))
        elif kind == 'sub':
            _flatten(val, size * 0.72, dy + size * 0.28, out)
        else:
            _flatten(val, size * 0.72, dy - size * 0.40, out)
    return out


def text(x, y, s, size=14, anchor='middle', style='', color='#1a1a1a'):
    """文字；'_x'/'_{xx}' 下标、'^x'/'^{xx}' 上标，用 tspan 真上下标"""
    st = " font-style='italic'" if 'i' in style else ''
    wt = " font-weight='bold'" if 'b' in style else ''
    nodes, _ = _parse(s)
    if len(nodes) == 1 and nodes[0][0] == 't':
        return f"<text x='{x:.1f}' y='{y:.1f}' text-anchor='{anchor}' font-size='{size}'{st}{wt} fill='{color}'>{s}</text>"
    cur = 0.0
    body = ''
    for t, dy, sz in _flatten(nodes, size):
        body += f"<tspan dy='{dy - cur:.1f}' font-size='{sz:.1f}'>{t}</tspan>"
        cur = dy
    return f"<text x='{x:.1f}' y='{y:.1f}' text-anchor='{anchor}' font-size='{size}'{st}{wt} fill='{color}'>{body}</text>"


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
    """乘法器 ⊗：圆 + 对角线"""
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


def head_at(w, h, x0, y0):
    """viewBox 贴内容边界用"""
    base = HEAD.format(w=w, h=h)
    return base.replace("viewBox='0 0 %d %d'" % (w, h), "viewBox='%d %d %d %d'" % (x0, y0, w, h))


# ================================================================ 题目原图
# ---------------------------------------------------------------- 二、窄带噪声产生框图
def fig_q2sys():
    s = HEAD.format(w=776, h=214) + marker('a23a')
    YC = 100
    s += text(6, YC + 5, 'n_w(t)', anchor='start', style='i', size=13.5)
    s += line(66, YC, 98, YC, marker='a23a')
    s += rect(100, YC - 20, 54, 40) + text(127, YC + 5, 'BPF', size=13)
    s += line(154, YC, 198, YC, marker='a23a')
    s += text(172, YC - 9, 'n(t)', style='i', size=13)
    s += dot(190, YC, 3)
    s += rect(200, YC - 22, 96, 44)
    s += text(248, YC - 3, '希尔伯特', size=12.5)
    s += text(248, YC + 14, '变换', size=12.5)
    s += line(296, YC, 330, YC, marker='a23a')
    s += text(318, YC - 10, 'n(t)', style='i', size=13)
    s += poly([(305, YC - 15), (310, YC - 21), (315, YC - 15)], width=1.4)
    s += mul(348, YC) + text(348, 78, 'j', size=13, style='i')
    s += line(361, YC, 425, YC)
    s += adder(438, YC)
    # n(t) 直通支路
    s += line(190, YC, 190, 174) + line(190, 174, 438, 174)
    s += line(438, 174, 438, 113, marker='a23a')
    s += line(451, YC, 486, YC, marker='a23a')
    s += text(468, YC - 9, 'z(t)', style='i', size=13)
    s += mul(502, YC)
    s += text(502, 76, 'e^{-j2πf_ct}', size=13)
    s += line(515, YC, 552, YC)
    s += text(534, 120, 'n_L(t)', style='i', size=13)
    s += dot(560, YC, 3)
    s += line(560, YC, 560, 58) + line(560, 58, 598, 58, marker='a23a')
    s += line(560, YC, 560, 150) + line(560, 150, 598, 150, marker='a23a')
    s += rect(600, 41, 64, 34) + text(632, 63, '取实部', size=12.5)
    s += rect(600, 133, 64, 34) + text(632, 155, '取虚部', size=12.5)
    s += line(664, 58, 700, 58, marker='a23a') + text(706, 63, 'n_c(t)', anchor='start', style='i', size=13)
    s += line(664, 150, 700, 150, marker='a23a') + text(706, 155, 'n_s(t)', anchor='start', style='i', size=13)
    return s + '</svg>'


# ---------------------------------------------------------------- 七、梯形总体传递函数
def fig_q7spec():
    s = HEAD.format(w=560, h=250) + marker('a23b')
    OX, OY = 250, 208
    U = 45.0
    s += line(40, OY, 470, OY, marker='a23b') + line(OX, OY + 6, OX, 42, marker='a23b')

    def X(f):
        return OX + f * U

    HY = 96
    s += poly([(X(-4), OY), (X(-1), HY), (X(1), HY), (X(4), OY)])
    s += line(X(-1), OY, X(-1), HY, width=1.2, dash='4 3', color='#777')
    s += line(X(1), OY, X(1), HY, width=1.2, dash='4 3', color='#777')
    for f, t in ((-4, '−4'), (-1, '−1'), (0, '0'), (1, '1'), (4, '4')):
        s += text(X(f), OY + 20, t, size=13)
    s += text(478, OY + 5, 'f/kHz', size=13, anchor='start')
    s += text(242, HY - 7, '1', size=12, anchor='end')
    return s + '</svg>'


# ---------------------------------------------------------------- 五、八进制星形星座
R3 = math.sqrt(3)
Q5PTS = {
    's1': (1 + R3, 1), 's2': (1, 0), 's3': (0, R3), 's4': (-1, 0),
    's5': (-1 - R3, 1), 's6': (-1 - R3, -1), 's7': (0, -R3), 's8': (1 + R3, -1),
}
Q5LBL = {  # 标签相对偏移与对齐
    's1': (0, -13, 'middle'), 's2': (-13, -14, 'middle'), 's3': (12, -6, 'start'),
    's4': (-13, -14, 'middle'), 's5': (0, -13, 'middle'), 's6': (0, 20, 'middle'),
    's7': (12, 12, 'start'), 's8': (0, 20, 'middle'),
}
Q5DASH = [('s4', 's3'), ('s3', 's2'), ('s4', 's7'), ('s7', 's2'), ('s2', 's1'),
          ('s1', 's8'), ('s2', 's8'), ('s5', 's4'), ('s6', 's4'), ('s5', 's6')]


def q5_draw(cells=None, cw=700, ch=400):
    cx, cy, sc = 340, 200, 70
    s = ''

    def XY(p):
        return (cx + p[0] * sc, cy - p[1] * sc)

    if cells:
        for st, pts in cells.items():
            pp = [XY(p) for p in pts]
            if len(pp) < 3:
                continue
            s += poly(pp, stroke='#777', width=1.1, fill='#e6e6e6', close=True)
    # 坐标轴
    s += line(50, cy, 645, cy) + head(658, cy, 1, 0)
    s += line(cx, 372, cx, 46) + head(cx, 38, 0, -1)
    for a, b in Q5DASH:
        pa, pb = XY(Q5PTS[a]), XY(Q5PTS[b])
        s += line(pa[0], pa[1], pb[0], pb[1], width=1.3, dash='6 4', color='#333')
    for k, p in Q5PTS.items():
        x, y = XY(p)
        s += dot(x, y, 4)
    for k, p in Q5PTS.items():
        x, y = XY(p)
        dx, dy, an = Q5LBL[k]
        if k in ('s2', 's4'):
            s += rect(x + dx - 11, y + dy - 12, 22, 15, fill='#fff', width=0)
        s += text(x + dx, y + dy, k[0] + '_' + k[1], size=14, style='i', anchor=an)
    return s


def fig_q5const():
    return HEAD.format(w=700, h=400) + q5_draw() + '</svg>'


# ---------------------------------------------------------------- 六、两路并行传输
def fig_q6sys():
    s = HEAD.format(w=678, h=252) + marker('a23c')
    Y1, Y2 = 86, 176
    s += text(6, 136, '3Mbit/s', anchor='start', size=13)
    s += line(68, 131, 98, 131, marker='a23c')
    s += rect(100, 66, 40, 130)
    s += text(120, 124, '分', size=13) + text(120, 144, '路', size=13)
    s += line(140, 131, 152, 131) + dot(152, 131, 3)
    s += line(152, Y1, 152, Y2, width=1.4)
    for Y, R, BW, BWv, PN in ((Y1, 'R_1', '信道1', 'B_1=2MHz', 'P_1 / N_1'),
                              (Y2, 'R_2', '信道2', 'B_2=1MHz', 'P_2 / N_2')):
        s += line(152, Y, 186, Y, marker='a23c')
        s += text(169, Y - 10, R, size=13, style='i')
        s += rect(188, Y - 20, 64, 40) + text(220, Y - 4, '理想', size=12.5) + text(220, Y + 14, '编码', size=12.5)
        s += line(252, Y, 288, Y, marker='a23c')
        s += rect(290, Y - 25, 92, 50)
        s += text(336, Y - 8, BW, size=12.5) + text(294, Y + 16, BWv, size=12.5, anchor='start')
        s += line(382, Y, 430, Y, marker='a23c')
        s += text(386, Y - 8, PN, size=11, style='i', anchor='start')
        s += rect(432, Y - 20, 52, 40) + text(458, Y + 5, '译码', size=12.5)
        s += line(484, Y, 512, Y, marker='a23c')
    s += rect(514, 66, 40, 130)
    s += text(534, 124, '合', size=13) + text(534, 144, '路', size=13)
    s += line(554, 131, 600, 131, marker='a23c')
    s += text(606, 136, '3Mbit/s', anchor='start', size=13)
    return s + '</svg>'


# ---------------------------------------------------------------- 八、量化 + 哈夫曼
def fig_q8sys():
    s = HEAD.format(w=452, h=112) + marker('a23d')
    Y = 58
    s += text(8, Y + 5, 'X', anchor='start', style='i', size=14)
    s += line(34, Y, 72, Y, marker='a23d')
    s += rect(74, Y - 22, 70, 44) + text(109, Y + 5, '量化', size=13)
    s += line(144, Y, 182, Y, marker='a23d') + text(160, Y - 9, 'Y', size=13, style='i')
    s += rect(184, Y - 26, 92, 52)
    s += text(230, Y - 4, '哈夫曼', size=12.5) + text(230, Y + 13, '编码', size=12.5)
    s += line(276, Y, 316, Y, marker='a23d')
    return s + '</svg>'


# ---------------------------------------------------------------- 九、系统总框图
def fig_q9sys():
    s = HEAD.format(w=772, h=238) + marker('a23e')
    Y1, Y2 = 66, 176
    for Y, m in ((Y1, 'm_1(t)'), (Y2, 'm_2(t)')):
        s += text(6, Y + 5, m, anchor='start', style='i', size=13)
        s += line(50, Y, 68, Y, marker='a23e')
        s += rect(70, Y - 20, 64, 40) + text(102, Y - 2, '理想', size=12.5) + text(102, Y + 15, '采样', size=12.5)
        s += line(134, Y, 158, Y, marker='a23e')
        s += rect(160, Y - 22, 84, 44)
        s += text(202, Y - 2, 'A律十三', size=12) + text(202, Y + 15, '折线编码', size=12)
        s += line(244, Y, 300, Y, marker='a23e')
    s += text(266, Y1 - 11, 'A', size=13, style='i')
    s += text(266, Y2 - 11, 'B', size=13, style='i')
    yc = (Y1 + Y2) / 2
    s += rect(302, Y1 - 26, 40, (Y2 - Y1) + 52)
    s += text(322, yc - 8, '时分', size=12.5) + text(322, yc + 9, '复用', size=12.5)
    s += line(342, yc, 390, yc, marker='a23e') + text(366, yc - 10, 'C', size=13, style='i')
    s += rect(392, yc - 23, 84, 46)
    s += text(434, yc - 2, '(15,7)', size=12.5) + text(434, yc + 15, '循环码', size=12.5)
    s += line(476, yc, 520, yc, marker='a23e') + text(498, yc - 10, 'D', size=13, style='i')
    s += rect(522, yc - 23, 88, 46)
    s += text(566, yc - 2, '64QAM', size=12.5) + text(566, yc + 15, '调制', size=12.5)
    s += line(610, yc, 652, yc, marker='a23e') + text(630, yc - 10, 'E', size=13, style='i')
    s += text(658, yc + 5, '无线信道', anchor='start', size=12.5)
    return s + '</svg>'


# ================================================================ 解析配图
# ---------------------------------------------------------------- 二、三个功率谱
def fig_q2psd():
    s = HEAD.format(w=820, h=232) + marker('a23f')
    BASE = 158

    def axes(x0, x1, ylab, ttl):
        o = line(x0, BASE, x1, BASE) + head(x1 + 6, BASE, 1, 0)
        o += line(x0, BASE - 4, x0, 46, width=1.2, color='#888')
        o += text(x0 + 5, 64, ylab, size=12.5, anchor='start')
        o += text((x0 + x1) / 2, 24, ttl, size=12, color='#555')
        return o

    def band(x0, x1, h):
        return poly([(x0, BASE), (x0, BASE - h), (x1, BASE - h), (x1, BASE)])

    # (a) P_n(f)：双边，高度 N0/2
    s += axes(40, 268, 'P_n(f)', '(a) 窄带噪声 n(t)')
    s += band(58, 110, 66) + band(192, 244, 66)
    s += line(151, BASE, 151, 88, width=1, dash='4 3', color='#999')
    s += text(52, 86, 'N_0/2', size=12, anchor='start')
    s += text(58, BASE + 18, '−f_c−B', size=11)
    s += text(110, BASE + 34, '−f_c', size=11)
    s += text(151, BASE + 18, '0', size=11)
    s += text(192, BASE + 18, 'f_c', size=11)
    s += text(244, BASE + 34, 'f_c+B', size=11)
    s += text(274, BASE + 5, 'f', size=12, anchor='start')

    # (b) P_z(f)：解析信号只占正频率，高度 2N0
    s += axes(320, 560, 'P_z(f)', '(b) 解析信号 z(t)')
    s += band(372, 500, 108)
    s += line(320, BASE, 372, BASE, width=1.4, color='#888')
    s += text(378, 42, '2N_0', size=12, anchor='start')
    s += text(372, BASE + 18, 'f_c', size=11)
    s += text(500, BASE + 18, 'f_c+B', size=11)
    s += text(566, BASE + 5, 'f', size=12, anchor='start')

    # (c) P_nc(f)=P_ns(f)：双边低通，高度 N0/2，|f|<=B
    s += axes(600, 800, 'P_{n_c}(f)', '(c) 同相/正交分量')
    s += band(648, 752, 66)
    s += text(642, 86, 'N_0/2', size=12, anchor='end')
    s += text(648, BASE + 18, '−B', size=11)
    s += text(700, BASE + 18, '0', size=11)
    s += text(752, BASE + 18, 'B', size=11)
    s += text(806, BASE + 5, 'f', size=12, anchor='start')
    return s + '</svg>'


# ---------------------------------------------------------------- 四、匹配滤波器 h(t)
def fig_q4mf():
    s = HEAD.format(w=420, h=196) + marker('a23g')
    OX, OY = 60, 148
    U = 260.0
    H = 96.0

    def X(t):
        return OX + t * U

    s += line(OX - 20, OY, OX + U + 60, OY, marker='a23g')
    s += line(OX, OY + 8, OX, 40, marker='a23g')
    s += poly([(X(0), OY), (X(0.25), OY), (X(0.25), OY - H), (X(1), OY - H), (X(1), OY)])
    s += text(OX - 12, OY + 20, '0', size=12)
    s += text(X(0.25), OY + 20, 'T_b/4', size=12)
    s += text(X(1), OY + 20, 'T_b', size=12)
    s += text(OX + U + 64, OY + 5, 't', size=13, anchor='start')
    s += text(OX - 44, OY - H + 5, 'h(t)', size=13, anchor='start', style='i')
    s += text(X(0.33), OY - H - 9, '1', size=12)
    s += line(OX - 40, OY - H, X(0.25) - 2, OY - H, width=1, dash='4 3', color='#999')
    return s + '</svg>'


# ---------------------------------------------------------------- 五、判决域（Voronoi）
def _clip(poly_pts, m, n):
    """用半平面 (p-m)·n >= 0 裁剪多边形"""
    out = []
    L = len(poly_pts)
    for i in range(L):
        a = poly_pts[i]
        b = poly_pts[(i + 1) % L]
        fa = (a[0] - m[0]) * n[0] + (a[1] - m[1]) * n[1]
        fb = (b[0] - m[0]) * n[0] + (b[1] - m[1]) * n[1]
        if fa >= 0:
            out.append(a)
        if (fa > 0 and fb < 0) or (fa < 0 and fb > 0):
            t = fa / (fa - fb)
            out.append((a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])))
    return out


BOX = [(-4.05, 2.28), (4.05, 2.28), (4.05, -2.28), (-4.05, -2.28)]


def voronoi_cells():
    cells = {}
    for k, p in Q5PTS.items():
        pp = list(BOX)
        for k2, q in Q5PTS.items():
            if k2 == k:
                continue
            m = ((p[0] + q[0]) / 2, (p[1] + q[1]) / 2)
            n = (p[0] - q[0], p[1] - q[1])
            pp = _clip(pp, m, n)
            if not pp:
                break
        cells[k] = pp
    return cells


def fig_q5dec():
    cells = voronoi_cells()
    s = HEAD.format(w=700, h=400) + q5_draw(cells={'s1': cells['s1']})
    return s + '</svg>'


def fig_q5vor():
    s = HEAD.format(w=700, h=400) + q5_draw(cells=voronoi_cells())
    return s + '</svg>'


# ---------------------------------------------------------------- 七、编码器框图
def fig_q7enc():
    s = HEAD.format(w=470, h=258) + marker('a23h')
    YR, YA1, YA2 = 132, 58, 206
    s += line(26, YR, 58, YR, marker='a23h')
    s += dot(58, YR, 3)
    s += rect(70, YR - 17, 34, 34) + text(87, YR + 5, 'D', size=13, style='i')
    s += line(104, YR, 116, YR)
    s += dot(110, YR, 3)
    s += rect(116, YR - 17, 34, 34) + text(133, YR + 5, 'D', size=13, style='i')
    s += line(150, YR, 158, YR)
    s += dot(158, YR, 3)
    # g1 = 1+D+D²：三条抽头 → 上母线
    for x in (58, 110, 158):
        s += line(x, YR, x, YA1)
    s += line(58, YA1, 262, YA1)
    s += adder(276, YA1)
    s += line(290, YA1, 330, YA1, marker='a23h')
    s += text(338, YA1 + 5, 'c^{(1)}_n', size=13, style='i', anchor='start')
    # g2 = 1+D²：输入与 D² 输出 → 下母线
    for x in (58, 158):
        s += line(x, YR, x, YA2)
    s += line(58, YA2, 262, YA2)
    s += adder(276, YA2)
    s += line(290, YA2, 330, YA2, marker='a23h')
    s += text(338, YA2 + 5, 'c^{(2)}_n', size=13, style='i', anchor='start')
    s += text(40, 24, '上支路 1+D+D^2', size=12, color='#555', anchor='start')
    s += text(40, 250, '下支路 1+D^2', size=12, color='#555', anchor='start')
    return s + '</svg>'


# ---------------------------------------------------------------- 七、状态转移图
def fig_q7state():
    s = HEAD.format(w=478, h=352) + marker('a23i')
    POS = {'00': (120, 104), '10': (340, 104), '01': (120, 246), '11': (340, 246)}
    R = 26

    for k, (x, y) in POS.items():
        pass

    def loop(x, y, up=True, lbl=''):
        nonlocal s
        dy = -1 if up else 1
        p1 = (x - R * 0.68, y + dy * R * 0.72)
        p2 = (x + R * 0.68, y + dy * R * 0.72)
        c1 = (x - 46, y + dy * 76)
        c2 = (x + 46, y + dy * 76)
        s += (f"<path d='M{p1[0]:.1f},{p1[1]:.1f} C{c1[0]:.1f},{c1[1]:.1f} "
              f"{c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}' fill='none' "
              f"stroke='#1a1a1a' stroke-width='1.6'/>")
        s += head(p2[0], p2[1], 20, -dy * 60)
        s += text(x, y + dy * 92, lbl, size=12)

    def edge(a, b, lbl, bow=0.0, t=0.5, off=(0, -8)):
        nonlocal s
        (x1, y1), (x2, y2) = POS[a], POS[b]
        dx, dy = x2 - x1, y2 - y1
        L = math.hypot(dx, dy)
        ux, uy = dx / L, dy / L
        ax, ay = x1 + ux * R, y1 + uy * R
        bx, by = x2 - ux * R, y2 - uy * R
        # 二次贝塞尔：端点严格落在圆周上，控制点沿法向偏移，避免端点错位
        cx = (ax + bx) / 2 + (-uy) * bow * 2
        cy = (ay + by) / 2 + ux * bow * 2
        s += (f"<path d='M{ax:.1f},{ay:.1f} Q{cx:.1f},{cy:.1f} {bx:.1f},{by:.1f}' "
              f"fill='none' stroke='#1a1a1a' stroke-width='1.6'/>")
        s += head(bx, by, bx - cx, by - cy)
        mx = (1 - t) ** 2 * ax + 2 * t * (1 - t) * cx + t ** 2 * bx
        my = (1 - t) ** 2 * ay + 2 * t * (1 - t) * cy + t ** 2 * by
        if lbl:
            s += text(mx + off[0], my + off[1], lbl, size=12)

    edge('00', '10', '1/11', t=0.42, off=(0, -9))
    edge('10', '01', '0/10', bow=22, t=0.5, off=(0, -11))
    edge('01', '10', '1/00', bow=22, t=0.5, off=(4, 20))
    edge('10', '11', '1/01', bow=12, t=0.45, off=(18, 0))
    edge('01', '00', '0/11', bow=-12, t=0.45, off=(-18, 0))
    edge('11', '01', '0/01', t=0.5, off=(0, 18))
    loop(120, 104, True, '0/00')
    loop(340, 246, False, '1/10')
    for k, (x, y) in POS.items():
        s += circle(x, y, R, fill='#fff')
        s += text(x, y + 5, k, size=13)
    return s + '</svg>'


# ---------------------------------------------------------------- 七、网格图
def fig_q7trellis():
    s = HEAD.format(w=470, h=300) + marker('a23j')
    XL, XR = 130, 320
    YS = {'00': 60, '10': 120, '01': 180, '11': 240}
    LM = {'00': 1, '10': 2, '01': 3, '11': 3}
    RM = {'00': 3, '10': 1, '01': 3, '11': 3}
    branches = [('00', '00', '0/00', 0.5, (0, -8)), ('00', '10', '1/11', 0.5, (0, -8)),
                ('10', '01', '0/10', 0.22, (0, -7)), ('10', '11', '1/01', 0.5, (0, -8)),
                ('01', '00', '0/11', 0.5, (0, -8)), ('01', '10', '1/00', 0.78, (0, 17)),
                ('11', '01', '0/01', 0.5, (0, -8)), ('11', '11', '1/10', 0.5, (0, -8))]
    surv = {('01', '00'), ('00', '10'), ('10', '01'), ('10', '11')}
    for a, b, lbl, t, off in branches:
        x1, y1, x2, y2 = XL, YS[a], XR, YS[b]
        w = 2.6 if (a, b) in surv else 1.3
        s += line(x1 + 6, y1, x2 - 6, y2, width=w)
        mx = x1 + 6 + (x2 - 6 - x1 - 6) * t
        my = y1 + (y2 - y1) * t
        s += text(mx + off[0], my + off[1], lbl, size=11)
    for k, y in YS.items():
        s += dot(XL, y, 4) + dot(XR, y, 4)
        s += text(XL - 12, y + 4, k, size=12, anchor='end')
        s += text(XR + 12, y + 4, k, size=12, anchor='start')
        s += text(XL - 54, y + 5, str(LM[k]), size=12, anchor='end')
        s += text(XR + 56, y + 5, str(RM[k]), size=12, anchor='start')
    s += text(XL - 54, 26, '累积度量', size=11)
    s += text(XR + 56, 26, '累积度量', size=11)
    s += text((XL + XR) / 2, 26, '输入/输出', size=11)
    return s + '</svg>'


# ---------------------------------------------------------------- 九、调制框图
def fig_q9mod():
    s = HEAD.format(w=604, h=282) + marker('a23k')
    Y1, Y2 = 86, 186
    s += text(6, 136, '输入', anchor='start', size=12.5)
    s += line(44, 131, 64, 131, marker='a23k')
    s += rect(66, 79, 40, 104) + text(86, 124, '串并', size=12) + text(86, 141, '变换', size=12)
    s += line(106, 131, 120, 131) + dot(120, 131, 3)
    s += line(120, Y1, 120, Y2)
    for Y in (Y1, Y2):
        s += line(120, Y, 146, Y, marker='a23k')
        s += rect(148, Y - 20, 74, 40) + text(185, Y + 5, '2/8 进制', size=12)
        s += line(222, Y, 252, Y, marker='a23k')
        s += rect(254, Y - 24, 84, 48)
        s += text(296, Y - 5, '根升余弦', size=11.5) + text(296, Y + 11, 'α=1/4', size=11.5)
        s += line(338, Y, 372, Y)
    s += mul(386, Y1) + mul(386, Y2)
    s += text(386, 40, 'cos 2πf_ct', size=12)
    s += line(386, 46, 386, Y1 - 14, marker='a23k')
    s += text(386, 244, '−sin 2πf_ct', size=12)
    s += line(386, 238, 386, Y2 + 14, marker='a23k')
    s += line(399, Y1, 452, Y1) + line(399, Y2, 452, Y2)
    s += line(452, Y1, 452, 117) + line(452, Y2, 452, 145)
    s += adder(466, 131)
    s += line(479, 131, 508, 131, marker='a23k')
    s += text(514, 136, 's_{64QAM}(t)', anchor='start', size=12.5, style='i')
    return s + '</svg>'


# ---------------------------------------------------------------- 九、解调框图
def fig_q9demod():
    s = HEAD.format(w=580, h=272) + marker('a23l')
    Y1, Y2 = 78, 182
    s += text(6, 135, 'r(t)', anchor='start', size=13, style='i')
    s += line(40, 130, 72, 130, marker='a23l')
    s += dot(80, 130, 3)
    s += line(80, 130, 80, Y1) + line(80, 130, 80, Y2)
    for Y, car, cy in ((Y1, 'cos 2πf_ct', 36), (Y2, '−sin 2πf_ct', 232)):
        s += line(80, Y, 118, Y, marker='a23l')
        s += mul(132, Y)
        s += text(132, cy, car, size=12)
        if Y < 130:
            s += line(132, cy + 6, 132, Y - 14, marker='a23l')
        else:
            s += line(132, cy - 6, 132, Y + 14, marker='a23l')
        s += line(145, Y, 190, Y, marker='a23l')
        s += rect(192, Y - 24, 84, 48)
        s += text(234, Y - 5, '根升余弦', size=11.5) + text(234, Y + 11, 'α=1/4', size=11.5)
        s += line(276, Y, 318, Y, marker='a23l')
        s += rect(320, Y - 24, 92, 48)
        s += text(366, Y - 5, '抽样判决', size=11.5) + text(366, Y + 11, '八进制判决', size=11)
        s += line(412, Y, 444, Y, marker='a23l')
    s += rect(446, 80, 40, 104) + text(466, 124, '并串', size=12) + text(466, 141, '变换', size=12)
    s += line(486, 130, 518, 130, marker='a23l')
    s += text(524, 135, '输出', anchor='start', size=12.5)
    return s + '</svg>'


# ---------------------------------------------------------------- 九、E 点单边功率谱
def fig_q9psd():
    s = HEAD.format(w=644, h=232) + marker('a23m')
    OX, OY = 290, 172
    U = 8.0
    s += line(40, OY, 520, OY) + head(534, OY, 1, 0)
    s += line(OX, OY + 6, OX, 44) + head(OX, 36, 0, -1)

    def X(f):
        return OX + f * U

    yc = OY - 92
    pts = []
    for i in range(0, 201):
        f = -25 + i * 0.25
        if abs(f) <= 15:
            y = yc
        else:
            y = OY - (OY - yc) * 0.5 * (1 + math.cos(math.pi * (abs(f) - 15) / 10))
        pts.append((X(f), y))
    s += poly(pts)
    for f, t in ((-25, '−25'), (-15, '−15'), (0, '0'), (15, '15'), (20, '20'), (25, '25')):
        s += text(X(f), OY + 20, t, size=12)
    s += line(X(15), OY, X(15), yc, width=1, dash='4 3', color='#888')
    s += line(X(20), OY, X(20), OY - 46, width=1, dash='4 3', color='#888')
    s += text(540, OY + 5, 'f − f_c /kHz', size=12, anchor='start')
    s += text(OX + 8, 52, 'P_E(f)', size=12.5, anchor='start')
    return s + '</svg>'


# (key, 题号, 是否解析配图, 描述)
FIGS = [
    ('q2sys', '二', False, '窄带噪声产生框图'),
    ('q7spec', '七', False, '总体传递函数'),
    ('q5const', '五', False, '八进制星形星座图'),
    ('q6sys', '六', False, '两路并行传输框图'),
    ('q8sys', '八', False, '量化与哈夫曼编码框图'),
    ('q9sys', '九', False, '系统总框图'),
    ('q2psd', '二', True, '三段功率谱'),
    ('q4mf', '四', True, '匹配滤波器波形'),
    ('q5dec', '五', True, 's1 的最佳判决域'),
    ('q5vor', '五', True, '完整判决区域'),
    ('q7enc', '七', True, '卷积码编码器框图'),
    ('q7state', '七', True, '状态转移图'),
    ('q7trellis', '七', True, '网格图'),
    ('q9mod', '九', True, '64QAM 调制框图'),
    ('q9demod', '九', True, '64QAM 解调框图'),
    ('q9psd', '九', True, 'E 点单边功率谱'),
]
SVGS = {
    'q2sys': fig_q2sys(), 'q7spec': fig_q7spec(), 'q5const': fig_q5const(),
    'q6sys': fig_q6sys(), 'q8sys': fig_q8sys(), 'q9sys': fig_q9sys(),
    'q2psd': fig_q2psd(), 'q4mf': fig_q4mf(), 'q5dec': fig_q5dec(),
    'q5vor': fig_q5vor(), 'q7enc': fig_q7enc(), 'q7state': fig_q7state(),
    'q7trellis': fig_q7trellis(), 'q9mod': fig_q9mod(), 'q9demod': fig_q9demod(),
    'q9psd': fig_q9psd(),
}

YEAR = '2023'

# 统一收紧 viewBox：只改 viewBox 数值，不动任何元素坐标（等价裁剪，比例仍 1:1）
import sys as _sys, os as _os
_sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)))
from svg_fit import fit_svg, report as _pad_report

SVGS = {k: fit_svg(v, pad=16) for k, v in SVGS.items()}
for _k, _v in SVGS.items():
    _p = _pad_report(_v)
    if _p and max(abs(x) for x in _p) > 30:
        print('# 留白仍偏大 ' + _k + ': ' + str(_p), file=_sys.stderr)

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
