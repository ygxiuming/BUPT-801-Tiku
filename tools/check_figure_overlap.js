// 图库遮挡自查：文字包围盒 vs 线段/折线（含 poly 折线）是否相交；顺带报告 viewBox 留白。
// 用法：node tools/check_figure_overlap.js 2025
// 说明：字宽是按字符类别估的（CJK 1.0em、大写/数字 0.62em、其余 0.52em），
//       报出的交叠都值得人工看一眼；0 交叠不代表排版好看，但 >0 一定有脏重叠。
global.window = {};
const year = process.argv[2] || '2025';
require('../data/figures/' + year + '/_index.js');
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
    const base = (attrs.match(/font-size='(\d+)'/) || [0, 14])[1] | 0;
    const parts = [];
    if (inner.includes('<tspan')) {
      for (const t of inner.matchAll(/<tspan[^>]*font-size='(\d+)'[^>]*>([^<]*)<\/tspan>/g)) parts.push([t[2], +t[1]]);
    } else parts.push([inner, base]);
    let w = 0;
    for (const p of parts) for (const c of p[0]) w += charW(c, p[1]);
    const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
    // 上下沿系数与 tools/gen_figures_2025.py 的 _content_bbox() 必须一致，否则收边与检测互相打架。
    // 取字高 1.0em（上 0.80em / 下 0.20em）：这样 14px 行距的两行标注恰好相接，不会被误报成重叠。
    out.push({ txt: parts.map((p) => p[0]).join(''), x0: x0, x1: x0 + w, y0: y - base * 0.8, y1: y + base * 0.2 });
  }
  return out;
}

function segs(svg) {
  const out = [];
  for (const m of svg.matchAll(/<line x1='([-\d.]+)' y1='([-\d.]+)' x2='([-\d.]+)' y2='([-\d.]+)'/g))
    out.push([+m[1], +m[2], +m[3], +m[4]]);
  for (const m of svg.matchAll(/<path d='M([-\d.,\s]+)'/g)) {
    const nums = m[1].trim().split(/[\s,]+/).map(Number);
    for (let i = 0; i + 3 < nums.length; i += 2) out.push([nums[i], nums[i + 1], nums[i + 2], nums[i + 3]]);
  }
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

let total = 0;
for (const k of Object.keys(figs)) {
  const svg = figs[k];
  const vb = (svg.match(/viewBox='([^']+)'/) || [, '0 0 0 0'])[1].split(/\s+/).map(Number);
  const boxes = textBoxes(svg), S = segs(svg);
  const hits = [];
  for (const b of boxes) for (const s of S) if (segBoxIntersect(s, b)) hits.push(b.txt + '  x  [' + s.map((v) => Math.round(v)).join(',') + ']');
  // 文字包围盒互相重叠
  const tHits = [];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const A = boxes[i], C = boxes[j];
    if (A.x0 < C.x1 && C.x0 < A.x1 && A.y0 < C.y1 && C.y0 < A.y1) tHits.push(A.txt + ' <-> ' + C.txt);
  }
  // 内容边界留白
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  const mm = (x, y) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); };
  for (const s of S) { mm(s[0], s[1]); mm(s[2], s[3]); }
  for (const b of boxes) { mm(b.x0, b.y0); mm(b.x1, b.y1); }
  for (const m of svg.matchAll(/<circle cx='([-\d.]+)' cy='([-\d.]+)' r='([-\d.]+)'/g)) { mm(+m[1] - +m[3], +m[2] - +m[3]); mm(+m[1] + +m[3], +m[2] + +m[3]); }
  for (const m of svg.matchAll(/<rect x='([-\d.]+)' y='([-\d.]+)' width='([-\d.]+)' height='([-\d.]+)'/g)) { mm(+m[1], +m[2]); mm(+m[1] + +m[3], +m[2] + +m[4]); }
  // 注意 viewBox 可能是 'vx vy vw vh'（收边后原点不是 0,0），留白必须按绝对边界算
  const pad = [x0 - vb[0], y0 - vb[1], vb[0] + vb[2] - x1, vb[1] + vb[3] - y1].map(Math.round);
  const warn = pad.some((v) => v < 0 || v > 30) ? '  ⚠ 留白/溢出' : '';
  total += hits.length + tHits.length;
  console.log('\n== ' + k + ' == 文字' + boxes.length + ' 线段' + S.length + ' 线交叠' + hits.length + ' 字交叠' + tHits.length +
    ' 留白L/T/R/B=' + pad.join('/') + warn);
  Array.from(new Set(hits)).slice(0, 10).forEach((h) => console.log('    线:', h));
  Array.from(new Set(tHits)).slice(0, 10).forEach((h) => console.log('    字:', h));
}
console.log('\n合计交叠 ' + total + (total ? '（需人工核对）' : '（干净）'));
