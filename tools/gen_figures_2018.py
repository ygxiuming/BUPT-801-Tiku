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
    # 原卷为 2×2 表格：外框 + 十字分隔线
    s += rect(34, 14, 582, 252, width=1.3)
    s += line(330, 14, 330, 266, width=1.3)
    s += line(34, 140, 616, 140, width=1.3)
    return s + '</svg>'


# ---- 选择题（28）：四种载波提取方案（原卷为 2×2 网格：A/B 上排，C/D 下排） ----
CW_H = 38          # 方框统一高（容得下「窄带滤波/或锁相环」两行）
CW_GAP = 14        # 级间连线长度（框与框不能贴边，否则边框重合看着像一个框）
CW_ARROW = 26      # 进出箭头长度


def _cw_box(x, yc, w, txt):
    """载波提取方框：单行字居中；两行字（用 '\n' 分隔）时字号降一档，保持行距 14"""
    s = rect(x, yc - CW_H / 2, w, CW_H)
    if '\n' in txt:
        l1, l2 = txt.split('\n')
        s += text(x + w / 2, yc - 3, l1, size=12.5)
        s += text(x + w / 2, yc + 11, l2, size=11)
    else:
        s += text(x + w / 2, yc + 4.5, txt, size=13)
    return s


def _cw_row(x, yc, label, blocks):
    """一行框图：工号 → 箭头 → 方框 → … → 箭头。blocks=[(文字, 宽), …]，返回 (svg, 右端 x)"""
    s = text(x, yc + 5, label, size=14, anchor='start', style='bi')
    cx = x + 20
    s += line(cx, yc, cx + CW_ARROW, yc, marker='a18w')
    cx += CW_ARROW
    for i, (txt, w) in enumerate(blocks):
        if i:
            s += line(cx, yc, cx + CW_GAP, yc)
            cx += CW_GAP
        s += _cw_box(cx, yc, w, txt)
        cx += w
    s += line(cx, yc, cx + CW_ARROW, yc, marker='a18w')
    return s, cx + CW_ARROW


def fig_q28cw():
    W1, W2 = 56, 96                        # 平方框 / 窄带滤波框的宽度（窄的那个要放两行字）
    NB = '窄带滤波\n或锁相环'
    s = HEAD.format(w=520, h=176) + marker('a18w')
    y1, y2 = 40, 120                        # 上下两排信号线的高度
    c2 = 268                                # 右列起点
    s += _cw_row(6, y1, 'A', [('平方', W1), (NB, W2)])[0]
    s += _cw_row(c2, y1, 'B', [('平方', W1)])[0]
    s += _cw_row(6, y2, 'C', [(NB, W2)])[0]
    s += _cw_row(c2, y2, 'D', [(NB, W2), ('平方', W1)])[0]
    # 原卷为 2×2 表格：外框 + 十字分隔线
    s += rect(2, 10, 516, 156, width=1.3)
    s += line(259, 10, 259, 166, width=1.3)
    s += line(2, 80, 518, 80, width=1.3)
    # 原位图只有 286 宽，页面里会被撑到正文宽、字显得过大；这里给一个显示上限（矢量预览不受影响）
    return s.replace('<svg ', "<svg style='max-width:480px' ", 1) + '</svg>'


# ---- 第二题：SSB 解调框图 ----
def fig_q2demod():
    """原卷口径：s(t) 与 n_w(t) 先进相加器 ⊕，再经带通(19~26kHz)得到 r(t)；
    然后 A（带通输出）→ 乘法器 → 低通(5kHz) → B → y(t)。
    早先的图把噪声单独带通后再并到 s(t) 上、且没有相加器，与题面 r(t)=s(t)+n_w(t) 不符。"""
    s = HEAD.format(w=500, h=170) + marker('a18d')
    y = 62
    s += text(10, y + 5, 's(t)', anchor='start', style='i')
    s += line(44, y, 87, y)
    s += adder(100, y, r=13)
    s += text(88, 140, 'n_w(t)', anchor='end', style='i')
    s += line(100, 132, 100, y + 13, marker='a18d')
    s += line(113, y, 132, y, marker='a18d')
    s += box2(132, y - 19, 96, '带通', '滤波器', size=13)
    s += text(180, y + 37, '19k ~ 26kHz', size=12)
    s += line(228, y, 259, y, marker='a18d')
    s += text(243, y - 13, 'A')
    s += mul(272, y, r=13)
    s += line(272, 132, 272, y + 13, marker='a18d')
    s += text(286, 140, '2cos 2πf_ct', anchor='start', style='i', size=13)
    s += line(285, y, 306, y)
    s += box2(306, y - 19, 88, '低通', '滤波器', size=13)
    s += text(350, y + 37, '5kHz', size=12)
    s += line(394, y, 425, y, marker='a18d')
    s += text(409, y - 13, 'B')
    s += text(431, y + 5, 'y(t)', anchor='start', style='i')
    return s + '</svg>'


# ---- 第三题：g(t) 波形 ----
def _sqrt_label(right_x, y, num, rad, size=12):
    """把 "num/√rad" 右端对齐到 (right_x, y) 排出来。
    不用 '√' 字符：字体里 U+221A 的横线只覆盖一小段（有的字体干脆很短），
    缩到 12px 后常被看成“根号没有横线”。这里用折线把根号和横线画成图形，
    横线长度跟着被开方数字走，任何渲染器都不会丢。"""
    h = size * 0.86
    nw = size * 0.64 * len(str(num))        # 数字按 0.62em 估宽，再留 0.02em 余量
    sw = size * 0.55
    gap = 0.3                               # 斜杠与根号只留 0.3px（斜杠字形本身有空边，视觉上已分开）
    dw = size * 0.62 * len(str(rad))
    x = right_x - (nw + sw + gap + 0.54 * h + dw + 2)
    out = text(x, y, str(num), size=size, anchor='start')
    out += text(x + nw, y, '/', size=size, anchor='start')
    bx = x + nw + sw + gap
    out += poly([(bx, y - 0.30 * h), (bx + 0.16 * h, y - 0.38 * h),
                 (bx + 0.30 * h, y), (bx + 0.54 * h, y - h)], width=1.1)
    out += line(bx + 0.54 * h, y - h, bx + 0.56 * h + dw, y - h, width=1.1)
    out += text(bx + 0.58 * h, y - 1, str(rad), size=size * 0.92, anchor='start')
    return out


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
        if '√' in str(lab2):                       # 含根号：走矢量根号，横线一定画得出来
            num, rad = str(lab2).split('/√')
            s += _sqrt_label(ox - 8, oy - sy * v + 4, num, rad, size=12)
        else:
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
    # 原卷的辅助虚线：1/√5 高度的横线（纵轴→t=1），以及 t=1 处从横轴向上的竖线
    s += line(70, 130 - 72 * r1, 70 + 90, 130 - 72 * r1, width=1.1, dash='5,4')
    s += line(70 + 90, 130, 70 + 90, 130 - 72 * r1, width=1.1, dash='5,4')
    return s + '</svg>'


# ---- 第五题：FDM 系统框图 ----
def fig_q5sys():
    """原卷口径：四路各有一个 PCM 框，四路一起进 TDM，再 16QAM → 信道。
    A 在第 1 路 PCM 输出、B 在第 3 路 PCM 输出、C 为 TDM 输出、D 为 16QAM 输出。"""
    s = HEAD.format(w=560, h=210) + marker('a18s')
    ys = [40, 75, 110, 145]
    for i, y in enumerate(ys):
        s += text(8, y + 5, f'm_{i + 1}(t)', anchor='start', size=13, style='i')
        s += line(52, y, 80, y, marker='a18s')
        s += rect(80, y - 15, 70, 30)
        s += text(115, y + 5, 'PCM', size=13, style='i')
        s += line(150, y, 200, y)
    s += text(176, ys[0] - 8, 'A')
    s += text(176, ys[2] - 8, 'B')
    s += rect(200, 22, 42, 141)
    s += text(221, 97, 'TDM', size=13, style='i')
    s += line(242, 92, 282, 92, marker='a18s')
    s += text(262, 80, 'C')
    s += rect(282, 70, 100, 42)
    s += text(332, 96, '16QAM', size=13, style='i')
    s += text(332, 130, 'f_c = 2MHz', size=11, style='i')
    s += line(382, 92, 422, 92, marker='a18s')
    s += text(402, 80, 'D')
    s += box1(422, 77, 64, '信道', size=13)
    s += line(486, 92, 528, 92, marker='a18s')
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
    s += text(ox + 10, oy - sy + 4, '0.5', size=12, anchor='start')   # 原卷标在顶点右侧
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
    # 原卷：低平台两段 + 内凸起（其两壁在平台以上为虚线）
    s += poly([(ox - 6 * sx, oy), (ox - 6 * sx, oy - sy / 2), (ox - sx, oy - sy / 2)])
    s += poly([(ox + sx, oy - sy / 2), (ox + 6 * sx, oy - sy / 2), (ox + 6 * sx, oy)])
    s += line(ox - sx, oy - sy / 2, ox + sx, oy - sy / 2)
    s += line(ox - sx, oy - sy / 2, ox - sx, oy - sy, dash='5,4')
    s += line(ox + sx, oy - sy / 2, ox + sx, oy - sy, dash='5,4')
    s += line(ox - sx, oy - sy, ox + sx, oy - sy)
    for dx, lab in ((-6 * sx, '-6'), (-sx, '-1'), (-10, 'O'), (sx, '1'), (6 * sx, '6')):
        s += text(ox + dx, oy + 18, lab, size=12)
    s += text(ox + 6 * sx + 32, oy + 5, 'f/kHz', size=12, anchor='start', style='i')
    # 原卷：N0 在轴右侧内凸起顶部旁、N0/2 在低平台上方（+1 虚线壁右侧）
    s += text(ox + 4, oy - sy + 14, 'N_0', size=12, anchor='start', style='i')
    s += text(ox + sx + 8, oy - sy / 2 - 9, 'N_0/2', size=13, anchor='start', style='i')
    s += text(ox + 6, oy - sy - 26, 'P_{nc}(f)', size=13, anchor='start', style='i')
    return s + '</svg>'


# ---- 三(2)：匹配滤波器 h(t)=g(2-t) ----
def fig_q3h():
    s = HEAD.format(w=330, h=170) + marker('a18h')
    r2, r1 = 2 / math.sqrt(5), 1 / math.sqrt(5)
    s += _pulse_wave(70, 130, 90, 72, [(0, 1, r1), (1, 2, r2)], 'h(t)',
                     [(1, '1'), (2, '2'), (-0.13, 'O')], [(r2, '2/√5'), (r1, '1/√5')], 'a18h', ('', 't'))
    # 原卷在 2/√5 高度也有一条参考虚线（该段波形还在 1/√5，靠虚线标出上限）
    s += line(70, 130 - 72 * r2, 70 + 90, 130 - 72 * r2, width=1.1, dash='5,4')
    # 原卷另有：1/√5 高度 1→2 的虚线、t=1 从 2/√5 下到横轴的竖虚线
    s += line(70 + 90, 130 - 72 * r1, 70 + 180, 130 - 72 * r1, width=1.1, dash='5,4')
    s += line(70 + 90, 130 - 72 * r2, 70 + 90, 130, width=1.1, dash='5,4')
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


def _const(ox, oy, U, mk, pts=PTS, dim=(), labels=True):
    s = line(ox - 1.55 * U - 16, oy, ox + 1.55 * U + 26, oy, marker=mk)
    s += line(ox, oy + 1.55 * U + 16, ox, oy - 1.55 * U - 14, marker=mk)
    s += text(ox + 1.55 * U + 32, oy + 5, 'f_1(t)', size=12, anchor='start', style='i')
    s += text(ox + 6, oy - 1.55 * U - 20, 'f_2(t)', size=12, anchor='start', style='i')
    for dx, dy, lab in ((U, 16, '1'), (-U, 16, '-1')):
        s += text(ox + dx, oy + dy, lab, size=12)
    for dy, lab in ((-U + 4, '1'), (U + 4, '-1')):
        s += text(ox - 10, oy + dy, lab, size=12, anchor='end')
    for name, a, b, (pd, pdd, an) in pts:
        if name in dim:
            continue                       # 原卷：概率为 0 的点不画
        x, y = ox + a * U, oy - b * U
        s += dot(x, y, 4)
        if labels:                         # 原卷答案图不带 s_i 点标
            s += text(x + pd, y + pdd, name, size=11, anchor=an, style='i')
    return s


def fig_q4const():
    s = HEAD.format(w=320, h=300) + marker('a18c')
    ox, oy, U = 150, 150, 62
    s += _const(ox, oy, U, 'a18c', labels=False)
    return s + '</svg>'


def fig_q4reg1():
    s = HEAD.format(w=320, h=300) + marker('a18c')
    ox, oy, U = 150, 150, 62
    s += _const(ox, oy, U, 'a18c', labels=False)
    h = U / 2
    # 没有 (0,-1) 这个点，s1 与 s6(-1,-1)、s3(1,-1) 的边界是两条 45° 斜线、交汇在 (0,-1)，
    # 所以判决域是“上平、左右直、下方收尖”的盾形，不是正方形。
    s += poly([(ox - h, oy - h), (ox + h, oy - h), (ox + h, oy + h), (ox, oy + U), (ox - h, oy + h)],
              width=1.2, dash='5,4', close=True)
    return s + '</svg>'


def fig_q4reg2():
    s = HEAD.format(w=320, h=300) + marker('a18c')
    ox, oy, U = 150, 150, 62
    s += _const(ox, oy, U, 'a18c', dim=('s_7',), labels=False)
    h = U / 2
    pts = [(ox - h, oy - h), (ox, oy - U), (ox + h, oy - h),
           (ox + h, oy + h), (ox, oy + U), (ox - h, oy + h)]
    s += poly(pts, width=1.2, dash='5,4', close=True)
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
    return s + '</svg>'


# ---- 五(3)：16QAM 调制 / 解调框图（按原卷重画） ----
def fig_q5moddem():
    """原卷口径：调制 = 串并变换 →（每路两根线）→ D/A → 根升余弦频谱成型(α=1) →
    ⊗（振荡器 f_c=2MHz 直供上路、经 90° 供下路）→ ⊕ → 16QAM 信号；
    解调 = 接收信号 → ⊗×2（载波恢复经 90° 正交两路）→ 根号升余弦匹配滤波(α=1) →
    抽样开关 → 4进制判决 →（每路两根线）→ 并串转换。图内无多余说明文字。"""
    s = HEAD.format(w=760, h=580) + marker('a18m')
    # ---------------- 调制 ----------------
    s += text(14, 158, 'R_C', size=13, anchor='start', style='i')
    s += line(44, 152, 88, 152, marker='a18m')
    s += rect(88, 60, 46, 250)
    s += text(111, 172, '串并') + text(111, 196, '变换')
    for y0_, y1_ in ((96, 116), (276, 296)):        # 每路两根线进 D/A
        s += line(134, y0_, 168, y0_, marker='a18m')
        s += line(134, y1_, 168, y1_, marker='a18m')
    for yb, yc in ((70, 106), (250, 286)):
        s += rect(168, yb, 64, 52) + text(200, yc + 5, 'D/A', size=13, style='i')
        s += line(232, yc, 258, yc, marker='a18m')
        s += rect(258, yc - 36, 130, 72)
        s += text(323, yc - 14, '根升余弦', size=13) + text(323, yc + 8, '频谱成型', size=13)
        s += text(323, yc - 50, 'α = 1', size=13, style='i')
        s += line(388, yc, 424, yc, marker='a18m')
    s += mul(438, 106, 14)
    s += mul(438, 286, 14)
    # 载波：振荡器 → 上 ⊗；经 90° → 下 ⊗
    s += text(398, 183, 'f_c = 2MHz', size=13, anchor='end', style='i')
    s += circle(415, 178, 13) + text(415, 183, '~', size=14)
    s += line(428, 178, 436, 178, marker='a18m')
    s += line(438, 120, 438, 178)
    s += rect(416, 196, 44, 36) + text(438, 219, '90°', size=13)
    s += line(438, 232, 438, 272, marker='a18m')
    s += line(452, 106, 545, 106) + line(545, 106, 545, 182, marker='a18m')
    s += line(452, 286, 545, 286) + line(545, 286, 545, 210, marker='a18m')
    s += adder(585, 196, 14)
    s += line(599, 196, 648, 196, marker='a18m')
    s += text(654, 201, '16QAM 信号', size=13, anchor='start', style='i')
    # ---------------- 解调 ----------------
    s += text(14, 415, '接收信号', size=13, anchor='start')
    s += line(72, 410, 100, 410, marker='a18m')
    s += dot(104, 410, 3.5)
    s += line(104, 340, 104, 480)
    s += line(104, 340, 140, 340, marker='a18m')
    s += line(104, 480, 140, 480, marker='a18m')
    s += mul(154, 340, 14)
    s += mul(154, 480, 14)
    s += line(154, 354, 154, 384)
    s += rect(132, 384, 44, 36) + text(154, 407, '90°', size=13)
    s += line(154, 420, 154, 466, marker='a18m')
    s += rect(214, 362, 104, 36) + text(266, 385, '载波恢复', size=13)
    s += line(214, 380, 160, 380, marker='a18m')
    for yb, yc in ((310, 340), (450, 480)):
        s += line(168, yc, 204, yc, marker='a18m')
        s += rect(204, yb, 150, 60)
        s += text(279, yc - 8, '根号升余弦', size=13) + text(279, yc + 14, '匹配滤波', size=13)
        s += text(279, yb - 14, 'α = 1', size=13, style='i')
        # 抽样开关
        s += line(354, yc, 376, yc)
        s += dot(379, yc, 3)
        s += line(379, yc, 405, yc - 18)
        s += line(399, yc - 22, 411, yc - 10)
        s += dot(425, yc, 3)
        s += line(425, yc, 441, yc, marker='a18m')
        s += rect(441, yb, 104, 60)
        s += text(493, yc - 8, '4进制', size=13) + text(493, yc + 14, '判决', size=13)
        s += line(545, yc - 12, 578, yc - 12, marker='a18m')
        s += line(545, yc + 12, 578, yc + 12, marker='a18m')
    s += rect(578, 300, 48, 220)
    s += text(602, 398, '并串') + text(602, 426, '转换')
    s += line(626, 410, 668, 410, marker='a18m')
    return s + '</svg>'


# ---- 六(2)：哈夫曼编码树（横向“阶梯”版式，与原卷参考图同款） ----
def fig_q6huf():
    """哈夫曼树：叶在左（符号＋概率）、根在右、码字列在最右。

    8 个联合符号：1/4×1、1/8×5、1/16×2 → 码长 2、3×5、4×2；
    平均码长 = 1/4×2 + 5×1/8×3 + 2×1/16×4 = 23/8 比特/符号。
    行序与参考图一致（概率降序），码字与解析正文一致：
    {A,c}=10、{A,a}=010、{B,b}=011、{B,d}=000、{C,c}=001、{D,d}=110、
    {C,a}=1110、{D,b}=1111。
    版式照参考图走“阶梯”：母节点与较高那一支同一行（于是同一行上会依次出现
    1/8 → 1/4 → 1/2 的合并链），较低那一支用一根竖杆接上来；母概率写在竖杆右侧，
    0/1 标在各自引线上方，由码字逐位反推，与右侧码字列一一对上
    （竖杆被别的引线横穿处断开 12px，表示两线不相连）。
    """
    leaves = [('Ac', '{A,c}', '1/4', '10'),
              ('Aa', '{A,a}', '1/8', '010'),
              ('Bb', '{B,b}', '1/8', '011'),
              ('Bd', '{B,d}', '1/8', '000'),
              ('Cc', '{C,c}', '1/8', '001'),
              ('Dd', '{D,d}', '1/8', '110'),
              ('Ca', '{C,a}', '1/16', '1110'),
              ('Db', '{D,b}', '1/16', '1111')]
    # (母, 上支, 下支, 母概率, 上支标号, 下支标号)；列序 = 自下而上的合并次序
    merges = [('M1', 'Ca', 'Db', '1/8', '0', '1'),      # 1/16 + 1/16
              ('M2', 'Dd', 'M1', '1/4', '0', '1'),      # 1/8 + 1/8
              ('M3', 'Bd', 'Cc', '1/4', '0', '1'),      # 1/8 + 1/8
              ('M4', 'Aa', 'Bb', '1/4', '0', '1'),      # 1/8 + 1/8
              ('M5', 'M4', 'M3', '1/2', '1', '0'),      # 1/4 + 1/4
              ('M6', 'Ac', 'M2', '1/4', '0', '1'),      # 1/4 + 1/4
              ('RT', 'M5', 'M6', '', '0', '1')]         # 1/2 + 1/2
    Y0, DY = 44, 52                        # 叶行基线 / 行距
    XN, XP, XW = 88, 96, 132               # 符号名（右对齐）/ 概率（左对齐）/ 引线起点
    C0, GAP, LW = 190, 76, 39              # 第 1 列 / 列距 / 母概率占位宽
    CX = 706                               # 码字列

    y = {k: Y0 + i * DY for i, (k, *_1) in enumerate(leaves)}
    x_in = {k: XW for k, *_1 in leaves}    # 本节点引线的起点（在本节点标签右侧）
    col = {}
    for i, (mid, u, l, pr, bu, bl) in enumerate(merges, 1):
        col[mid] = C0 + (i - 1) * GAP if mid != 'RT' else C0 + 6 * GAP + 20
        y[mid] = min(y[u], y[l])           # 母节点落在较高那一支的同一行（阶梯式）
        x_in[mid] = col[mid] + LW
    parent = {}
    for mid, u, l, *_1 in merges:
        parent[u] = parent[l] = mid
    bars = [(col[m[0]], min(y[m[1]], y[m[2]]), max(y[m[1]], y[m[2]])) for m in merges]
    wires = [(x_in[k], col[parent[k]], y[k]) for k in y if k in parent]

    s = HEAD.format(w=760, h=470)
    for x0, x1, yy in wires:                                 # 引线：本节点标签右侧 → 母竖杆
        s += line(x0, yy, x1, yy, width=1.4)
    for bx, b0, b1 in bars:                                  # 竖杆：被别的引线横穿处断 12px
        cuts = sorted(yy for x0, x1, yy in wires
                      if x0 + 2 < bx < x1 - 2 and b0 + 7 < yy < b1 - 7)
        segs, cur = [], b0
        for yy in cuts:
            segs.append((cur, yy - 6))
            cur = yy + 6
        segs.append((cur, b1))
        for a_, b_ in segs:
            s += line(bx, a_, bx, b_, width=1.4)
    s += line(col['RT'], y['RT'], col['RT'] + 24, y['RT'], width=1.4)   # 根出线 → 码字列
    for mid, u, l, pr, bu, bl in merges:
        cx = col[mid]
        s += text(cx - 8, y[u] - 6, bu, size=11, anchor='end')
        s += text(cx - 8, y[l] - 6, bl, size=11, anchor='end')
        if pr:                                               # 根的概率 1 不写
            s += text(cx + 7, y[mid] + 4, pr, size=12, anchor='start')
    for k, name, pr, code in leaves:
        s += text(XN, y[k] + 4, name, size=12, anchor='end', style='i')
        s += text(XP, y[k] + 4, pr, size=12, anchor='start')
        s += text(CX, y[k] + 4, code, size=12, anchor='start')
    return s + '</svg>'


# ---- 八(5)：(2,1,4) 卷积码编码器（按原卷重画：无文字标注，输出经转换开关） ----
def fig_q8enc():
    """g1(D)=1+D³+D⁴ 取 {u, D³, D⁴}，g2(D)=1+D+D⁴ 取 {u, D¹, D⁴}；
    4 级移位寄存器共用，u 与 D⁴ 各有一条贯通上下的汇流线，两个模 2 加法器分列上下，
    两路输出分别走顶部/底部水平线接到转换开关（原卷样式，原卷图内无文字）。"""
    s = HEAD.format(w=680, h=310) + marker('a18e')
    y0 = 150
    s += line(24, y0, 120, y0, marker='a18e')
    for x in (120, 190, 260, 330):
        s += box1(x, y0 - 15, 44, 'D')
    for a_, b_ in ((164, 190), (234, 260), (304, 330), (374, 398)):
        s += line(a_, y0, b_, y0)
    for x in (90, 177, 317, 390):
        s += dot(x, y0, 3.5)
    yt, yb = 60, 240
    # 上 ⊕ = u ⊕ D³ ⊕ D⁴
    s += line(90, y0, 90, yt) + line(90, yt, 326, yt, marker='a18e')
    s += adder(340, yt, 13)
    s += line(317, y0, 317, 95) + line(317, 95, 352, 95) + line(352, 95, 352, 133, marker='a18e')
    s += line(390, y0, 390, yt) + line(390, yt, 354, yt, marker='a18e')
    s += line(340, 47, 340, 30) + line(340, 30, 560, 30) + line(560, 30, 560, 114)
    # 下 ⊕ = u ⊕ D¹ ⊕ D⁴
    s += line(90, y0, 90, yb) + line(90, yb, 326, yb, marker='a18e')
    s += adder(340, yb, 13)
    s += line(177, y0, 177, 195) + line(177, 195, 340, 195) + line(340, 195, 340, 226, marker='a18e')
    s += line(390, y0, 390, yb) + line(390, yb, 354, yb, marker='a18e')
    s += line(340, 253, 340, 270) + line(340, 270, 560, 270) + line(560, 270, 560, 166)
    # 转换开关（原卷样式：两触点 + 掷向上一路的臂 + 输出）
    s += dot(560, 118, 2.6) + dot(560, 168, 2.6)
    s += dot(612, 144, 3)
    s += line(612, 144, 563, 119)
    s += line(612, 144, 655, 144, marker='a18e')
    return s + '</svg>'


# ---------------------------------------------------------------- 输出
FIGS = [
    ('q14xf', '三四五', False, 'X(f) 四图（选择14-16）'),
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
    'q14xf': fig_q14xf(), 'q28cw': fig_q28cw(),
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
requires.append('./' + YEAR + '-十七-q17eye.js')  # 选择17：原卷扫描图直接嵌入（tools/embed_figure_images.mjs 生成）
for r in requires:
    print('require("' + r + '");')
