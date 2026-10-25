#!/usr/bin/env python3
"""按真实渲染像素收紧 viewBox（比字符宽度估算准）。

思路：用 cairosvg 以 1:1 渲染 SVG，PIL 取非白像素包围盒 → 换算回 viewBox 坐标 →
四周加 pad 后写回。只改 viewBox 数值，元素坐标一律不动。

用法：
    /home/xiuming/.workbuddy/binaries/python/envs/default/bin/python tools/fit_figures_render.py 2023 [pad]

依赖：cairosvg + pillow（在 envs/default 里）。没有的话跳过即可，生成器里的
tools/svg_fit.py 启发式版本已经把留白压到 16~30px。
"""
import io
import math
import os
import re
import sys

import cairosvg
from PIL import Image, ImageChops

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
year = sys.argv[1] if len(sys.argv) > 1 else '2023'
pad = float(sys.argv[2]) if len(sys.argv) > 2 else 16.0

FIGDIR = os.path.join(ROOT, 'data', 'figures', year)


def load_js_svg(path):
    """从图 js 里取出 SVG 字符串（单引号 JS 字符串，\' 是转义引号）"""
    txt = open(path, encoding='utf-8').read()
    m = re.search(r"= '(.*)';", txt, re.S)
    if not m:
        return None, None
    raw = m.group(1)
    svg = raw.replace("\\'", "'").replace('\\\\', '\\')
    return txt, svg


def ink_bbox_px(svg):
    # cairosvg 只认第一个字体名：Helvetica 在本机不存在 → 中文整段不画，
    # 会量出偏小的包围盒把左边裁掉。测量时统一换成系统里的 CJK 字体。
    svg = re.sub(r"font-family=\"[^\"]*\"", 'font-family="Noto Sans CJK SC"', svg, count=1)
    png = cairosvg.svg2png(bytestring=svg.encode('utf-8'), scale=1.0,
                           background_color='white')
    im = Image.open(io.BytesIO(png)).convert('RGB')
    bg = Image.new('RGB', im.size, (255, 255, 255))
    diff = ImageChops.difference(im, bg)
    return diff.getbbox(), im.size


def fmt(v):
    s = ('%.1f' % v).rstrip('0').rstrip('.')
    return s if s else '0'


def process(path):
    txt, svg = load_js_svg(path)
    if not svg:
        return None
    m = re.search(r"viewBox='([-\d.]+)\s+([-\d.]+)\s+([\d.]+)\s+([\d.]+)'", svg)
    if not m:
        return None
    vx, vy, vw, vh = (float(m.group(i)) for i in range(1, 5))

    box, (pw, ph) = ink_bbox_px(svg)
    if not box:
        return None
    bx0, by0, bx1, by1 = box
    sx, sy = vw / pw, vh / ph
    ix0, iy0, ix1, iy1 = vx + bx0 * sx, vy + by0 * sy, vx + bx1 * sx, vy + by1 * sy

    nx0 = max(vx, ix0 - pad)
    ny0 = max(vy, iy0 - pad)
    nx1 = min(vx + vw, ix1 + pad)
    ny1 = min(vy + vh, iy1 + pad)
    if nx1 - nx0 < 20 or ny1 - ny0 < 20:
        return None

    old = "viewBox=\\'%s %s %s %s\\'" % (_g(m, 1), _g(m, 2), _g(m, 3), _g(m, 4))
    new_vb = '%s %s %s %s' % (fmt(nx0), fmt(ny0), fmt(nx1 - nx0), fmt(ny1 - ny0))
    # JS 里是转义的单引号；直接用数值替换更稳，避免格式差异
    txt2 = re.sub(r"viewBox=\\'[-\d. ]+\\'", "viewBox=\\'" + new_vb + "\\'", txt, count=1)
    if txt2 == txt:
        return None
    open(path, 'w', encoding='utf-8').write(txt2)
    return (round(nx0 - ix0, 1), round(ny0 - iy0, 1),
            round(nx1 - ix1, 1), round(ny1 - iy1, 1))


def _g(m, i):
    return m.group(i)


changed = 0
for dirpath, _, files in os.walk(FIGDIR):
    for f in sorted(files):
        if not f.endswith('.js') or f.startswith('_'):
            continue
        p = os.path.join(dirpath, f)
        r = process(p)
        if r is None:
            continue
        changed += 1
        flag = '' if max(abs(v) for v in r) <= 30 else '  ⚠'
        print('%-28s 留白 L/T/R/B = %s%s' % (f, '/'.join(str(v) for v in r), flag))

print('已收紧 %d 张图（pad=%g）' % (changed, pad))
