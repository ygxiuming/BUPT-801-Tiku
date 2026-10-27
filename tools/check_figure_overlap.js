// 图库遮挡自查：文字包围盒 vs 线段/折线/方框边/圆 是否相交；净距 <6px 预警；顺带报告 viewBox 留白。
// 用法：node tools/check_figure_overlap.js 2025
// 说明：字宽按字符类别估（CJK 1.0em、大写/数字 0.62em、其余 0.52em），与 tools/svgkit.py 一致。
//       「交叠」必须清零（>0 一定有脏重叠）；「净距预警」不算失败，但标签贴线值得看一眼。
//       path 按 svgkit._path_points 同口径解析（小写相对命令、A 弧端点、Z 闭合），先剥 <defs>。
global.window = {};
const path = require('path');
// require(变量) 与路径字面量 .. 都会被 Mimosa 拦：unshift 项目根后用 data/... 裸说明符 + 静态 case
module.paths.unshift(path.dirname(__dirname));
const year = String(process.argv[2] || '2025');
let loaded = false;
switch (year) {
  case '2013': require('data/figures/2013/_index.js'); loaded = true; break;
  case '2014': require('data/figures/2014/_index.js'); loaded = true; break;
  case '2015': require('data/figures/2015/_index.js'); loaded = true; break;
  case '2016': require('data/figures/2016/_index.js'); loaded = true; break;
  case '2017': require('data/figures/2017/_index.js'); loaded = true; break;
  case '2018': require('data/figures/2018/_index.js'); loaded = true; break;
  case '2019': require('data/figures/2019/_index.js'); loaded = true; break;
  case '2020': require('data/figures/2020/_index.js'); loaded = true; break;
  case '2021': require('data/figures/2021/_index.js'); loaded = true; break;
  case '2022': require('data/figures/2022/_index.js'); loaded = true; break;
  case '2023': require('data/figures/2023/_index.js'); loaded = true; break;
  case '2024': require('data/figures/2024/_index.js'); loaded = true; break;
  case '2025': require('data/figures/2025/_index.js'); loaded = true; break;
  case '2026': require('data/figures/2026/_index.js'); loaded = true; break;
}
if (!loaded) { console.error('未知年份（或未登记）：' + year + '；在 tools/check_figure_overlap.js 加一个 case'); process.exit(1); }
const figs = global.window.BUPT801.figures[year] || {};

const charW = (c, size) => {
  if (/[\u4e00-\u9fff\uff00-\uffef]/.test(c)) return size * 1.0;
  if (/[A-Z0-9]/.test(c)) return size * 0.62;
  return size * 0.52;
};

function textBoxes(svg) {
  const out = [];
  for (const m of svg.matchAll(/<text x='([-\d.]+)' y='([-\d.]+)' text-anchor='(\w+)'([^>]*)>([\s\S]*?)<\/text>/g)) {
    const x = +m[1], y = +m[2], anchor = m[3], attrs = m[4], inner = m[5];
    const base = (attrs.match(/font-size='([\d.]+)'/) || [0, 14])[1] | 0;
    const parts = [];
    if (inner.includes('<tspan')) {
      // font-size 可能是 '13.0'（text() 里 {sz:.1f} 输出），正则必须收小数：
      // 只认 \d+ 会把带上下标的文字整块算成宽度 0，交叠漏检、留白虚高。
      for (const t of inner.matchAll(/<tspan[^>]*font-size='([\d.]+)'[^>]*>([^<]*)<\/tspan>/g)) parts.push([t[2], +t[1]]);
    } else parts.push([inner, base]);
    let w = 0;
    for (const p of parts) for (const c of p[0]) w += charW(c, p[1]);
    const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
    // 上下沿系数与 tools/svgkit.py 的 content_bbox 一致，否则收边与检测互相打架。
    // 取字高 1.0em（上 0.80em / 下 0.20em）：这样 14px 行距的两行标注恰好相接，不会被误报成重叠。
    out.push({ txt: parts.map((p) => p[0]).join(''), x0: x0, x1: x0 + w, y0: y - base * 0.8, y1: y + base * 0.2 });
  }
  return out;
}

// path 的 d → 点集（绝对坐标；小写命令按相对位移累加；A 弧只取端点）。与 svgkit._path_points 同口径。
const SEG_RE = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;
const NUM_RE = /-?\d*\.?\d+/g;
function pathPoints(d) {
  const pts = [];
  let cx = 0, cy = 0;
  for (const m of d.matchAll(SEG_RE)) {
    const cmd = m[1], rel = cmd !== cmd.toUpperCase(), u = cmd.toUpperCase();
    if (u === 'Z') continue;
    const nums = (m[2].match(NUM_RE) || []).map(Number);
    if (u === 'H' || u === 'V') {
      for (const v of nums) {
        if (u === 'H') cx = rel ? cx + v : v; else cy = rel ? cy + v : v;
        pts.push([cx, cy]);
      }
      continue;
    }
    if (u === 'A') {
      for (let i = 0; i + 6 < nums.length; i += 7) {
        const nx = nums[i + 5], ny = nums[i + 6];
        cx = rel ? cx + nx : nx; cy = rel ? cy + ny : ny;
        pts.push([cx, cy]);
      }
      continue;
    }
    const step = { M: 2, L: 2, T: 2, C: 6, S: 4, Q: 4 }[u] || 2;
    for (let i = 0; i + step <= nums.length; i += step) {
      for (let j = i; j < i + step; j += 2) {
        const nx = nums[j], ny = nums[j + 1];
        cx = rel ? cx + nx : nx; cy = rel ? cy + ny : ny;
        pts.push([cx, cy]);
      }
    }
  }
  return pts;
}

function segs(svg) {
  // hard = <line>（与旧版口径一致，作为门槛）；soft = 全量 path/折线/方框边（增强检测，只复核）
  const hard = [], soft = [];
  const strip = svg.replace(/<defs>[\s\S]*?<\/defs>/g, ''); // marker 的 M0,0 不是墨迹
  for (const m of strip.matchAll(/<line x1='([-\d.]+)' y1='([-\d.]+)' x2='([-\d.]+)' y2='([-\d.]+)'/g))
    hard.push([+m[1], +m[2], +m[3], +m[4]]);
  for (const m of strip.matchAll(/<path d='([^']+)'/g)) {
    const pts = pathPoints(m[1]);
    for (let i = 0; i + 1 < pts.length; i++) soft.push([pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]]);
  }
  for (const m of strip.matchAll(/<(polygon|polyline) points='([^']+)'/g)) {
    const nums = m[2].trim().split(/[\s,]+/).map(Number);
    const pts = [];
    for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
    if (m[1] === 'polygon' && pts.length > 2) pts.push([pts[0][0], pts[0][1]]);
    for (let i = 0; i + 1 < pts.length; i++) soft.push([pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]]);
  }
  for (const m of strip.matchAll(/<rect x='([-\d.]+)' y='([-\d.]+)' width='([-\d.]+)' height='([-\d.]+)'/g)) {
    const x = +m[1], y = +m[2], X = x + +m[3], Y = y + +m[4];
    soft.push([x, y, X, y], [X, y, X, Y], [X, Y, x, Y], [x, Y, x, y]);
  }
  return { hard: hard, soft: soft };
}

function circles(svg) {
  // 圆 vs 文字一律只复核：状态节点（圆内 00/11）、Σ 加法器（圆内 Σ）都是"文字在圆内"的合法画法，
  // 几何上区分不了"脏压圆"和"设计如此"；但真压上去时值得看一眼。
  const out = [];
  const strip = svg.replace(/<defs>[\s\S]*?<\/defs>/g, '');
  for (const m of strip.matchAll(/<circle cx='([-\d.]+)' cy='([-\d.]+)' r='([-\d.]+)'/g))
    out.push({ cx: +m[1], cy: +m[2], r: +m[3] });
  return out;
}

function segBoxIntersect(s, b) {
  const x1 = s[0], y1 = s[1], x2 = s[2], y2 = s[3];
  const inside = (x, y) => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1;
  if (inside(x1, y1) || inside(x2, y2)) return true;
  let t0 = 0, t1 = 1;
  const dx = x2 - x1, dy = y2 - y1;
  const clip = (p, q) => {
    if (p === 0) return q >= 0;
    const r = q / p;
    if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; }
    else { if (r < t0) return false; if (r < t1) t1 = r; }
    return true;
  };
  if (clip(-dx, x1 - b.x0) && clip(dx, b.x1 - x1) && clip(-dy, y1 - b.y0) && clip(dy, b.y1 - y1)) return t0 <= t1;
  return false;
}

function circleBoxIntersect(c, b) {
  const nx = Math.max(b.x0, Math.min(c.cx, b.x1));
  const ny = Math.max(b.y0, Math.min(c.cy, b.y1));
  return (c.cx - nx) * (c.cx - nx) + (c.cy - ny) * (c.cy - ny) < c.r * c.r;
}

// 线段到矩形的最小距离（相交返回 0；用于 <6px 净距预警）
function ptDist(px, py, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay;
  const L2 = vx * vx + vy * vy;
  const t = L2 ? Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / L2)) : 0;
  const dx = px - (ax + t * vx), dy = py - (ay + t * vy);
  return Math.sqrt(dx * dx + dy * dy);
}
function segSegDist(s1, s2) {
  const ax = s1[0], ay = s1[1], bx = s1[2], by = s1[3];
  const cx = s2[0], cy = s2[1], dx = s2[2], dy = s2[3];
  const rx = bx - ax, ry = by - ay, sx = dx - cx, sy = dy - cy;
  const den = rx * sy - ry * sx;
  if (den !== 0) {
    const t = ((cx - ax) * sy - (cy - ay) * sx) / den;
    const u = ((cx - ax) * ry - (cy - ay) * rx) / den;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return 0;
  }
  return Math.min(ptDist(ax, ay, cx, cy, dx, dy), ptDist(bx, by, cx, cy, dx, dy),
    ptDist(cx, cy, ax, ay, bx, by), ptDist(dx, dy, ax, ay, bx, by));
}
function segBoxDist(s, b) {
  if (segBoxIntersect(s, b)) return 0;
  const inBox = (x, y) => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1;
  if (inBox(s[0], s[1]) || inBox(s[2], s[3])) return 0;
  const corners = [[b.x0, b.y0], [b.x1, b.y0], [b.x1, b.y1], [b.x0, b.y1]];
  let d = ptDist(s[0], s[1], b.x0, b.y0, b.x1, b.y1);
  for (let i = 0; i < 4; i++) {
    const e = [corners[i][0], corners[i][1], corners[(i + 1) % 4][0], corners[(i + 1) % 4][1]];
    d = Math.min(d, segSegDist(s, e), ptDist(e[0], e[1], s[0], s[1], s[2], s[3]));
  }
  return d;
}

let total = 0;
for (const k of Object.keys(figs)) {
  const svg = figs[k];
  const vb = (svg.match(/viewBox='([^']+)'/) || [, '0 0 0 0'])[1].split(/\s+/).map(Number);
  const boxes = textBoxes(svg), S = segs(svg), C = circles(svg);
  const hits = [], soft = [], near = [];
  for (const b of boxes) {
    for (const s of S.hard) {
      if (segBoxIntersect(s, b)) hits.push(b.txt + '  x  线[' + s.map((v) => Math.round(v)).join(',') + ']');
      else {
        const d = segBoxDist(s, b);
        if (d > 0 && d < 6) near.push(b.txt + ' 距线 ' + d.toFixed(1) + 'px');
      }
    }
    for (const s of S.soft) {
      if (segBoxIntersect(s, b)) soft.push(b.txt + '  x  线[' + s.map((v) => Math.round(v)).join(',') + ']');
      else {
        const d = segBoxDist(s, b);
        if (d > 0 && d < 6) near.push(b.txt + ' 距线 ' + d.toFixed(1) + 'px');
      }
    }
    for (const c of C) {
      if (circleBoxIntersect(c, b)) soft.push(b.txt + '  x  圆[' + Math.round(c.cx) + ',' + Math.round(c.cy) + ' r' + Math.round(c.r) + ']');
      else {
        const nx = Math.max(b.x0, Math.min(c.cx, b.x1)), ny = Math.max(b.y0, Math.min(c.cy, b.y1));
        const d = Math.sqrt((c.cx - nx) * (c.cx - nx) + (c.cy - ny) * (c.cy - ny)) - c.r;
        if (d > 0 && d < 6) near.push(b.txt + ' 距圆 ' + d.toFixed(1) + 'px');
      }
    }
  }
  // 文字包围盒互相重叠
  const tHits = [];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const A = boxes[i], C2 = boxes[j];
    if (A.x0 < C2.x1 && C2.x0 < A.x1 && A.y0 < C2.y1 && C2.y0 < A.y1) tHits.push(A.txt + ' <-> ' + C2.txt);
  }
  // 内容边界留白
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  const mm = (x, y) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); };
  for (const s of S.hard) { mm(s[0], s[1]); mm(s[2], s[3]); }
  for (const s of S.soft) { mm(s[0], s[1]); mm(s[2], s[3]); }
  for (const b of boxes) { mm(b.x0, b.y0); mm(b.x1, b.y1); }
  for (const c of C) { mm(c.cx - c.r, c.cy - c.r); mm(c.cx + c.r, c.cy + c.r); }
  // 位图题（原卷扫描图直接嵌入）：<image> 的矩形就是墨迹
  for (const m of svg.matchAll(/<image[^>]*x='([-\d.]+)'[^>]*y='([-\d.]+)'[^>]*width='([-\d.]+)'[^>]*height='([-\d.]+)'/g)) { mm(+m[1], +m[2]); mm(+m[1] + +m[3], +m[2] + +m[4]); }
  // 注意 viewBox 可能是 'vx vy vw vh'（收边后原点不是 0,0），留白必须按绝对边界算
  const pad = [x0 - vb[0], y0 - vb[1], vb[0] + vb[2] - x1, vb[1] + vb[3] - y1].map(Math.round);
  const warn = pad.some((v) => v < 0 || v > 30) ? '  ⚠ 留白/溢出' : '';
  total += hits.length + tHits.length;
  console.log('\n== ' + k + ' == 文字' + boxes.length + ' 线段' + (S.hard.length + S.soft.length) +
    ' 硬交叠' + (hits.length + tHits.length) + ' 复核' + soft.length + ' 净距预警' + near.length +
    ' 留白L/T/R/B=' + pad.join('/') + warn);
  Array.from(new Set(hits)).slice(0, 10).forEach((h) => console.log('    线:', h));
  Array.from(new Set(tHits)).slice(0, 10).forEach((h) => console.log('    字:', h));
  Array.from(new Set(soft)).slice(0, 6).forEach((h) => console.log('    ? 复核:', h));
  Array.from(new Set(near)).slice(0, 8).forEach((h) => console.log('    ⚠ 近:', h));
}
console.log('\n合计交叠 ' + total + (total ? '（需人工核对）' : '（干净）'));
