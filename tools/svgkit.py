#!/usr/bin/env python3
"""图库公共收边工具：把 viewBox 收到"内容包围盒 + 统一留白"。

所有年份的生成器都调 `tighten(svg, margin=PAD)`，保证：
  * 四边留白一致（默认 18px），图形在页面里居中、不贴边、不被裁；
  * 不依赖画布尺寸，元素坐标不用改（等价裁剪，笔画粗细/字号不变）。

包围盒按 line/rect/circle/polygon/path(M) 与 text（估算字宽）统计；
text 的宽高口径与 tools/check_figure_overlap.js 一致。
"""
import re

PAD = 18  # 四边统一留白（px）

CJK = re.compile(r'[\u4e00-\u9fff\uff00-\uffef]')


def _charw(c, size):
    if CJK.match(c):
        return size * 1.0
    if c.isupper() or c.isdigit():
        return size * 0.62
    return size * 0.52


_SEG = re.compile(r'([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)')
_NUM = re.compile(r'-?\d*\.?\d+')


def _path_points(d):
    """把 path 的 d 拆成点集（绝对坐标；小写命令按相对位移累加）。

    两个坑都在这里：
      * 以前只抓 `M` 后的数字，`d='M.. C..'` 会漏掉控制点、曲线鼓包被裁；
      * `poly` 画的箭头是 `M55,32 l9,-4 l0,8 z`（小写相对命令），当成绝对值
        会凭空生出 (9,-4) 这种点，把包围盒拉到左上角。
    """
    pts, cx, cy = [], 0.0, 0.0
    for cmd, arg in _SEG.findall(d):
        u, rel = cmd.upper(), cmd.islower()
        if u == 'Z':
            continue
        nums = [float(v) for v in _NUM.findall(arg)]
        if u in 'HV':                       # 单轴段：配一个当前坐标
            for v in nums:
                if u == 'H':
                    cx = cx + v if rel else v
                else:
                    cy = cy + v if rel else v
                pts.append((cx, cy))
            continue
        if u == 'A':                        # 弧：只取端点，避免 flags 被当成坐标
            for i in range(0, len(nums) - 6, 7):
                nx, ny = nums[i + 5], nums[i + 6]
                cx, cy = (cx + nx, cy + ny) if rel else (nx, ny)
                pts.append((cx, cy))
            continue
        step = {'M': 2, 'L': 2, 'T': 2, 'C': 6, 'S': 4, 'Q': 4}.get(u, 2)
        for i in range(0, len(nums) - step + 1, step):
            for j in range(i, i + step, 2):
                nx, ny = nums[j], nums[j + 1]
                px, py = (cx + nx, cy + ny) if rel else (nx, ny)
                pts.append((px, py))
                cx, cy = px, py
    return pts


def content_bbox(svg):
    """扫一遍 SVG 基本图元 + 文字（估算字宽），返回 (x0,y0,x1,y1)；无内容返回 None。

    先剔除 `<defs>`：箭头 marker 的 `M0,0 L7,3 L0,6 z` 是"图形定义"不是墨迹，
    留着会把包围盒拉到原点，收边等于没做（四边留白变成 L/T 远大于 R/B）。
    """
    svg = re.sub(r'<defs>.*?</defs>', '', svg, flags=re.S)
    xs, ys = [], []

    def put(x, y):
        xs.append(x)
        ys.append(y)

    for m in re.finditer(r"<line x1='([-\d.]+)' y1='([-\d.]+)' x2='([-\d.]+)' y2='([-\d.]+)'", svg):
        put(float(m.group(1)), float(m.group(2)))
        put(float(m.group(3)), float(m.group(4)))
    for m in re.finditer(r"<circle cx='([-\d.]+)' cy='([-\d.]+)' r='([-\d.]+)'", svg):
        cx, cy, r = float(m.group(1)), float(m.group(2)), float(m.group(3))
        put(cx - r, cy - r)
        put(cx + r, cy + r)
    for m in re.finditer(r"<rect x='([-\d.]+)' y='([-\d.]+)' width='([-\d.]+)' height='([-\d.]+)'", svg):
        x, y, w, h = [float(m.group(i)) for i in (1, 2, 3, 4)]
        put(x, y)
        put(x + w, y + h)
    for m in re.finditer(r"<polygon points='([^']+)'", svg):
        nums = [float(v) for v in re.split(r'[\s,]+', m.group(1).strip())]
        for i in range(0, len(nums) - 1, 2):
            put(nums[i], nums[i + 1])
    for m in re.finditer(r"<path d='([^']+)'", svg):
        for px, py in _path_points(m.group(1)):
            put(px, py)
    for m in re.finditer(r"<text x='([-\d.]+)' y='([-\d.]+)' text-anchor='(\w+)'([^>]*)>(.*?)</text>", svg, re.S):
        x, y, anchor, attrs, inner = (float(m.group(1)), float(m.group(2)),
                                      m.group(3), m.group(4), m.group(5))
        base = int((re.search(r"font-size='(\d+)'", attrs) or [0, 14])[1])
        chunks = re.findall(r"<tspan[^>]*font-size='(\d+)'[^>]*>([^<]*)</tspan>", inner)
        if chunks:
            w = sum(_charw(c, int(sz)) for sz, txt in chunks for c in txt)
        else:
            w = sum(_charw(c, base) for c in re.sub(r'<[^>]+>', '', inner))
        x0 = x - w / 2 if anchor == 'middle' else (x - w if anchor == 'end' else x)
        put(x0, y - base * 0.80)
        put(x0 + w, y + base * 0.2)
    if not xs:
        return None
    return min(xs), min(ys), max(xs), max(ys)


def tighten(svg, margin=PAD):
    """把 viewBox 收到内容边界 + margin（四边等宽），返回新的 SVG 字符串。"""
    bb = content_bbox(svg)
    if not bb:
        return svg
    x0, y0, x1, y1 = bb
    vx, vy = x0 - margin, y0 - margin
    vw, vh = (x1 - x0) + 2 * margin, (y1 - y0) + 2 * margin
    return re.sub(r"viewBox='[-\d. ]+'",
                  "viewBox='%d %d %d %d'" % (round(vx), round(vy), round(vw), round(vh)), svg, count=1)
