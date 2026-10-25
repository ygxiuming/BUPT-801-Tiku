#!/usr/bin/env python3
"""图库预览：把某年（或某几个具体图）的 SVG 渲染成 PNG，拼成一张带图名的网格图。

一次看完整年图件，省得逐张 Read 烧上下文；网格里能直接看出留白是否一致、
图是否居中、同类图版式是否统一。需要 cairosvg + Pillow（都在 default venv 里）。

用法（在项目根目录执行）：
    python tools/preview_figures.py 2026
    python tools/preview_figures.py 2025 2026 --cols 3
    python tools/preview_figures.py 2025 --only q7quant,psk8new --out /tmp/x.png
    python tools/preview_figures.py 2026 --cell 760x470 --cols 2

产出：默认写到 /tmp/w801/figures-<年>.png（每个年份一张）；--out 只对单年份生效。
"""
import argparse
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def dump_svgs(year, dst):
    """用 node 把 data/figures/<年>/_index.js 里的图逐个落盘，并换成 CJK 字体。"""
    os.makedirs(dst, exist_ok=True)
    script = (
        "const fs=require('fs');global.window={};"
        "require(%r);"
        "const figs=window.BUPT801.figures[%r]||{};"
        "for(const [k,svg] of Object.entries(figs))"
        "  fs.writeFileSync(%r+k+'.svg',"
        "    svg.replace(/font-family=\"[^\"]*\"/,'font-family=\"Noto Sans CJK SC\"'));"
        "console.log(Object.keys(figs).length);"
        % (os.path.join(ROOT, 'data', 'figures', year, '_index.js'),
           year, dst.rstrip('/') + '/')
    )
    r = subprocess.run(['node', '-e', script], cwd=ROOT,
                       capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit('导出 %s 失败：%s' % (year, r.stderr.strip()[:400]))
    n = int((r.stdout.strip().splitlines() or ['0'])[-1])
    if n == 0:
        sys.exit('%s 没有导出任何图：先跑 node tools/emit_figures.mjs %s' % (year, year))
    return n


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('years', nargs='+')
    ap.add_argument('--out')
    ap.add_argument('--out-dir', default='/tmp/w801')
    ap.add_argument('--cols', type=int, default=3)
    ap.add_argument('--cell', default='520x400', help='单元格 WxH，图等比缩放到格内')
    ap.add_argument('--only', help='只要这几张，逗号分隔')
    ap.add_argument('--scale', type=float, default=2.0)
    a = ap.parse_args()

    if a.out and len(a.years) > 1:
        sys.exit('--out 只对单年份生效；多年份请用 --out-dir')
    cw, ch = (int(v) for v in a.cell.lower().split('x'))
    keys = set(filter(None, re.split(r'[,\s]+', a.only or '')))

    import cairosvg                                    # noqa: E402
    from PIL import Image, ImageDraw                  # noqa: E402

    os.makedirs(a.out_dir, exist_ok=True)
    for year in a.years:
        tmp = os.path.join('/tmp', 'w801', 'prev-' + year)
        dump_svgs(year, tmp)
        names = sorted(f[:-4] for f in os.listdir(tmp) if f.endswith('.svg'))
        if keys:
            names = [n for n in names if n in keys]
            missing = keys - set(names)
            if missing:
                print('警告：没有这些图 -> ' + ','.join(sorted(missing)))
        if not names:
            continue

        tiles = []
        for n in names:
            svg = os.path.join(tmp, n + '.svg')
            png = svg[:-4] + '.png'
            cairosvg.svg2png(url=svg, write_to=png, scale=a.scale,
                             background_color='white')
            im = Image.open(png).convert('RGB')
            rr = min(cw / im.width, ch / im.height, 1.0)
            if rr < 1.0:
                im = im.resize((max(1, int(im.width * rr)),
                                max(1, int(im.height * rr))), Image.LANCZOS)
            tiles.append((n, im))

        cols, pad, lab = max(1, a.cols), 10, 22
        rows = (len(tiles) + cols - 1) // cols
        W = cols * (cw + pad) + pad
        H = rows * (ch + lab + pad) + pad
        cv = Image.new('RGB', (W, H), 'white')
        d = ImageDraw.Draw(cv)
        for i, (n, im) in enumerate(tiles):
            cx = pad + (i % cols) * (cw + pad)
            cy = pad + (i // cols) * (ch + lab + pad)
            d.text((cx + 2, cy + 4), n, fill='#c00')
            cv.paste(im, (cx + (cw - im.width) // 2, cy + lab + (ch - im.height) // 2))

        dst = a.out or os.path.join(a.out_dir, 'figures-%s.png' % year)
        cv.save(dst)
        print('%s: %d 张 -> %s (%dx%d)' % (year, len(tiles), dst, W, H))


if __name__ == '__main__':
    main()
