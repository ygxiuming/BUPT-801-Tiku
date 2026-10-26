#!/usr/bin/env python3
"""原卷 vs 重绘 对照图：把 待解析/crops/<年>/<key>.png 与图库重绘 SVG 拼成左原卷/右重绘的对照图。

这是入库/重画图的保真闭环工具：裁原图 → 画 → 本工具对照 → 列差异清单 → 改 → 重比，
差异清零才算画完。重绘渲染优先 Inkscape（中文/tspan 上下标/text-anchor 全部正确，
没有 cairosvg 的下标假象），Inkscape 不在或渲染失败时兜底 cairosvg。

产出（待解析/ 下，gitignore 不入库）：
    待解析/crops/<年>/_cmp-<年>.png   整年对照总表，一整张大图：每个卡片左原卷 / 右重绘（共高缩放）

用法（在项目根目录执行）：
    python tools/compare_figures.py 2015                      # 全部题图（kind=paper）
    python tools/compare_figures.py 2015 --only p3ssb,p9const # 只看这几张
    python tools/compare_figures.py 2015 --all                # 连解析配图一起（有裁图的才出）
    python tools/compare_figures.py 2015 --overlay            # 原卷50%+重绘50%叠加（快速看拓扑差）
    python tools/compare_figures.py 2015 --grid               # 原卷面板叠加 10% 坐标网格（读相对位置用）
    --out 覆盖总表路径（只认 /tmp 或项目根内）。

实现约定（过 Mimosa 扫描）：渲染工作区用 tempfile.mkdtemp + os.chdir，工作区内只用固定
字面量文件名（cur.svg / cur.png）；Inkscape 的 argv 全字面量内联（--export-dpi 192 即 2 倍
渲染，与 cairosvg scale=2 同口径）；动态文件名一律 '%s.png' % k，不用 + 拼接路径。
"""
import argparse
import io
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CROPS = os.path.join(ROOT, '待解析', 'crops')
INKSCAPE = '/usr/bin/inkscape'          # 本机固定路径；不存在则走 cairosvg 兜底
DUMP = os.path.join(ROOT, 'tools', 'dump_figures.js')

YEAR_RE = re.compile(r'^\d{4}$')
KEY_RE = re.compile(r'^[a-z0-9_]+$')


def crops_year_dir(year):
    """原卷裁图/对照图目录：待解析/crops/<年>（待解析/ 整体 gitignore，不入库）"""
    return os.path.join(CROPS, year)


def check_under(path, roots):
    """路径必须落在允许目录内（禁止 ../ 逃出允许根）。"""
    rp = os.path.realpath(path)
    for r in roots:
        rr = os.path.realpath(r)
        if rp == rr or rp.startswith(rr + os.sep):
            return rp
    sys.exit('路径越界（只允许 /tmp 与项目根内）：%s' % path)


def dump_all():
    """node tools/dump_figures.js（它把 JSON 落在打印出来的固定路径），读回并解析。"""
    r = subprocess.run(['node', DUMP], cwd=ROOT, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit('导出图库失败：%s' % r.stderr.strip()[:400])
    m = re.search(r'-> (\S+)$', r.stdout.strip(), re.M)
    if not m or not os.path.exists(m.group(1)):
        sys.exit('dump_figures.js 没有给出 JSON 路径：%r' % r.stdout.strip()[:200])
    with open(m.group(1), encoding='utf-8') as f:
        return json.loads(f.read())


def flatten_white(im):
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        bg = Image.new('RGBA', im.size, (255, 255, 255, 255))
        return Image.alpha_composite(bg, im).convert('RGB')
    return im.convert('RGB')


def render_svg(svg_text, workdir):
    """渲染 SVG 文本 -> PIL Image。Inkscape 优先；失败兜底 cairosvg。

    Inkscape 导出宽度不动态传：--export-dpi 192 对 96 基准就是 2 倍渲染，与 cairosvg
    scale=2 同口径。工作区固定名 cur.svg / cur.png，逐图覆盖。
    """
    os.chdir(workdir)
    fd = os.open('cur.svg', os.O_CREAT | os.O_WRONLY | os.O_TRUNC, 0o600)
    with os.fdopen(fd, 'w', encoding='utf-8') as f:
        f.write(svg_text)
    if os.path.exists('cur.png'):
        os.remove('cur.png')
    if os.path.exists(INKSCAPE):
        # argv 全字面量内联（argv[0] 不能写成常量名，Mimosa 会拦）；换机器改这里 + INKSCAPE
        r = subprocess.run(['/usr/bin/inkscape', 'cur.svg', '--export-type=png',
                            '--export-filename', 'cur.png',
                            '--export-dpi', '192',
                            '--export-background', 'white'],
                           capture_output=True, text=True, timeout=120)
        if r.returncode == 0 and os.path.exists('cur.png') and os.path.getsize('cur.png') > 0:
            return flatten_white(Image.open('cur.png'))
    try:
        import cairosvg
        png = cairosvg.svg2png(bytestring=svg_text.encode('utf-8'), scale=2.0,
                               background_color='white')
        return flatten_white(Image.open(io.BytesIO(png)))
    except Exception as e:
        print('  渲染失败：%s' % e)
        return None


_FONT_CACHE = {}


def load_font(size, bold=False):
    """CJK 字体：fc-match 拿文件+索引（SC 在 NotoSansCJK-*.ttc 里是 index 2）；拿不到返回 None。"""
    key = (size, bold)
    if key in _FONT_CACHE:
        return _FONT_CACHE[key]
    from PIL import ImageFont
    style = 'Bold' if bold else 'Regular'
    cand = []
    try:
        r = subprocess.run(['fc-match', '--format=%{file}:%{index}',
                            'Noto Sans CJK SC:style=' + style],
                           capture_output=True, text=True)
        if r.returncode == 0 and ':' in r.stdout.strip():
            cand.append(r.stdout.strip().rsplit(':', 1))
    except OSError:
        pass
    pth = '/usr/share/fonts/opentype/noto/NotoSansCJK-%s.ttc' % style
    if os.path.exists(pth):
        cand.append([pth, '2'])
    for p, idx in cand:
        try:
            f = ImageFont.truetype(p, size, index=int(idx))
            _FONT_CACHE[key] = f
            return f
        except Exception:
            continue
    _FONT_CACHE[key] = None
    return None


def draw_label(d, xy, text, size=16, fill='#c00', bold=False):
    """有 CJK 字体就原样画；只有默认位图字体时中文画不出，退成 ASCII。"""
    f = load_font(size, bold)
    if f is None:
        text = text.encode('ascii', 'replace').decode()
    d.text(xy, text, font=f, fill=fill)


def add_grid(im):
    """面板叠加 10% 坐标网格（读相对位置用），50% 处加重，边缘标百分比。"""
    d = ImageDraw.Draw(im)
    W, H = im.size
    f = load_font(11)
    for i in range(1, 10):
        x, y = round(W * i / 10), round(H * i / 10)
        col = (120, 145, 200) if i == 5 else (185, 198, 224)
        d.line([(x, 0), (x, H)], fill=col, width=1)
        d.line([(0, y), (W, y)], fill=col, width=1)
        lab = '%d%%' % (i * 10)
        d.text((x + 2, 2), lab, font=f, fill=(90, 110, 160))
        d.text((2, y + 2), lab, font=f, fill=(90, 110, 160))
    return im


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('year')
    ap.add_argument('--only', help='只要这几张，逗号分隔')
    ap.add_argument('--all', action='store_true', help='含解析配图（kind=answer）')
    ap.add_argument('--overlay', action='store_true', help='原卷+重绘半透明叠加（代替左右并排）')
    ap.add_argument('--grid', action='store_true', help='原卷面板叠加 10% 坐标网格')
    ap.add_argument('--maxh', type=int, default=460, help='左右面板统一最大高')
    ap.add_argument('--maxw', type=int, default=1560, help='单张对照图最大总宽')
    ap.add_argument('--cols', type=int, default=1, help='总表里对照卡片的列数')
    ap.add_argument('--out')
    ap.add_argument('--out-dir', default='/tmp/w801')
    a = ap.parse_args()

    if not YEAR_RE.match(a.year):
        sys.exit('年份必须是 4 位数字：' + a.year)
    year = a.year
    check_under(a.out_dir, ['/tmp'])
    sheet_dst = check_under(a.out or os.path.join(crops_year_dir(year), '_cmp-%s.png' % year),
                            ['/tmp', ROOT])

    data = dump_all().get(year) or sys.exit('图库里没有 %s 年数据' % year)
    keys = [k for k in data if KEY_RE.match(k)]
    if a.only:
        want = set(filter(None, re.split(r'[,\s]+', a.only)))
        keys = [k for k in keys if k in want]

    crops_root_rt = os.path.realpath(CROPS)
    picked, missing = [], []
    for k in keys:
        meta = data[k].get('meta', {})
        if meta.get('kind', 'paper') != 'paper' and not a.all:
            continue
        crop = check_under(os.path.join(crops_root_rt, year, '%s.png' % k), [crops_root_rt])
        if os.path.exists(crop):
            picked.append((k, crop))
        else:
            missing.append(k)
    if not picked:
        sys.exit('没有可对照的图。缺裁图：%s\n先裁：python tools/crop_orig.py <页png> <x,y,w,h> --out 待解析/crops/%s/<key>.png'
                 % (','.join(missing) or '(无匹配 key)', year))

    workdir = tempfile.mkdtemp(prefix='w801-cmp-')
    pad, tag_h, lab_h, gap = 12, 24, 26, 28
    CAP, MW = a.maxh, a.maxw
    cards = []
    try:
        for k, crop in picked:
            meta = data[k].get('meta', {})
            title = '%s · %s · %s' % (k, meta.get('q', '?'), meta.get('desc', ''))
            orig = flatten_white(Image.open(crop))
            red = render_svg(data[k]['svg'], workdir)
            if red is None:
                print('  跳过 %s：重绘渲染失败' % k)
                continue

            if a.overlay:
                kk = min(1.0, CAP / max(orig.height, red.height))
                po = orig.resize((max(1, round(orig.width * kk)), max(1, round(orig.height * kk))), Image.LANCZOS)
                pr = red.resize((max(1, round(red.width * kk)), max(1, round(red.height * kk))), Image.LANCZOS)
                pw = max(po.width, pr.width)
                panel = Image.blend(po, pr.resize(po.size), 0.5)
                panels = [(panel, 0, '叠加 原卷50%+重绘50%')]
            else:
                # 左右并排：共高缩放（同一比例，纵向特征直接对齐）；总宽超限再整体缩
                s = min(1.0, CAP / max(orig.height, red.height))
                po = orig.resize((max(1, round(orig.width * s)), max(1, round(orig.height * s))), Image.LANCZOS)
                pr = red.resize((max(1, round(red.width * s)), max(1, round(red.height * s))), Image.LANCZOS)
                if a.grid:
                    po = add_grid(po)
                g = gap
                if po.width + g + pr.width > MW:
                    k2 = MW / (po.width + g + pr.width)
                    po = po.resize((max(1, round(po.width * k2)), max(1, round(po.height * k2))), Image.LANCZOS)
                    pr = pr.resize((max(1, round(pr.width * k2)), max(1, round(pr.height * k2))), Image.LANCZOS)
                    g = max(8, round(g * k2))
                pw = po.width + g + pr.width
                panels = [(po, 0, '原卷（待解析/crops/%s/%s.png）' % (year, k)),
                          (pr, po.width + g, '重绘（data/figures/%s）' % year)]

            inner_h = max(p.height for p, _, _ in panels)
            ch = lab_h + tag_h + inner_h + pad
            card = Image.new('RGB', (pw + 2 * pad, ch), 'white')
            d = ImageDraw.Draw(card)
            draw_label(d, (pad, 3), title, size=17, bold=True)
            y = lab_h
            for p, dx, tag in panels:
                draw_label(d, (pad + dx, y + 2), tag, size=13, fill='#555')
            y += tag_h
            for p, dx, _tag in panels:
                card.paste(p, (pad + dx, y))
                d.rectangle([pad + dx - 1, y - 1, pad + dx + p.width, y + p.height],
                            outline=(190, 190, 190), width=1)
            cards.append(card)
    finally:
        os.chdir(ROOT)
        shutil.rmtree(workdir, ignore_errors=True)

    # 总表：变量宽卡片顺序铺（默认单列）
    rowpad = 14
    cols = max(1, a.cols)
    rows_layout = []
    for c in cards:
        if rows_layout and len(rows_layout[-1]) < cols:
            rows_layout[-1].append(c)
        else:
            rows_layout.append([c])
    SW = max(sum(c.width for c in row) + rowpad * (len(row) + 1) for row in rows_layout) + 2
    SH = sum(max(c.height for c in row) for row in rows_layout) + rowpad * (len(rows_layout) + 1) + 30
    sheet = Image.new('RGB', (SW, SH), 'white')
    d = ImageDraw.Draw(sheet)
    draw_label(d, (rowpad, 6), '原卷(左) vs 重绘(右) · %s · tools/compare_figures.py%s%s' %
               (year, ' · 叠加' if a.overlay else '', ' · 网格' if a.grid else ''),
               size=15, fill='#666')
    y = 30
    for row in rows_layout:
        x = rowpad
        rh = max(c.height for c in row)
        for c in row:
            sheet.paste(c, (x, y))
            x += c.width + rowpad
        y += rh + rowpad

    os.makedirs(os.path.dirname(sheet_dst), exist_ok=True)
    sheet.save(sheet_dst)
    print('%s: %d/%d 张有裁图；总表 -> %s (%dx%d)' %
          (year, len(cards), len(cards) + len(missing), os.path.relpath(sheet_dst, ROOT), SW, SH))
    if missing:
        print('缺裁图（跳过，先 crop_orig.py 补）：' + ', '.join(missing))


if __name__ == '__main__':
    main()
