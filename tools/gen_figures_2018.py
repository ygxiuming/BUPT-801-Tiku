#!/usr/bin/env python3
# 生成 2018 年试卷 SVG 图库（每图一个文件，输出用 ###FILE: 分隔）：
#   node tools/emit_figures.mjs 2018
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


def box1(x, y, w, txt, size=14):
    """单行方框（高 30）"""
    return rect(x, y, w, 30) + text(x + w / 2, y + 20, txt, size=size)


def box2(x, y, w, t1, t2, size=14):
    """双行方框（高 38，行基线 16/31）"""
    return rect(x, y, w, 38) + text(x + w / 2, y + 16, t1, size=size) + text(x + w / 2, y + 31, t2, size=size)


HEAD = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {w} {h}' "
        "font-family=\"Helvetica,Arial,'PingFang SC','Microsoft YaHei',sans-serif\" font-size='14'>")


# ================================================================ 题图
# ---- 选择题（14）（15）（16）：四个 X(f) ----
def _xf_panel(ox, oy, label, kind, hw, tw, H, ticks, mk):
    s = line(ox - hw - 26, oy, ox + hw + 30, oy, marker=mk)
    s += line(ox, oy, ox, oy - H - 14, marker=mk)
    if kind == 'rect':
        pts = [(ox - hw, oy), (ox - hw, oy - H), (ox + hw, oy - H), (ox + hw, oy)]
    elif kind == 'trap':
        pts = [(ox - hw, oy), (ox - tw, oy - H), (ox + tw, oy - H), (ox + hw, oy)]
    else:
        pts = [(ox - hw, oy), (ox, oy - H), (ox + hw, oy)]
    s += poly(pts)
    s += text(ox - hw - 40, oy - H - 4, label, anchor='start')
    s += text(ox + 5, oy - H - 20, 'X(f)', size=12, anchor='start', style='i')
    s += text(ox + hw + 34, oy + 5, 'f/Hz', size=12, anchor='start', style='i')
    for dx, lab in ticks:
        s += text(ox + dx, oy + 18, lab, size=12)
    return s


def fig_q14xf():
    s = HEAD.format(w=640, h=280) + marker('a18x')
    s += _xf_panel(180, 74, 'A', 'rect', 40, 0, 44, [(-40, '-100'), (-9, 'O'), (40, '100')], 'a18x')
    s += _xf_panel(480, 74, 'B', 'rect', 80, 0, 44, [(-80, '-200'), (-9, 'O'), (80, '200')], 'a18x')
    s += _xf_panel(180, 218, 'C', 'trap', 80, 40, 44,
                   [(-80, '-200'), (-40, '-100'), (-9, 'O'), (40, '100'), (80, '200')], 'a18x')
    s += _xf_panel(480, 218, 'D', 'tri', 80, 0, 44, [(-80, '-200'), (-9, 'O'), (80, '200')], 'a18x')
    return s + '</svg>'


# ---- 选择题（17）：四幅眼图 ----
def _eye_panel(px, py, pw, ph, traces, label, wline=1.0):
    s = rect(px, py, pw, ph, width=1.2)
    for tr in traces:
        pts = [(px + 6 + t / 2 * (pw - 12), py + ph / 2 - v * (ph / 2 - 10)) for t, v in tr]
        s += poly(pts, width=wline)
    s += text(px - 12, py + ph / 2 + 5, label, anchor='end', style='bi')
    return s


def _step(v0, v1, u):
    return v0 + (v1 - v0) * (0.5 - 0.5 * math.cos(math.pi * max(0.0, min(1.0, u))))


def _eye_clean(bits, w, n=13):
    """无 ISI 的眼图轨迹：bits[k] 为第 k 个符号的电平，跳变宽度 w（以 Tb 为单位），中心在符号边界"""
    ts = [2.0 * i / (n - 1) for i in range(n)]
    out = []
    for t in ts:
        i = int(math.floor(t))
        u = t - i
        if u < w / 2:
            v = _step(bits.get(i - 1, bits.get(i, 0)), bits.get(i, 0), (u + w / 2) / w)
        elif u > 1 - w / 2:
            v = _step(bits.get(i, 0), bits.get(i + 1, bits.get(i, 0)), (u - (1 - w / 2)) / w)
        else:
            v = bits.get(i, 0)
        out.append((t, v))
    return out


def _eye_isi(bits, W, n=17):
    """成形脉冲为宽度 W·Tb 的三角波：W>2 时在抽样时刻各轨迹相交（眼闭合）"""
    out = []
    for i in range(n):
        t = 2.0 * i / (n - 1)
        v = 0.0
        for k, b in bits.items():
            u = t - (k + 0.5)
            if abs(u) < W / 2:
                v += b * (1 - 2 * abs(u) / W)
        out.append((t, v))
    return out


def fig_q17eye():
    s = HEAD.format(w=560, h=340)
    PW, PH = 200, 120
    # A：抽样时刻眼闭合（严重码间干扰）；三角脉冲宽度 4Tb，轨迹最大值 2 → 乘 0.45 保证不出框
    trA = [[(t, v * 0.45) for t, v in _eye_isi({-1: a, 0: b, 1: c, 2: d}, 4.0)]
           for a in (1, -1) for b in (1, -1) for c in (1, -1) for d in (1, -1)]
    # B：理想眼图（完全张开）
    trB = [_eye_clean({-1: a, 0: b, 1: c, 2: c}, 0.26)
           for a in (1, -1) for b in (1, -1) for c in (1, -1)]
    # C：四电平眼图（电平多、线迹密，抽样时刻仍张开）
    L4 = [1, 1 / 3, -1 / 3, -1]
    trC = [_eye_clean({-1: a, 0: b, 1: c, 2: c}, 0.30, 9)
           for a in L4 for b in L4 for c in L4]
    # D：定时抖动（交叉点左右模糊，抽样时刻仍张开）
    trD = []
    for jit in (-0.14, -0.07, 0.0, 0.07, 0.14):
        for b in ((1, 1, -1), (1, -1, 1), (-1, 1, -1), (-1, -1, 1)):
            trD.append([(min(2.0, max(0.0, t + jit)), v) for t, v in
                        _eye_clean({-1: b[0], 0: b[1], 1: b[2], 2: b[2]}, 0.22)])
    s += _eye_panel(120, 20, PW, PH, trA, 'A', 0.9)
    s += _eye_panel(380, 20, PW, PH, trB, 'B')
    s += _eye_panel(120, 190, PW, PH, trC, 'C', 0.7)
    s += _eye_panel(380, 190, PW, PH, trD, 'D', 0.9)
    s += text(120, 336, '横轴：0~2T_b（最佳抽样时刻在两个“眼睛”中央）', size=12, anchor='start', color='#666')
    return s + '</svg>'


# ---- 选择题（28）：四种载波提取方案 ----
def _cw_panel(x, y, label, seq):
    """seq: [('in',), ('box',txt), ('nbox',t1,t2), ('out',)]；yc 为信号线高度"""
    yc = y + 15
    s = text(x, yc + 5, label, anchor='start', style='bi')
    cx = x + 26
    for item in seq:
        if item[0] == 'in':
            s += line(cx, yc, cx + 24, yc, marker='a18w')
            cx += 24
        elif item[0] == 'out':
            s += line(cx, yc, cx + 30, yc, marker='a18w')
            cx += 30
        elif item[0] == 'box':
            s += box1(cx, yc - 15, 66, item[1])
            cx += 66
        else:
            s += box2(cx, yc - 19, 104, item[1], item[2])
            cx += 104
    return s


def fig_q28cw():
    s = HEAD.format(w=430, h=250) + marker('a18w')
    NB = ('nbox', '窄带滤波', '或锁相环')
    s += _cw_panel(20, 30, 'A', [('in',), ('box', '平方'), NB, ('out',)])
    s += _cw_panel(20, 95, 'B', [('in',), ('box', '平方'), ('out',)])
    s += _cw_panel(20, 145, 'C', [('in',), NB, ('out',)])
    s += _cw_panel(20, 205, 'D', [('in',), NB, ('box', '平方'), ('out',)])
    return s + '</svg>'


# ---- 第二题：SSB 解调框图 ----
def fig_q2demod():
    s = HEAD.format(w=520, h=160) + marker('a18d')
    s += text(12, 55, 's(t)', anchor='start', style='i')
    s += line(44, 50, 215, 50)
    s += text(12, 115, 'n_w(t)', anchor='start', style='i')
    s += line(48, 110, 78, 110, marker='a18d')
    s += box2(78, 91, 88, '带通滤波', '19k~26kHz', size=13)
    s += line(166, 110, 215, 110)
    s += line(215, 110, 215, 50)
    s += dot(215, 50, 3.5)
    s += line(215, 50, 267, 50)
    s += text(240, 38, 'A')
    s += mul(280, 50)
    s += line(280, 14, 280, 37)
    s += text(286, 20, '2cos(2πf_ct)', size=13, anchor='start', style='i')
    s += line(293, 50, 320, 50)
    s += box2(320, 31, 76, '低通滤波', '5kHz')
    s += line(396, 50, 442, 50, marker='a18d')
    s += text(412, 38, 'B')
    s += text(448, 55, 'y(t)', anchor='start', style='i')
    return s + '</svg>'


# ---- 第三题：g(t) 波形 ----
def _pulse_wave(ox, oy, sx, sy, segs, lab, ticks, ylabs, mk, title):
    """segs: [(t0,t1,value)...] 阶梯波"""
    s = line(ox - 16, oy, ox + sx * 2.9, oy, marker=mk)
    s += line(ox, oy, ox, oy - sy * 1.25, marker=mk)
    pts, cur = [], None
    for t0, t1, v in segs:
        if cur is None:
            pts.append((ox + sx * t0, oy - sy * v))
        elif abs(cur - v) > 1e-9:
            pts.append((ox + sx * t0, oy - sy * cur))
            pts.append((ox + sx * t0, oy - sy * v))
        pts.append((ox + sx * t1, oy - sy * v))
        cur = v
    pts.append((ox + sx * 2, oy))
    s += poly(pts)
    for t, lab2 in ticks:
        s += text(ox + sx * t, oy + 18, lab2, size=12)
    for v, lab2 in ylabs:
        s += text(ox - 8, oy - sy * v + 4, lab2, size=12, anchor='end')
        s += line(ox - 4, oy - sy * v, ox, oy - sy * v, width=1.2)
    s += text(ox + sx * 3.0, oy + 5, title[1], size=13, anchor='start', style='i')
    s += text(ox + 6, oy - sy * 1.32, lab, size=13, anchor='start', style='i')
    return s


def fig_q3g():
    s = HEAD.format(w=330, h=170) + marker('a18g')
    r2, r1 = 2 / math.sqrt(5), 1 / math.sqrt(5)
    s += _pulse_wave(70, 130, 90, 72, [(0, 1, r2), (1, 2, r1)], 'g(t)',
                     [(1, '1'), (2, '2'), (-0.13, 'O')], [(r2, '2/√5'), (r1, '1/√5')], 'a18g', ('', 't'))
    return s + '</svg>'


# ---- 第五题：FDM 系统框图 ----
def fig_q5sys():
    s = HEAD.format(w=620, h=250) + marker('a18s')
    # A 路：m1、m2 → PCM
    for i, y in enumerate((30, 50)):
        s += text(8, y + 5, f'm_{i + 1}(t)', anchor='start', size=13, style='i')
        s += line(56, y, 96, y, marker='a18s')
    s += box2(96, 21, 88, 'PCM', '8kHz×8bit', size=13)
    s += line(184, 40, 236, 40)
    s += dot(236, 40, 3.5)
    s += text(236, 28, 'A')
    # B 路：m3、m4 → PCM
    for i, y in enumerate((130, 150)):
        s += text(8, y + 5, f'm_{i + 3}(t)', anchor='start', size=13, style='i')
        s += line(56, y, 96, y, marker='a18s')
    s += box2(96, 121, 88, 'PCM', '4kHz×8bit', size=13)
    s += line(184, 140, 236, 140)
    s += dot(236, 140, 3.5)
    s += text(236, 158, 'B')
    # 复接 → 16QAM
    s += line(236, 40, 236, 60)
    s += line(236, 140, 236, 74)
    s += line(236, 60, 262, 60)
    s += line(236, 74, 262, 74)
    s += box1(262, 52, 78, '复接')
    s += line(340, 67, 396, 67)
    s += dot(366, 67, 3.5)
    s += text(366, 55, 'C')
    s += box2(396, 48, 96, '16QAM', 'f_c=2MHz', size=13)
    s += line(492, 67, 548, 67, marker='a18s')
    s += dot(520, 67, 3.5)
    s += text(520, 55, 'D')
    return s + '</svg>'


# ---- 第七题：p(x) 三角分布 ----
def fig_q7pdf():
    s = HEAD.format(w=340, h=200) + marker('a18p')
    ox, oy, sx, sy = 170, 150, 62, 116
    s += line(ox - 2 * sx - 20, oy, ox + 2 * sx + 24, oy, marker='a18p')
    s += line(ox, oy, ox, oy - sy - 18, marker='a18p')
    s += poly([(ox - 2 * sx, oy), (ox, oy - sy), (ox + 2 * sx, oy)])
    s += line(ox, oy - sy, ox - 5, oy - sy, width=1.2)
    for dx, lab in ((-2 * sx, '-2'), (-9, 'O'), (2 * sx, '2')):
        s += text(ox + dx, oy + 18, lab, size=12)
    s += text(ox - 9, oy - sy + 4, '0.5', size=12, anchor='end')
    s += text(ox + 2 * sx + 30, oy + 5, 'x', size=13, anchor='start', style='i')
    s += text(ox + 6, oy - sy - 24, 'p(x)', size=13, anchor='start', style='i')
    return s + '</svg>'


# ================================================================ 解析图
# ---- 二(3)：nc(t) 功率谱 ----
def fig_q2psd():
    s = HEAD.format(w=420, h=200) + marker('a18n')
    ox, oy, sx, sy = 200, 150, 26, 60          # 1kHz = 26px；N0 = 60px
    s += line(ox - 6 * sx - 22, oy, ox + 6 * sx + 26, oy, marker='a18n')
    s += line(ox, oy, ox, oy - sy - 20, marker='a18n')
    pts = [(ox - 6 * sx, oy), (ox - 6 * sx, oy - sy / 2), (ox - sx, oy - sy / 2),
           (ox - sx, oy - sy), (ox + sx, oy - sy), (ox + sx, oy - sy / 2),
           (ox + 6 * sx, oy - sy / 2), (ox + 6 * sx, oy)]
    s += poly(pts)
    for dx, lab in ((-6 * sx, '-6'), (-sx, '-1'), (-10, 'O'), (sx, '1'), (6 * sx, '6')):
        s += text(ox + dx, oy + 18, lab, size=12)
    s += text(ox + 6 * sx + 32, oy + 5, 'f/kHz', size=12, anchor='start', style='i')
    # 电平标注放空白区：N0 在中央凸起左侧、N0/2 在低平台上方，都不压线
    s += line(ox - sx, oy - sy, ox - sx - 9, oy - sy, width=1.2)
    s += text(ox - sx - 15, oy - sy + 4, 'N_0', size=13, anchor='end', style='i')
    s += text(ox - 3.2 * sx - 22, oy - sy / 2 - 11, 'N_0/2', size=13, anchor='start', style='i')
    s += text(ox + 6, oy - sy - 26, 'P_{nc}(f)', size=13, anchor='start', style='i')
    return s + '</svg>'


# ---- 三(2)：匹配滤波器 h(t)=g(2-t) ----
def fig_q3h():
    s = HEAD.format(w=330, h=170) + marker('a18h')
    r2, r1 = 2 / math.sqrt(5), 1 / math.sqrt(5)
    s += _pulse_wave(70, 130, 90, 72, [(0, 1, r1), (1, 2, r2)], 'h(t)',
                     [(1, '1'), (2, '2'), (-0.13, 'O')], [(r2, '2/√5'), (r1, '1/√5')], 'a18h', ('', 't'))
    s += text(70, 168, 'h(t)=g(T_b-t),  T_b=2s', size=12, anchor='start', color='#666', style='i')
    return s + '</svg>'


# ---- 四：星座图与判决域 ----
PTS = [('s_1', 0, 0, (-7, 15, 'end')), ('s_2', -1, 1, (-8, -6, 'end')), ('s_3', 1, -1, (9, 16, 'start')),
       ('s_4', 1, 0, (11, 18, 'start')), ('s_5', 1, 1, (9, -6, 'start')), ('s_6', -1, -1, (-9, 17, 'end')),
       ('s_7', 0, 1, (9, -6, 'start')), ('s_8', -1, 0, (6, -12, 'start'))]


def _const(ox, oy, U, mk, pts=PTS, dim=()):
    s = line(ox - 1.55 * U - 16, oy, ox + 1.55 * U + 26, oy, marker=mk)
    s += line(ox, oy + 1.55 * U + 16, ox, oy - 1.55 * U - 14, marker=mk)
    s += text(ox + 1.55 * U + 32, oy + 5, 'f_1(t)', size=12, anchor='start', style='i')
    s += text(ox + 6, oy - 1.55 * U - 20, 'f_2(t)', size=12, anchor='start', style='i')
    for dx, dy, lab in ((U, 16, '1'), (-U, 16, '-1')):
        s += text(ox + dx, oy + dy, lab, size=12)
    for dy, lab in ((-U + 4, '1'), (U + 4, '-1')):
        s += text(ox - 10, oy + dy, lab, size=12, anchor='end')
    for name, a, b, (pd, pdd, an) in pts:
        x, y = ox + a * U, oy - b * U
        if name in dim:
            s += circle(x, y, 4, color='#888', width=1.4)
        else:
            s += dot(x, y, 4)
        s += text(x + pd, y + pdd, name, size=11, anchor=an, style='i')
    return s


def fig_q4const():
    s = HEAD.format(w=320, h=300) + marker('a18c')
    ox, oy, U = 150, 150, 62
    s += _const(ox, oy, U, 'a18c')
    s += line(ox, oy, ox + U, oy, width=1.4, color='#c00')
    s += text(ox + U / 2, oy - 8, 'd_{min}=1', size=12, anchor='middle', color='#c00')
    return s + '</svg>'


def fig_q4reg1():
    s = HEAD.format(w=320, h=300) + marker('a18c')
    ox, oy, U = 150, 150, 62
    s += _const(ox, oy, U, 'a18c')
    h = U / 2
    s += poly([(ox - h, oy - h), (ox + h, oy - h), (ox + h, oy + h), (ox - h, oy + h)],
              stroke='#888', width=1.2, dash='5,4', close=True)
    s += text(ox + h - 6, oy - h + 14, 'D_1', size=12, anchor='end', color='#555', style='i')
    return s + '</svg>'


def fig_q4reg2():
    s = HEAD.format(w=320, h=300) + marker('a18c')
    ox, oy, U = 150, 150, 62
    s += _const(ox, oy, U, 'a18c', dim=('s_7',))
    h = U / 2
    pts = [(ox - h, oy - h), (ox, oy - 2 * h - 0), (ox + h, oy - h),
           (ox + h, oy + h), (ox, oy + U), (ox - h, oy + h)]
    pts = [(ox - h, oy - h), (ox, oy - U), (ox + h, oy - h),
           (ox + h, oy + h), (ox, oy + U), (ox - h, oy + h)]
    s += poly(pts, stroke='#888', width=1.2, dash='5,4', close=True)
    s += text(ox + h - 6, oy - h + 14, 'D_1', size=12, anchor='end', color='#555', style='i')
    s += text(ox + U + 30, oy - U - 10, 'P(s_7)=0', size=12, anchor='start', color='#666', style='i')
    return s + '</svg>'


# ---- 四(2)：s5(t) 波形 ----
def fig_q4s5():
    s = HEAD.format(w=340, h=190) + marker('a18w5')
    ox, oy, sx, sy = 70, 150, 120, 46
    s += line(ox - 16, oy, ox + sx * 1.35, oy, marker='a18w5')
    s += line(ox, oy, ox, oy - sy * 2 - 20, marker='a18w5')
    s += poly([(ox, oy - sy * 2), (ox + sx / 2, oy - sy * 2), (ox + sx / 2, oy)])
    for t, lab in ((0.5, '1/2'), (1, '1'), (-0.1, 'O')):
        s += text(ox + sx * t, oy + 18, lab, size=12)
    s += text(ox - 9, oy - sy * 2 + 4, '2', size=12, anchor='end')
    s += line(ox, oy - sy * 2, ox - 5, oy - sy * 2, width=1.2)
    s += text(ox + sx * 1.4, oy + 5, 't', size=13, anchor='start', style='i')
    s += text(ox + 8, oy - sy * 2 - 12, 's_5(t)', size=13, anchor='start', style='i')
    return s + '</svg>'


# ---- 五(2)：D 点功率谱（α=1 升余弦） ----
def fig_q5psd():
    s = HEAD.format(w=460, h=210) + marker('a18q')
    ox, oy, sx, sy = 230, 160, 3.6, 108
    s += line(ox - 48 * sx - 22, oy, ox + 48 * sx + 26, oy, marker='a18q')
    s += line(ox, oy, ox, oy - sy - 22, marker='a18q')
    pts = []
    for i in range(81):
        f = -48 + 96 * i / 80
        v = 0.5 * (1 + math.cos(math.pi * abs(f) / 48))
        pts.append((ox + sx * f, oy - sy * v))
    s += poly(pts)
    for dx, lab in ((-48, '-48'), (-8, 'O'), (48, '48')):
        s += text(ox + sx * dx, oy + 18, lab, size=12)
    s += text(ox + 48 * sx + 32, oy + 5, 'f-f_c/kHz', size=12, anchor='start', style='i')
    s += text(ox + 6, oy - sy - 28, 'P_D(f)', size=13, anchor='start', style='i')
    s += line(ox, oy, ox, oy - sy, width=1.1, dash='3,4', color='#999')
    s += text(ox, oy + 42, 'α=1：无平坦段，边界 f_c±48kHz 处按升余弦降到 0', size=12,
              anchor='middle', color='#666')
    return s + '</svg>'


# ---- 五(3)：16QAM 调制 / 解调框图 ----
def fig_q5moddem():
    s = HEAD.format(w=620, h=470) + marker('a18m')
    # ---------------- 调制 ----------------
    s += text(14, 24, '调制', size=13, anchor='start', color='#666')
    s += text(14, 92, 'R_C=192kbit/s', size=12, anchor='start', style='i')
    s += line(14, 100, 108, 100, marker='a18m')
    s += box2(108, 81, 84, '串/并变换', '4bit/符号', size=13)
    s += line(192, 100, 214, 100)
    s += line(214, 60, 214, 140)
    s += dot(214, 100, 3.5)
    s += line(214, 60, 236, 60, marker='a18m')
    s += line(214, 140, 236, 140, marker='a18m')
    s += text(222, 52, 'I', size=12, anchor='start', style='i')
    s += text(222, 160, 'Q', size=12, anchor='start', style='i')
    for y, carr, cy in ((60, 'cos 2πf_ct', 26), (140, 'sin 2πf_ct', 178)):
        s += box1(236, y - 15, 52, 'D/A')
        s += line(288, y, 306, y)
        s += box2(306, y - 19, 78, '成形滤波', 'α=1', size=13)
        s += line(384, y, 402, y)
        s += mul(415, y)
        s += line(415, cy, 415, y - (13 if y == 60 else -13), marker='a18m')
        s += text(423, cy + (4 if y == 60 else -4), carr, size=13, anchor='start', style='i')
        s += line(428, y, 452, y)
    s += line(452, 60, 452, 93)
    s += line(452, 140, 452, 107)
    s += adder(470, 100)
    s += line(452, 93, 457, 93)
    s += line(452, 107, 457, 107)
    s += line(483, 100, 540, 100, marker='a18m')
    s += text(546, 105, '16QAM 已调信号', size=13, anchor='start')
    s += text(306, 200, '两路载波正交（90°）', size=12, anchor='start', color='#666')
    # ---------------- 解调 ----------------
    dy = 260
    s += text(14, dy - 12, '解调', size=13, anchor='start', color='#666')
    s += text(12, dy + 44, 'r(t)', size=13, anchor='start', style='i')
    s += line(44, dy + 40, 70, dy + 40)
    s += line(70, dy, 70, dy + 80)
    s += dot(70, dy + 40, 3.5)
    s += line(70, dy, 92, dy, marker='a18m')
    s += line(70, dy + 80, 92, dy + 80, marker='a18m')
    s += text(78, dy - 8, 'I', size=12, anchor='start', style='i')
    s += text(78, dy + 100, 'Q', size=12, anchor='start', style='i')
    for y, carr in ((dy, '2cos 2πf_ct'), (dy + 80, '-2sin 2πf_ct')):
        s += mul(105, y)
        s += line(105, y - 40 if y == dy else y + 40, 105, y - 13 if y == dy else y + 13, marker='a18m')
        s += text(113, y - 36 if y == dy else y + 32, carr, size=13, anchor='start', style='i')
        s += line(118, y, 140, y)
        s += box2(140, y - 19, 78, '低通滤波', 'α=1', size=13)
        s += line(218, y, 236, y)
        s += box2(236, y - 19, 82, '抽样判决', '2bit', size=13)
        s += line(318, y, 344, y)
    s += line(344, dy, 344, dy + 33)
    s += line(344, dy + 80, 344, dy + 47)
    s += line(344, dy + 33, 352, dy + 33)
    s += line(344, dy + 47, 352, dy + 47)
    s += box2(352, dy + 21, 84, '并/串变换', '4bit/符号', size=13)
    s += line(436, dy + 40, 492, dy + 40, marker='a18m')
    s += text(498, dy + 45, '192kbit/s', size=13, anchor='start')
    return s + '</svg>'


# ---- 六(2)：哈夫曼编码树 ----
def fig_q6huf():
    s = HEAD.format(w=700, h=430)
    ys = [60 + 44 * i for i in range(8)]
    lab = ['(A,c) 1/4', '(A,a) 1/8', '(B,b) 1/8', '(B,d) 1/8',
           '(C,c) 1/8', '(D,d) 1/8', '(C,a) 1/16', '(D,b) 1/16']
    LX, C3, C2, C1, C0 = 200, 315, 430, 545, 660
    n78 = (C3, (ys[6] + ys[7]) / 2)
    n23 = (C2, (ys[1] + ys[2]) / 2)
    n45 = (C2, (ys[3] + ys[4]) / 2)
    n678 = (C2, (ys[5] + n78[1]) / 2)
    nA = (C1, (ys[0] + n23[1]) / 2)
    nB = (C1, (n45[1] + n678[1]) / 2)
    root = (C0, (nA[1] + nB[1]) / 2)
    edges = [((LX, ys[0]), nA, '0'), ((LX, ys[1]), n23, '0'), ((LX, ys[2]), n23, '1'),
             ((LX, ys[3]), n45, '0'), ((LX, ys[4]), n45, '1'), ((LX, ys[5]), n678, '0'),
             ((LX, ys[6]), n78, '0'), ((LX, ys[7]), n78, '1'),
             (n23, nA, '1'), (n45, nB, '0'), (n78, n678, '1'), (n678, nB, '1'),
             (nA, root, '0'), (nB, root, '1')]
    for a, b, bit in edges:
        s += line(a[0], a[1], b[0], b[1], width=1.2)
        t = 0.82
        bx, by = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
        dy = -7 if a[1] < b[1] else 15
        s += text(bx, by + dy, bit, size=12, color='#555')
    for i in range(8):
        s += dot(LX, ys[i], 4)
        s += text(LX - 12, ys[i] + 5, lab[i], size=12, anchor='end', style='i')
    for nd in (n23, n45, n678, n78, nA, nB, root):
        s += circle(nd[0], nd[1], 4, width=1.4)
    s += text(LX - 12, 30, '联合符号  P', size=12, anchor='end', color='#666')
    s += text(200, 424, '码字自根节点沿 0/1 分支读出（如 (A,c)→00、(C,a)→1110），平均码长 23/8 比特/符号对',
              size=12, anchor='start', color='#666')
    return s + '</svg>'


# ---- 八(5)：(2,1,4) 卷积码编码器 ----
def fig_q8enc():
    s = HEAD.format(w=640, h=320) + marker('a18e')
    y0 = 160
    s += text(12, y0 + 5, 'u', size=13, anchor='start', style='i')
    s += line(26, y0, 110, y0, marker='a18e')
    xs = [110, 190, 270, 350, 430]          # S0..S4 抽头点
    dxs = [130, 210, 290, 370]              # D 盒左边界
    for i, x in enumerate(dxs):
        s += box1(x, y0 - 15, 40, 'D')
    s += line(110, y0, 130, y0)
    s += line(170, y0, 210, y0)
    s += line(250, y0, 290, y0)
    s += line(330, y0, 370, y0)
    s += line(410, y0, xs[4], y0)
    for x in (xs[0], xs[1], xs[3], xs[4]):  # S2 未参与生成，不画节点
        s += dot(x, y0, 3.5)
    A1, A2 = 520, 60
    s += adder(A1, A2, r=16)
    s += adder(A1, 260, r=16)
    # 上支路 c1 = u + S3 + S4（1+D^3+D^4）
    for x, sy in ((xs[0], A2 - 8), (xs[3], A2), (xs[4], A2 + 8)):
        s += line(x, y0, x, sy)
        s += line(x, sy, A1 - 15.5, sy)
    s += line(A1, A2 - 16, A1, 26)
    s += line(A1, 26, 600, 26, marker='a18e')
    s += text(606, 31, 'c^{(1)}', size=13, anchor='start', style='i')
    s += text(470, 42, 'g^{(1)}(D)=1+D^3+D^4', size=12, anchor='end', color='#555', style='i')
    # 下支路 c2 = u + S1 + S4（1+D+D^4）
    for x, sy in ((xs[0], 268), (xs[1], 260), (xs[4], 252)):
        s += line(x, y0, x, sy)
        s += line(x, sy, A1 - 15.5, sy)
    s += line(A1, 276, A1, 300)
    s += line(A1, 300, 600, 300, marker='a18e')
    s += text(606, 305, 'c^{(2)}', size=13, anchor='start', style='i')
    s += text(470, 288, 'g^{(2)}(D)=1+D+D^4', size=12, anchor='end', color='#555', style='i')
    s += text(26, 26, '码率 1/2、约束长度 K=5、状态数 2^4=16', size=12, anchor='start', color='#666')
    return s + '</svg>'


# ---------------------------------------------------------------- 输出
FIGS = [
    ('q14xf', '三四五', False, 'X(f) 四图（选择14-16）'),
    ('q17eye', '十七', False, '眼图四幅（选择17）'),
    ('q28cw', '廿八', False, '载波提取四方案（选择28）'),
    ('q2demod', '二', False, '解调框图'),
    ('q3g', '三', False, 'g(t) 波形'),
    ('q5sys', '五', False, 'FDM 系统框图'),
    ('q7pdf', '七', False, 'p(x) 概率密度'),
    ('q2psd', '二', True, 'nc(t) 功率谱'),
    ('q3h', '三', True, '匹配滤波器 h(t)'),
    ('q4const', '四', True, '星座图'),
    ('q4s5', '四', True, 's5(t) 波形'),
    ('q4reg1', '四', True, 's1 判决域（8 点等概）'),
    ('q4reg2', '四', True, 's1 判决域（s7 概率为 0）'),
    ('q5psd', '五', True, 'D 点功率谱'),
    ('q5moddem', '五', True, '16QAM 调制解调框图'),
    ('q6huf', '六', True, '哈夫曼编码树'),
    ('q8enc', '八', True, '卷积码编码器'),
]
SVGS = {
    'q14xf': fig_q14xf(), 'q17eye': fig_q17eye(), 'q28cw': fig_q28cw(),
    'q2demod': fig_q2demod(), 'q3g': fig_q3g(), 'q5sys': fig_q5sys(), 'q7pdf': fig_q7pdf(),
    'q2psd': fig_q2psd(), 'q3h': fig_q3h(), 'q4const': fig_q4const(), 'q4s5': fig_q4s5(),
    'q4reg1': fig_q4reg1(), 'q4reg2': fig_q4reg2(), 'q5psd': fig_q5psd(),
    'q5moddem': fig_q5moddem(), 'q6huf': fig_q6huf(), 'q8enc': fig_q8enc(),
}
# 全部图统一把 viewBox 收到内容边界（四边各留 18px）：图居中、不贴边。
SVGS = {k: tighten(v, PAD) for k, v in SVGS.items()}

YEAR = '2018'
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
