#!/usr/bin/env python3
# 生成 2024年试卷 SVG 图库（每图一个文件，输出用 ###FILE: 分隔）：
#   node tools/emit_figures.mjs 2024
import math

# ---------------------------------------------------------------- 基础画笔
def marker(mid, color='#1a1a1a', k=1.0):
    w, x, y = 8 * k, 7 * k, 3 * k
    return (f"<defs><marker id='{mid}' markerWidth='{w:.1f}' markerHeight='{w:.1f}' "
            f"refX='{x:.1f}' refY='{y:.1f}' orient='auto'>"
            f"<path d='M0,0 L{x:.1f},{y:.1f} L0,{2 * y:.1f} z' fill='{color}'/></marker></defs>")


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


def qcur(p0, ctrl, p1, width=1.6, dash=None, color='#1a1a1a', marker=None):
    """二次贝塞尔曲线，用于状态图的弧形支路"""
    da = f" stroke-dasharray='{dash}'" if dash else ''
    mk = f" marker-end='url(#{marker})'" if marker else ''
    return (f"<path d='M{p0[0]:.1f},{p0[1]:.1f} Q{ctrl[0]:.1f},{ctrl[1]:.1f} "
            f"{p1[0]:.1f},{p1[1]:.1f}' fill='none' stroke='{color}' stroke-width='{width}'{da}{mk}/>")


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


def head_at(w, h, x0, y0):
    """viewBox 贴内容边界用：内容不在 (0,0) 起点时，用左上角偏移 (x0,y0) 裁掉多余留白"""
    base = HEAD.format(w=w, h=h)
    return base.replace("viewBox='0 0 %d %d'" % (w, h), "viewBox='%d %d %d %d'" % (x0, y0, w, h))


# ---------------------------------------------------------------- 四、DSB-SC 相干解调框图（题目原图）
def fig_q4recv():
    s = HEAD.format(w=640, h=176) + marker('a24a')
    Y, YN = 88, 148
    s += text(8, Y + 5, 's(t)', anchor='start', style='i')
    s += line(44, Y, 92, Y, marker='a24a')
    s += adder(108, Y, 13)
    s += line(121, Y, 160, Y, marker='a24a')
    s += rect(162, Y - 24, 96, 48) + text(210, Y + 5, '带通滤波器')
    s += line(258, Y, 300, Y, marker='a24a')
    s += mul(316, Y, 14)
    s += line(330, Y, 372, Y, marker='a24a')
    s += rect(374, Y - 24, 96, 48) + text(422, Y + 5, '低通滤波器')
    s += line(470, Y, 560, Y, marker='a24a')
    # 噪声输入
    s += text(108, YN + 16, 'n_w(t)', style='i')
    s += line(108, YN + 2, 108, Y + 14, marker='a24a')
    # 本地载波
    s += text(316, 152, '2cos(2πf_c t)', size=13)
    s += line(316, 136, 316, Y + 15, marker='a24a')
    return s + '</svg>'


# ---------------------------------------------------------------- 九、最佳接收机框图（题目原图）
def fig_q9recv():
    s = HEAD.format(w=780, h=200) + marker('a24b')
    Y, YN = 98, 150
    s += text(8, 58, 's_1(t) 或 s_2(t)', anchor='start', style='i')
    s += line(8, Y, 126, Y, marker='a24b')
    s += adder(140, Y, 13)
    s += line(153, Y, 190, Y, marker='a24b')
    s += rect(192, Y - 24, 88, 48) + text(236, Y + 5, '带通滤波器')
    s += line(280, Y, 322, Y, marker='a24b')
    s += mul(338, Y, 14)
    s += line(352, Y, 392, Y, marker='a24b')
    s += rect(394, Y - 24, 84, 48)
    s += text(436, Y - 2, '低通 h(t)')
    s += line(478, Y, 518, Y, marker='a24b')
    # 抽样开关
    s += dot(520, Y, 3.4)
    s += line(520, Y, 544, Y - 14, marker='a24b')
    s += text(532, Y + 26, 't=T_b', size=13)
    s += text(532, Y + 42, '(抽样)', size=12)
    s += dot(550, Y, 3.4)
    s += line(550, Y, 598, Y, marker='a24b')
    s += text(574, Y - 10, 'y', style='i')
    s += rect(600, Y - 24, 60, 48) + text(630, Y + 5, '判决')
    s += line(660, Y, 718, Y, marker='a24b')
    # 噪声
    s += text(140, YN + 18, 'n_w(t)', style='i')
    s += line(140, YN + 2, 140, Y + 14, marker='a24b')
    # 本地载波
    s += text(338, 168, '2cos(2πf_c t)', size=13)
    s += line(338, 152, 338, Y + 15, marker='a24b')
    return s + '</svg>'


# ---------------------------------------------------------------- 八、卷积码状态转移图（题目原图）
def fig_q8state():
    s = HEAD.format(w=780, h=360) + marker('a24c') + marker('a24d')  # c=实线(0) d=虚线(1)
    N = {
        '000': (100, 186), '100': (250, 78), '110': (540, 78), '111': (688, 186),
        '010': (368, 186), '101': (486, 186), '001': (250, 300), '011': (540, 300),
    }
    R = 25
    # ---- 支路（先画线，节点后画，遮住线头）
    E = [
        # (起点, 控制点, 终点, 标签, 标签偏移, 是否虚线)
        ('000', (238, 140), '100', '11', (-14, -4), True),
        ('100', (420, 62), '110', '10', (-8, -12), True),
        ('100', (300, 148), '010', '01', (10, 2), False),
        ('010', (300, 248), '001', '10', (6, 6), False),
        ('010', (424, 214), '101', '01', (0, 30), True),
        ('101', (424, 156), '010', '10', (0, -14), False),
        ('101', (508, 122), '110', '01', (10, 0), True),
        ('001', (168, 258), '000', '11', (-12, 8), False),
        ('001', (236, 214), '100', '00', (14, 0), True),
        ('110', (552, 186), '011', '11', (10, 10), False),
        ('110', (628, 108), '111', '00', (-6, -10), True),
        ('111', (640, 262), '011', '00', (6, 12), False),
        ('011', (392, 322), '001', '01', (0, 18), False),
        ('011', (556, 268), '101', '10', (12, 4), True),
    ]
    for a, cp, b, lbl, off, dashed in E:
        p0, p1 = N[a], N[b]
        s += qcur(p0, cp, p1, dash='6,4' if dashed else None, marker='a24d' if dashed else 'a24c')
        mid = ((p0[0] + 2 * cp[0] + p1[0]) / 4, (p0[1] + 2 * cp[1] + p1[1]) / 4)
        s += text(mid[0] + off[0], mid[1] + off[1], lbl, size=13)
    # 000 自环（实线 00）
    s += "<path d='M82,172 C34,148 34,224 82,200' fill='none' stroke='#1a1a1a' stroke-width='1.6' marker-end='url(#a24c)'/>"
    s += text(26, 160, '00', size=13)
    # 111 自环（虚线 11）
    s += "<path d='M706,172 C754,148 754,224 706,200' fill='none' stroke='#1a1a1a' stroke-width='1.6' stroke-dasharray='6,4' marker-end='url(#a24d)'/>"
    s += text(760, 160, '11', size=13)
    # ---- 节点
    for k, (x, y) in N.items():
        s += circle(x, y, R, fill='#ffffff')
        s += text(x, y + 5, k, size=13)
    # c1c2 说明
    s += text(52, 44, 'c_1c_2', size=13)
    s += text(112, 44, '虚线：输入 1    实线：输入 0', size=12, color='#555', anchor='start')
    return s + '</svg>'


# ---------------------------------------------------------------- 二、功率谱解析图
def _sa2(x):
    """Sa^2(x) = (sin x / x)^2"""
    if abs(x) < 1e-9:
        return 1.0
    return (math.sin(x) / x) ** 2


def fig_q2psd():
    s = HEAD.format(w=720, h=250) + marker('a24e')
    BASE = 190
    X0, X1 = 44, 320          # 左：|G(f)|^2
    x1, x2 = 424, 700         # 右：P_s1 与 P_s2 / P_s3
    s += line(X0, BASE, X1, BASE, marker='a24e')
    s += line(X0, BASE, X0, 62, marker='a24e')
    s += text(X1 + 4, BASE + 5, 'f', size=13, anchor='start', style='i')
    s += text(X0 - 26, 50, '|G(f)|²', size=12, anchor='start')
    # |G|^2 的归一化包络：零点在 f = n/Ts
    pts = []
    for i in range(0, 181):
        u = i / 180 * 3.0            # u = f*Ts
        pts.append((X0 + u / 3.0 * (X1 - X0 - 20), BASE - 96 * _sa2(math.pi * u)))
    s += poly(pts, width=1.8)
    for n in (1, 2, 3):
        xx = X0 + n / 3.0 * (X1 - X0 - 20)
        s += line(xx, BASE, xx, BASE - 4, width=1.2)
        s += text(xx, BASE + 17, ('1/T_s' if n == 1 else ('2/T_s' if n == 2 else '3/T_s')), size=11)
    s += text(X0 - 8, BASE + 5, '0', size=12)
    s += text((X0 + X1) / 2, 26, 'g(t) 的能量谱密度：T_s²Sa²(πfT_s)', size=12, color='#666')

    # 右：P_s1（实线）与 P_s2（粗虚线）对比，再叠一条 P_s3 的直流线谱
    s += line(x1, BASE, x2, BASE, marker='a24e')
    s += line(x1, BASE, x1, 62, marker='a24e')
    s += text(x2 + 4, BASE + 5, 'f', size=13, anchor='start', style='i')
    s += text(x1 - 30, 50, 'P_s(f)', size=12, anchor='start')
    W = x2 - x1 - 20
    p1, p2 = [], []
    for i in range(0, 181):
        u = i / 180 * 3.0
        xx = x1 + u / 3.0 * W
        p1.append((xx, BASE - 84 * _sa2(math.pi * u)))
        p2.append((xx, BASE - 84 * _sa2(math.pi * u) * (4 * math.sin(2 * math.pi * u) ** 2) / 3.3))
    s += poly(p1, width=1.8)
    s += poly(p2, width=1.6, dash='6,4')
    for n in (1, 2, 3):
        xx = x1 + n / 3.0 * W
        s += line(xx, BASE, xx, BASE - 4, width=1.2)
        s += text(xx, BASE + 17, ('1/T_s' if n == 1 else ('2/T_s' if n == 2 else '3/T_s')), size=11)
    s += text(x1 - 8, BASE + 5, '0', size=12)
    # 图例
    s += line(x1 + 8, 76, x1 + 46, 76, width=1.8) + text(x1 + 54, 80, 'P_s1 = T_sSa²', size=11, anchor='start')
    s += line(x1 + 8, 96, x1 + 46, 96, width=1.6, dash='6,4') + text(x1 + 54, 100, 'P_s2（差分后，f=0 处为零）', size=11, anchor='start')
    s += text((x1 + x2) / 2 + 30, 26, 's_1 与 s_2 的功率谱', size=12, color='#666')
    return s + '</svg>'


# ---------------------------------------------------------------- 三、16QAM 发端框图（解析配图）
def fig_q3tx():
    s = HEAD.format(w=760, h=250) + marker('a24f')
    DX = 44
    YC, YI, YQ = 126, 74, 178
    s += text(6, YC - 10, '84 kbps', size=13, anchor='start')
    s += line(8, YC, 40 + DX, YC, marker='a24f')
    s += rect(42 + DX, YC - 26, 66, 52) + text(75 + DX, YC - 3, '串并') + text(75 + DX, YC + 15, '变换', size=12)
    s += line(108 + DX, YC, 140 + DX, YC)
    s += line(140 + DX, YI, 140 + DX, YQ)
    s += dot(140 + DX, YC, 3.2)
    s += line(140 + DX, YI, 168 + DX, YI, marker='a24f')
    s += line(140 + DX, YQ, 168 + DX, YQ, marker='a24f')
    s += rect(170 + DX, YI - 20, 70, 40) + text(205 + DX, YI + 5, '2/4 电平')
    s += rect(170 + DX, YQ - 20, 70, 40) + text(205 + DX, YQ + 5, '2/4 电平')
    s += line(240 + DX, YI, 272 + DX, YI, marker='a24f')
    s += line(240 + DX, YQ, 272 + DX, YQ, marker='a24f')
    s += rect(274 + DX, YI - 22, 88, 44) + text(318 + DX, YI - 3, '根升余弦', size=13) + text(318 + DX, YI + 13, 'α = 1/7', size=11)
    s += rect(274 + DX, YQ - 22, 88, 44) + text(318 + DX, YQ - 3, '根升余弦', size=13) + text(318 + DX, YQ + 13, 'α = 1/7', size=11)
    s += line(362 + DX, YI, 392 + DX, YI, marker='a24f')
    s += line(362 + DX, YQ, 392 + DX, YQ, marker='a24f')
    s += mul(406 + DX, YI, 13) + mul(406 + DX, YQ, 13)
    # 载波
    s += text(406 + DX, 30, 'cos(2πf_c t)', size=12)
    s += line(406 + DX, 36, 406 + DX, YI - 14, marker='a24f')
    s += text(406 + DX, 232, '−sin(2πf_c t)', size=12)
    s += line(406 + DX, 220, 406 + DX, YQ + 14, marker='a24f')
    # 合路
    s += line(419 + DX, YI, 486 + DX, YI) + line(486 + DX, YI, 486 + DX, YC - 13, marker='a24f')
    s += line(419 + DX, YQ, 486 + DX, YQ) + line(486 + DX, YQ, 486 + DX, YC + 13, marker='a24f')
    s += adder(486 + DX, YC, 13)
    s += line(499 + DX, YC, 546 + DX, YC, marker='a24f')
    s += text(552 + DX, YC + 5, 's_16QAM(t)', size=13, anchor='start')
    return s + '</svg>'


# ---------------------------------------------------------------- 三、16QAM 收端框图（解析配图）
def fig_q3block():
    s = HEAD.format(w=700, h=250) + marker('a250')
    YC, YI, YQ = 126, 74, 178
    s += text(6, YC + 5, 'r(t)', size=13, anchor='start', style='i')
    s += line(38, YC, 66, YC)
    s += line(66, YI, 66, YQ)
    s += dot(66, YC, 3.2)
    s += line(66, YI, 90, YI, marker='a250')
    s += line(66, YQ, 90, YQ, marker='a250')
    s += mul(104, YI, 13) + mul(104, YQ, 13)
    s += text(104, 30, 'cos(2πf_c t)', size=12)
    s += line(104, 36, 104, YI - 14, marker='a250')
    s += text(104, 232, '−sin(2πf_c t)', size=12)
    s += line(104, 220, 104, YQ + 14, marker='a250')
    s += rect(150, YI - 22, 88, 44) + text(194, YI - 3, 'RRC 匹配', size=13) + text(194, YI + 13, 'α = 1/7', size=11)
    s += rect(150, YQ - 22, 88, 44) + text(194, YQ - 3, 'RRC 匹配', size=13) + text(194, YQ + 13, 'α = 1/7', size=11)
    s += line(117, YI, 148, YI, marker='a250')
    s += line(117, YQ, 148, YQ, marker='a250')
    s += line(238, YI, 268, YI, marker='a250')
    s += line(238, YQ, 268, YQ, marker='a250')
    s += rect(270, YI - 20, 66, 40) + text(303, YI + 5, '抽样')
    s += rect(270, YQ - 20, 66, 40) + text(303, YQ + 5, '抽样')
    s += line(336, YI, 366, YI, marker='a250')
    s += line(336, YQ, 366, YQ, marker='a250')
    s += rect(368, YI - 22, 78, 44) + text(407, YI + 5, '四进制判决', size=12)
    s += rect(368, YQ - 22, 78, 44) + text(407, YQ + 5, '四进制判决', size=12)
    s += line(446, YI, 490, YI) + line(490, YI, 490, YC - 15)
    s += line(446, YQ, 490, YQ) + line(490, YQ, 490, YC + 15)
    s += line(490, YI, 512, YC - 15)
    s += line(490, YQ, 512, YC + 15)
    s += rect(514, YC - 26, 66, 52) + text(547, YC - 3, '并串') + text(547, YC + 15, '变换', size=12)
    s += line(580, YC, 634, YC, marker='a250')
    s += text(640, YC + 5, '84 kbps', size=13, anchor='start')
    # 载波恢复
    s += text(60, 218, '载波恢复', size=12)
    s += line(60, 204, 60, YC + 6, width=1.2, dash='4,3', marker='a250')
    s += text(348, 24, 'α = 1/7 的根升余弦与发端成形配对，级联为升余弦', size=11, color='#666')
    return s + '</svg>'


# ---------------------------------------------------------------- 六、8 点星座图（解析配图）
def _const_axes(s, cx, cy, U, xr=2.5, yr=2.6):
    s += line(cx - xr * U, cy, cx + xr * U + 16, cy, marker='a241')
    s += line(cx, cy + 1.4 * U + 12, cx, cy - yr * U - 16, marker='a241')
    s += text(cx + xr * U + 20, cy + 5, 'x', size=13, anchor='start', style='i')
    s += text(cx + 6, cy - yr * U - 20, 'y', size=13, anchor='start', style='i')
    return s


PTS = {'s_1': (-2, 0), 's_2': (-1, 0), 's_3': (0, 0), 's_4': (1, 0),
       's_5': (2, 0), 's_6': (0, 2), 's_7': (-1, -1), 's_8': (1, -1)}


def fig_q6const():
    cx, cy, U = 310, 240, 68
    s = head_at(382, 322, 139, 28) + marker('a241')
    # 坐标轴
    s += line(cx - 2.35 * U, cy, cx + 2.35 * U + 18, cy, marker='a241')
    s += line(cx, cy + 1.3 * U + 10, cx, cy - 2.3 * U - 18, marker='a241')
    s += text(cx + 2.35 * U + 22, cy + 5, 'x', size=13, anchor='start', style='i')
    s += text(cx + 7, cy - 2.3 * U - 22, 'y', size=13, anchor='start', style='i')
    LAB = {'s_1': (0, -13), 's_2': (0, -13), 's_3': (-16, 22), 's_4': (0, -13),
           's_5': (0, -13), 's_6': (17, 5), 's_7': (0, 24), 's_8': (0, 24)}
    for k, (i, j) in PTS.items():
        px, py = cx + i * U, cy - j * U
        s += dot(px, py, 4.4)
        s += text(px + LAB[k][0], py + LAB[k][1], k, size=13)
    s += text(cx - 2.3 * U, cy - 2.2 * U, 'E_s = 9/4,  d_{min} = 1', size=12, color='#555', anchor='start')
    return s + '</svg>'


# ---------------------------------------------------------------- 六、判决域（解析配图）
def fig_q6voronoi():
    cx, cy, U = 340, 200, 72
    s = head_at(402, 372, 159, 0) + marker('a241')
    X = lambda x: cx + x * U
    Y = lambda y: cy - y * U
    D = '#8e97a3'
    # 坐标轴
    s += line(X(-2.35), cy, X(2.35) + 18, cy, marker='a241')
    s += line(cx, Y(-1.35), cx, Y(2.18) - 16, marker='a241')
    s += text(X(2.35) + 22, cy + 5, 'x', size=13, anchor='start', style='i')
    s += text(cx + 7, Y(2.18) - 20, 'y', size=13, anchor='start', style='i')
    # 中垂线（每条只画有效段，避免糊成一团）
    plain = [
        ((-1.5, -0.5), (-1.5, 1.5)), ((-0.5, -0.5), (-0.5, 1.0)),
        ((0.5, -0.5), (0.5, 1.0)), ((1.5, -0.5), (1.5, 1.5)),
        ((-1.0, 1.0), (1.0, 1.0)), ((-1.5, -0.5), (1.5, -0.5)),
        ((-0.5, -0.5), (-1.9, -0.9)), ((0.5, -0.5), (1.9, -0.9)),
        ((1.5, -0.5), (2.25, -0.85)), ((-1.5, -0.5), (-2.2, -1.2)),
        ((-1.5, 1.5), (-2.15, 2.15)), ((-0.5, 1.0), (-1.5, 1.5)),
        ((0.5, 1.0), (1.5, 1.5)), ((1.5, 1.5), (2.15, 2.15)),
    ]
    for a, b in plain:
        s += line(X(a[0]), Y(a[1]), X(b[0]), Y(b[1]), width=1.2, dash='5,4', color=D)
    # s8 的胞：顶点 (1,0)，底边 y=-0.5 上 [0.5,1.5]，向下张开
    tri = [(X(1.0), Y(0.0)), (X(0.5), Y(-0.5)), (X(-0.1), Y(-1.05)),
           (X(2.1), Y(-1.05)), (X(1.5), Y(-0.5))]
    dpath = 'M' + ' L'.join(f'{a:.1f},{b:.1f}' for a, b in tri) + ' Z'
    s += f"<path d='{dpath}' fill='#2563eb' fill-opacity='0.07' stroke='none'/>"
    # 点
    LAB = {'s_1': (0, -13), 's_2': (0, -13), 's_3': (-16, 22), 's_4': (0, -13),
           's_5': (0, -13), 's_6': (17, 5), 's_7': (0, 24), 's_8': (24, 5)}
    for k, (i, j) in PTS.items():
        px, py = X(i), Y(j)
        s += dot(px, py, 4.4)
        s += text(px + LAB[k][0], py + LAB[k][1], k, size=13,
                  color='#2563eb' if k == 's_8' else '#1a1a1a')
    # 标注 s8 胞的三条边距
    s += text(X(1.0), Y(-0.82), 'D_8', size=13, color='#2563eb')
    s += text(170, 332, '虚线：各中垂线；浅蓝：s_8 的判决域', size=11, color='#2563eb', anchor='start')
    s += text(170, 350, '三条边距 0.5（上）/ 0.707（左）/ 0.707（右）', size=11, color='#2563eb', anchor='start')
    return s + '</svg>'


# ---------------------------------------------------------------- 八、编码器原理框图（解析配图）
def fig_q8enc():
    s = HEAD.format(w=520, h=270) + marker('a244')
    Y, Y1, Y2 = 132, 220, 46
    s += text(8, Y + 5, '输入 u', size=13, anchor='start')
    s += line(56, Y, 92, Y, marker='a244')
    # 三级寄存器
    for i, x in enumerate((112, 202, 292)):
        s += rect(x, Y - 21, 62, 42) + text(x + 31, Y + 6, 'D', size=15, style='i')
        if i < 2:
            s += line(x + 62, Y, x + 90, Y)
        else:
            s += line(x + 62, Y, 392, Y, marker='a244')
    # 抽头节点
    taps = (96, 188, 278, 376)
    for x in taps:
        s += dot(x, Y, 3.4)
    # c1（下）：u, D²u, D³u
    for x in (96, 278, 376):
        s += line(x, Y + 3, x, Y1 - 3)
    s += line(96, Y1, 320, Y1, marker='a244')
    s += adder(334, Y1, 13)
    s += line(347, Y1, 412, Y1, marker='a244')
    s += text(420, Y1 + 5, 'c_1', size=14, anchor='start')
    # c2（上）：u, Du, D³u
    for x in (96, 188, 376):
        s += line(x, Y - 3, x, Y2 + 3)
    s += line(96, Y2, 320, Y2, marker='a244')
    s += adder(334, Y2, 13)
    s += line(347, Y2, 412, Y2, marker='a244')
    s += text(420, Y2 + 5, 'c_2', size=14, anchor='start')
    s += text(6, Y2 - 22, 'g_2 = 1 + x + x³  →  c_2 = u ⊕ Du ⊕ D³u', size=11, color='#555', anchor='start')
    s += text(6, Y1 + 26, 'g_1 = 1 + x² + x³  →  c_1 = u ⊕ D²u ⊕ D³u', size=11, color='#555', anchor='start')
    s += text(452, (Y1 + Y2) / 2 + 5, '经并串', size=12, anchor='start')
    s += text(452, (Y1 + Y2) / 2 + 22, '开关输出', size=12, anchor='start')
    return s + '</svg>'


# ---------------------------------------------------------------- 八、网格图与幸存路径（解析配图）
STATES = ['000', '100', '010', '110', '001', '101', '011', '111']
TRELLIS = {
    '000': {'0': ('000', '00'), '1': ('100', '11')},
    '100': {'0': ('010', '01'), '1': ('110', '10')},
    '010': {'0': ('001', '10'), '1': ('101', '01')},
    '001': {'0': ('000', '11'), '1': ('100', '00')},
    '110': {'0': ('011', '11'), '1': ('111', '00')},
    '111': {'0': ('011', '00'), '1': ('111', '11')},
    '011': {'0': ('001', '01'), '1': ('101', '10')},
    '101': {'0': ('010', '10'), '1': ('110', '01')},
}


def _hd(a, b):
    return sum(1 for x, y in zip(a, b) if x != y)


def fig_q8trellis():
    """只画两条幸存路径经过的边，其余位置给出各步最小度量"""
    X0, DX, Y0, DY = 70, 132, 48, 40
    s = HEAD.format(w=724, h=412) + marker('a245', k=0.72) + marker('a246', '#2563eb', k=0.72)
    # 节点
    pos = {}
    for c in range(5):
        for r, st in enumerate(STATES):
            pos[(c, st)] = (X0 + c * DX, Y0 + r * DY)
    for (c, st), (x, y) in pos.items():
        s += circle(x, y, 4.2, fill='#c8ced6', color='#c8ced6')
    for r, st in enumerate(STATES):
        s += text(X0 - 22, Y0 + r * DY + 5, st, size=13)
    for c in range(5):
        s += text(X0 + c * DX, 22, '第 %d 步' % c if c else '起点', size=11, color='#666')

    # 灰底：全部转移（很淡）
    for c in range(4):
        for st in STATES:
            for u in ('0', '1'):
                ns, _o = TRELLIS[st][u]
                p0, p1 = pos[(c, st)], pos[(c + 1, ns)]
                s += line(p0[0], p0[1], p1[0], p1[1], width=1.0, color='#e4e8ee')

    # 高亮两条路径
    pathA = ['000', '100', '010', '001', '000']
    pathB = ['000', '100', '010', '001', '100']
    for path, col, mid in ((pathA, '#1a1a1a', 'a245'), (pathB, '#2563eb', 'a246')):
        for c in range(4):
            p0, p1 = pos[(c, path[c])], pos[(c + 1, path[c + 1])]
            s += line(p0[0], p0[1] + (4 if path is pathB else -4),
                      p1[0], p1[1] + (4 if path is pathB else -4),
                      width=2.1, color=col, marker=mid)
        for c, st in enumerate(path):
            x, y = pos[(c, st)]
            s += circle(x, y, 5.0, fill='#ffffff', color=col, width=2.0)

    # 度量标注
    s += text(pos[(4, '000')][0] + 22, pos[(4, '000')][1] - 12, '度量 2', size=12, anchor='start')
    s += text(pos[(4, '100')][0] + 22, pos[(4, '100')][1] + 18, '度量 4', size=12, anchor='start', color='#2563eb')
    s += text(6, 392, '黑线：000→100→010→001→000（度量 2）    蓝线：000→100→010→001→100（度量 4）', size=11, color='#555', anchor='start')
    s += text(6, 374, '接收码段：11 | 11 | 11 | 11（4 段，共 8 比特）', size=11, color='#555', anchor='start')
    return s + '</svg>'


# (key, 题号, 是否解析配图, 描述)。题目原图放 data/figures/<年>/，解析配图放 answer/ 子目录。
FIGS = [
    ('q4recv', '四', False, 'DSB-SC 相干解调框图'),
    ('q8state', '八', False, '卷积码状态转移图'),
    ('q9recv', '九', False, '最佳接收机框图'),
    ('q2psd', '二', True, '能量谱与功率谱'),
    ('q3tx', '三', True, '16QAM 发端框图'),
    ('q3block', '三', True, '16QAM 收端框图'),
    ('q6const', '六', True, '8 点星座图'),
    ('q6voronoi', '六', True, '最大似然判决域'),
    ('q8enc', '八', True, '编码器原理框图'),
    ('q8trellis', '八', True, '网格图与幸存路径'),
]
SVGS = {
    'q4recv': fig_q4recv(), 'q8state': fig_q8state(), 'q9recv': fig_q9recv(),
    'q2psd': fig_q2psd(), 'q3tx': fig_q3tx(), 'q3block': fig_q3block(),
    'q6const': fig_q6const(), 'q6voronoi': fig_q6voronoi(),
    'q8enc': fig_q8enc(), 'q8trellis': fig_q8trellis(),
}

YEAR = '2024'
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
