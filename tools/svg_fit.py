#!/usr/bin/env python3
"""SVG 贴边裁切：按"墨迹包围盒"收紧 viewBox，去掉多余留白。

为什么需要：图是按固定画布（如 700×400）画的，坐标好算但四周常空出 40~140px，
在页面里 SVG 按宽度铺满，空白就成了"图变小"。这里只改 viewBox（不动任何元素坐标），
等于等价裁剪，笔画粗细/字号不变（viewBox 与 width/height 同比，比例 1:1 保持）。

用法（在生成器里）：
    from svg_fit import fit_svg
    svg = fit_svg(svg)            # 默认四周留 16px
    svg = fit_svg(svg, pad=18)

约束：
  * 只收紧、不放大：新框一定在原框内（max/min 夹住），不会裁掉原有留白以外的内容；
  * 包围盒按 line/rect/circle/poly/path/text 估算，path 的 Q 控制点会略微高估（更安全）；
  * 文本宽度按字符类别估（CJK 1.0em、大写数字 0.62em、其它 0.52em），与 check_figure_overlap.js 一致；
  * 箭头 marker 会超出端点 ~8px，靠 pad>=14 兜住。
"""
import re

NUM = r'-?\d+(?:\.\d+)?'


def _attr(attrs, name, default=0.0):
    m = re.search(r"[\s]" + name + r"=['\"]([-\d.]+)['\"]", attrs)
    return float(m.group(1)) if m else default


def _attr_str(attrs, name, default=''):
    m = re.search(r"[\s]" + name + r"=['\"]([^'\"]*)['\"]", attrs)
    return m.group(1) if m else default


def _num_list(s):
    return [float(v) for v in re.findall(NUM, s or '')]


def _char_w(c, size):
    if '\u4e00' <= c <= '\u9fff' or '\uff00' <= c <= '\uffef':
        return size * 1.0
    if c.isdigit() or ('A' <= c <= 'Z'):
        return size * 0.62
    return size * 0.52


def _text_box(attrs, inner):
    """估算 <text> 的包围盒（基线 y 上下各留一点呼吸）"""
    x = _attr(attrs, 'x')
    y = _attr(attrs, 'y')
    size = _attr(attrs, 'font-size', 14.0) or 14.0
    anchor = _attr_str(attrs, 'anchor') or _attr_str(attrs, 'text-anchor') or 'start'

    tspans = re.findall(r"<tspan([^>]*)>([^<]*)</tspan>", inner)
    if tspans:
        w = 0.0
        top = y - size * 0.82
        bot = y + size * 0.30
        for tattrs, ttxt in tspans:
            tsize = _attr(tattrs, 'font-size', size) or size
            dy = _attr(tattrs, 'dy', 0.0)
            w += sum(_char_w(c, tsize) for c in ttxt)
            top = min(top, y + dy - tsize * 0.82)
            bot = max(bot, y + dy + tsize * 0.30)
    else:
        txt = re.sub(r'<[^>]+>', '', inner)
        w = sum(_char_w(c, size) for c in txt)
        top = y - size * 0.82
        bot = y + size * 0.30

    if anchor == 'middle':
        x0, x1 = x - w / 2, x + w / 2
    elif anchor == 'end':
        x0, x1 = x - w, x
    else:
        x0, x1 = x, x + w
    return (x0, top, x1, bot)


def ink_bbox(svg):
    box = None
    # <defs> 里的 marker 只是"图章"，其路径坐标（常为 0,0 附近）不代表画面墨迹，先剔除
    body = re.sub(r"<defs>.*?</defs>", '', svg, flags=re.S)

    def add(b):
        nonlocal box
        if b is None:
            return
        box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]),
                                     max(box[2], b[2]), max(box[3], b[3]))

    # 自闭合图元
    for tag, attrs in re.findall(r"<(line|rect|circle|poly|path)([^>]*?)/>", body):
        if tag == 'line':
            xs = [_attr(attrs, 'x1'), _attr(attrs, 'x2')]
            ys = [_attr(attrs, 'y1'), _attr(attrs, 'y2')]
            add((min(xs), min(ys), max(xs), max(ys)))
        elif tag == 'rect':
            x, y = _attr(attrs, 'x'), _attr(attrs, 'y')
            add((x, y, x + _attr(attrs, 'width'), y + _attr(attrs, 'height')))
        elif tag == 'circle':
            cx, cy, r = _attr(attrs, 'cx'), _attr(attrs, 'cy'), _attr(attrs, 'r')
            add((cx - r, cy - r, cx + r, cy + r))
        elif tag == 'poly':
            # 只取 points 属性里的坐标，别把 stroke-width 等属性的数字也当成坐标
            v = _num_list(_attr_str(attrs, 'points'))
            pts = list(zip(v[0::2], v[1::2]))
            if pts:
                add((min(p[0] for p in pts), min(p[1] for p in pts),
                     max(p[0] for p in pts), max(p[1] for p in pts)))
        elif tag == 'path':
            d = _attr_str(attrs, 'd')
            v = _num_list(d)
            pts = list(zip(v[0::2], v[1::2]))
            if pts:
                add((min(p[0] for p in pts), min(p[1] for p in pts),
                     max(p[0] for p in pts), max(p[1] for p in pts)))

    # 文本（含 tspan 上下标）
    for attrs, inner in re.findall(r"<text([^>]*)>(.*?)</text>", body, re.S):
        add(_text_box(attrs, inner))

    return box


def _fmt(v):
    s = ('%.1f' % v).rstrip('0').rstrip('.')
    return s if s else '0'


def fit_svg(svg, pad=16.0, min_gain=3.0):
    """把 viewBox 收紧到墨迹包围盒 + pad；收益太小则原样返回。"""
    m = re.search(r"viewBox='([-\d.]+)\s+([-\d.]+)\s+([\d.]+)\s+([\d.]+)'", svg)
    if not m:
        m = re.search(r'viewBox="([-\d.]+)\s+([-\d.]+)\s+([\d.]+)\s+([\d.]+)"', svg)
    if not m:
        return svg
    x0, y0, w, h = (float(m.group(i)) for i in range(1, 5))
    x1, y1 = x0 + w, y0 + h

    box = ink_bbox(svg)
    if not box:
        return svg
    bx0, by0, bx1, by1 = box
    if bx1 <= bx0 or by1 <= by0:
        return svg

    nx0 = max(x0, bx0 - pad)
    ny0 = max(y0, by0 - pad)
    nx1 = min(x1, bx1 + pad)
    ny1 = min(y1, by1 + pad)
    if nx1 - nx0 < 20 or ny1 - ny0 < 20:
        return svg
    if (nx1 - nx0) > w - min_gain and (ny1 - ny0) > h - min_gain:
        return svg

    new_vb = 'viewBox=\'%s %s %s %s\'' % (_fmt(nx0), _fmt(ny0), _fmt(nx1 - nx0), _fmt(ny1 - ny0))
    return svg[:m.start()] + new_vb + svg[m.end():]


def report(svg, name=''):
    """返回 (左, 上, 右, 下) 四边留白，供生成后自检。"""
    m = re.search(r"viewBox='([-\d.]+)\s+([-\d.]+)\s+([\d.]+)\s+([\d.]+)'", svg)
    if not m:
        return None
    x0, y0, w, h = (float(m.group(i)) for i in range(1, 5))
    box = ink_bbox(svg)
    if not box:
        return None
    return (round(box[0] - x0, 1), round(box[1] - y0, 1),
            round(x0 + w - box[2], 1), round(y0 + h - box[3], 1))
