#!/usr/bin/env python3
"""原卷图区域裁剪助手：从整页 PNG 裁出图区域，存到 待解析/crops/<年>/<key>.png 留档。

裁图是"画完与原卷对照"的输入：compare_figures.py 按 待解析/crops/<年>/<key>.png
找原图，找不到就跳过该图并警告。裁片与源 PDF 同在 待解析/（gitignore，不入库）。

用法（在项目根目录执行）：
    python tools/crop_orig.py /tmp/w801/2015/p-03.png 830,220,1450,560 \
        --out 待解析/crops/2015/p3ssb.png
    python tools/crop_orig.py 页.png 0.18,0.35,0.62,0.30 --norm --out ...   # 按页面比例

坐标：左上角 x,y + 宽 w,h（页面像素）；--norm 时四个数按 0~1 页面比例解析。
先 Read 整页图估坐标 → 裁 → Read 裁片核对，偏了就调坐标重裁。
"""
import argparse
import os
import sys

from PIL import Image


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('page', help='整页 PNG（pdftoppm -r 300 的产物）')
    ap.add_argument('box', help='x,y,w,h（像素；配合 --norm 则为 0~1 页面比例）')
    ap.add_argument('--norm', action='store_true', help='按页面比例解析 box')
    ap.add_argument('--out', required=True, help='裁片输出路径，约定 待解析/crops/<年>/<key>.png')
    a = ap.parse_args()

    im = Image.open(a.page)
    W, H = im.size
    try:
        x, y, w, h = (float(v) for v in a.box.split(','))
    except ValueError:
        sys.exit('box 格式应为 x,y,w,h 四个数：' + a.box)
    if a.norm:
        if not all(0 <= v <= 1 for v in (x, y, w, h)) or w <= 0 or h <= 0:
            sys.exit('--norm 下 box 应为 0~1 的比例且 w/h > 0：' + a.box)
        x, y, w, h = x * W, y * H, w * W, h * H
    box = (max(0, round(x)), max(0, round(y)),
           min(W, round(x + w)), min(H, round(y + h)))
    if box[2] <= box[0] or box[3] <= box[1]:
        sys.exit('裁剪框为空：%r（页面 %dx%d）' % (box, W, H))

    crop = im.crop(box)
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    crop.save(a.out)
    print('%dx%d 页面 -> 裁片 %dx%d -> %s' % (W, H, crop.width, crop.height, a.out))


if __name__ == '__main__':
    main()
