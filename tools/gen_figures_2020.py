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


def path_c(p0, c1, c2, p1, marker=None, width=1.6, color='#1a1a1a'):
    """三次贝塞尔（状态转移图的弧线）"""
    mk = f" marker-end='url(#{marker})'" if marker else ''
    return (f"<path d='M{p0[0]:.1f},{p0[1]:.1f} C{c1[0]:.1f},{c1[1]:.1f} "
            f"{c2[0]:.1f},{c2[1]:.1f} {p1[0]:.1f},{p1[1]:.1f}' fill='none' "
            f"stroke='{color}' stroke-width='{width}'{mk}/>")


def line(x1, y1, x2, y2, width=1.6, dash=None, color='#1a1a1a', marker=None):
    da = f" stroke-dasharray='{dash}'" if dash else ''
    mk = f" marker-end='url(#{marker})'" if marker else ''
    return (f"<line x1='{x1:.1f}' y1='{y1:.1f}' x2='{x2:.1f}' y2='{y2:.1f}' "
            f"stroke='{color}' stroke-width='{width}'{da}{mk}/>")


def _tokens(s):
    """把 'x_c' / 'T_{b}' / 'P_{n_A}' 这类迷你标记切成 [(文字, 'n'|'sub'|'sup'), ...]（支持嵌套）"""
    out, i = [], 0
    while i < len(s):
        c = s[i]
        if c in '_^':
            kind = 'sub' if c == '_' else 'sup'
            i += 1
            if i < len(s) and s[i] == '{':
                depth, j = 1, i + 1
                while j < len(s) and depth:
                    if s[j] == '{':
                        depth += 1
                    elif s[j] == '}':
                        depth -= 1
                    j += 1
                out.append((s[i + 1:j - 1], kind))
                i = j
            elif i < len(s):
                out.append((s[i], kind))
                i += 1
        else:
            j = i
            while j < len(s) and s[j] not in '_^':
                j += 1
            out.append((s[i:j], 'n'))
            i = j
    return out


def _flatten(tokens, size, dy, out):
    for t, k in tokens:
        if k == 'n':
            out.append((t, dy, size))
        elif k == 'sub':
            _flatten(_tokens(t), size * 0.72, dy + size * 0.30, out)
        else:
            _flatten(_tokens(t), size * 0.72, dy - size * 0.42, out)


def text(x, y, s, size=14, anchor='middle', style='', color='#1a1a1a'):
    """文字；'_x'/'_{xx}' 排成下标、'^x'/'^{xx}' 排成上标（支持嵌套下标，如 P_{n_A}）"""
    st = " font-style='italic'" if 'i' in style else ''
    wt = " font-weight='bold'" if 'b' in style else ''
    small = f" font-size='{size}'" if size != 14 else ''
    leaves = []
    _flatten(_tokens(s), size, 0, leaves)
    body, cur = '', 0
    for t, ady, fs in leaves:
        body += f"<tspan dy='{ady - cur:.1f}' font-size='{round(fs)}'>{t}</tspan>"
        cur = ady
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


def tick(x, y, vertical=False, h=5):
    """坐标轴刻度短线"""
    if vertical:
        return line(x - h, y, x + h, y, width=1.2)
    return line(x, y - h, x, y + h, width=1.2)


def switch(x, y, mk):
    """采样开关（原卷画法）：两个空心端子 + 交叉的斜杆与带箭头触点"""
    return (circle(x - 14, y, 4, fill='white')
            + circle(x + 14, y, 4, fill='white')
            + line(x + 11, y - 3, x - 24, y - 30)
            + line(x + 7, y - 31, x - 14, y - 6, marker=mk))


HEAD = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {w} {h}' "
        "font-family=\"Helvetica,Arial,'PingFang SC','Microsoft YaHei',sans-serif\" font-size='14'>")


# ---------------------------------------------------------------- 三（题图）：SSB 调制与相干解调框图
def fig_q3block():
    """照原卷版式重绘：m(t) 抽头分两路——上路 ×cos(2πf_c t)，下路经希尔伯特变换后 ×(−sin)，
    相加得上边带 s(t)；再加 n_w(t)、过 BPF 到 A 点，×2cos 相干解调、过 LPF 到 B 点。"""
    s = HEAD.format(w=940, h=280) + marker('m20a')
    Y1, YM, Y2 = 78, 140, 202          # 上支路 / 主支路 / 下支路
    RM, RA = 15, 16                    # 乘法器 / 相加器半径
    TAP, MULX = 100, 290               # m(t) 抽头位置、两个乘法器的竖轴
    AX = 410                           # 合路相加器的竖轴

    # ---- m(t) 输入与上路
    s += text(12, Y1 + 5, 'm(t)', anchor='start', style='i')
    s += line(52, Y1, MULX - RM - 2, Y1, marker='m20a')
    s += dot(TAP, Y1, 3.5)
    # ---- 下路：抽头 → 希尔伯特变换 → 下乘法器
    s += line(TAP, Y1, TAP, 112, marker='m20a')
    s += rect(62, 112, 76, 52)
    s += text(TAP, 135, '希尔伯')
    s += text(TAP, 150, '特变换')
    s += line(TAP, 164, TAP, Y2)
    s += line(TAP, Y2, MULX - RM - 2, Y2, marker='m20a')
    # ---- 两路乘法器与载波
    s += mul(MULX, Y1, RM) + mul(MULX, Y2, RM)
    s += text(MULX, 30, 'cos(2πf_c t)', size=13)
    s += line(MULX, 40, MULX, Y1 - RM - 1, marker='m20a')
    s += text(MULX, 252, '−sin(2πf_c t)', size=13)
    s += line(MULX, 232, MULX, Y2 + RM + 1, marker='m20a')
    # ---- 上下两支路汇入相加器得 s(t)
    s += line(MULX + RM, Y1, AX, Y1) + line(AX, Y1, AX, YM - RA - 1, marker='m20a')
    s += line(MULX + RM, Y2, AX, Y2) + line(AX, Y2, AX, YM + RA + 1, marker='m20a')
    s += adder(AX, YM, RA)
    s += line(AX + RA, YM, 484, YM, marker='m20a')
    s += text(456, 131, 's(t)', size=13, style='i')
    # ---- 叠加信道噪声
    s += adder(502, YM, RA)
    s += text(502, 226, 'n_w(t)', size=13)
    s += line(502, 206, 502, YM + RA + 1, marker='m20a')
    # ---- BPF → A 点 → 相干乘法器 → LPF → B 点
    s += line(518, YM, 554, YM, marker='m20a')
    s += rect(556, YM - 24, 96, 48) + text(604, YM + 5, 'BPF', style='i')
    s += line(652, YM, 672, YM, marker='m20a')
    s += dot(678, YM, 4) + text(678, 172, 'A', size=13, style='i')
    s += line(682, YM, 699, YM, marker='m20a')
    s += mul(716, YM, RM)
    s += text(716, 92, '2cos(2πf_c t)', size=13)
    s += line(716, 102, 716, YM - RM - 1, marker='m20a')
    s += line(731, YM, 758, YM, marker='m20a')
    s += rect(760, YM - 24, 96, 48) + text(808, YM + 5, 'LPF', style='i')
    s += line(856, YM, 876, YM, marker='m20a')
    s += dot(882, YM, 4) + text(882, 172, 'B', size=13, style='i')
    s += line(886, YM, 920, YM, marker='m20a')
    return s + '</svg>'


# ---------------------------------------------------------------- 四（题图）：匹配滤波接收框图
def fig_q4rx():
    s = HEAD.format(w=1060, h=210) + marker('m20b')
    Y1, Ym, Y2 = 60, 110, 160
    s += text(10, Ym + 5, 's_1(t)或s_2(t)', anchor='start', size=13)
    s += line(120, Ym, 157, Ym)
    s += adder(175, Ym, 18)
    s += text(175, 178, 'n_w(t)', size=13)
    s += line(175, 160, 175, 128, marker='m20b')
    s += line(193, Ym, 290, Ym)
    s += text(245, Ym - 9, 'r(t)', size=13, style='i')
    # 分两路
    s += line(290, Y1, 290, Y2)
    s += line(290, Y1, 340, Y1, marker='m20b')
    s += line(290, Y2, 340, Y2, marker='m20b')
    # 匹配滤波器
    s += rect(340, Y1 - 24, 270, 48) + text(475, Y1 + 5, '匹配滤波器1')
    s += text(475, 26, 'h_1(t)', size=13)
    s += rect(340, Y2 - 24, 270, 48) + text(475, Y2 + 5, '匹配滤波器2')
    s += text(475, 126, 'h_2(t)', size=13)
    # 采样开关（两个空心触点 + 交叉斜杆）
    for yy in (Y1, Y2):
        s += line(610, yy, 642, yy, marker='m20b')
        s += switch(663, yy, 'm20b')
        s += text(663, yy - 40, 't=t_0', size=12)
        s += line(681, yy, 800, yy)
    s += text(740, 49, 'y_1', size=13, style='i')
    s += text(740, 179, 'y_2', size=13, style='i')
    # 求和（上 + 下 −）与判决
    s += line(800, Y1, 800, Ym - 18, marker='m20b')
    s += line(800, Y2, 800, Ym + 18, marker='m20b')
    s += text(790, Ym - 20, '+', size=13, anchor='end')
    s += text(790, Ym + 26, '−', size=13, anchor='end')
    s += adder(818, Ym, 18)
    s += line(836, Ym, 880, Ym)
    s += text(866, Ym - 9, 'y', size=13, style='i')
    s += rect(900, Ym - 24, 100, 48) + text(950, Ym + 5, '判决')
    s += line(1000, Ym, 1040, Ym, marker='m20b')
    s += text(950, 186, 'V_T', size=13)
    s += line(950, 174, 950, Ym + 24, marker='m20b')
    return s + '</svg>'


# ---------------------------------------------------------------- 七（题图）：p(x) 阶梯形概率密度
def fig_q7pdf():
    s = HEAD.format(w=660, h=300) + marker('m20c')
    BASE, OX, U = 250, 330, 40
    H8, H12, H24 = 72, 50, 30  # 原卷阶梯高度约 2.4 : 1.7 : 1，按卷面比例而非严格 3:2:1
    X = lambda v: OX + v * U
    # 连续坐标轴
    s += line(X(-7.2), BASE, X(7.2), BASE, marker='m20c')
    s += line(OX, BASE, OX, 112, marker='m20c')
    s += text(OX + 12, 110, 'p(x)', anchor='start', style='i')
    s += text(X(7.2) + 10, BASE + 22, 'x', anchor='start', style='i')
    # 阶梯轮廓
    outline = [(X(-6), BASE), (X(-6), BASE - H24), (X(-4), BASE - H24), (X(-4), BASE - H12),
               (X(-2), BASE - H12), (X(-2), BASE - H8), (X(2), BASE - H8), (X(2), BASE - H12),
               (X(4), BASE - H12), (X(4), BASE - H24), (X(6), BASE - H24), (X(6), BASE)]
    s += poly(outline, width=1.8)
    # 区间内的辅助虚线（台阶跳变处延伸到坐标轴）
    for v, h in ((-4, H24), (-2, H12), (2, H12), (4, H24)):
        s += line(X(v), BASE, X(v), BASE - h, width=1.1, dash='3,4', color='#999')
    # 电平标注
    s += text(OX + 10, BASE - H8 - 8, '1/8', size=12, anchor='start')
    s += text(X(2) + 10, BASE - H12 - 8, '1/12', size=12, anchor='start')
    s += text(X(4) + 10, BASE - H24 - 8, '1/24', size=12, anchor='start')
    # 横轴刻度
    for v in (-6, -4, -2, 2, 4, 6):
        s += text(X(v), BASE + 22, str(v), size=12)
    s += text(OX, BASE + 22, 'O', size=12)
    return s + '</svg>'


# ---------------------------------------------------------------- 三（解析）：A 点噪声功率谱
def fig_q3psdA():
    s = HEAD.format(w=600, h=230) + marker('m20d')
    BASE, OX, U, H = 180, 300, 0.2, 55  # 1 Hz = 0.2px
    X = lambda hz: OX + hz * U
    s += line(20, BASE, 585, BASE, marker='m20d')
    s += line(OX, BASE, OX, 95, marker='m20d')
    s += text(OX + 10, 102, 'P_{n_A}(f)', anchor='start', style='i')
    # 双侧矩形谱
    for a, b in ((900, 1200), (-1200, -900)):
        s += poly([(X(a), BASE), (X(a), BASE - H), (X(b), BASE - H), (X(b), BASE)], width=1.8)
    # y 轴上的 N0/2 电平
    s += tick(OX, BASE - H, vertical=True, h=5)
    s += text(OX + 10, BASE - H + 5, 'N_0/2', size=13, anchor='start')
    for v in (-1200, -900, 900, 1200):
        s += text(X(v), BASE + 22, str(v), size=12)
    s += text(OX - 8, BASE + 22, 'O', size=12)
    s += text(592, BASE + 22, 'f', anchor='start', style='i')
    return s + '</svg>'


# ---------------------------------------------------------------- 三（解析）：B 点噪声功率谱
def fig_q3psdB():
    s = HEAD.format(w=440, h=230) + marker('m20e')
    BASE, OX, U = 180, 230, 0.45  # 1 Hz = 0.45px
    X = lambda hz: OX + hz * U
    H2, H1 = 40, 56
    s += line(80, BASE, 410, BASE, marker='m20e')
    s += line(OX, BASE, OX, 95, marker='m20e')
    s += text(OX + 10, 92, 'P_{n_B}(f)', anchor='start', style='i')
    pts = [(X(-200), BASE), (X(-200), BASE - H2), (X(-100), BASE - H2), (X(-100), BASE - H1),
           (X(100), BASE - H1), (X(100), BASE - H2), (X(200), BASE - H2), (X(200), BASE)]
    s += poly(pts, width=1.8)
    s += text(OX + 8, BASE - H1 - 10, 'N_0', size=13, anchor='start')
    # N0/2 用箭头指到 y 轴上的电平
    s += tick(OX, BASE - H2, vertical=True, h=5)
    s += text(292, BASE - H2 - 18, 'N_0/2', size=13, anchor='start')
    s += line(288, BASE - H2 - 12, OX + 5, BASE - H2 - 1, width=1.2, marker='m20e')
    for v, lbl in ((-200, '-200'), (200, '200')):
        s += text(X(v), BASE + 22, lbl, size=12)
    s += text(OX - 8, BASE + 22, 'O', size=12)
    s += text(414, BASE + 22, 'f', anchor='start', style='i')
    return s + '</svg>'


# ---------------------------------------------------------------- 五（解析）：16QAM 星座公用底图
def q5_grid(s, mid):
    """4×4 星座：坐标轴 + 刻度 + 16 个点；正半轴标 1、3，负半轴只画刻度"""
    cx, cy, U = 210, 210, 48
    s += line(30, cy, 402, cy, marker=mid)
    s += line(cx, 402, cx, 18, marker=mid)
    P = {}
    for i in (-3, -1, 1, 3):
        for j in (-3, -1, 1, 3):
            P[(i, j)] = (cx + i * U, cy - j * U)
            s += dot(cx + i * U, cy - j * U, 4.5)
    for v in (-3, -1, 1, 3):
        s += tick(cx + v * U, cy)
        s += tick(cx, cy - v * U, vertical=True)
    for v in (1, 3):
        s += text(cx + v * U, cy + 22, str(v), size=12)
        s += text(cx + 10, cy - v * U + 5, str(v), size=12, anchor='start')
    return P, s


def fig_q5const():
    s = HEAD.format(w=430, h=430) + marker('m20f')
    _, s = q5_grid(s, 'm20f')
    return s + '</svg>'


def hatch_rect(x0, y0, x1, y1, step=9):
    """在矩形内画 45° 斜线阴影（右下方向），避免用 pattern 影响几何自查"""
    out = []
    c = x0 - y1
    while c <= x1 - y0:
        xa, xb = c + y0, c + y1
        xa = min(max(xa, x0), x1)
        xb = min(max(xb, x0), x1)
        if xa < xb:
            out.append(line(xa, xa - c, xb, xb - c, width=1.0))
        c += step
    return ''.join(out)


def fig_q5region():
    s = HEAD.format(w=430, h=430) + marker('m20g')
    P, s = q5_grid(s, 'm20g')
    cx, cy, U = 210, 210, 48
    bx, by = cx - 2 * U, cy + 2 * U  # (-2, -2)
    x0, y0, x1, y1 = 30, by, bx, 402
    s += hatch_rect(x0, y0, x1, y1)
    s += line(bx, by, bx, y1, dash='5,4', color='#1a1a1a', width=1.4)
    s += line(bx, by, x0, by, dash='5,4', color='#1a1a1a', width=1.4)
    s += text(bx - 6, cy - 8, '-2', size=12, anchor='end')
    s += text(cx + 10, by + 5, '-2', size=12, anchor='start')
    return s + '</svg>'


def fig_q5gray():
    s = HEAD.format(w=430, h=430) + marker('m20h')
    P, s = q5_grid(s, 'm20h')
    GX = {-3: '00', -1: '01', 1: '11', 3: '10'}   # 实部 → 高 2 位
    GY = {3: '00', 1: '10', -1: '11', -3: '01'}   # 虚部 → 低 2 位
    for (i, j), (px, py) in P.items():
        s += text(px, py + 20, GX[i] + GY[j], size=12)
    return s + '</svg>'


# ---------------------------------------------------------------- 八（题图）：卷积码编码器框图
def fig_q8enc():
    """照原卷版式重绘：两级空移位寄存器（b_n → D₁ → D₂）；
    上路相加器三抽头 b_n、b_{n-1}、b_{n-2} 合成 c₁ = b_n⊕b_{n-1}⊕b_{n-2}，
    下路相加器两抽头 b_n、b_{n-1} 合成 c₂ = b_n⊕b_{n-1}；
    上相加器三路进（左/右/下）、输出上出，下相加器两路进（左/上）、输出右出。"""
    s = HEAD.format(w=760, h=300) + marker('m20k')
    YS, YT, YB = 150, 76, 224          # 输入线 / 上支路 / 下支路
    RA = 15
    AX = 352                           # 两级寄存器之间的抽头、两个相加器的竖轴
    BW, BH = 104, 32
    B1, B2 = 210, 390                  # 第一、第二级寄存器左边界
    TAP = 150                          # 输入抽头

    # ---- 输入 b0b1b2b3
    s += text(10, YS + 5, 'b_0b_1b_2b_3', anchor='start', style='i')
    s += line(74, YS, B1 - 2, YS, marker='m20k')
    s += dot(TAP, YS, 3.5)
    # ---- 输入抽头分上、下两路
    s += line(TAP, YS, TAP, YT)
    s += line(TAP, YT, AX - RA - 1, YT, marker='m20k')
    s += line(TAP, YS, TAP, YB)
    s += line(TAP, YB, AX - RA - 1, YB, marker='m20k')
    # ---- 两级移位寄存器
    s += rect(B1, YS - BH / 2, BW, BH)
    s += rect(B2, YS - BH / 2, BW, BH)
    s += line(B1 + BW, YS, B2, YS)
    # ---- 两级之间的抽头（b_{n-1}）分别进上、下相加器
    s += dot(AX, YS, 3.5)
    s += line(AX, YS, AX, YT + RA + 1, marker='m20k')
    s += line(AX, YS, AX, YB - RA - 1, marker='m20k')
    # ---- 上、下相加器
    s += adder(AX, YT, RA) + adder(AX, YB, RA)
    # ---- 第二级输出（b_{n-2}）反馈到上相加器右侧
    s += line(B2 + BW, YS, 536, YS) + line(536, YS, 536, YT)
    s += line(536, YT, AX + RA + 1, YT, marker='m20k')
    # ---- 两路输出
    s += line(AX, YT - RA, AX, 40)
    s += line(AX, 40, 618, 40, marker='m20k')
    s += text(630, 45, 'c_10c_11c_12c_13', anchor='start', style='i')
    s += line(AX + RA, YB, 618, YB, marker='m20k')
    s += text(630, YB + 5, 'c_20c_21c_22c_23', anchor='start', style='i')
    return s + '</svg>'


# ---------------------------------------------------------------- 八（解析）：状态转移图
def fig_q8state():
    s = HEAD.format(w=720, h=340) + marker('m20i')
    A, B, C, D = (140, 180), (350, 84), (350, 276), (560, 180)
    BW, BH = 70, 46

    def box(p, val):
        x, y = p
        return rect(x - BW / 2, y - BH / 2, BW, BH) + text(x, y + 6, val)

    s += box(A, '00') + box(B, '10') + box(C, '01') + box(D, '11')
    s += text(A[0] - 32, A[1] - 36, 'a', style='i')
    s += text(B[0], B[1] - 36, 'b', style='i')
    s += text(C[0], C[1] + 54, 'c', style='i')
    s += text(D[0] + 32, D[1] - 36, 'd', style='i')
    # 左右自环
    s += path_c((A[0] - BW / 2, A[1] + 12), (A[0] - BW / 2 - 38, A[1] + 36),
                (A[0] - BW / 2 - 38, A[1] - 36), (A[0] - BW / 2, A[1] - 12), marker='m20i')
    s += text(12, A[1] + 5, '00(0)', size=13, anchor='start')
    s += path_c((D[0] + BW / 2, D[1] - 12), (D[0] + BW / 2 + 38, D[1] - 36),
                (D[0] + BW / 2 + 38, D[1] + 36), (D[0] + BW / 2, D[1] + 12), marker='m20i')
    s += text(645, D[1] + 5, '10(1)', size=13, anchor='start')
    # 外围四条弧
    s += path_c((A[0] + 20, A[1] - 21), (A[0] + 45, 62), (B[0] - 45, 62),
                (B[0] - BW / 2, B[1]), marker='m20i')
    s += text(215, 58, '11(1)', size=13)
    s += path_c((B[0] + BW / 2, B[1] + 8), (B[0] + 80, 70), (D[0] - 45, 120),
                (D[0] - 6, D[1] - BH / 2), marker='m20i')
    s += text(458, 52, '00(1)', size=13)
    s += path_c((D[0], D[1] + BH / 2), (D[0], 300), (C[0] + 80, 300),
                (C[0] + BW / 2, C[1]), marker='m20i')
    s += text(474, 314, '01(0)', size=13)
    s += path_c((C[0] - BW / 2, C[1]), (C[0] - 80, 300), (A[0] + 60, 300),
                (A[0], A[1] + BH / 2), marker='m20i')
    s += text(196, 314, '10(0)', size=13)
    # 中间 c→b / b→c 两条弧
    s += path_c((C[0] - 15, C[1] - BH / 2), (C[0] - 48, 190), (B[0] - 48, 170),
                (B[0] - 15, B[1] + BH / 2), marker='m20i')
    s += text(278, 187, '01(1)', size=13, anchor='end')
    s += path_c((B[0] + 15, B[1] + BH / 2), (B[0] + 48, 170), (C[0] + 48, 190),
                (C[0] + 15, C[1] - BH / 2), marker='m20i')
    s += text(422, 187, '11(0)', size=13, anchor='start')
    return s + '</svg>'


# ---------------------------------------------------------------- 九（解析）：升余弦发送功率谱
def fig_q9psd():
    s = HEAD.format(w=640, h=240) + marker('m20j')
    BASE, OX, U, H = 180, 300, 45, 60  # 1 kHz = 45px
    X = lambda khz: OX + khz * U
    Y = lambda khz: BASE - H / 2 * (1 + math.cos(math.pi * (khz - 2) / 2))
    s += line(80, BASE, 560, BASE, marker='m20j')
    s += line(OX, BASE, OX, 62, marker='m20j')
    s += text(OX + 10, 70, 'P_s(f)', anchor='start', style='i')
    # 左滚降(-4→-2) + 平顶(-2→2) + 右滚降(2→4)
    roll = [2 + k * 0.125 for k in range(0, 17)]
    pts = [(X(-f), Y(f)) for f in reversed(roll)] + [(X(f), Y(f)) for f in roll]
    s += poly(pts, width=1.8)
    for v in (-3, 3):
        s += line(X(v), BASE, X(v), Y(v), width=1.1, dash='3,4', color='#999')
    for v in (-4, -3, -2, 2, 3, 4):
        s += text(X(v), BASE + 22, str(v), size=12)
    s += text(OX - 8, BASE + 22, 'O', size=12)
    s += text(566, BASE + 22, 'f/kHz', anchor='start', style='i')
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
