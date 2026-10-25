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
    s = HEAD.format(w=560, h=130) + marker('arA')
    s += text(10, 45, 's(t)', anchor='start', style='i')
    s += line(46, 40, 76, 40, marker='arA')
    s += rect(79, 25, 62, 30) + text(110, 45, '信道')
    s += line(141, 40, 196, 40, marker='arA') + text(168, 32, 'r(t)', style='i')
    s += rect(199, 25, 56, 30) + text(227, 45, 'BPF')
    s += line(255, 40, 306, 40, marker='arA')
    s += circle(320, 40, 13) + line(314, 34, 326, 46) + line(326, 34, 314, 46)
    s += line(333, 40, 390, 40, marker='arA')
    s += rect(393, 25, 58, 30) + text(422, 45, 'LPF')
    s += line(451, 40, 520, 40, marker='arA')
    s += text(320, 106, '2cos(2πf_c t)')
    s += line(320, 88, 320, 58, marker='arA')
    return s + '</svg>'


# ------------------------------------------------------------------ 题四：PAM 系统
def fig_pam():
    s = HEAD.format(w=680, h=195) + marker('arB')
    AX, BX = 55, 478
    # 顶部 A→B 的双向测量线（原卷是两头带箭头的尺寸线）
    s += line(AX, 32, BX, 32)
    s += line(AX, 32, AX, 44, width=1.2) + line(BX, 32, BX, 44, width=1.2)
    s += f"<path d='M{AX},32 l9,-4 l0,8 z' fill='#1a1a1a'/><path d='M{BX},32 l-9,-4 l0,8 z' fill='#1a1a1a'/>"
    s += text((AX + BX) / 2, 22, 'X(f), x(t)', style='i')
    s += text(6, 74, 'd(t)', anchor='start', style='i')
    s += line(38, 70, 64, 70, marker='arB')
    s += dot(AX, 70, 3) + text(AX, 94, 'A')
    # 滤波器框两行字：框高 38、行基线差 14；框宽 ≥ 文字宽 70 + 12（规范 5.4）
    s += rect(67, 51, 88, 38) + text(111, 67, '发送滤波器') + text(111, 81, 'G_T(f)', style='i')
    s += line(155, 70, 186, 70, marker='arB') + text(170, 62, 's(t)', style='i')
    s += rect(189, 51, 64, 38) + text(221, 67, '信道') + text(221, 81, 'C(f)', style='i')
    s += line(253, 70, 292, 70, marker='arB') + text(272, 62, 'y(t)', style='i')
    s += circle(306, 70, 11) + line(300, 70, 312, 70) + line(306, 64, 306, 76)
    s += line(306, 120, 306, 84, marker='arB') + text(306, 138, 'n_w(t)', style='i')
    s += line(317, 70, 352, 70, marker='arB') + text(334, 62, 'r(t)', style='i')
    s += rect(355, 51, 88, 38) + text(399, 67, '接收滤波器') + text(399, 81, 'G_R(f)', style='i')
    s += line(443, 70, 470, 70, marker='arB') + text(456, 62, 'v(t)', style='i')
    s += dot(BX, 70, 3) + text(BX, 94, 'B')
    s += line(BX, 70, 500, 70)
    # 抽样开关：两个触点小圆圈 + 斜刀（原卷画法）；t=kT_s 抬到刀刃尖上方 ≥6px
    s += dot(500, 70, 2.6, fill='#fff', stroke='#1a1a1a')
    s += dot(528, 70, 2.6, fill='#fff', stroke='#1a1a1a')
    s += line(500, 70, 522, 48, width=1.8)
    s += text(534, 38, 't=kT_s', style='i')
    s += line(528, 70, 556, 70)
    s += dot(560, 70, 3) + text(560, 94, 'C')
    s += line(564, 70, 596, 70, marker='arB') + text(606, 75, 'v_k', anchor='start', style='i')
    return s + '</svg>'


# ------------------------------------------------------------------ 题九：两级编码器
def fig_encoder():
    """b=uG₁ → c=bG₂ 两级编码框图（2025 第九题），版式照原卷：

    G／G₂ 两个虚线框左上角标名；⊕ 悬在 D₁、D₂ 之间的正上方，三路抽头分别从
    左（b）、下（D₁ 后）、右（D₃ 后）汇入；输出从 ⊕ 顶部上折再往右穿框出去。
    信号线穿虚线框的位置留 8px 缺口，避免"实线压虚线框"。
    竖向节奏按原卷比例定（G₂顶→输出→⊕→D链 四层等距感），⊕ 与 D 框比旧版
    放大一圈（r=17、50×50），标签四周留 ≥10px 净空，不再有贴线/压角。
    """
    YS = 222                       # 信号线 / D 框中心
    YA = 140                       # ⊕ 中心与左右抽头母线
    YO = 66                        # 输出线（⊕ 顶部上折后）
    R = 17                         # ⊕ 半径（原卷 ⊕ 明显大，占外框高一成）
    AX = 479                       # ⊕ 中心，对准 D₁/D₂ 之间的抽头
    BX = 378                       # b 抽头位置（g_0=1，D₁ 前）
    D0, DW, DG = 402, 50, 54       # D₁ 左缘 / 框宽 / 框间距
    RX = D0 + 3 * DW + 2 * DG + 30               # 右抽头拐点（D₃ 后 30px）
    GX0, GX1, GY0, GY1 = 140, 748, 0, 280        # 外层 G 框（整个编码器）
    SX0, SX1, SY0, SY1 = 352, 720, 30, 262       # 内层 G₂ 框（bG₂）
    s = HEAD.format(w=950, h=300) + marker('arC')

    def dashh(y, x1, x2):
        return line(x1, y, x2, y, width=1.2, dash='5,4')

    def dashv(x, y1, y2, gaps=()):
        """竖虚线；gaps 里的 y 各留 ±8px 缺口（给穿框的实线让路）"""
        ys = [y1]
        for g in gaps:
            ys += [g - 8, g + 8]
        ys.append(y2)
        return ''.join(line(x, ys[i], x, ys[i + 1], width=1.2, dash='5,4')
                       for i in range(0, len(ys), 2))

    # ---- 外层 G 框、内层 G₂ 框 ----
    s += dashh(GY0, GX0, GX1) + dashh(GY1, GX0, GX1)
    s += dashv(GX0, GY0, GY1, gaps=(YS,)) + dashv(GX1, GY0, GY1, gaps=(YO,))
    s += dashh(SY0, SX0, SX1) + dashh(SY1, SX0, SX1)
    s += dashv(SX0, SY0, SY1, gaps=(YS,)) + dashv(SX1, SY0, SY1, gaps=(YO,))
    s += text(GX0 + 18, GY0 + 36, 'G', anchor='start', size=15, style='i')
    s += text(SX0 + 18, SY0 + 28, 'G_2', anchor='start', size=15, style='i')

    # ---- u → G₁ → b ----
    s += text(10, YS - 12, 'u=(u_0u_1u_2u_3)', anchor='start', style='ib')
    s += line(112, YS, 170, YS, marker='arC')
    s += rect(170, YS - 27, 62, 54) + text(201, YS + 6, 'G_1', size=15, style='i')
    s += text(246, YS - 12, 'b=(b_0b_1b_2b_3)', anchor='start', style='ib')

    # ---- b 母线 + 三级延迟 D ----
    # 抽头①在 D₁ 之前（g_0=1）；D₁ 后抽头②（g_1=1）；D₃ 后抽头③（g_3=1）。
    # 每级 D 之间补箭头，和原卷的逐级推送一致。
    s += line(232, YS, D0, YS, marker='arC') + dot(BX, YS, 3)
    for i in range(3):
        x = D0 + i * (DW + DG)
        s += rect(x, YS - 25, DW, 50) + text(x + DW / 2, YS + 6, 'D', style='i')
        if i < 2:
            s += line(x + DW, YS, x + DW + DG, YS, marker='arC')
    s += dot(AX, YS, 3)
    s += line(D0 + 2 * (DW + DG) + DW, YS, RX, YS)           # D₃ 后折上去

    # ---- 三路抽头汇入 ⊕ ----
    s += line(BX, YS, BX, YA) + line(BX, YA, AX - R, YA, marker='arC')       # 左
    s += line(AX, YS, AX, YA + R, marker='arC')                              # 下
    s += line(RX, YS, RX, YA) + line(RX, YA, AX + R, YA, marker='arC')       # 右
    s += circle(AX, YA, R)
    s += line(AX - R * .77, YA, AX + R * .77, YA) + line(AX, YA - R * .77, AX, YA + R * .77)

    # ---- ⊕ → c（上折后穿两层框的缺口出去） ----
    s += line(AX, YA - R, AX, YO) + line(AX, YO, 780, YO, marker='arC')
    s += text(794, YO + 5, 'c=(c_0c_1c_2c_3c_4c_5c_6)', anchor='start', style='ib')
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
        s += line(cx, cy, x2, y2, dash='5,4', color='#888')
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
    s += circle(cx, cy, R, dash='5,4', color='#999', width=1.2)
    s += circle(cx, cy, R / 2, dash='3,4', color='#bbb', width=1.0)

    # ① 内-内边界：坐标轴段
    for deg in (0, 90, 180, 270):
        x2, y2 = pt(cx, cy, R * APEX, deg)
        s += line(cx, cy, x2, y2, color='#888', dash='5,4', width=1.2)
    # ② 内-外边界：轴三重点 → 对角三重点（半张角 61.3°）
    for adeg in (0, 90, 180, 270):
        ax, ay = pt(cx, cy, R * APEX, adeg)
        for sgn in (+1, -1):
            ux = math.cos(math.radians(adeg + sgn * 61.3))
            uy = -math.sin(math.radians(adeg + sgn * 61.3))
            s += line(ax, ay, ax + ux * R * LEN, ay + uy * R * LEN,
                      color='#888', dash='5,4', width=1.2)
    # ③ 外-外边界：对角三重点沿对角线向外
    for sx in (+1, -1):
        for sy in (+1, -1):
            s += line(cx + sx * R * TRI, cy + sy * R * TRI,
                      cx + sx * R * WD, cy + sy * R * WD, color='#888', dash='5,4', width=1.2)

    inner = {1: 45, 3: 135, 5: 225, 7: 315}
    outer = {8: 0, 2: 90, 4: 180, 6: 270}
    # 外点标签分层（同图(a)：s_i 在点旁、二进制码再往外一层），偏移量按
    # "文字盒到点/虚线净距 ≥6px" 定：轴向外点的内-外边界线从 0.58R 处以
    # ±61.3° 引出，码标签放到 1.42R 才与 s_i、点都拉开。
    out_s = {8: (14, 5, 'start'), 2: (0, -14, 'middle'),
             4: (-14, 5, 'end'), 6: (0, 22, 'middle')}
    for i, deg in {**outer, **inner}.items():
        r = R / 2 if i in inner else R
        px, py = pt(cx, cy, r, deg)
        s += dot(px, py, 4.5)
        if i in inner:
            # 内点住在 28.7°~61.3° 的窄楔形里，标签放楔形中部（0.72R 处）才不压边界线
            lx, ly = pt(cx, cy, R * 0.72, deg)
            s += text(lx, ly + 5, f's_{i}', style='i')
        else:
            ox, oy, an = out_s[i]
            s += text(px + ox, py + oy, f's_{i}', style='i')
            bx, by = pt(cx, cy, R * 1.42, deg)
            s += text(bx, by + 5, GRAY[i], size=13, color='#333')
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
    s += line(c0, base, c0, 74, color='#999', dash='3,4', width=1.1)
    s += line(c1, base, c1, 74, color='#999', dash='3,4', width=1.1)
    s += poly(gauss_pts(c0, base, peak, sigma, max(26, c0 - 135), min(512, c0 + 135)))
    s += poly(gauss_pts(c1, base, peak, sigma, max(26, c1 - 135), min(512, c1 + 135)))
    s += line(vt, base - 2, vt, 96, width=1.6, dash='7,4', color='#c0392b')
    s += text(vt, 86, 'V_T=E_1/2', style='i', color='#c0392b')
    s += text(c0 - 52, 62, 'f(y|"0")', style='i')
    s += text(c1 + 52, 62, 'f(y|"1")', style='i')
    s += text(c0, 222, '0')
    s += text(c1, 222, 'E_1', style='i')
    s += text(512, 222, 'y', anchor='end', style='i')
    # 两条尾巴的误差概率：标在轴下方 + 引线指到对应尾巴（曲线附近没有空白，硬塞会压线）。
    # 红只留给门限 V_T 一处；P(e|s) 是次级标注 → #555，引线用灰色细箭头
    s += "<defs><marker id='arDg' markerWidth='8' markerHeight='8' refX='7' refY='3' orient='auto'>"
    s += "<path d='M0,0 L7,3 L0,6 z' fill='#999'/></marker></defs>"
    s += line(250, 236, 250, 206, color='#999', width=1.1, marker='arDg')
    s += line(292, 236, 292, 206, color='#999', width=1.1, marker='arDg')
    s += text(244, 248, 'P(e|s_1)', size=12, color='#555', anchor='end')
    s += text(298, 248, 'P(e|s_2)', size=12, color='#555', anchor='start')
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
        # 直通支路（转移概率不用红色：红只留给全图唯一的关键数值，见规范 5.2）
        s += line(82, y, xR - 8, yy[k], marker='arE')
        s += text((82 + xR) / 2, y - 9, '1/2', size=12)
    # 擦除支路：不画箭头（三个箭头会在 Y=3 处叠成一团黑），统一收到节点左侧 6px；
    # 标签各自错开 x 位置，沿线的法向下移 16px。线色线宽与直通支路一致（信号线 #1a1a1a/1.6）
    lab_x = {'0': 118, '1': 148, '2': 178}
    for k, y in xy.items():
        s += line(82, y, xR - 6, y3 - 2)
        xl = lab_x[k]
        yl = y + (y3 - 2 - y) * (xl - 82) / (xR - 6 - 82)
        s += text(xl, yl + 21, '1/2', size=12)
    return s + '</svg>'


# ------------------------------------------------------------------ 题七：量化特性
def fig_q7quant():
    s = HEAD.format(w=740, h=250) + marker('arF')
    X0, XS, YB = 60, 35, 200

    def mx(v):
        return X0 + (v + 4) * XS

    s += line(X0 - 12, YB, 350, YB, marker='arF') + text(356, YB + 5, 'x', anchor='start', style='i')
    s += line(mx(0), YB, mx(0), 80, marker='arF')
    s += poly([(mx(-4), YB), (mx(0), 100), (mx(4), YB)], close=True, fill='#f5f5f5')
    s += text(mx(0) - 8, 95, '1/4', anchor='end')
    for v in (-4, -2, 2, 4):
        s += line(mx(v), YB, mx(v), YB + 5) + text(mx(v), YB + 22, str(v))
    s += text(mx(0), YB + 22, '0')
    s += text(mx(0) - 62, 177, 'p(x)', style='i')   # 放进三角形内部，避开斜线
    X1, XS2 = 420, 35

    def mx2(v):
        return X1 + (v + 4) * XS2

    yb, ya, y_aa, y_ab = 80, 120, 160, 200
    s += line(X1 - 12, y_ab, 710, y_ab, marker='arF') + text(716, y_ab + 5, 'x', anchor='start', style='i')
    s += line(mx2(0), y_ab, mx2(0), 55, marker='arF')
    # 电平参考虚线只画在该电平真正出现的半轴：+a 在 0~2、−a 在 −2~0
    # （参考虚线统一 #999 / 1.1 / 3,4，见规范 5.2，别用 #bbb/2,3）
    s += line(mx2(0), y_aa, mx2(-2), y_aa, color='#999', width=1.1, dash='3,4')
    s += line(mx2(0), ya, mx2(2), ya, color='#999', width=1.1, dash='3,4')
    s += poly([(mx2(-4), y_ab), (mx2(-2), y_ab), (mx2(-2), y_aa), (mx2(0), y_aa),
               (mx2(0), ya), (mx2(2), ya), (mx2(2), yb), (mx2(4), yb)])
    # ±2 处已由折线的竖跳变表达，不再叠一条贯穿全高的灰虚线（视觉重复）
    s += dot(mx2(-2), y_ab, 3.5) + dot(mx2(-2), y_aa, 3.5, fill='#fff', stroke='#1a1a1a')
    s += dot(mx2(0), y_aa, 3.5) + dot(mx2(0), ya, 3.5, fill='#fff', stroke='#1a1a1a')
    s += dot(mx2(2), ya, 3.5) + dot(mx2(2), yb, 3.5, fill='#fff', stroke='#1a1a1a')
    # 4 个电平标签统一放在对应电平线的上方 4px（右对齐到 y 轴左侧 12px）
    for yy2, nm in ((yb, 'b'), (ya, 'a'), (y_aa, '−a'), (y_ab, '−b')):
        s += text(mx2(0) - 12, yy2 - 4, nm, anchor='end', style='i')
    for v in (-4, -2, 2, 4):
        s += text(mx2(v), y_ab + 22, str(v))
    s += text(mx2(0), y_ab + 22, '0')
    s += text(mx2(0), 40, 'Y=Q(x)', style='i')   # 轴名写在 y 轴顶端上方，避开箭头
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
from svgkit import PAD, tighten  # 与 2026 共用同一套收边口径（四边各留 18px）





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
# 全部图统一把 viewBox 收到内容边界（四边各留 18px），页面里居中不贴边
SVGS = {k: tighten(v, PAD) for k, v in SVGS.items()}

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
