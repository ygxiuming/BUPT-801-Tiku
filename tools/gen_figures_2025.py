#!/usr/bin/env python3
# 生成 2025年试卷 SVG 图库（相对路径落盘，需在项目根目录运行）：
#   python3 tools/gen_figures_2025.py
#
# 硬约定（踩过的坑都写在这里）：
#   · 上下标一律走 text() 的迷你标记（x_c / T_{b}），绝不写 Unicode 下标（N₀、s₁）——
#     浏览器字体缺字会渲染成豆腐块 "N⊠/2"。
#   · 幅度谱的 f=0 竖线是坐标轴，画细灰线且不带箭头，否则会被读成一根谱线。
#   · 频率轴刻度必须线性，不能为了好看把 900 Hz 挤到 1.45 倍 400 Hz 的位置。
#   · 判决域/曲线上的标签各自留 ≥6px 空隙，标签不与线、箭头头相交。
import math, os

OUT_REL = os.path.join('data', 'figures', '2025.js')


def marker(mid):
    return (f"<defs><marker id='{mid}' markerWidth='8' markerHeight='8' refX='7' refY='3' orient='auto'>"
            f"<path d='M0,0 L7,3 L0,6 z' fill='#1a1a1a'/></marker></defs>")


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
    """文字；'_x'/'_{xx}' 排下标、'^x'/'^{xx}' 排上标（tspan），避免出现 f_c 这种下划线写法"""
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


def rect(x, y, w, h, dash=None, fill='none'):
    da = f" stroke-dasharray='{dash}'" if dash else ''
    return f"<rect x='{x:.1f}' y='{y:.1f}' width='{w:.1f}' height='{h:.1f}' fill='{fill}' stroke='#1a1a1a'{da}/>"


HEAD = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {w} {h}' "
        "font-family=\"Helvetica,Arial,'PingFang SC','Microsoft YaHei',sans-serif\" font-size='14'>")


# ------------------------------------------------------------------ 题三：SSB 相干解调
def fig_ssb():
    s = HEAD.format(w=440, h=125) + marker('arA')
    s += text(10, 45, 's(t)', anchor='start', style='i')
    s += line(46, 40, 70, 40, marker='arA')
    s += rect(73, 25, 52, 30) + text(99, 45, '信道')
    s += line(125, 40, 158, 40, marker='arA') + text(142, 32, 'r(t)', style='i')
    s += rect(161, 25, 44, 30) + text(183, 45, 'BPF')
    s += line(205, 40, 236, 40, marker='arA')
    s += circle(251, 40, 13) + line(245, 34, 257, 46) + line(257, 34, 245, 46)
    s += line(264, 40, 296, 40, marker='arA')
    s += rect(299, 25, 46, 30) + text(322, 45, 'LPF')
    s += line(345, 40, 400, 40, marker='arA')
    s += text(248, 100, '2cos(2πf_c t)')
    s += line(248, 84, 251, 57, marker='arA')
    return s + '</svg>'


# ------------------------------------------------------------------ 题四：PAM 系统
def fig_pam():
    s = HEAD.format(w=650, h=195) + marker('arB')
    # 顶部 A→B 的双向测量线（原卷是两头带箭头的尺寸线）
    s += line(55, 32, 462, 32)
    s += line(55, 32, 55, 44, width=1.2) + line(462, 32, 462, 44, width=1.2)
    s += "<path d='M55,32 l9,-4 l0,8 z' fill='#1a1a1a'/><path d='M462,32 l-9,-4 l0,8 z' fill='#1a1a1a'/>"
    s += text(258, 22, 'X(f), x(t)', style='i')
    s += text(6, 74, 'd(t)', anchor='start', style='i')
    s += line(38, 70, 64, 70, marker='arB')
    s += dot(55, 70, 3) + text(55, 94, 'A')
    s += rect(67, 55, 80, 32) + text(107, 69, '发送滤波器') + text(107, 83, 'G_T(f)', style='i')
    s += line(147, 70, 180, 70, marker='arB') + text(163, 62, 's(t)', style='i')
    s += rect(183, 55, 64, 32) + text(215, 69, '信道') + text(215, 83, 'C(f)', style='i')
    s += line(247, 70, 286, 70, marker='arB') + text(266, 62, 'y(t)', style='i')
    s += circle(300, 70, 11) + line(294, 70, 306, 70) + line(300, 64, 300, 76)
    s += line(300, 120, 300, 84, marker='arB') + text(300, 138, 'n_w(t)', style='i')
    s += line(311, 70, 346, 70, marker='arB') + text(329, 62, 'r(t)', style='i')
    s += rect(349, 55, 80, 32) + text(389, 69, '接收滤波器') + text(389, 83, 'G_R(f)', style='i')
    s += line(429, 70, 456, 70, marker='arB') + text(444, 62, 'v(t)', style='i')
    s += dot(464, 70, 3) + text(464, 94, 'B')
    s += line(464, 70, 486, 70)
    # 抽样开关：两个触点小圆圈 + 斜刀（原卷画法）
    s += dot(490, 70, 2.6, fill='#fff', stroke='#1a1a1a')
    s += dot(518, 70, 2.6, fill='#fff', stroke='#1a1a1a')
    s += line(490, 70, 512, 48, width=1.8)
    s += text(506, 42, 't=kT_s', style='i')
    s += line(518, 70, 546, 70)
    s += dot(550, 70, 3) + text(550, 94, 'C')
    s += line(554, 70, 586, 70, marker='arB') + text(596, 75, 'v_k', anchor='start', style='i')
    return s + '</svg>'


# ------------------------------------------------------------------ 题九：两级编码器
def fig_encoder():
    """b=uG₁ → c=b*g 两级编码框图（2025 第九题）。

    版式要点：标签与箭头各留 ≥8px 空隙；抽头母线在延迟线正上方；G₂ 标签放在
    虚线框内左下角空位；⊕ 用「圆 + 十字线」绘制（不用字符），交叉点即模二加。
    """
    X0, X1 = 406, 874          # G₂ 虚线框左右边界
    YB, YBUS = 96, 50          # 信号线 / 抽头母线
    YT, YD = 26, 138           # 框上/下边界
    s = HEAD.format(w=1070, h=150) + marker('arC')

    def dashed(x1, y1, x2, y2):
        return line(x1, y1, x2, y2, width=1.3, dash='6,4')

    # 虚线框：左边界给输入线让路、右边界给输出线让路，线不压框
    s += dashed(X0, YT, X1, YT) + dashed(X0, YD, X1, YD)                    # 上下边
    s += dashed(X0, YT, X0, YB - 7) + dashed(X0, YB + 7, X0, YD)            # 左边（缺口）
    s += dashed(X1, YT, X1, YBUS - 6) + dashed(X1, YBUS + 6, X1, YD)        # 右边（缺口）
    s += text(414, YD - 8, 'G_2', anchor='start', style='b')

    # ---- u → G₁ → b ----
    s += text(10, YB - 8, 'u=(u_0u_1u_2u_3)', anchor='start', style='i')
    s += line(6, YB, 148, YB, marker='arC')
    s += rect(151, YB - 18, 44, 36) + text(173, YB + 5, 'G_1', style='b')
    s += line(197, YB, 228, YB, marker='arC')
    s += text(234, YB - 8, 'b=(b_0b_1b_2b_3)', anchor='start', style='i')

    # ---- b → 延迟线 D D D ----
    s += line(332, YB, 441, YB, marker='arC')
    for x in (444, 516, 588):
        s += rect(x, YB - 16, 36, 32) + text(x + 18, YB + 5, 'D', style='i')
    s += line(480, YB, 513, YB, marker='arC')
    s += line(552, YB, 585, YB, marker='arC')
    s += line(624, YB, 690, YB)

    # ---- 抽头：输入(g0=1)、1D(g1=1)、3D(g3=1) → 模二加 ----
    for x in (420, 498, 690):
        s += dot(x, YB, 2.6) + line(x, YB, x, YBUS) + dot(x, YBUS, 2.6)
    s += line(420, YBUS, 728, YBUS)
    s += circle(740, YBUS, 12)
    s += line(731, YBUS, 749, YBUS) + line(740, YBUS - 9, 740, YBUS + 9)
    s += line(752, YBUS, 884, YBUS, marker='arC')          # 穿框右边界缺口输出 c
    s += text(892, YBUS + 5, 'c=(c_0c_1c_2c_3c_4c_5c_6)', anchor='start', style='i')
    return s + '</svg>'


# ------------------------------------------------------------------ 题六：8PSK 星座与判决域
GRAY = {8: '100', 1: '000', 2: '001', 3: '011', 4: '010', 5: '110', 6: '111', 7: '101'}


def pt(cx, cy, r, deg):
    return (cx + r * math.cos(math.radians(deg)), cy - r * math.sin(math.radians(deg)))


def fig_psk8():
    cx, cy, R = 200, 200, 120
    s = HEAD.format(w=400, h=400) + circle(cx, cy, R)
    for k in range(8):  # ML判决边界 22.5°+45k
        a = 22.5 + 45 * k
        x2, y2 = pt(cx, cy, 158, a)
        s += line(cx, cy, x2, y2, dash='5,4', color='#666')
    for i in range(1, 9):
        deg = 45 * i % 360
        px, py = pt(cx, cy, R, deg)
        s += dot(px, py, 4.5)
        lx, ly = pt(cx, cy, 88, deg)
        s += text(lx, ly + 5, f's_{i}', style='i')
        dx, dy = pt(cx, cy, 52, deg)
        s += text(dx, dy + 5, f'D_{i}', size=12, color='#555')
        bx, by = pt(cx, cy, 152, deg)
        s += text(bx, by + 5, GRAY[i], size=13, color='#333')
    return s + '</svg>'


def fig_psk8new():
    """Ω'：s₁s₃s₅s₇ 缩到 r=1/2，s₂s₄s₆s₈ 保持 r=1。

    判决域是真正的沃罗诺伊图（不是随手画的斜线）：
      · 内-内相邻点之间 → 坐标轴上 原点→0.580 的那一段；
      · 内-外相邻点之间 → 由轴上三重点 (0.580,0) 沿 61.3° 引出的中垂线，到 (1.280,1.280)；
      · 外-外相邻点之间 → 由对角三重点 (1.280,1.280) 沿对角线向外。
    三重点由 |p-内点|=|p-外点| 解出：0.375/0.6464=0.580，再沿 61.3° 走到 1.280。
    """
    cx, cy, R = 210, 210, 105
    APEX, TRI, WD = 0.580, 1.280, 1.72
    LEN = math.hypot(TRI, TRI) - APEX - 0.0      # (0.580,0) → (1.280,1.280) 的斜线长度
    LEN = math.hypot(TRI - APEX, TRI)            # = 1.459（单位：R）
    s = HEAD.format(w=420, h=430)
    s += circle(cx, cy, R, dash='4,5', color='#999', width=1.2)
    s += circle(cx, cy, R / 2, dash='2,5', color='#bbb', width=1.0)

    # ① 内-内边界：坐标轴段
    for deg in (0, 90, 180, 270):
        x2, y2 = pt(cx, cy, R * APEX, deg)
        s += line(cx, cy, x2, y2, color='#666', dash='6,4', width=1.3)
    # ② 内-外边界：轴三重点 → 对角三重点（半张角 61.3°）
    for adeg in (0, 90, 180, 270):
        ax, ay = pt(cx, cy, R * APEX, adeg)
        for sgn in (+1, -1):
            ux = math.cos(math.radians(adeg + sgn * 61.3))
            uy = -math.sin(math.radians(adeg + sgn * 61.3))
            s += line(ax, ay, ax + ux * R * LEN, ay + uy * R * LEN,
                      color='#666', dash='6,4', width=1.3)
    # ③ 外-外边界：对角三重点沿对角线向外
    for sx in (+1, -1):
        for sy in (+1, -1):
            s += line(cx + sx * R * TRI, cy + sy * R * TRI,
                      cx + sx * R * WD, cy + sy * R * WD, color='#666', dash='6,4', width=1.3)

    inner = {1: 45, 3: 135, 5: 225, 7: 315}
    outer = {8: 0, 2: 90, 4: 180, 6: 270}
    # 点标签的相对偏移（anchor 随象限变），先定位再排字，避免文字压到星座点/虚线
    off = {
        8: (14, 5, 'start'), 2: (0, -14, 'middle'), 4: (-14, 5, 'end'), 6: (0, 22, 'middle'),
    }
    for i, deg in {**outer, **inner}.items():
        r = R / 2 if i in inner else R
        px, py = pt(cx, cy, r, deg)
        s += dot(px, py, 4.5)
        if i in inner:
            # 内点住在 28.7°~61.3° 的窄楔形里，标签放楔形中部（0.72R 处）才不压边界线
            lx, ly = pt(cx, cy, R * 0.72, deg)
            s += text(lx, ly + 5, f's_{i}', size=13)
        else:
            ox, oy, an = off[i]
            s += text(px + ox, py + oy, f's_{i} {GRAY[i]}', size=13, anchor=an)
        # 判决域标签：内点放象限中央；外点沿轴放到轴段外侧（轴段只到 0.58R）
        dr = R * 0.24 if i in inner else R * 0.74
        dx, dy = pt(cx, cy, dr, deg)
        s += text(dx, dy + 5, f'D_{i}', size=12, color='#555')
    s += text(cx, 418, '内点 r=1/2，外点 r=1；虚线为 ML 判决域边界（格雷映射同图(a)）', size=12, color='#666')
    return s + '</svg>'


# ------------------------------------------------------------------ 题五：OOK 判决 PDF
def gauss_pts(cx, base_y, peak, sigma, x0, x1, step=6):
    pts = []
    x = x0
    while x <= x1:
        y = base_y - peak * math.exp(-((x - cx) ** 2) / (2 * sigma ** 2))
        pts.append((x, y))
        x += step
    return pts


def fig_ookpdf():
    base, sigma, peak = 200, 45, 125
    c0, c1, vt = 140, 400, 270
    s = HEAD.format(w=560, h=258) + marker('arD')
    s += line(24, base, 520, base, marker='arD')
    s += line(c0, base, c0, 74, color='#bbb', dash='2,3', width=1.1)
    s += line(c1, base, c1, 74, color='#bbb', dash='2,3', width=1.1)
    s += poly(gauss_pts(c0, base, peak, sigma, max(26, c0 - 135), min(512, c0 + 135)))
    s += poly(gauss_pts(c1, base, peak, sigma, max(26, c1 - 135), min(512, c1 + 135)))
    s += line(vt, base - 2, vt, 96, width=1.6, dash='7,4', color='#c0392b')
    s += text(vt, 86, 'V_T=E_1/2', style='i', color='#c0392b')
    s += text(c0 - 52, 62, 'f(y|"0")', style='i')
    s += text(c1 + 52, 62, 'f(y|"1")', style='i')
    s += text(c0, 222, '0')
    s += text(c1, 222, 'E_1', style='i')
    s += text(512, 222, 'y', anchor='end', style='i')
    # 两条尾巴的误差概率：标在轴下方 + 引线指到对应尾巴（曲线附近没有空白，硬塞会压线）
    s += line(250, 236, 250, 206, color='#c0392b', width=1.1, marker='arD')
    s += line(292, 236, 292, 206, color='#c0392b', width=1.1, marker='arD')
    s += text(244, 248, 'P(e|s_1)', size=12, color='#c0392b', anchor='end')
    s += text(298, 248, 'P(e|s_2)', size=12, color='#c0392b', anchor='start')
    return s + '</svg>'


# ------------------------------------------------------------------ 题八：信道转移图
def fig_q8chan():
    """三条 X=i → Y=3 的擦除支路：标签错开 x 位置放，避免三个 1/2 挤在一起。"""
    s = HEAD.format(w=540, h=380) + marker('arE')
    xy = {'0': 76, '1': 158, '2': 240}
    xL, xR = 84, 396
    for k, y in xy.items():
        s += dot(76, y, 5)
        s += text(64, y + 5, f'X={k}', anchor='end', style='i')
        s += text(64, y + 23, 'P=1/3', anchor='end', size=12, color='#555')
    yy = {'0': 76, '1': 158, '2': 240}
    for k, y in yy.items():
        s += dot(xR, y, 5) + text(xR + 14, y + 5, f'Y={k}', anchor='start', style='i')
        s += text(xR + 96, y + 5, '1/6', anchor='start', size=12, color='#555')
    y3 = 320
    s += dot(xR, y3, 5) + text(xR + 14, y3 + 5, 'Y=3', anchor='start', style='i')
    s += text(xR + 96, y3 + 5, '1/2', anchor='start', size=12, color='#555')

    for k, y in xy.items():
        # 直通支路
        s += line(82, y, xR - 8, yy[k], marker='arE')
        s += text((82 + xR) / 2, y - 9, '1/2', size=12, color='#c0392b')
    # 擦除支路：不画箭头（三个箭头会在 Y=3 处叠成一团黑），统一收到节点左侧 6px；
    # 标签各自错开 x 位置，沿线的法向下移 16px
    lab_x = {'0': 118, '1': 148, '2': 178}
    for k, y in xy.items():
        s += line(82, y, xR - 6, y3 - 2, color='#777', width=1.3)
        xl = lab_x[k]
        yl = y + (y3 - 2 - y) * (xl - 82) / (xR - 6 - 82)
        s += text(xl, yl + 21, '1/2', size=12, color='#c0392b')
    return s + '</svg>'


# ------------------------------------------------------------------ 题七：量化特性
def fig_q7quant():
    s = HEAD.format(w=740, h=250) + marker('arF')
    X0, XS, YB = 60, 35, 195

    def mx(v):
        return X0 + (v + 4) * XS

    s += line(X0 - 12, YB, 350, YB, marker='arF') + text(356, YB + 5, 'x', anchor='start', style='i')
    s += line(mx(0), YB, mx(0), 75, marker='arF')
    s += poly([(mx(-4), YB), (mx(0), 95), (mx(4), YB)], close=True, fill='#f5f5f5')
    s += text(mx(0) - 8, 90, '1/4', anchor='end')
    for v in (-4, -2, 2, 4):
        s += line(mx(v), YB, mx(v), YB + 5) + text(mx(v), YB + 22, str(v))
    s += text(mx(0), YB + 22, '0')
    s += text(mx(0) - 62, 172, 'p(x)', style='i')   # 放进三角形内部，避开斜线
    X1, XS2 = 420, 35

    def mx2(v):
        return X1 + (v + 4) * XS2

    yb, ya, y_aa, y_ab = 80, 120, 160, 200
    s += line(X1 - 12, y_ab, 710, y_ab, marker='arF') + text(716, y_ab + 5, 'x', anchor='start', style='i')
    s += line(mx2(0), y_ab, mx2(0), 55, marker='arF')
    # 电平参考虚线只画在该电平真正出现的半轴：+a 在 0~2、−a 在 −2~0
    s += line(mx2(0), y_aa, mx2(-2), y_aa, color='#bbb', dash='2,3')
    s += line(mx2(0), ya, mx2(2), ya, color='#bbb', dash='2,3')
    s += poly([(mx2(-4), y_ab), (mx2(-2), y_ab), (mx2(-2), y_aa), (mx2(0), y_aa),
               (mx2(0), ya), (mx2(2), ya), (mx2(2), yb), (mx2(4), yb)])
    for v in (-2, 2):
        s += line(mx2(v), yb - 5, mx2(v), y_ab + 5, color='#999', dash='3,3')
    s += dot(mx2(-2), y_ab, 3.5) + dot(mx2(-2), y_aa, 3.5, fill='#fff', stroke='#1a1a1a')
    s += dot(mx2(0), y_aa, 3.5) + dot(mx2(0), ya, 3.5, fill='#fff', stroke='#1a1a1a')
    s += dot(mx2(2), ya, 3.5) + dot(mx2(2), yb, 3.5, fill='#fff', stroke='#1a1a1a')
    for yy2, nm in ((yb, 'b'), (ya, 'a'), (y_aa - 8, '−a'), (y_ab - 8, '−b')):
        s += text(mx2(0) - 12, yy2 + 5, nm, anchor='end', style='i')
    for v in (-4, -2, 2, 4):
        s += text(mx2(v), y_ab + 22, str(v))
    s += text(mx2(0), y_ab + 22, '0')
    s += text(mx2(0) - 12, 62, 'Y=Q(x)', anchor='end', style='i')
    return s + '</svg>'


# ------------------------------------------------------------------ 题二：带限白噪声 PSD
def fig_q2psd():
    s = HEAD.format(w=380, h=190) + marker('arG')
    s += line(40, 150, 340, 150, marker='arG') + text(348, 155, 'f', anchor='start', style='i')
    s += line(190, 150, 190, 40, marker='arG')
    s += poly([(90, 150), (90, 60), (290, 60), (290, 150)], fill='#f5f5f5')
    s += text(84, 56, 'N_0/2', anchor='end', style='i')
    s += text(90, 168, '−B') + text(290, 168, 'B') + text(198, 168, '0', anchor='start')
    s += text(190, 30, 'P_n(f)', style='i')
    return s + '</svg>'


# ------------------------------------------------------------------ 题三：m(t) 功率谱线
def fig_q3psd():
    """频率轴线性：900 Hz 的位置必须是 400 Hz 的 2.25 倍。
    f=0 处的竖线是坐标轴，用细灰线且不带箭头——否则会被误读成一根谱线。"""
    W, FH = 520, 200
    X0, SC, BASE, H1 = 260, 0.20, 152, 62   # f=0 位置、px/Hz、横轴、幅度1的高度
    s = HEAD.format(w=W, h=FH) + marker('arH')

    def fx(f):
        return X0 + f * SC

    s += line(30, BASE, 492, BASE, marker='arH') + text(500, BASE + 5, 'f', anchor='start', style='i')
    s += line(X0, BASE, X0, 74, color='#999', width=1.1)
    s += text(X0, 64, 'P_m(f)', style='i')

    def imp(f, amp):
        x = fx(f)
        h = H1 * amp
        # 箭头用细长三角，别用 marker（marker 会吃掉线宽，看起来像粗头）
        lab = '1' if amp == 1 else '1/4'
        return (line(x, BASE, x, BASE - h, width=1.6)
                + f"<polygon points='{x - 3.4},{BASE - h + 8} {x + 3.4},{BASE - h + 8} {x},{BASE - h - 1}' fill='#1a1a1a'/>"
                + text(x, BASE - h - 8, lab, size=12))

    for f in (-400, 400):
        s += imp(f, 1)
    for f in (-900, 900):
        s += imp(f, 0.25)
    for f, t in ((-900, '−900'), (-400, '−400'), (0, '0'), (400, '400'), (900, '900')):
        s += text(fx(f), 172, t, size=12)
    return s + '</svg>'


# ------------------------------------------------------------------ 题四：A→B 冲激响应
def sinc(x):
    return 1.0 if abs(x) < 1e-9 else math.sin(math.pi * x) / (math.pi * x)


def fig_q4x():
    X0, TSP, Y0, SC = 200, 80, 150, 70
    s = HEAD.format(w=560, h=245) + marker('arI')
    s += line(20, Y0, 540, Y0, marker='arI') + text(548, Y0 + 5, 't', anchor='start', style='i')
    pts = []
    t = -2.12
    while t <= 3.42:
        v = sinc(t) - sinc(t - 2)
        pts.append((X0 + t * TSP, Y0 - v * SC))
        t += 0.04
    s += poly(pts, width=2)
    for k in (-2, -1, 0, 1, 2, 3):
        x = X0 + k * TSP
        s += line(x, Y0 - 4, x, Y0 + 4)
        if k == 0:
            lbl = '0'
        elif abs(k) == 1:
            lbl = ('−' if k < 0 else '') + 'T_s'
        else:
            lbl = ('−' if k < 0 else '') + str(abs(k)) + 'T_s'
        s += text(x, Y0 + 26, lbl, size=12)
    s += dot(X0, Y0 - SC, 4.5) + text(X0 + 10, Y0 - SC - 10, 'x(0)=1', anchor='start', size=12, style='i')
    s += dot(X0 + 2 * TSP, Y0 + SC, 4.5) + text(X0 + 2 * TSP + 10, Y0 + SC + 16, 'x(2T_s)=−1', anchor='start', size=12, style='i')
    for k in (-2, -1, 1, 3):
        s += dot(X0 + k * TSP, Y0, 3.5, fill='#fff', stroke='#1a1a1a')
    return s + '</svg>'


# ------------------------------------------------------------------ viewBox 自动收边
import re as _re

CJK = _re.compile(r'[\u4e00-\u9fff\uff00-\uffef]')


def _charw(c, size):
    if CJK.match(c):
        return size * 1.0
    if c.isupper() or c.isdigit():
        return size * 0.62
    return size * 0.52


def _content_bbox(svg):
    """扫一遍 SVG 基本图元 + 文字（估算字宽），返回内容包围盒。"""
    xs, ys = [], []

    def put(x, y):
        xs.append(x); ys.append(y)

    for m in _re.finditer(r"<line x1='([-\d.]+)' y1='([-\d.]+)' x2='([-\d.]+)' y2='([-\d.]+)'", svg):
        put(float(m.group(1)), float(m.group(2))); put(float(m.group(3)), float(m.group(4)))
    for m in _re.finditer(r"<circle cx='([-\d.]+)' cy='([-\d.]+)' r='([-\d.]+)'", svg):
        cx, cy, r = float(m.group(1)), float(m.group(2)), float(m.group(3))
        put(cx - r, cy - r); put(cx + r, cy + r)
    for m in _re.finditer(r"<rect x='([-\d.]+)' y='([-\d.]+)' width='([-\d.]+)' height='([-\d.]+)'", svg):
        x, y, w, h = [float(m.group(i)) for i in (1, 2, 3, 4)]
        put(x, y); put(x + w, y + h)
    for m in _re.finditer(r"<polygon points='([^']+)'", svg):
        nums = [float(v) for v in _re.split(r'[\s,]+', m.group(1).strip())]
        for i in range(0, len(nums) - 1, 2):
            put(nums[i], nums[i + 1])
    for m in _re.finditer(r"<path d='M([-\d.,\s]+)'", svg):
        nums = [float(v) for v in _re.split(r'[\s,]+', m.group(1).strip())]
        for i in range(0, len(nums) - 1, 2):
            put(nums[i], nums[i + 1])
    for m in _re.finditer(r"<text x='([-\d.]+)' y='([-\d.]+)' text-anchor='(\w+)'([^>]*)>(.*?)</text>", svg, _re.S):
        x, y, anchor, attrs, inner = float(m.group(1)), float(m.group(2)), m.group(3), m.group(4), m.group(5)
        base = int((_re.search(r"font-size='(\d+)'", attrs) or [0, 14])[1])
        chunks = _re.findall(r"<tspan[^>]*font-size='(\d+)'[^>]*>([^<]*)</tspan>", inner)
        if chunks:
            w = sum(_charw(c, int(sz)) for sz, txt in chunks for c in txt)
        else:
            w = sum(_charw(c, base) for c in _re.sub(r'<[^>]+>', '', inner))
        x0 = x - w / 2 if anchor == 'middle' else (x - w if anchor == 'end' else x)
        put(x0, y - base * 0.80); put(x0 + w, y + base * 0.2)
    if not xs:
        return None
    return min(xs), min(ys), max(xs), max(ys)


def tighten(svg, margin=18):
    """把 viewBox 收到内容边界 + margin，避免整幅图在全宽渲染时偏左/偏下或被裁。"""
    bb = _content_bbox(svg)
    if not bb:
        return svg
    x0, y0, x1, y1 = bb
    vx, vy = x0 - margin, y0 - margin
    vw, vh = (x1 - x0) + 2 * margin, (y1 - y0) + 2 * margin
    return _re.sub(r"viewBox='0 0 [-\d.]+ [-\d.]+'",
                   "viewBox='%d %d %d %d'" % (round(vx), round(vy), round(vw), round(vh)), svg, count=1)


# (key, 题号, 是否解析配图, 描述)。题目原图放 data/figures/<年>/，解析配图放 answer/ 子目录。
# 文件名统一"年份-题号-图名"；题目数据里仍用 fig: "key" 引用（与文件名解耦）。
FIGS = [
    ('ssb', '三', False, 'SSB相干解调框图'),
    ('pam', '四', False, 'PAM系统框图'),
    ('encoder', '九', False, '两级编码器框图'),
    ('q2psd', '二', True, '带限白噪声功率谱'),
    ('q3psd', '三', True, 'm(t)功率谱线'),
    ('q4x', '四', True, 'A→B冲激响应x(t)'),
    ('ookpdf', '五', True, 'OOK最佳判决PDF'),
    ('psk8', '六', True, '8PSK星座与判决域'),
    ('psk8new', '六', True, '8PSK新星座(内圆r=1/2)'),
    ('q7quant', '七', True, '量化特性曲线'),
    ('q8chan', '八', True, '信道转移图'),
]
SVGS = {
    'ssb': fig_ssb(), 'pam': fig_pam(), 'encoder': fig_encoder(),
    'psk8': fig_psk8(), 'psk8new': fig_psk8new(), 'ookpdf': fig_ookpdf(),
    'q8chan': fig_q8chan(), 'q7quant': fig_q7quant(), 'q2psd': fig_q2psd(),
    'q3psd': fig_q3psd(), 'q4x': fig_q4x(),
}
# 全部图统一把 viewBox 收到内容边界（留 14px），全宽渲染时不会偏左/被裁
SVGS = {k: tighten(v) for k, v in SVGS.items()}

# 每张图一个文件；输出用 ###FILE: 分隔，落盘用 node tools/emit_figures.mjs 2025。
# 页面加载由 app/scripts/sync-data.mjs 把目录（不含 _ 前缀文件）合并成 public/data/figures/<年>.js。
YEAR = '2025'
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
