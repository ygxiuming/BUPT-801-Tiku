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
import base64
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def dump_svgs(year, dst):
    """用 node 把 data/figures/<年>/_index.js 里的图逐个落盘，并换成 CJK 字体。

    注册值有两种：'<svg …>'（矢量）与 { src, w, h }（位图替换，assets/<key>.png 优先于 svg）。
    后者在这里现包一层 svg 外壳（18px 留白），和前端 figToSvg() 的口径一致。
    """
    os.makedirs(dst, exist_ok=True)
    script = (
        "const fs=require('fs');global.window={};"
        "require(%r);"
        "const figs=window.BUPT801.figures[%r]||{};"
        "for(const [k,svg0] of Object.entries(figs)){"
        "  let svg=svg0;"
        "  if(svg&&typeof svg==='object'&&svg.src){"
        "    const w=svg.w||1200,h=svg.h||800;"
        "    svg=\"<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' \"+"
        "      \"viewBox='0 0 \"+(w+36)+\" \"+(h+36)+\"'><image x='18' y='18' width='\"+w+\"' height='\"+h+\"' \"+"
        "      \"xlink:href='\"+svg.src+\"'/></svg>\";"
        "  }"
        "  fs.writeFileSync(%r+k+'.svg',"
        "    svg.replace(/font-family=\"[^\"]*\"/,'font-family=\"Noto Sans CJK SC\"'));"
        "}"
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


# 位图外壳里的 href 是站点绝对路径（/data/figures/<年>/assets/x.png）。
# 坑：cairosvg 只认 **base64 data URI**，既不认站点路径、也不认 file://（实测 2.9.1 三种写法只有 data 出图，
# 路径写法不报错、静默画空白）。所以预览前把外链就地换成 data URI——只改 /tmp 下的临时副本，不动仓库里的图。
HREF_SITE = re.compile(r'(xlink:href|href)=(["\'])(/data/[^"\']+)\2')
IMG_MIME = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
            '.webp': 'image/webp', '.gif': 'image/gif'}


PREVIEW_ROOT = os.path.realpath('/tmp/w801')


def inline_hrefs(svg_path):
    sp = os.path.realpath(svg_path)
    if not sp.startswith(PREVIEW_ROOT + os.sep):
        return False  # 本函数只处理 /tmp/w801 下的临时副本，越界路径一律不动
    txt = open(sp, encoding='utf-8').read()

    def rep(m):
        root = os.path.realpath(ROOT)
        f = os.path.realpath(os.path.join(ROOT, m.group(3).lstrip('/')))
        if not f.startswith(root + os.sep):
            return m.group(0)  # 越出项目根的引用一律不内联（svg 是数据文件，防 crafted 路径）
        if not os.path.exists(f):
            print('警告：%s 引用的 %s 不存在，预览里这张会是空白' % (os.path.basename(svg_path), m.group(3)))
            return m.group(0)
        mime = IMG_MIME.get(os.path.splitext(f)[1].lower(), 'image/png')
        b64 = base64.b64encode(open(f, 'rb').read()).decode()
        return '%s=%sdata:%s;base64,%s%s' % (m.group(1), m.group(2), mime, b64, m.group(2))

    out = HREF_SITE.sub(rep, txt)
    if out != txt:
        dst = os.path.realpath(svg_path)
        if not dst.startswith(PREVIEW_ROOT + os.sep):
            return False  # 越出 /tmp/w801 预览区的副本一律不写
        name = os.path.basename(dst)
        if not re.fullmatch(r'[A-Za-z0-9_.\-]+\.svg', name):
            return False  # 文件名白名单：只回写预览区里的 <key>.svg 临时副本
        cwd = os.getcwd()
        os.chdir(os.path.dirname(dst))
        try:
            fd = os.open(name, os.O_CREAT | os.O_WRONLY | os.O_TRUNC, 0o600)
            with os.fdopen(fd, 'w', encoding='utf-8') as f:
                f.write(out)
        finally:
            os.chdir(cwd)
    return out != txt


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
            inline_hrefs(svg)
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
