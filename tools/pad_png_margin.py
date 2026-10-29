#!/usr/bin/env python
"""给截图 PNG 的四周垫白边，垫到每边内容离边 ≥ pct×图宽（只加白边、不裁内容、不挪已达标边）。

背景：截图按墨迹紧裁，内容会贴到图块边缘（2026-二-q2psd 四边全 0）。位图外壳只给
18 个 viewBox 单位的留白，所以白边要在 PNG 内部垫够。SVG 图不用这个——tighten(PAD=18) 已保证。

用法：
  python tools/pad_png_margin.py data/images/2026 [更多文件或目录...] [--pct 0.05]
幂等：已达标（某边 ≥ 目标）的边不再垫；重复跑不会再变。
改完记得 node tools/emit_figures.mjs <年> --rebuild 重建注册表（w/h 变了）。
"""
import sys, os, glob
from PIL import Image, ImageChops

PCT = 0.05
THRESH = 24  # 与该 RGB 均值差超过此值算"墨迹"

def content_bbox(im):
    bg = Image.new('RGB', im.size, (255, 255, 255))
    diff = ImageChops.difference(im.convert('RGB'), bg).convert('L')
    return diff.point(lambda x: 255 if x > THRESH else 0).getbbox()

def pad_file(path, pct):
    im = Image.open(path)
    if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
        im = im.convert('RGBA')
        bg = Image.new('RGBA', im.size, (255, 255, 255, 255))
        im = Image.alpha_composite(bg, im).convert('RGB')
    else:
        im = im.convert('RGB')
    w, h = im.size
    bbox = content_bbox(im)
    if not bbox:
        print(f"  跳过（纯白/无内容）: {path}")
        return False
    l, t, r, b = bbox
    cw, chh = r - l, b - t
    # 反解：垫完后要满足 tx = pct*(cw + 2*tx)，即 tx = pct*cw/(1-2pct)，
    # 这样重复跑不会再长（否则目标按新图宽算会每次都差一点、无限微增）
    tx = max(1, round(pct * cw / (1 - 2 * pct)))
    ty = tx  # 上下也按图宽口径，和 2025 年一致
    add = (max(0, tx - l), max(0, ty - t), max(0, tx - (w - r)), max(0, ty - (h - b)))
    if not any(add):
        print(f"  已达标不动: {os.path.basename(path)}  {w}x{h}  L={l} T={t} R={w-r} B={h-b}")
        return False
    nw, nh = w + add[0] + add[2], h + add[1] + add[3]
    out = Image.new('RGB', (nw, nh), (255, 255, 255))
    out.paste(im, (add[0], add[1]))
    out.save(path)
    nl, nt, nr, nb = l + add[0], t + add[1], (w - r) + add[2], (h - b) + add[3]
    print(f"  {os.path.basename(path)}: {w}x{h} → {nw}x{nh}  "
          f"L={l}→{nl} T={t}→{nt} R={w-r}→{nr} B={h-b}→{nb}")
    return True

def main():
    args = sys.argv[1:]
    pct = PCT
    if '--pct' in args:
        i = args.index('--pct')
        pct = float(args[i + 1])
        del args[i:i + 2]
    files = []
    for a in args:
        if os.path.isdir(a):
            files += glob.glob(os.path.join(a, '*.png')) + glob.glob(os.path.join(a, 'answer', '*.png'))
        elif a.lower().endswith('.png'):
            files.append(a)
        else:
            print(f"忽略非 png: {a}")
    if not files:
        print(__doc__)
        return 1
    print(f"目标留白: 每边 ≥ {pct:.0%} 图宽")
    changed = [f for f in sorted(set(files)) if pad_file(f, pct)]
    print(f"共 {len(files)} 张，垫了 {len(changed)} 张。"
          + ("记得 node tools/emit_figures.mjs <年> --rebuild" if changed else ""))
    return 0

if __name__ == '__main__':
    sys.exit(main())
