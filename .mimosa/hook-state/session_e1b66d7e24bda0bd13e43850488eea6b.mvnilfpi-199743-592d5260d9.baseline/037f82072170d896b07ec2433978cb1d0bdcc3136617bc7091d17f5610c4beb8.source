#!/usr/bin/env python3
# 生成 2026年试卷 SVG 图库（每图一个文件，输出用 ###FILE: 分隔）：
#   node tools/emit_figures.mjs 2026
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


def head_at(w, h, x0, y0):
    """viewBox 贴内容边界用：内容不在 (0,0) 起点时，用左上角偏移 (x0,y0) 裁掉多余留白"""
    base = HEAD.format(w=w, h=h)
    return base.replace("viewBox='0 0 %d %d'" % (w, h), "viewBox='%d %d %d %d'" % (x0, y0, w, h))


# ---------------------------------------------------------------- 二、m(t) 与 SSB 的谱
def fig_q2psd():
    """m(t)=4cos40πt+2cos120πt 的双边幅度谱（左）与上边带 SSB 的单边谱（右）"""
    s = HEAD.format(w=782, h=200) + marker('a26a')
    BASE = 152
    for X0, X1 in ((30, 330), (430, 730)):
        s += line(X0, BASE, X1, BASE, marker='a26a')

    def stem(x, h, lbl, col='#1a1a1a'):
        out = line(x, BASE, x, BASE - h, width=1.8, color=col)
        out += (f"<polygon points='{x-4:.1f},{BASE-h+8:.1f} {x+4:.1f},{BASE-h+8:.1f} "
                f"{x:.1f},{BASE-h:.1f}' fill='{col}'/>")
        out += text(x, BASE - h - 7, lbl, size=12, color=col)
        return out

    # 左：m(t) 双边谱，f=±20 → 4，f=±60 → 1
    # 幅度轴画在 f=0 处（双侧谱的惯例），不带箭头：否则细灰线+箭头容易被误读成一根谱线
    s += line(180, BASE, 180, 68, width=1.2, color='#888')
    s += stem(100, 66, '4') + stem(260, 66, '4')
    s += stem(60, 20, '1') + stem(300, 20, '1')
    for x, t in ((60, '−60'), (100, '−20'), (180, '0'), (260, '20'), (300, '60')):
        s += text(x, BASE + 18, t, size=12)
    s += text(188, 64, 'P_m(f)', size=13, anchor='start', style='i')
    s += text(338, BASE + 5, 'f /Hz', size=12, anchor='start')
    s += text(180, 24, 'm(t) 的双边幅度谱', size=12, color='#666')

    # 右：上边带 SSB 单边谱，1020 → 4，1060 → 1（f 轴局部展开，不按左图比例）
    s += line(480, BASE, 480, 68, width=1.2, color='#888')
    s += stem(540, 66, '4') + stem(660, 20, '1')
    for x, t in ((480, '0'), (540, '1020'), (660, '1060')):
        s += text(x, BASE + 18, t, size=12)
    for bx in (492, 502):
        s += line(bx - 4, BASE + 6, bx + 4, BASE - 6, width=1.4)
    s += text(488, 64, 'P_s(f)', size=13, anchor='start', style='i')
    s += text(742, BASE + 5, 'f /Hz', size=12, anchor='start')
    s += text(580, 24, '上边带 SSB 的单边幅度谱（f 轴局部展开）', size=12, color='#666')
    return s + '</svg>'


# ---------------------------------------------------------------- 三、接收机框图
def fig_q3recv():
    # 内容实际范围 x 8~462、y 64~172：viewBox 收边，避免全宽渲染时图偏左偏上
    s = head_at(470, 126, 0, 56) + marker('a26b')
    Y = 88
    s += text(8, Y + 5, 'r(t)', anchor='start', style='i')
    s += line(44, Y, 88, Y, marker='a26b')
    s += mul(104, Y, 14)
    s += line(118, Y, 146, Y, marker='a26b')
    # 积分器：∫ 与上下限、被积式整体居中于框内
    s += rect(148, Y - 24, 124, 48)
    s += text(166, Y + 8, '∫', size=28)
    s += text(180, Y - 9, 'T_b', size=10, anchor='start')
    s += text(180, Y + 19, '0', size=10, anchor='start')
    s += text(202, Y + 5, '(·)dt', anchor='start')
    s += line(272, Y, 300, Y, marker='a26b')
    s += text(308, Y + 5, 'y', style='i')
    s += line(322, Y, 352, Y, marker='a26b')
    s += rect(354, Y - 24, 62, 48) + text(385, Y + 5, '判决')
    s += line(416, Y, 462, Y, marker='a26b')
    # g(t) 与 V_T 输入
    s += text(104, 168, 'g(t)', style='i')
    s += line(104, 154, 104, Y + 16, marker='a26b')
    s += text(385, 168, 'V_T', style='i')
    s += line(385, 154, 385, Y + 24, marker='a26b')
    return s + '</svg>'


# ---------------------------------------------------------------- 五、16QAM 星座（试卷版）
def fig_q5stem():
    """试卷上的图：只标出 6 个星座点所对应的比特"""
    cx, cy, U = 200, 200, 32
    s = HEAD.format(w=400, h=400) + marker('a26c')
    s += line(30, cy, 372, cy, marker='a26c')
    s += line(cx, 372, cx, 30, marker='a26c')
    s += text(376, cy + 5, 'x_c', style='i', anchor='start')
    s += text(cx + 6, 26, 'x_s', style='i', anchor='start')
    marked = {(-3, 3): '1000', (3, 3): '0000', (1, 1): '0101',
              (-1, -1): '1111', (-3, -3): '1010', (3, -3): '0010'}
    for (i, j) in [(a, b) for a in (-3, -1, 1, 3) for b in (-3, -1, 1, 3)]:
        px, py = cx + i * U, cy - j * U
        s += dot(px, py, 4.2)
    for (i, j), lbl in marked.items():
        px, py = cx + i * U, cy - j * U
        s += text(px, py - 12, lbl, size=12)
    return s + '</svg>'


# ---------------------------------------------------------------- 五、16QAM Gray 映射 + 判决域
def fig_q5const():
    cx, cy, U = 220, 220, 34
    s = head_at(440, 450, 20, 0) + marker('a26d')
    # ML 判决域边界：两坐标轴 ±2 处（点间距的中点）
    for v in (-2, 2):
        s += line(cx + v * U, cy - 3 * U - 34, cx + v * U, cy + 3 * U + 34,
                  width=1.2, dash='5,4', color='#888')
        s += line(cx - 3 * U - 34, cy - v * U, cx + 3 * U + 34, cy - v * U,
                  width=1.2, dash='5,4', color='#888')
    s += line(34, cy, 424, cy, marker='a26d')
    s += line(cx, 424, cx, 34, marker='a26d')
    s += text(430, cy + 5, 'x_c', style='i', anchor='start')
    s += text(cx + 7, 32, 'x_s', style='i', anchor='start')
    grid = {
        3: ['1000', '1100', '0100', '0000'],
        1: ['1001', '1101', '0101', '0001'],
        -1: ['1011', '1111', '0111', '0011'],
        -3: ['1010', '1110', '0110', '0010'],
    }
    for j, row in grid.items():
        for k, lbl in enumerate(row):
            i = (-3, -1, 1, 3)[k]
            px, py = cx + i * U, cy - j * U
            s += dot(px, py, 4.2)
            s += text(px, py - 9, lbl, size=11)
    # 坐标轴上的短刻度（不写数字，避免与星座点标签重叠）
    for v in (-3, -1, 1, 3):
        s += line(cx + v * U, cy - 4, cx + v * U, cy + 4, width=1.2)
        s += line(cx - 4, cy - v * U, cx + 4, cy - v * U, width=1.2)
    return s + '</svg>'


# ---------------------------------------------------------------- 六、复基带 → 带通框图
def fig_q6block():
    s = HEAD.format(w=700, h=230) + marker('a26e')
    YC, YI, YQ = 115, 68, 162
    s += text(8, YC + 5, 'd(t)', anchor='start', style='i')
    s += line(46, YC, 86, YC, marker='a26e')
    s += rect(88, YC - 20, 104, 40)
    s += text(140, YC - 2, '滤波器') + text(140, YC + 14, 'g(t)', style='i')
    s += line(192, YC, 250, YC, marker='a26e')
    s += text(216, YC - 8, 'x(t)', style='i')
    # 分支
    s += line(250, YI, 250, YQ)
    s += line(250, YI, 288, YI, marker='a26e')
    s += line(250, YQ, 288, YQ, marker='a26e')
    s += dot(250, YC, 3.2)
    s += rect(290, YI - 18, 52, 36) + text(316, YI + 5, 'Re')
    s += rect(290, YQ - 18, 52, 36) + text(316, YQ + 5, 'Im')
    # 实部支路
    s += line(342, YI, 404, YI, marker='a26e') + text(372, YI - 8, 'I(t)', style='i')
    s += mul(418, YI, 13)
    s += text(418, 26, 'cos(2πf_c t)', size=13)
    s += line(418, 32, 418, YI - 14, marker='a26e')
    s += line(431, YI, 576, YI) + line(576, YI, 576, YC - 14, marker='a26e')
    # 虚部支路
    s += line(342, YQ, 404, YQ, marker='a26e') + text(372, YQ + 18, 'Q(t)', style='i')
    s += mul(418, YQ, 13)
    s += text(418, 214, '−sin(2πf_c t)', size=13)
    s += line(418, 208, 418, YQ + 14, marker='a26e')
    s += line(431, YQ, 576, YQ) + line(576, YQ, 576, YC + 14, marker='a26e')
    # 相加
    s += adder(576, YC, 14)
    s += line(590, YC, 646, YC, marker='a26e')
    s += text(654, YC + 5, 's(t)', anchor='start', style='i')
    return s + '</svg>'


# (key, 题号, 是否解析配图, 描述)。题目原图放 data/figures/<年>/，解析配图放 answer/ 子目录。
# 文件名统一"年份-题号-图名"；题目数据里仍用 fig: "key" 引用（与文件名解耦）。
FIGS = [
    ('q3recv', '三', False, '接收框图'),
    ('q5stem', '五', False, '题干框图'),
    ('q6block', '六', False, '系统框图'),
    ('q2psd', '二', True, '功率谱'),
    ('q5const', '五', True, '星座图'),
]
SVGS = {
    'q2psd': fig_q2psd(), 'q3recv': fig_q3recv(), 'q5stem': fig_q5stem(),
    'q5const': fig_q5const(), 'q6block': fig_q6block(),
}

# 每张图一个文件；输出用 ###FILE: 分隔，落盘用 node tools/emit_figures.mjs 2026。
# 页面加载由 app/scripts/sync-data.mjs 把目录（不含 _ 前缀文件）合并成 public/data/figures/<年>.js。
YEAR = '2026'
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
