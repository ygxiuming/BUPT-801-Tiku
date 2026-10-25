#!/usr/bin/env python3
# 生成 2020年试卷 SVG 图库（每图一个文件，输出用 ###FILE: 分隔）：
#   node tools/emit_figures.mjs 2020
import math

from svgkit import PAD, tighten  # 统一的 viewBox 收边（四边等宽留白）

# ---------------------------------------------------------------- 基础画笔
def marker(mid, color='#1a1a1a'):
    return (f"<defs><marker id='{mid}' markerWidth='8' markerHeight='8' refX='7' refY='3' orient='auto'>"
            f"<path d='M0,0 L7,3 L0,6 z' fill='{color}'/></marker></defs>")


def poly(pts, stroke='#1a1a1a', width=1.6, dash=None, fill='none', close=False, marker=None):
    d = ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)
    dd = ' Z' if close else ''
    da = f" stroke-dasharray='{dash}'" if dash else ''
    mk = f" marker-end='url(#{marker})'" if marker else ''
    return f"<path d='M{d}{dd}' fill='{fill}' stroke='{stroke}' stroke-width='{width}'{da}{mk}/>"


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


def mul(cx, cy, r=13, mid=None):
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


# ---------------------------------------------------------------- 三（题图）：SSB 调制与相干解调框图
def fig_q3block():
    s = HEAD.format(w=560, h=195) + marker('m20a')
    Y1, Y2, Ym = 70, 130, 100
    # m(t) 输入与上/下支路
    s += text(10, Y1 + 5, 'm(t)', anchor='start', style='i')
    s += line(44, Y1, 160, Y1)
    s += line(100, Y1, 100, Y2 - 19)
    s += rect(68, Y2 - 19, 64, 38)
    s += text(100, Y2 - 4, '希尔伯特', size=12)
    s += text(100, Y2 + 12, '变换', size=12)
    s += line(132, Y2, 160, Y2)
    # 两个乘法器
    s += mul(160, Y1)
    s += text(160, Y1 - 30, 'cos(2πf_c t)', size=13)
    s += line(160, Y1 - 24, 160, Y1 - 16, marker='m20a')
    s += mul(160, Y2)
    s += text(160, Y2 + 40, '−sin(2πf_c t)', size=13)
    s += line(160, Y2 + 28, 160, Y2 + 16, marker='m20a')
    # 汇总到相加器
    s += line(174, Y1, 196, Y1) + line(196, Y1, 196, Ym) + line(196, Ym, 209, Ym)
    s += line(174, Y2, 204, Y2) + line(204, Y2, 204, Ym)
    s += adder(224, Ym)
    s += line(237, Ym, 271, Ym)
    s += text(252, Ym - 9, 's(t)', size=13, style='i')
    # 信道噪声相加
    s += adder(286, Ym)
    s += text(286, Ym + 66, 'n_w(t)', size=13)
    s += line(286, Ym + 52, 286, Ym + 15, marker='m20a')
    # BPF
    s += line(299, Ym, 314, Ym)
    s += rect(314, Ym - 15, 56, 30) + text(342, Ym + 5, 'BPF')
    s += line(370, Ym, 409, Ym)
    s += text(388, Ym + 22, 'A', size=13, style='i')
    # 相干乘法器
    s += mul(424, Ym)
    s += text(424, Ym - 42, '2cos(2πf_c t)', size=13)
    s += line(424, Ym - 36, 424, Ym - 16, marker='m20a')
    # LPF
    s += line(437, Ym, 454, Ym)
    s += rect(454, Ym - 15, 52, 30) + text(480, Ym + 5, 'LPF')
    s += line(506, Ym, 544, Ym, marker='m20a')
    s += text(522, Ym + 22, 'B', size=13, style='i')
    return s + '</svg>'


# ---------------------------------------------------------------- 四（题图）：匹配滤波接收框图
def fig_q4rx():
    s = HEAD.format(w=550, h=190) + marker('m20b')
    Ym, Y1, Y2 = 90, 55, 125
    # 输入与噪声
    s += text(8, Ym + 5, 's_1(t)或s_2(t)', anchor='start', size=13)
    s += line(106, Ym, 131, Ym)
    s += adder(146, Ym)
    s += text(146, Ym + 80, 'n_w(t)', size=13)
    s += line(146, Ym + 68, 146, Ym + 15, marker='m20b')
    s += line(159, Ym, 204, Ym)
    s += text(180, Ym - 10, 'r(t)', size=13, style='i')
    # 分两路
    s += line(204, Y1, 204, Y2)
    s += line(204, Y1, 232, Y1)
    s += line(204, Y2, 232, Y2)
    # 匹配滤波器
    s += rect(232, Y1 - 15, 96, 30) + text(280, Y1 + 5, '匹配滤波器1', size=13)
    s += text(280, Y1 - 25, 'h_1(t)', size=13)
    s += rect(232, Y2 - 15, 96, 30) + text(280, Y2 + 5, '匹配滤波器2', size=13)
    s += text(280, Ym + 4, 'h_2(t)', size=13)
    # 采样开关（刀触点画法）
    for yy, ly in ((Y1, Y1 - 24), (Y2, Y2 + 26)):
        s += line(328, yy, 344, yy)
        s += dot(346, yy, 2.6)
        s += line(346, yy, 357, yy - 8)
        s += dot(359, yy, 2.6)
        s += line(359, yy, 414, yy)
        s += text(353, ly, 't=t_0', size=12, style='i')
    # 求和与判决
    s += line(414, Y1, 430, Y1) + line(430, Y1, 430, Ym - 13)
    s += text(438, Y1 - 6, 'y_1', size=12, style='i')
    s += line(414, Y2, 430, Y2) + line(430, Y2, 430, Ym + 13)
    s += text(438, Y2 + 18, 'y_2', size=12, style='i')
    s += adder(444, Ym)
    s += text(424, Y1 + 13, '+', size=12, anchor='end')
    s += text(424, Y2 - 9, '−', size=12, anchor='end')
    s += line(457, Ym, 480, Ym)
    s += text(468, Ym - 10, 'y', size=13, style='i')
    s += rect(480, Ym - 15, 52, 30) + text(506, Ym + 5, '判决')
    s += line(532, Ym, 546, Ym, marker='m20b')
    s += text(506, Ym + 82, 'V_T', size=13)
    s += line(506, Ym + 68, 506, Ym + 17, marker='m20b')
    return s + '</svg>'


# ---------------------------------------------------------------- 七（题图）：p(x) 阶梯形概率密度
def fig_q7pdf():
    s = HEAD.format(w=560, h=175) + marker('m20c')
    BASE, OX = 122, 300
    U, H8, H12, H24 = 30, 40, 30, 15  # 1单位=30px；高度 1/8,1/12,1/24
    X = lambda v: OX + v * U
    # 坐标轴在密度图下方断开，避免与阶梯线重合：x 轴左右两段，y 轴上下两段
    s += line(80, BASE, 118, BASE)
    s += line(482, BASE, 536, BASE, marker='m20c')
    s += line(OX, BASE - 2.5, OX, 30, marker='m20c')
    s += line(OX, BASE, OX, BASE - H8 - 2.5)
    s += text(546, BASE + 5, 'x', style='i', anchor='start')
    s += text(OX + 12, 36, 'p(x)', anchor='start')
    # 阶梯轮廓（填充 + 顶部描边，不画与轴重合的底边）
    outline = [(X(-6), BASE), (X(-6), BASE - H24), (X(-4), BASE - H24), (X(-4), BASE - H12),
               (X(-2), BASE - H12), (X(-2), BASE - H8), (X(2), BASE - H8), (X(2), BASE - H12),
               (X(4), BASE - H12), (X(4), BASE - H24), (X(6), BASE - H24), (X(6), BASE)]
    s += poly(outline, fill='#f4f4f4', stroke='none', close=True)
    s += poly(outline)
    s += text(OX + 12, BASE - H8 - 6, '1/8', size=12, anchor='start')
    s += text(X(3), BASE - H12 - 7, '1/12', size=12)
    s += text(X(5), BASE - H24 - 7, '1/24', size=12)
    for v in (-6, -4, -2, 2, 4, 6):
        s += text(X(v), BASE + 18, str(v), size=12)
    s += text(OX - 8, BASE + 18, 'O', size=12)
    return s + '</svg>'


# ---------------------------------------------------------------- 三（解析）：A 点噪声功率谱
def fig_q3psdA():
    s = HEAD.format(w=470, h=180) + marker('m20d')
    BASE, OX, U = 120, 235, 85  # 1 kHz = 85px
    X = lambda khz: OX + khz * U
    s += line(120, BASE, 386, BASE, marker='m20d')
    H = 42
    for a, b in ((-1.2, -0.9), (0.9, 1.2)):
        s += line(X(a), BASE, X(a), BASE - H) + line(X(b), BASE, X(b), BASE - H)
        s += line(X(a), BASE - H, X(b), BASE - H, width=1.8)
    s += text(X(-1.05), BASE - H - 8, 'N_0/2', size=12)
    s += text(X(1.05), BASE - H - 8, 'N_0/2', size=12)
    # 外侧频率一行、内侧一行，避免刻度文字互相挤压
    for v, lbl in ((-1.2, '-1.2'), (1.2, '1.2')):
        s += text(X(v), BASE + 18, lbl, size=12)
    for v, lbl in ((-0.9, '-0.9'), (0.9, '0.9')):
        s += text(X(v), BASE + 34, lbl, size=12)
    s += text(OX - 8, BASE + 18, 'O', size=12)
    s += text(398, BASE + 5, 'f/kHz', anchor='start', size=12)
    return s + '</svg>'


# ---------------------------------------------------------------- 三（解析）：B 点噪声功率谱
def fig_q3psdB():
    s = HEAD.format(w=500, h=180) + marker('m20e')
    BASE, OX, U = 125, 245, 55  # 1（百 Hz）= 55px
    X = lambda u: OX + u * U    # u 以 100 Hz 为单位
    s += line(110, BASE, 133, BASE)
    s += line(357, BASE, 390, BASE, marker='m20e')
    H2, H1 = 42, 58  # N0/2 与 N0 高度
    # 阶梯轮廓：±[100,200] 高 N0/2，|f|≤100 高 N0（不画与轴重合的底边）
    pts = [(X(-2), BASE), (X(-2), BASE - H2), (X(-1), BASE - H2), (X(-1), BASE - H1),
           (X(1), BASE - H1), (X(1), BASE - H2), (X(2), BASE - H2), (X(2), BASE)]
    s += poly(pts, fill='#f4f4f4', stroke='none', close=True)
    s += poly(pts)
    s += text(X(0), BASE - H1 - 8, 'N_0', size=12)
    s += text(X(-1.5), BASE - H2 - 8, 'N_0/2', size=11)
    s += text(X(1.5), BASE - H2 - 8, 'N_0/2', size=11)
    for v, lbl in ((-2, '-200'), (-1, '-100'), (1, '100'), (2, '200')):
        s += text(X(v), BASE + 18, lbl, size=12)
    s += text(OX - 8, BASE + 18, 'O', size=12)
    s += text(402, BASE + 5, 'f', style='i', anchor='start')
    return s + '</svg>'


# ---------------------------------------------------------------- 五（解析）：16QAM 星座底图
def q5_grid(s, mid):
    """公用 4×4 网格：坐标轴 + 16 个点，返回坐标表"""
    cx, cy, U = 200, 200, 45
    s += line(38, cy, 372, cy, marker=mid)
    s += line(cx, 375, cx, 30, marker=mid)
    P = {}
    for i in (-3, -1, 1, 3):
        for j in (-3, -1, 1, 3):
            P[(i, j)] = (cx + i * U, cy - j * U)
            s += dot(cx + i * U, cy - j * U, 4.2)
    for v in (-3, -1, 1, 3):
        s += text(cx + v * U, cy + 20, str(v), size=12)
        s += text(cx - 12, cy - v * U + 4, str(v), size=12, anchor='end')
    return P, s


def fig_q5const():
    s = HEAD.format(w=400, h=410) + marker('m20f')
    _, s = q5_grid(s, 'm20f')
    return s + '</svg>'


def fig_q5region():
    s = HEAD.format(w=400, h=410) + marker('m20g')
    P, s = q5_grid(s, 'm20g')
    px, py = P[(-3, -3)]
    # ML 判决域：Re ≤ −2 且 Im ≤ −2（阴影 1/4 平面，边界箭头示意无限延伸）
    bx, by = 110, 290
    s += poly([(24, by), (bx, by), (bx, 378), (24, 378)], fill='#e8e8e8', stroke='none', close=True)
    s += line(bx, by, bx, 378, dash='5,4', color='#888', width=1.2, marker='m20g')
    s += line(bx, by, 24, by, dash='5,4', color='#888', width=1.2, marker='m20g')
    s += dot(px, py, 5.5)
    s += text(50, py + 22, 's', size=13, style='i')
    s += text(96, by - 12, 'D', size=13, style='i', color='#555')
    return s + '</svg>'


def fig_q5gray():
    s = HEAD.format(w=400, h=410) + marker('m20h')
    P, s = q5_grid(s, 'm20h')
    # 行、列各取格雷序；与参考答案一致：(-3,-3)=0001（红色标出）
    GX = {-3: '00', -1: '01', 1: '11', 3: '10'}   # 实部 → 高 2 位
    GY = {3: '00', 1: '10', -1: '11', -3: '01'}   # 虚部 → 低 2 位
    for (i, j), (px, py) in P.items():
        bits = GX[i] + GY[j]
        col = '#c00' if bits == '0001' else '#1a1a1a'
        s += text(px, py - 10, bits, size=11, color=col)
    return s + '</svg>'


# ---------------------------------------------------------------- 八（题图）：卷积码编码器框图
def fig_q8enc():
    """与原卷一致：两级移位寄存器，上路三抽头（1+x+x²）、下路两抽头（1+x），
    ⊕ 悬在 D₁/D₂ 之间正上方/正下方，输出分别向右上/右下引出。"""
    s = HEAD.format(w=530, h=210) + marker('m20k')
    YS = 105                        # 信号线 / D 框中心
    YT, YB = 45, 165                # 上、下 ⊕ 中心
    R = 15
    AX = 250                        # ⊕ 中心（对准 D₁/D₂ 之间的抽头）
    BX = 180                        # 输入抽头位置
    D0, DW = 200, 50                # D₁ 左缘 / 框宽
    RX = D0 + 2 * DW + 20           # 右抽头拐点（D₂ 后）
    # 主线与两个 D 框
    s += text(14, YS + 5, 'b_0b_1b_2b_3', anchor='start', size=13)
    s += line(112, YS, D0, YS)
    s += rect(D0, YS - 15, DW, 30) + text(D0 + DW / 2, YS + 5, 'D', style='i')
    s += line(D0 + DW, YS, D0 + DW + 20, YS)
    s += rect(D0 + DW + 20, YS - 15, DW, 30) + text(D0 + DW + 20 + DW / 2, YS + 5, 'D', style='i')
    s += line(D0 + 2 * DW + 20, YS, RX + 30, YS)
    # 上路：三抽头（输入、D₁ 后、D₂ 后）→ ⊕ → 顶部输出
    s += line(BX, YS, BX, YT)
    s += line(BX, YT, AX - R - 2, YT)
    s += line(AX, YS - 15, AX, YT + R + 2, marker='m20k')
    s += line(RX, YS, RX, YT)
    s += line(RX, YT, AX + R + 2, YT)
    s += adder(AX, YT, R)
    s += line(AX, YT - R, AX, 26, marker='m20k')
    s += line(AX, 26, 372, 26)
    s += text(380, 31, 'c_10c_11c_12c_13', anchor='start', size=13)
    # 下路：两抽头（输入、D₁ 后）→ ⊕ → 底部输出
    s += line(BX, YS, BX, YB)
    s += line(BX, YB, AX - R - 2, YB)
    s += line(AX, YS + 15, AX, YB - R - 2, marker='m20k')
    s += adder(AX, YB, R)
    s += line(AX + R, YB, 372, YB)
    s += text(380, YB + 5, 'c_20c_21c_22c_23', anchor='start', size=13)
    return s + '</svg>'


# ---------------------------------------------------------------- 八（解析）：状态转移图
def fig_q8state():
    s = HEAD.format(w=580, h=300) + marker('m20i')
    A, B, C, D = (80, 150), (280, 60), (280, 240), (480, 150)
    R = 16
    # 自环（a 上方、d 下方）
    s += poly([(88, 136), (110, 92), (50, 92), (74, 135)], marker='m20i', width=1.4)
    s += text(80, 82, '00(0)', size=12)
    s += poly([(472, 164), (450, 208), (510, 208), (486, 165)], marker='m20i', width=1.4)
    s += text(480, 226, '10(1)', size=12)

    def edge(p, q, lbl, lx, ly):
        dx, dy = q[0] - p[0], q[1] - p[1]
        n = math.hypot(dx, dy)
        ux, uy = dx / n, dy / n
        x1, y1 = p[0] + ux * R, p[1] + uy * R
        x2, y2 = q[0] - ux * (R + 6), q[1] - uy * (R + 6)
        return line(x1, y1, x2, y2, marker='m20i') + text(lx, ly, lbl, size=12)

    s += edge(A, B, '11(1)', 158, 92)
    s += edge(B, D, '00(1)', 372, 90)
    s += edge(C, A, '10(0)', 156, 218)
    s += edge(D, C, '01(0)', 376, 234)
    # 竖直双向：b→c（左）与 c→b（右）
    s += line(272, 78, 272, 220, marker='m20i')
    s += text(258, 154, '11(0)', size=12, anchor='end')
    s += line(288, 222, 288, 80, marker='m20i')
    s += text(302, 154, '01(1)', size=12, anchor='start')
    for (cx, cy), nm in ((A, 'a'), (B, 'b'), (C, 'c'), (D, 'd')):
        s += circle(cx, cy, R) + text(cx, cy + 5, nm, style='i')
    return s + '</svg>'


# ---------------------------------------------------------------- 九（解析）：升余弦发送功率谱
def fig_q9psd():
    s = HEAD.format(w=620, h=205) + marker('m20j')
    BASE, OX, U, H = 155, 280, 55, 70  # 1 kHz = 55px
    X = lambda khz: OX + khz * U
    Y = lambda khz: BASE - H / 2 * (1 + math.cos(math.pi * (khz - 2) / 2))
    s += line(30, BASE, 540, BASE, marker='m20j')
    s += line(OX, BASE, OX, 38, marker='m20j')
    s += text(OX + 10, 46, 'P_s(f)', anchor='start', style='i')
    # 左滚降(-4→-2) + 平顶(-2→2) + 右滚降(2→4)
    roll = [2 + k * 0.25 for k in range(0, 9)]
    pts = [(X(-f), Y(f)) for f in reversed(roll)] + [(X(f), Y(f)) for f in roll]
    s += poly(pts, width=1.8)
    s += text(X(3), BASE - H - 8, '滚降 α=1/3', size=12, color='#555')
    for v in (-4, -3, -2, 2, 3, 4):
        s += text(X(v), BASE + 18, str(v), size=12)
    s += text(OX - 8, BASE + 18, 'O', size=12)
    s += text(552, BASE + 5, 'f/kHz', anchor='start', size=12)
    return s + '</svg>'


# (key, 题号, 是否解析配图, 描述)。题目原图放 data/figures/<年>/，解析配图放 answer/ 子目录。
FIGS = [
    ('q3block', '三', False, 'SSB 调制解调框图'),
    ('q4rx', '四', False, '匹配滤波接收框图'),
    ('q7pdf', '七', False, '概率密度曲线'),
    ('q8enc', '八', False, '卷积码编码器框图'),
    ('q3psdA', '三', True, 'A 点噪声功率谱'),
    ('q3psdB', '三', True, 'B 点噪声功率谱'),
    ('q5const', '五', True, '16QAM 星座图'),
    ('q5region', '五', True, 'ML 判决域'),
    ('q5gray', '五', True, '格雷码标注'),
    ('q8state', '八', True, '状态转移图'),
    ('q9psd', '九', True, '升余弦功率谱'),
]
SVGS = {
    'q3block': fig_q3block(), 'q4rx': fig_q4rx(), 'q7pdf': fig_q7pdf(),
    'q8enc': fig_q8enc(),
    'q3psdA': fig_q3psdA(), 'q3psdB': fig_q3psdB(), 'q5const': fig_q5const(),
    'q5region': fig_q5region(), 'q5gray': fig_q5gray(), 'q8state': fig_q8state(),
    'q9psd': fig_q9psd(),
}
# 全部图统一把 viewBox 收到内容边界（四边各留 18px），与 2025/2026 同一套口径：
# 页面里图居中、不贴边、不因画布空白而显得偏小。
SVGS = {k: tighten(v, PAD) for k, v in SVGS.items()}

# 每张图一个文件；输出用 ###FILE: 分隔，落盘用 node tools/emit_figures.mjs 2020。
YEAR = '2020'
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

# Node 端索引（server/校验器加载用；以 _ 开头，不进浏览器 bundle）
print('###FILE:data/figures/' + YEAR + '/_index.js')
print('// ' + YEAR + ' 图库索引 —— 由 tools/gen_figures_' + YEAR + '.py 生成；Node 端 require 用，不进浏览器 bundle')
for r in requires:
    print('require("' + r + '");')
