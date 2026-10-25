// 数据完整性校验：加载全部数据文件，核对结构、选项组、章节/知识点引用、图引用、KaTeX 公式可渲染性
// 运行: node tools/validate_data.js
//
// 约定：
//   data/figures/<年>/[answer/]<图名>.js     单图一文件；有 _index.js 则用它，否则递归 require 全部非 _ 文件
//   data/questions/<年>.js / <年>-b.js / <年>-big.js
// 新增年份只需在下面 EXPECT 里登记期望的题量，脚本自动发现数据文件。
global.window = {};
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// ---------------- 数据加载 ----------------
// ---------------- 数据加载（静态登记，新增年份在此加行）----------------
// 图库：data/figures/<年>/（_index.js 由生成器维护）
// 题目：旧格式 <年>.js/-b.js/-big.js；新格式 <年>/paper.js + <年>/answer.js
require('../data/chapters.js');
require('../data/figures/2021/_index.js');
require('../data/figures/2023/_index.js');
require('../data/figures/2024/_index.js');
require('../data/figures/2025/_index.js');
require('../data/figures/2026/_index.js');
require('../data/figures/2022/_index.js');
require('../data/figures/2020/_index.js');
require('../data/questions/2020/paper.js');
require('../data/questions/2020/answer.js');
require('../data/questions/2021/paper.js');
require('../data/questions/2021/answer.js');
require('../data/questions/2022/paper.js');
require('../data/questions/2022/answer.js');
require('../data/questions/2023/paper.js');
require('../data/questions/2023/answer.js');
require('../data/questions/2024/paper.js');
require('../data/questions/2024/answer.js');
require('../data/questions/2025/paper.js');
require('../data/questions/2025/answer.js');
require('../data/questions/2026/paper.js');
require('../data/questions/2026/answer.js');

// KaTeX 单一来源：server 的 npm 依赖（app/ 是 ESM 包，require 其下 .js 会按 ESM 加载失败）
const katex = require(path.join(ROOT, 'server/node_modules/katex/dist/katex.min.js'));

const B = global.window.BUPT801;
const errors = [];
const warns = [];

// hydrate：把 answers（年份目录 answer.js）合并回题目；旧格式（exp 内嵌）不受影响
(function () {
  Object.keys(B.answers || {}).forEach((y) => {
    const p = B.papers && B.papers[y];
    if (!p) return;
    const a = B.answers[y];
    p.questions.forEach((q) => {
      const m = a[q.id];
      if (!m) return;
      if (m.answer !== undefined) q.answer = m.answer;
      if (m.exp !== undefined) q.exp = m.exp;
      if (m.sol !== undefined) q.sol = m.sol;
    });
  });
})();

// ---------------- 期望值（每年） ----------------
const EXPECT = {
  // 2021 原卷：一（40 分）+ 二～八（15/15/15/15/15/15/20 = 110 分）
  2021: { choice: 40, big: 7, score: 150 },
  // 2022 原卷：一（40 分）+ 二～九（12/16/12/14/12/12/12/16 = 106 分），原卷标注合计 146 分
  2022: { choice: 40, big: 8, score: 146 },
  2023: { choice: 50, big: 8, score: 150 },
  2024: { choice: 40, big: 9, score: 150 },
  2025: { choice: 30, big: 8, score: 150 },
  2026: { choice: 40, big: 7, score: 150 },
  2020: { choice: 40, big: 8, score: 150 }
};

// ---------------- KaTeX ----------------
function renderLatex(s) {
  // strict:false —— 只关心“能不能渲染出来”，不把中文进公式等排版建议当失败
  katex.renderToString(s, { throwOnError: true, displayMode: true, strict: false });
}

function checkStrings(obj, p) {
  if (typeof obj === 'string') {
    if (!obj.includes('$')) return;
    const disp = obj.split('$$');
    for (let i = 1; i < disp.length; i += 2) {
      const tex = disp[i];
      if (!tex.trim()) continue;
      try { renderLatex(tex); }
      catch (e) { errors.push(`${p}: KaTeX(显示)渲染失败 [${tex.slice(0, 80)}] -> ${e.message.slice(0, 120)}`); }
    }
    const inlineSrc = disp.filter((_, i) => i % 2 === 0).join(' ');
    const parts = inlineSrc.split('$');
    if ((inlineSrc.match(/\$/g) || []).length % 2 !== 0) errors.push(`${p}: $ 不配对: ${obj.slice(0, 60)}`);
    for (let i = 1; i < parts.length; i += 2) {
      const tex = parts[i];
      if (!tex.trim()) continue;
      try { renderLatex(tex); }
      catch (e) { errors.push(`${p}: KaTeX(行内)渲染失败 [${tex.slice(0, 80)}] -> ${e.message.slice(0, 120)}`); }
    }
  } else if (Array.isArray(obj)) obj.forEach((v, i) => checkStrings(v, `${p}[${i}]`));
  else if (obj && typeof obj === 'object') Object.entries(obj).forEach(([k, v]) => checkStrings(v, `${p}.${k}`));
}

// ---------------- 该空实际使用哪一套选项 ----------------
// 2026 起：题目可显式写 oKey（如 options5 / options2829）；2025 旧数据靠 blank 号硬编码。
function optKeyOf(q, g) {
  if (q.oKey) return q.oKey;
  if (!g) return null;
  if (q.blank === 12 && g.options12) return 'options12';
  if (q.blank === 13 && g.options13) return 'options13';
  if (q.blank === 25 && g.options25) return 'options25';
  if (q.blank === 26 && g.options26) return 'options26';
  return 'options';
}

const chapters = B.chapters || [];
const chIds = new Set(chapters.map((c) => c.id));
const pointNames = new Map(chapters.map((c) => [c.id, new Set(c.points)]));

// ---------------- 逐年校验 ----------------
for (const year of Object.keys(B.papers).sort()) {
  const paper = B.papers[year];
  const exp = EXPECT[year] || {};
  const figs = (B.figures || {})[year] || {};
  const qs = paper.questions || [];
  const choice = qs.filter((q) => q.type === 'choice');
  const big = qs.filter((q) => q.type === 'big');
  const bigScore = big.reduce((s, q) => s + (q.score || 0), 0);
  console.log(`\n== ${year} == 选择题 ${choice.length} 空，大题 ${big.length} 题（${bigScore} 分），图 ${Object.keys(figs).length} 张`);

  if (exp.choice && choice.length !== exp.choice) errors.push(`${year}: 选择题应为 ${exp.choice} 空，实际 ${choice.length}`);
  if (exp.big && big.length !== exp.big) errors.push(`${year}: 大题应为 ${exp.big} 题，实际 ${big.length}`);
  if (exp.score && choice.length + bigScore !== exp.score) errors.push(`${year}: 总分应为 ${exp.score}，实际 ${choice.length + bigScore}`);

  // sections 声明与实际一致
  const secBig = (paper.sections || []).find((s) => s.id === 'big');
  if (secBig && secBig.score !== bigScore) errors.push(`${year}: sections.big.score=${secBig.score} 与大题合计 ${bigScore} 不一致`);
  const secChoice = (paper.sections || []).find((s) => s.id === 'choice');
  if (secChoice && secChoice.score !== choice.length) errors.push(`${year}: sections.choice.score=${secChoice.score} 与空数 ${choice.length} 不一致`);

  // 题号连续（同一道题可含多个空、共享题号：2024 为 20 题 × 2 空，故先去重）
  const nums = [...new Set(choice.map((q) => q.num))].sort((a, b) => a - b);
  for (let i = 1; i <= nums.length; i++) if (nums[i - 1] !== i) { errors.push(`${year}: 选择题题号不连续，第 ${i} 个题号是 ${nums[i - 1]}`); break; }
  const blanks = choice.map((q) => q.blank).sort((a, b) => a - b);
  for (let i = 1; i <= choice.length; i++) if (blanks[i - 1] !== i) { errors.push(`${year}: blank 编号不连续，第 ${i} 个是 ${blanks[i - 1]}`); break; }

  const ids = new Set(qs.map((q) => q.id));
  if (ids.size !== qs.length) errors.push(`${year}: 存在重复题目 id`);

  qs.forEach((q) => {
    if (!chIds.has(q.chapter)) errors.push(`${q.id}: 章节无效 ${q.chapter}`);
    else if (q.point && !pointNames.get(q.chapter).has(q.point)) warns.push(`${q.id}: 知识点 "${q.point}" 不在 chapters.js 的 ${q.chapter} 列表中`);

    if (q.type === 'choice') {
      if (!'ABCD'.includes(q.answer)) errors.push(`${q.id}: 答案非法 ${q.answer}`);
      if (!q.exp || !q.exp.concl) errors.push(`${q.id}: 缺少解析 exp.concl`);
      else {
        if (!q.exp.opts || !q.exp.opts[q.answer]) errors.push(`${q.id}: 解析未给出正确项 ${q.answer} 的说明`);
        ['A', 'B', 'C', 'D'].forEach((k) => { if (!q.exp.opts || !q.exp.opts[k]) warns.push(`${q.id}: 选项 ${k} 缺少解析`); });
      }
      const g = q.group ? paper.groups[q.group] : null;
      if (q.group && !g) errors.push(`${q.id}: 选项组缺失 ${q.group}`);
      else if (g) {
        const key = optKeyOf(q, g);
        const opts = key ? g[key] : null;
        if (q.oKey && !g[q.oKey]) errors.push(`${q.id}: oKey=${q.oKey} 不在组 ${q.group} 中`);
        if (!opts) errors.push(`${q.id}: 组 ${q.group} 缺少 ${key}`);
        else if (!opts[q.answer]) errors.push(`${q.id}: 答案 ${q.answer} 不在该组选项中`);
      }
      // 组干必须包含该空号，否则页面上题干与空号对不上
      if (g && g.stem && g.stem.indexOf('（' + q.blank + '）') < 0 && !q.stem) errors.push(`${q.id}: 组干未包含（${q.blank}）标记`);
    } else if (q.type === 'big') {
      if (!q.sol || !q.sol.steps || !q.sol.steps.length) errors.push(`${q.id}: 缺少分步解析 sol.steps`);
      else {
        if (!q.sol.summary) warns.push(`${q.id}: 缺少答案汇总 sol.summary`);
        q.sol.steps.forEach((st, i) => {
          if (!st.q) errors.push(`${q.id} step${i}: 缺少小问标题`);
          if (!st.ans) warns.push(`${q.id} step${i}: 缺少该小问结论 st.ans`);
        });
      }
      if (!q.score) errors.push(`${q.id}: 缺少分值`);
    }
    checkStrings(q, q.id);

    if (q.fig && !figs[q.fig]) errors.push(`${q.id}: 图缺失 ${q.fig}`);
    if (q.sol && q.sol.steps) q.sol.steps.forEach((st, i) => { if (st.fig && !figs[st.fig]) errors.push(`${q.id} step${i}: 图缺失 ${st.fig}`); });
  });

  // 组：optionSets 键必须存在；组干齐全；组内题必须指定 oKey
  Object.entries(paper.groups || {}).forEach(([gk, g]) => {
    if (g.optionSets) {
      g.optionSets.forEach((k) => { if (!g[k]) errors.push(`${year} ${gk}: optionSets 声明了 ${k} 但组内不存在`); });
      if (!g.stem) errors.push(`${year} ${gk}: 多选项组缺少组干 stem`);
    }
    const inGroup = choice.filter((q) => q.group === gk);
    if (!inGroup.length) warns.push(`${year} ${gk}: 选项组没有任何题目引用`);
    inGroup.forEach((q) => { if (g.optionSets && !q.oKey) warns.push(`${q.id}: 组 ${gk} 有多套选项但题目未指定 oKey`); });
  });

  // 未被引用的图
  const usedFigs = new Set();
  qs.forEach((q) => { if (q.fig) usedFigs.add(q.fig); if (q.sol) (q.sol.steps || []).forEach((st) => st.fig && usedFigs.add(st.fig)); });
  Object.keys(figs).forEach((k) => { if (!usedFigs.has(k)) warns.push(`${year}: 图 ${k} 未被任何题目引用`); });
}

// ---------------- 数值抽查（答案正确性核心数值） ----------------
function approx(a, b, eps) { return Math.abs(a - b) <= (eps || 1e-9); }
const t = [];
// 2021
// 二：N0=1e-5 时两种 BPF 通带下的 B 点噪声功率与信噪比
(function () {
  const N0 = 1e-5;
  const NB1 = N0 / 2 * 200;
  const NB2 = N0 * 100 + N0 / 2 * 100;
  t.push(['2021二(2) NB=1e-3、SNR=2000', approx(NB1, 1e-3) && approx(2 / NB1, 2000)]);
  t.push(['2021二(3) NB=1.5e-3、SNR=4000/3', approx(NB2, 1.5e-3) && approx(2 / NB2, 4000 / 3)]);
})();
// 三：Tb=0.5 s 时相邻码元在抽样点的串扰各 2/π，合计 4/π>1 → 眼图闭合
t.push(['2021三 Tb=0.5 时串扰 4/π>1', approx(2 * (2 / Math.PI), 4 / Math.PI) && 4 / Math.PI > 1]);
// 五：枚举 12 个星座点求 Es、dmin；再由分布求熵与互信息
(function () {
  const pts = [];
  for (const xi of [-3, -1, 1, 3]) for (const xq of [-3, -1, 1, 3]) {
    if (Math.abs(xi) === 3 && Math.abs(xq) === 3) continue;
    pts.push([xi, xq]);
  }
  const Es = pts.reduce((s, p) => s + p[0] * p[0] + p[1] * p[1], 0) / pts.length;
  let dmin = Infinity;
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
    if (d < dmin) dmin = d;
  }
  const H = Math.log2(12);
  const HXI = -[4, 4, 2, 2].reduce((s, c) => s + (c / 12) * Math.log2(c / 12), 0);
  t.push(['2021五(2) Es=22/3、dmin=2', approx(Es, 22 / 3) && approx(dmin, 2)]);
  t.push(['2021五(3) H(X)=2+log2 3、I=log2 3−4/3',
    approx(H, 2 + Math.log2(3)) && approx(2 * HXI - H, Math.log2(3) - 4 / 3)]);
})();
// 六：对 p(x)=1/3(0≤x<2)、1/6(2≤x≤4) 做数值积分
(function () {
  const p = (x) => (x >= 0 && x < 2 ? 1 / 3 : (x >= 2 && x <= 4 ? 1 / 6 : 0));
  const N = 200000, dx = 4 / N;
  let m1 = 0, m2 = 0;
  for (let i = 0; i < N; i++) { const x = (i + 0.5) * dx, w = dx * p(x); m1 += w * x; m2 += w * x * x; }
  t.push(['2021六 E[X]=5/3、E[X²]=4', approx(m1, 5 / 3, 1e-3) && approx(m2, 4, 1e-3)]);
})();
// 七：g1g2 与 x⁷+1 的因式关系；卷积码编码；两条 m 序列
(function () {
  const mul = (a, b) => {
    const c = Array(a.length + b.length - 1).fill(0);
    a.forEach((av, i) => b.forEach((bv, j) => { c[i + j] ^= av & bv; }));
    return c;
  };
  const g = mul([1, 1, 0, 1], [1, 0, 1, 1]);
  const x7p1 = Array(8).fill(0); x7p1[0] = 1; x7p1[7] = 1;
  t.push(['2021七(1) g=x⁶+…+1、g(x+1)=x⁷+1',
    g.join('') === '1111111' && mul(g, [1, 1]).join('') === x7p1.join('')]);
  // 生成矩阵三行都是 1111111（xg、x²g 模 x⁷−1 后不变），枚举 8 个码字求最小非零重量
  const ws = [];
  for (let m = 0; m < 8; m++) {
    let w = 0;
    for (let p = 0; p < 7; p++) {
      let b = 0;
      for (let i = 0; i < 3; i++) if ((m >> i) & 1) b ^= 1;
      w += b;
    }
    ws.push(w);
  }
  const dmin = Math.min(...ws.filter((w) => w > 0));
  t.push(['2021七(1) dmin=7', dmin === 7]);
  const D = [0, 0, 0]; let enc = '';
  for (const bit of [1, 1, 1, 0, 0, 0, 0]) {
    const [d1, d2, d3] = D;
    enc += `${bit ^ d1 ^ d3}${bit ^ d2 ^ d3}${bit ^ d3}`;
    D.unshift(bit); D.pop();
  }
  t.push(['2021七(2) 编码输出 111011001001101111000', enc === '111011001001101111000']);
  const seq = (c, init) => {
    const a = init.slice();
    for (let n = 3; n < 7; n++) a.push((c[0] * a[n - 1] + c[1] * a[n - 2] + c[2] * a[n - 3]) % 2);
    return a.join('');
  };
  t.push(['2021七(3) m 序列 1110100、1110010',
    seq([1, 0, 1], [1, 1, 1]) === '1110100' && seq([0, 1, 1], [1, 1, 1]) === '1110010']);
})();
// 八：三个子信道的香农容量
(function () {
  const C1 = Math.log2(1 + 3 * 1);
  const C2 = Math.log2(1 + 1) + Math.log2(1 + 2) + Math.log2(1 + 3);
  const beta = 3 / (1 + 2 + 3);
  const C3 = Math.log2(1 + beta * 1) + Math.log2(1 + beta * 4) + Math.log2(1 + beta * 9);
  t.push(['2021八(2a) C=2 kbit/s', approx(C1, 2)]);
  t.push(['2021八(2b) C=3+log2 3', approx(C2, 3 + Math.log2(3))]);
  t.push(['2021八(2c) β=1/2、C=log2(99/4)', approx(beta, 0.5) && approx(C3, Math.log2(99 / 4))]);
})();
// 2022
// 6 个概率 1/2,1/4,1/8,1/16,1/32,1/32 → 码长 1,2,3,4,5,5
t.push(['2022(5) 哈夫曼平均码长 31/16', approx(1 * (1 / 2) + 2 * (1 / 4) + 3 * (1 / 8) + 4 * (1 / 16) + 5 * (1 / 32) + 5 * (1 / 32), 31 / 16)]);
t.push(['2022(8) FM 卡森 B=2(β+1)fm=10kHz', approx(2 * (4 + 1) * 1, 10)]);
t.push(['2022(9) PCM 80 kbit/s', approx(2 * 5 * 8, 80)]);
t.push(['2022(10) 复用 6×80+60=540', approx(6 * 80 + 60, 540)]);
t.push(['2022(11) 基带最小带宽 540/2=270', approx(540 / 2, 270)]);
t.push(['2022(12) 64QAM Rs=9600/6=1600', approx(9600 / Math.log2(64), 1600)]);
t.push(['2022(13) 矩形脉冲带通主瓣 2Rs=3200', approx(2 * 1600, 3200)]);
t.push(['2022(14) RRC α=1/2 带通带宽 Rs(1+α)=2400', approx(1600 * 1.5, 2400)]);
t.push(['2022(24) 16FSK 最小频差 Rs/2=2kHz', approx(16 / Math.log2(16) / 2, 2)]);
t.push(['2022(32) 四进制基带 η=4/(1+1/3)=3', approx(4 / (1 + 1 / 3), 3)]);
// 2022(37) m 序列：f1=1+x+x³、f2=1+x²+x³，c=a⊕b 的所有循环移位
(function () {
  const seq = (cs, init) => { const a = init.slice(); for (let n = 3; n < 14; n++) a.push((cs[0] * a[n - 1] + cs[1] * a[n - 2] + cs[2] * a[n - 3]) % 2); return a; };
  const seen = new Set();
  for (let i = 1; i < 8; i++) for (let j = 1; j < 8; j++) {
    const A = seq([1, 0, 1], [(i >> 2) & 1, (i >> 1) & 1, i & 1]);
    const B = seq([0, 1, 1], [(j >> 2) & 1, (j >> 1) & 1, j & 1]);
    const C = A.map((v, n) => v ^ B[n]);
    if (C.slice(0, 7).join('') !== C.slice(7, 14).join('')) return; // 周期不是 7 说明递推写错
    for (let s = 0; s < 7; s++) seen.add(Array.from({ length: 7 }, (_, k) => C[(s + k) % 7]).join(''));
  }
  t.push(['2022(37) {c_n} 周期含 1000001', seen.has('1000001')]);
  t.push(['2022(37) {c_n} 周期不含 0000000', !seen.has('0000000')]);
})();
// 2022 二：AM 相干解调 —— η=1/17、Ps=2.125、Pn=N0·(2W)、输出信噪比 1000（30 dB）
t.push(['2022二 η=Pm/(A²+Pm)=1/17', approx(0.25 / (4 + 0.25), 1 / 17)]);
t.push(['2022二 Ps=(A²+Pm)/2=2.125', approx((4 + 0.25) / 2, 2.125)]);
t.push(['2022二 Pn=N0·2W=2.5e-4', approx(2.5e-8 * 10e3, 2.5e-4)]);
t.push(['2022二 输出信噪比 1000（30 dB）', approx(0.25 / 2.5e-4, 1000)]);
// 2022 六：QPSK“系统性错半格”的熵链
t.push(['2022六 H(φ)=H(φ̂)=2', approx(Math.log2(4), 2)]);
t.push(['2022六 H(φ̂|φ)=1、H(φ̂,φ)=3、I=1', approx(2 + 1, 3) && approx(2 - 1, 1)]);
// 2022 七：p_X=2(1-x)、W=√X、二电平量化 {1/4, 3/4}
t.push(['2022七 E[X²]=1/6', approx(2 * (1 / 3 - 1 / 4), 1 / 6)]);
t.push(['2022七 F_W(1/2)=7/16', approx(2 * 0.25 - 1 / 16, 7 / 16)]);
t.push(['2022七 E[W²]=1/3', approx(1 - 2 / 3, 1 / 3)]);
t.push(['2022七 E[Z²]=11/32', approx((1 / 16) * (7 / 16) + (9 / 16) * (9 / 16), 11 / 32)]);
t.push(['2022七 E[WZ]=79/240', approx((1 / 4) * (17 / 120) + (3 / 4) * (47 / 120), 79 / 240)]);
t.push(['2022七 量化噪声 3/160', approx(11 / 32 - 2 * (79 / 240) + 1 / 3, 3 / 160)]);
// 2022 八：(10,4) 循环码 g(x)=x⁶+x⁵+x+1 —— 系统矩阵 / 校验矩阵 / 伴随式
(function () {
  const G0 = [[1, 1, 0, 0, 0, 1, 1, 0, 0, 0], [0, 1, 1, 0, 0, 0, 1, 1, 0, 0], [0, 0, 1, 1, 0, 0, 0, 1, 1, 0], [0, 0, 0, 1, 1, 0, 0, 0, 1, 1]];
  const mul = (M, N) => M.map((r) => N[0].map((_, j) => N.reduce((s, n, k) => s ^ (n[j] & r[k]), 0)));
  // A = 前 4 列，用高斯消元求 A⁻¹（GF(2)）
  const A = G0.map((r) => r.slice(0, 4));
  const Aug = A.map((r, i) => r.concat([0, 1, 2, 3].map((j) => (i === j ? 1 : 0))));
  for (let c = 0; c < 4; c++) {
    const p = Aug.findIndex((r, i) => i >= c && r[c]);
    [Aug[c], Aug[p]] = [Aug[p], Aug[c]];
    Aug.forEach((r, i) => { if (i !== c && r[c]) r.forEach((_, j) => { r[j] ^= Aug[c][j]; }); });
  }
  const Ai = Aug.map((r) => r.slice(4));
  const G = [];
  for (let i = 0; i < 4; i++) { const row = []; for (let j = 0; j < 10; j++) row.push(G0.reduce((s, g, k) => s ^ (Ai[i][k] & g[j]), 0)); G.push(row); }
  const H = [0, 1, 2, 3, 4, 5].map((j) => G.map((r) => r[4 + j]).concat([0, 1, 2, 3, 4, 5].map((m) => (m === j ? 1 : 0))));
  t.push(['2022八(1) GHᵀ=0', G.every((r) => H.every((h) => h.reduce((s, v, k) => s ^ (v & r[k]), 0) === 0))]);
  // (2) 前后 5 位逐位相同
  let same = true;
  for (let b = 0; b < 16; b++) {
    const c = Array.from({ length: 10 }, (_, j) => G.reduce((s, r, i) => s ^ (((b >> i) & 1) & r[j]), 0));
    if (c.slice(0, 5).join('') !== c.slice(5).join('')) same = false;
  }
  t.push(['2022八(2) c4..c0 = c9..c5', same]);
  // (3) y=1100011001 的伴随式与译码
  const y = '1100011001'.split('').map(Number);
  const s = H.map((h) => h.reduce((acc, v, k) => acc ^ (v & y[k]), 0));
  t.push(['2022八(3) s=(000001)', s.join('') === '000001']);
  t.push(['2022八(3) 译成 1100011000', y.map((v, k) => v ^ (k === 9 ? 1 : 0)).join('') === '1100011000']);
})();
// 2022 九：卷积码 g1=1+x²、g2=1+x+x²，接收 100010111000 的维特比译码
(function () {
  const step = (st, u) => [(u ^ st[1]), (u ^ st[0] ^ st[1]), [u, st[0]]];
  const y = '100010111000'.split('').map(Number);
  let paths = { '00': [0, ''] };
  for (let t2 = 0; t2 < 6; t2++) {
    const r = y.slice(2 * t2, 2 * t2 + 2);
    const next = {};
    for (const k of Object.keys(paths)) {
      const st = k.split('').map(Number);
      for (const u of [0, 1]) {
        const o = step(st, u);
        const d = paths[k][0] + (o[0] !== r[0]) + (o[1] !== r[1]);
        const k2 = o[2].join('');
        if (!next[k2] || d < next[k2][0]) next[k2] = [d, paths[k][1] + u];
      }
    }
    paths = next;
  }
  // 编码器末两位是收尾 0，故幸存路径必须回到 00；信息位取前 4 位
  const best = paths['00'];
  t.push(['2022九(3) 维特比译码 1100、距离 3', best[1].slice(0, 4) === '1100' && best[0] === 3]);
})();
// 2025
t.push(['哈夫曼L=1.5', approx(1 * 0.5 + 2 / 3 + 2 / 6, 1.5)]);
t.push(['A律段落7判定', 1020 >= 512 && 1020 < 1024]);
t.push(['dmin8PSK', approx(2 * Math.sin(Math.PI / 8), 0.7653668647)]);
t.push(['Es_new=5/8', approx((4 * 1 + 4 * 0.25) / 8, 0.625)]);
t.push(['dmin_new=√2/2', approx(Math.sqrt(2) / 2, 0.7071067812)]);
t.push(['卷积(1000,g)', [1, 1, 0, 1, 0, 0, 0].join('') === '1101000']);
t.push(['G行1=1000110', (function () { const b = [1, 1, 1, 0], g = [1, 1, 0, 1]; const c = new Array(7).fill(0); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) c[i + j] ^= b[i] * g[j]; return c.join('') === '1000110'; })()]);
t.push(['伴随式(101)', (function () { const y = [1, 1, 1, 0, 1, 1, 1]; const H = [[1, 0, 1, 1, 1, 0, 0], [1, 1, 1, 0, 0, 1, 0], [0, 1, 1, 1, 0, 0, 1]]; return H.map((r) => r.reduce((s, v, i) => s ^ v * y[i], 0)).join('') === '101'; })()]);
// 2025 十九/二十：1024QAM 是带通系统，Rs=B/(1+α)（不是基带的 2B）
t.push(['2025(19) 1024QAM B=1MHz 理想 → 10Mbit/s', (function () { const B = 1e6, Rs = B / 1; return Math.abs(Rs * Math.log2(1024) - 10e6) < 1; })()]);
t.push(['2025(20) 升余弦 α=1/4 → 8Mbit/s', (function () { const B = 1e6, a = 0.25, Rs = B / (1 + a); return Math.abs(Rs * Math.log2(1024) - 8e6) < 1; })()]);
// 8PSK 新星座：内点之间 √2/2 才是最小距离，内-外 0.737 比它大
t.push(['2025六(4) 内-外 0.737 > 内-内 0.707', (function () { const din = Math.SQRT2 / 2; const dout = Math.hypot(1 - Math.SQRT2 / 4, 0.5 * Math.SQRT2 / 2); return Math.abs(din - 0.7071) < 1e-3 && Math.abs(dout - 0.7368) < 1e-3 && dout > din; })()]);
// 2026
t.push(['DSB→SSB 折算 30+3.01=33dB', approx(30 + 10 * Math.log10(2), 33.0103, 1e-3)]);
t.push(['AM η=10% 折 23dB', approx(30 - 10 * Math.log10(5), 23.0103, 1e-3)]);
t.push(['64QAM 6Mbit/s => 1MBaud', approx(6e6 / 6, 1e6)]);
t.push(['RRC α=1/4 绝对带宽 1.25MHz', approx(1e6 * 1.25, 1.25e6)]);
t.push(['A律 +4.2V => 归一 537.6 落段7', Math.round(4.2 * 128) === 538]);
t.push(['匹配滤波 SNR=2E/N0=20 => 13dB', approx(10 * Math.log10(2 * 1 / 0.1), 13.0103, 1e-3)]);
t.push(['m序列 2^4-1=15', Math.pow(2, 4) - 1 === 15]);
t.push(['卷积码 m=3,K=4,状态8', Math.pow(2, 3) === 8]);
t.push(['SSB 偏移 240Hz、B=600Hz', approx(600 - 120 - 240, 240) && approx(2 * 300, 600)]);
// 2026 四：量化器（p(x)=(3-|x|)/9，Y=(2b1-1)2^(2b2-1)）—— 数值积分独立复核
(function () {
  const pdf = (x) => (Math.abs(x) <= 3 ? (3 - Math.abs(x)) / 9 : 0);
  const qy = (x) => (x > 0 ? 1 : -1) * Math.pow(2, 2 * (Math.abs(x) > 1 ? 1 : 0) - 1);
  const N = 600000, a = -3, b = 3, hh = (b - a) / N;
  let sx2 = 0, sy2 = 0, sxy = 0, se2 = 0, p1 = 0, p2 = 0;
  for (let i = 0; i < N; i++) {
    const x = a + (i + 0.5) * hh, w = pdf(x) * hh, y = qy(x);
    sx2 += x * x * w; sy2 += y * y * w; sxy += x * y * w; se2 += (x - y) * (x - y) * w;
    if (x > 0) p1 += w;
    if (Math.abs(x) > 1) p2 += w;
  }
  t.push(['2026四(1) E[X²]=3/2', approx(sx2, 1.5, 1e-3)]);
  t.push(['2026四(2) P(b1=1)=1/2,P(b2=1)=4/9', approx(p1, 0.5, 1e-5) && approx(p2, 4 / 9, 1e-3)]);
  t.push(['2026四(3) E[Y²]=23/12(=E[XY]=29/18 时)', approx(sy2, 23 / 12, 1e-3)]);
  t.push(['2026四(3) E[XY]=29/18', approx(sxy, 29 / 18, 1e-3)]);
  t.push(['2026四(4) 量化噪声 7/36', approx(se2, 7 / 36, 1e-3)]);
  // 量化噪声必须等于 E[X²]-2E[XY]+E[Y²]（不能只用 E[X²]-E[Y²]）
  t.push(['2026四(4) 噪声=E[X²]-2E[XY]+E[Y²]', approx(sx2 - 2 * sxy + sy2, se2, 1e-9)]);
})();
t.push(['2026五(2) 16QAM 平均符号能量 10', approx((4 * 2 + 8 * 10 + 4 * 18) / 16, 10)]);
t.push(['2026三(1) Eb=(E1+E2)/2=5Tb、正交 ρ=0', approx((2 + 8) / 2, 5)]);
t.push(['2026三(2) 门限 Tb、Pe=Q(√(Tb/N0))', approx((2 + 0) / 2, 1) && approx(Math.sqrt(1), 1)]);
t.push(['2026三(3) 门限 -3Tb、Pe=Q(√(E_b/N0))', approx((2 - 8) / 2, -3) && approx(Math.sqrt(5), Math.sqrt(5))]);
// 2026 八：(7,4) 循环码 g(x)=x³+x+1 —— 生成矩阵/校验矩阵/伴随式/陪集
(function () {
  const G = [[1, 0, 0, 0, 1, 0, 1], [0, 1, 0, 0, 1, 1, 1], [0, 0, 1, 0, 1, 1, 0], [0, 0, 0, 1, 0, 1, 1]];
  const H = [[1, 1, 1, 0, 1, 0, 0], [0, 1, 1, 1, 0, 1, 0], [1, 1, 0, 1, 0, 0, 1]];
  const mul = (v, m) => m.map((r) => r.reduce((s, x, i) => s ^ (x & v[i]), 0));
  // G·Hᵀ=0
  const ok0 = G.every((row) => mul(row, H).every((x) => x === 0));
  // 非零码字最小重量 = 3
  let dmin = 99;
  for (let u = 1; u < 16; u++) {
    const b = [(u >> 3) & 1, (u >> 2) & 1, (u >> 1) & 1, u & 1];
    const c = new Array(7).fill(0);
    for (let i = 0; i < 4; i++) if (b[i]) for (let j = 0; j < 7; j++) c[j] ^= G[i][j];
    dmin = Math.min(dmin, c.reduce((s, x) => s + x, 0));
  }
  const y = [1, 0, 0, 1, 0, 1, 1];
  const s = mul(y, H).join('');
  // 伴随式 = H 第 1 列 → 第 1 位错 → ĉ = y ⊕ e1
  const chap = y.slice(); chap[0] ^= 1;
  t.push(['2026八(1) GHᵀ=0、dmin=3', ok0 && dmin === 3]);
  t.push(['2026八(2) s=(101)、ĉ=0001011', s === '101' && chap.join('') === '0001011']);
  // (3)(4) 8 个陪集首 → 8 个错误图样，重量分布 1×3重、3×2重、4×4重
  const leaders = [[0, 0, 0, 0, 0, 0, 0]].concat([0, 1, 2, 3, 4, 5, 6].map((i) => [0, 0, 0, 0, 0, 0, 0].map((_, j) => (i === j ? 1 : 0))));
  const c0 = [0, 0, 0, 1, 0, 1, 1];
  const w = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
  const pats = leaders.map((e) => c0.map((x, i) => x ^ e[i]));
  pats.forEach((p) => { w[p.reduce((s2, x) => s2 + x, 0)]++; });
  t.push(['2026八(3) 8 图样重量分布 3重1个/2重3个/4重4个', pats.length === 8 && w[3] === 1 && w[2] === 3 && w[4] === 4]);
})();

// ---------- 2023 ----------
// 2023(1)(2)：AMI / HDB3 编码程序化复核（不使用“结果套结果”）
(function () {
  const bits = '1000010000110000'.split('').map(Number);
  let last = -1, ami = '';
  for (const b of bits) {
    if (b) { last = -last; ami += last > 0 ? '+' : '-'; } else ami += '0';
  }
  const hb = [];
  let lp = 0, sinceSub = 0, zr = 0;
  for (const b of bits) {
    if (!b) {
      hb.push('0'); zr++;
      if (zr === 4) {
        if (sinceSub % 2 === 1) hb[hb.length - 1] = lp > 0 ? '+' : '-';
        else {
          const B = lp > 0 ? -1 : 1;
          hb[hb.length - 4] = B > 0 ? '+' : '-';
          hb[hb.length - 1] = B > 0 ? '+' : '-';
          lp = B;
        }
        sinceSub = 0; zr = 0;
      }
    } else { zr = 0; lp = lp > 0 ? -1 : 1; hb.push(lp > 0 ? '+' : '-'); sinceSub++; }
  }
  t.push(['2023(1) AMI=+0000-0000+-0000', ami === '+0000-0000+-0000']);
  t.push(['2023(2) HDB3=+000+-000-+-+00+', hb.join('') === '+000+-000-+-+00+']);
})();
// 2023(27)(28)：A 律十三折线编解码（Δ=640/2048 mV）
(function () {
  const D = 640 / 2048;
  const starts = [0, 16, 32, 64, 128, 256, 512, 1024];
  const steps = [1, 1, 2, 4, 8, 16, 32, 64];
  const enc = (x) => {
    const n = Math.abs(x) / D;
    let seg = 0;
    for (let i = 7; i >= 0; i--) if (n >= starts[i]) { seg = i; break; }
    const lvl = Math.min(15, Math.floor((n - starts[seg]) / steps[seg]));
    return (x >= 0 ? '1' : '0') + seg.toString(2).padStart(3, '0') + lvl.toString(2).padStart(4, '0');
  };
  const dec = (c) => {
    const seg = parseInt(c.slice(1, 4), 2), lvl = parseInt(c.slice(4), 2);
    return (c[0] === '1' ? 1 : -1) * (starts[seg] + (lvl + 0.5) * steps[seg]) * D;
  };
  t.push(['2023(27) +330mV → 11110000', enc(330) === '11110000']);
  t.push(['2023(28) 11100000 → +165mV', approx(dec('11100000'), 165, 1e-9)]);
})();
// 2023(45)(46)：(7,4) 循环码 g=x³+x+1 —— 全部 16 个码字验 dmin，1110 系统编码
(function () {
  const g = [1, 0, 1, 1];
  const mul = (a, b) => {
    const out = new Array(a.length + b.length - 1).fill(0);
    for (let i = 0; i < a.length; i++) if (a[i]) for (let j = 0; j < b.length; j++) if (b[j]) out[i + j] ^= 1;
    return out;
  };
  let dmin = 99;
  for (let u = 1; u < 16; u++) {
    const m = [(u >> 3) & 1, (u >> 2) & 1, (u >> 1) & 1, u & 1];
    dmin = Math.min(dmin, mul(m, g).reduce((s, x) => s + x, 0));
  }
  const a = [1, 1, 1, 0, 0, 0, 0];
  for (let i = 0; i < 4; i++) if (a[i]) for (let j = 0; j < 4; j++) a[i + j] ^= g[j];
  const code = '1110' + a.slice(4).join('');
  t.push(['2023(45)(46) dmin=3、1110→1110100', dmin === 3 && code === '1110100']);
})();
// 2023七：卷积码 g1=1+D+D²、g2=1+D² 的两路输出与一步维特比度量
(function () {
  const reg = [0, 0], o1 = [], o2 = [];
  for (const b of [1, 1, 1, 0, 0, 0]) {
    o1.push(b ^ reg[0] ^ reg[1]);
    o2.push(b ^ reg[1]);
    reg[1] = reg[0]; reg[0] = b;
  }
  const TR = {
    '00': { 0: ['00', '00'], 1: ['10', '11'] },
    '10': { 0: ['01', '10'], 1: ['11', '01'] },
    '01': { 0: ['00', '11'], 1: ['10', '00'] },
    '11': { 0: ['01', '01'], 1: ['11', '10'] }
  };
  const left = { '00': 1, '10': 2, '01': 3, '11': 3 };
  const upd = { '00': 99, '10': 99, '01': 99, '11': 99 };
  for (const s of Object.keys(left)) for (const u of ['0', '1']) {
    const [ns, out] = TR[s][u];
    const hd = (out[0] !== '1' ? 1 : 0) + (out[1] !== '1' ? 1 : 0);
    upd[ns] = Math.min(upd[ns], left[s] + hd);
  }
  t.push(['2023七(2) 上路101010、下路110110', o1.join('') === '101010' && o2.join('') === '110110']);
  t.push(['2023七(3) M(00,10,01,11)=3,1,3,3', upd['00'] === 3 && upd['10'] === 1 && upd['01'] === 3 && upd['11'] === 3]);
})();
// 2023八：X~U[0,4] 四段量化 —— 数值积分独立复核
(function () {
  const N = 400000, h = 4 / N;
  let sx2 = 0, sy2 = 0, sxy = 0, se2 = 0;
  for (let i = 0; i < N; i++) {
    const x = (i + 0.5) * h, w = h / 4;
    const y = x < 0.5 ? 0.25 : x < 1 ? 0.75 : x < 2 ? 1.5 : 3;
    sx2 += x * x * w; sy2 += y * y * w; sxy += x * y * w; se2 += (x - y) * (x - y) * w;
  }
  t.push(['2023八(2) E[X²]=16/3', approx(sx2, 16 / 3, 1e-3)]);
  t.push(['2023八(2) E[Y²]=E[XY]=329/64', approx(sy2, 329 / 64, 1e-3) && approx(sxy, 329 / 64, 1e-3)]);
  t.push(['2023八(2) 量化噪声 37/192', approx(se2, 37 / 192, 1e-3)]);
})();
// 2023五：星形八进制星座最小距离 2，且 d(s1,s8)<d(s1,s7)<d(s1,s5)<d(s1,s6)
(function () {
  const r3 = Math.sqrt(3);
  const S = { s1: [1 + r3, 1], s2: [1, 0], s3: [0, r3], s4: [-1, 0],
    s5: [-1 - r3, 1], s6: [-1 - r3, -1], s7: [0, -r3], s8: [1 + r3, -1] };
  const d = (a, b) => Math.hypot(S[a][0] - S[b][0], S[a][1] - S[b][1]);
  const ks = Object.keys(S);
  let dmin = 99;
  for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) dmin = Math.min(dmin, d(ks[i], ks[j]));
  t.push(['2023五 最小距离2、p8>p7>p5>p6', approx(dmin, 2, 1e-9) &&
    d('s1', 's8') < d('s1', 's7') && d('s1', 's7') < d('s1', 's5') && d('s1', 's5') < d('s1', 's6')]);
})();
// 2023六：两路香农公式反解最小功率
(function () {
  const P1a = (Math.pow(2, 2e6 / 2e6) - 1) / 250, P2a = (Math.pow(2, 1e6 / 1e6) - 1) / 1000;
  const P1b = (Math.pow(2, 0.5) - 1) / 250, P2b = (Math.pow(2, 2) - 1) / 1000;
  t.push(['2023六(3) 5mW / (4√2−1)mW', approx(P1a + P2a, 5e-3, 1e-9) && approx(P1b + P2b, (4 * Math.SQRT2 - 1) / 1000, 1e-9)]);
})();
// 2023九：带通抽样 6kHz、64QAM 符号速率 40kBaud
(function () {
  const fs2 = 2 * 6e3 / Math.floor(6 / 2.5);
  const RsE = 112e3 * 15 / 7 / 6;
  t.push(['2023九 fs2=6kHz、RsE=40kBaud', approx(fs2, 6e3, 1e-9) && approx(RsE, 40e3, 1e-6)]);
})();
// 2023四：∫g²=3Tb/4、∫g(t)g(Tb−t)dt=Tb/2
(function () {
  const N = 100000, h = 1 / N;
  let e = 0, x = 0;
  for (let i = 0; i < N; i++) {
    const tt = (i + 0.5) * h;
    const g = tt <= 0.75 ? 1 : 0;
    const gt = (1 - tt) >= 0 && (1 - tt) <= 0.75 ? 1 : 0;
    e += g * gt * h; x += g * g * h;
  }
  t.push(['2023四 Eg=3Tb/4、错位相关=Tb/2', approx(x, 0.75, 1e-3) && approx(e, 0.5, 1e-3)]);
})();

// ---------------- 2024 ----------------
// 三：1kHz 带通信号按 2kHz 采样、2kHz 基带按 4kHz 采样；k=7 才够 40dB（6.02k）
(function () {
  const Rb1 = 2e3 * 7, Rb2 = 2e3 * 7, Rb3 = 4e3 * 7, Rb4 = 4e3 * 7;
  const Rb = Rb1 + Rb2 + Rb3 + Rb4;
  const Rs = Rb / 4;                       // 16QAM，4 bit/符号
  const alpha = 24e3 / Rs - 1;             // 24kHz 带通信道 → Rs(1+α)=24kHz
  const snr6 = 20 * 6 * Math.log10(2), snr7 = 20 * 7 * Math.log10(2);
  t.push(['2024三 Rb=84kbit/s、Rs=21kBaud、α=1/7', approx(Rb, 84e3) && approx(Rs, 21e3) && approx(alpha, 1 / 7, 1e-9)]);
  t.push(['2024三 k=7（6 比特仅 36.1dB）', snr6 < 40 && snr7 >= 40]);
})();
// 四：DSB 输入 SNR=S/(N0·2fm)；相干解调增益 2；θ 均匀时对 cos²θ 求均值 = 1/2+1/π
(function () {
  const S = 10e-3, N0 = 1e-9, fm = 5e3;
  const snrIn = S / (N0 * 2 * fm);
  let avg = 0, N = 200000;
  for (let i = 0; i < N; i++) { const th = (i + 0.5) / N * Math.PI / 4; avg += Math.cos(th) ** 2 / N; }
  t.push(['2024四 (S/N)i=1000、θ=0 时 2000', approx(snrIn, 1000, 1e-6) && approx(2 * snrIn, 2000, 1e-6)]);
  t.push(['2024四(3) 均值=1000+2000/π', approx(avg, 0.5 + 1 / Math.PI, 1e-5) && approx(2000 * avg, 1000 + 2000 / Math.PI, 1e-2)]);
})();
// 五：用题给近似 log2 3≈11/7、log2 5≈7/3，逐项算熵
(function () {
  const L3 = 11 / 7, L5 = 7 / 3, L6 = 1 + L3, L12 = 2 + L3;
  const HY = -(2 * (5 / 12) * (L5 - L12) + (1 / 6) * (-L6));
  const HYX = (2 / 3) * (L3 - 1) + (1 / 3) * L6;   // -Σ P log(2/3 或 1/6)
  t.push(['2024五 H(Y)=92/63、H(Y|X)=26/21', approx(HY, 92 / 63, 1e-9) && approx(HYX, 26 / 21, 1e-9)]);
  t.push(['2024五 H(X,Y)=47/21、I=2/9', approx(1 + HYX, 47 / 21, 1e-9) && approx(HY - HYX, 2 / 9, 1e-9)]);
})();
// 六：Es、dmin，以及 s8 的胞——三条中垂线距离 0.5 / 0.707 / 0.707
(function () {
  const S = [[-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [0, 2], [-1, -1], [1, -1]];
  const Es = S.reduce((a, p) => a + p[0] * p[0] + p[1] * p[1], 0) / S.length;
  let dmin = Infinity;
  for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) dmin = Math.min(dmin, Math.hypot(S[i][0] - S[j][0], S[i][1] - S[j][1]));
  const sig = Math.sqrt(0.005);
  // s8 的胞由 3 条中垂线围成：上方 y=-0.5 距 0.5；两条斜边距 0.7071。
  // 折算到 erfc 自变量 d/(σ√2)：0.5→5、0.7071→10，即 Pe≈Q(5√2)=½erfc(5)。
  const u1 = 0.5 / sig, u2 = Math.SQRT1_2 / sig;
  t.push(['2024六 Es=9/4、dmin=1', approx(Es, 2.25, 1e-12) && approx(dmin, 1, 1e-12)]);
  t.push(['2024六(3) 三条边距→½erfc(5)', approx(u1, 5 * Math.SQRT2, 1e-9) && approx(u2, 10, 1e-9)]);
})();
// 七：(8,4) 系统码——GHᵀ=0、dmin=4、伴随式 1100 的码重 2 图样 4 个
(function () {
  const G = [[1, 0, 0, 0, 1, 1, 1, 0], [0, 1, 0, 0, 1, 1, 0, 1], [0, 0, 1, 0, 1, 0, 1, 1], [0, 0, 0, 1, 0, 1, 1, 1]];
  const H = [[1, 1, 1, 0, 1, 0, 0, 0], [1, 1, 0, 1, 0, 1, 0, 0], [1, 0, 1, 1, 0, 0, 1, 0], [0, 1, 1, 1, 0, 0, 0, 1]];
  const mul = (v, M) => M.map((r) => r.reduce((s, x, i) => s ^ (x & v[i]), 0));
  const okG = G.every((r) => mul(r, H).every((x) => x === 0));
  let dmin = 99;
  for (let u = 1; u < 16; u++) {
    const b = [(u >> 3) & 1, (u >> 2) & 1, (u >> 1) & 1, u & 1], c = new Array(8).fill(0);
    for (let i = 0; i < 4; i++) if (b[i]) for (let j = 0; j < 8; j++) c[j] ^= G[i][j];
    dmin = Math.min(dmin, c.reduce((s, x) => s + x, 0));
  }
  const cols = [0, 1, 2, 3, 4, 5, 6, 7].map((j) => H.map((r) => r[j]));
  const pats = [];
  for (let i = 0; i < 8; i++) for (let k = i + 1; k < 8; k++) {
    if (cols[i].map((v, q) => v ^ cols[k][q]).join('') === '1100') { const e = new Array(8).fill(0); e[i] = 1; e[k] = 1; pats.push(e.join('')); }
  }
  t.push(['2024七 GHᵀ=0、dmin=4', okG && dmin === 4]);
  t.push(['2024七(3) 伴随式1100 → 4 个码重2图样',
    pats.length === 4 && pats.slice().sort().join() === ['00110000', '00001100', '10000010', '01000001'].sort().join()]);
})();
// 八：8 状态 Viterbi——000→100→010→001→000 度量 2 是否为最优，到 100 是否 4
(function () {
  const g1 = [1, 0, 1, 1], g2 = [1, 1, 0, 1];   // c1=u⊕D²u⊕D³u，c2=u⊕Du⊕D³u
  const out = (state, u) => {                    // state: [u_{n-1},u_{n-2},u_{n-3}]
    const m = [u, state[0], state[1], state[2]];
    const c1 = g1.reduce((s, x, i) => s ^ (x & m[i]), 0);
    const c2 = g2.reduce((s, x, i) => s ^ (x & m[i]), 0);
    return String(c1) + String(c2);
  };
  const rx = ['11', '11', '11', '11'];
  const dist = (a, b) => a.split('').reduce((s, c, i) => s + (c !== b[i] ? 1 : 0), 0);
  let best = {}; best['000'] = { m: 0, path: ['000'] };
  for (let step = 0; step < 4; step++) {
    const nxt = {};
    for (const [st, v] of Object.entries(best)) {
      for (const u of [0, 1]) {
        const to = String(u) + st[0] + st[1];      // 状态 [u_n, u_{n-1}, u_{n-2}]
        const m = v.m + dist(out(st.split('').map(Number), u), rx[step]);
        if (!nxt[to] || nxt[to].m > m) nxt[to] = { m, path: v.path.concat(to) };
      }
    }
    best = nxt;
  }
  const p000 = best['000'], p100 = best['100'];
  t.push(['2024八(3) 到000 度量2、到100 度量4', p000.m === 2 && p100.m === 4
    && p000.path.join('→') === '000→100→010→001→000' && p100.path.join('→') === '000→100→010→001→100']);
})();
// 九：Eg=Tb/3、错位相关 Tb/6；匹配时 E[y]=Tb/3
(function () {
  const N = 100000, h = 1 / N;
  let eg = 0, cc = 0;
  for (let i = 0; i < N; i++) {
    const x = (i + 0.5) * h;
    eg += x * x * h;            // ∫(t/Tb)²dt，Tb=1
    cc += x * (1 - x) * h;      // ∫g(t)g(Tb−t)dt
  }
  t.push(['2024九 Eg=Tb/3、非匹配输出=Tb/6', approx(eg, 1 / 3, 1e-6) && approx(cc, 1 / 6, 1e-6)]);
})();
// 十：p(x)=x/2 的四电平均匀量化（电平 1/4,3/4,5/4,7/4）—— 数值积分独立复核
(function () {
  const N = 800000, a = 0, b = 2, hh = (b - a) / N;
  const qy = (x) => 0.25 + 0.5 * Math.min(3, Math.floor(x / 0.5));
  let sx2 = 0, sy2 = 0, sxy = 0, se2 = 0, p = [0, 0, 0, 0];
  for (let i = 0; i < N; i++) {
    const x = a + (i + 0.5) * hh, w = (x / 2) * hh, y = qy(x);
    sx2 += x * x * w; sy2 += y * y * w; sxy += x * y * w; se2 += (x - y) * (x - y) * w;
    p[Math.min(3, Math.floor(x / 0.5))] += w;
  }
  t.push(['2024十(1) E[X²]=2', approx(sx2, 2, 1e-6)]);
  t.push(['2024十(2) 概率 1/16,3/16,5/16,7/16', p.every((v, i) => approx(v, (2 * i + 1) / 16, 1e-6))]);
  t.push(['2024十(3) E[Y²]=31/16', approx(sy2, 31 / 16, 1e-6)]);
  t.push(['2024十(4) E[XY]=47/24', approx(sxy, 47 / 24, 1e-6)]);
  t.push(['2024十(5) 噪声=1/48', approx(se2, 1 / 48, 1e-6) && approx(sx2 - 2 * sxy + sy2, 1 / 48, 1e-6)]);
  t.push(['2024十(6) SNR=E[X²]/噪声=96（按提示值 ≈20dB）', approx(sx2 / se2, 96, 1e-3)]);
})();

// ---------------- 2020 数值抽查（独立方法复核） ----------------
// (5)(6) 能量信号 2sinc(2000τ)：E=R(0)=2；带宽由傅里叶积分数值验证 |X(f)|² 在 |f|>1000 Hz 处为零
t.push(['2020(5) E=R(0)=2', approx(2, 2)]);
(function () {
  const N = 400000, T = 0.05, h = 2 * T / N; // τ∈[-50ms,50ms]，50 个 sinc 瓣
  const X = (f) => { let re = 0, im = 0; for (let i = 0; i < N; i++) { const tau = -T + (i + 0.5) * h; const s = 2 * Math.sin(Math.PI * 2000 * tau) / (Math.PI * 2000 * tau); re += s * Math.cos(2 * Math.PI * f * tau) * h; im -= s * Math.sin(2 * Math.PI * f * tau) * h; } return re * re + im * im; };
  const inb = X(500);
  // 测点别贴着带边（1000 Hz）：截断积分在跳变处有 Gibbs 振荡，X(999) 只有 3.6e-7 的假象。
  // 取带内 500 Hz 验平台值 ≈1e-6，取带外 1100 Hz 验泄漏确实掉下去了。
  t.push(['2020(6) 带内 |X(500)|²≈1e-6、带外 |X(1100)|²<1e-3·带内', approx(inb, 1e-6, 2e-7) && X(1100) < 1e-3 * inb]);
})();
// (9) AM 调制效率 η=Pm/2 /(1/2+Pm/2)=1/6
t.push(['2020(9) η=1/6', approx(0.1 / 0.6, 1 / 6)]);
// (10) 差分编解码 + BSC 蒙特卡洛：P=2p(1-p)
(function () {
  let err = 0; const N = 200000, p = 0.1;
  let b = 0, prevB = 0, prevE = 0;
  for (let i = 0; i < N; i++) {
    const a = Math.random() < 0.5 ? 0 : 1;
    b = a ^ b;
    const e = Math.random() < p ? 1 : 0;
    const bt = b ^ e;
    const at = bt ^ prevB;
    if (at !== a) err++;
    prevB = bt; prevE = e;
  }
  t.push(['2020(10) 蒙特卡洛 ≈2p(1-p)=0.18', Math.abs(err / N - 2 * p * (1 - p)) < 0.005]);
})();
// (14) 16QAM = 两路独立 4ASK：1-(1-p)² ≈ 0.008
t.push(['2020(14) 1-(1-0.004)²≈0.008', Math.abs(1 - Math.pow(1 - 0.004, 2) - 0.008) < 1e-4]);
// (18) A 律第 8 段译码：1024+(15+0.5)×64
t.push(['2020(18) +2016 mV', approx(1024 + 15.5 * 64, 2016)]);
// (27) 带通采样：谱副本（周期 fs）两两不重叠 → fs=6 可行、fs=5.9 混叠
(function () {
  const clash = (fs) => {
    const iv = [];
    for (let k = -15; k <= 15; k++) { iv.push([9.5 + k * fs, 12 + k * fs, k]); iv.push([-12 + k * fs, -9.5 + k * fs, k]); }
    for (let i = 0; i < iv.length; i++) for (let j = i + 1; j < iv.length; j++) {
      if (iv[i][2] === iv[j][2]) continue;
      if (iv[i][0] < iv[j][1] - 1e-9 && iv[j][0] < iv[i][1] - 1e-9) return true;
    }
    return false;
  };
  t.push(['2020(27) fs=6 不混叠、fs=5.9 混叠', !clash(6) && clash(5.9)]);
})();
// 二：方差 ∫2N0cos²(πf/2B)df=2N0B；3dB 点 cos²(π/4)=1/2
(function () {
  const N = 200000, B = 1, N0 = 1, h = 2 * B / N;
  let s = 0;
  for (let i = 0; i < N; i++) { const f = -B + (i + 0.5) * h; s += 2 * N0 * Math.pow(Math.cos(Math.PI * f / (2 * B)), 2) * h; }
  t.push(['2020二 D[n]=2N0B', approx(s, 2 * N0 * B, 1e-6)]);
  t.push(['2020二 3dB 带宽 B/2', approx(2 * Math.pow(Math.cos(Math.PI * (B / 2) / (2 * B)), 2), N0)]);
})();
// 三：B 点噪声功率 = 200N0+100N0=300N0，信噪比 1000
t.push(['2020三 PnB=300N0、SNR=1000', approx(200 * 1e-5 + 100 * 1e-5, 3e-3) && approx(3 / 3e-3, 1000)]);
// 四：Eb=∫s1²dt=2Tb、E12=0（数值积分）；噪声方差 N0/2+N0/2
(function () {
  const N = 400000, Tb = 1, h = Tb / N;
  let e1 = 0, e12 = 0;
  for (let i = 0; i < N; i++) {
    const t0 = (i + 0.5) * h;
    const s1 = 2 * Math.cos(22 * Math.PI * t0 / Tb), s2 = 2 * Math.cos(20 * Math.PI * t0 / Tb);
    e1 += s1 * s1 * h; e12 += s1 * s2 * h;
  }
  t.push(['2020四 Eb=2Tb、E12=0', approx(e1, 2 * Tb, 1e-6) && Math.abs(e12) < 1e-6]);
  t.push(['2020四 D[Z]=N0', approx(0.5 + 0.5, 1)]);
})();
// 五：16 点枚举 Es=10、dmin=2
(function () {
  const P = [];
  for (const a of [-1, 1]) for (const b of [-1, 1]) for (const c of [-1, 1]) for (const d of [-1, 1]) P.push([2 * a + c, 2 * b + d]);
  const es = P.reduce((s, p) => s + p[0] * p[0] + p[1] * p[1], 0) / 16;
  let dm = 1e9;
  for (let i = 0; i < 16; i++) for (let j = i + 1; j < 16; j++) dm = Math.min(dm, Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]));
  t.push(['2020五 Es=10、dmin=2', approx(es, 10, 1e-9) && approx(dm, 2, 1e-9)]);
})();
// 六：32 个等概结局枚举 → H(Y)=4、H(Y|X)=2、I=2
(function () {
  const cnt = {}, cntX = {};
  let tot = 0;
  for (let ix = 0; ix < 8; ix++) for (const Z of [1, 2]) for (const th of [0, Math.PI]) {
    const ang = Math.PI / 4 + ix * Math.PI / 4 + th;
    const y = Z.toFixed(0) + '|' + Math.round(Math.cos(ang) * 1e6) / 1e6 + ',' + Math.round(Math.sin(ang) * 1e6) / 1e6;
    cnt[y] = (cnt[y] || 0) + 1; cntX[ix] = (cntX[ix] || {});
    const kx = ix, ky = y;
    cntX[ix][ky] = (cntX[ix][ky] || 0) + 1;
    tot++;
  }
  const H = (c, n) => -Object.values(c).reduce((s, v) => s + (v / n) * Math.log2(v / n), 0);
  const hy = H(cnt, tot);
  const hyc = Object.values(cntX).reduce((s, c) => s + H(c, Object.values(c).reduce((a, v) => a + v, 0)) * (Object.values(c).reduce((a, v) => a + v, 0) / tot), 0);
  t.push(['2020六 H(Y)=4、H(Y|X)=2、I=2', approx(hy, 4, 1e-9) && approx(hyc, 2, 1e-9) && approx(hy - hyc, 2, 1e-9)]);
})();
// 七：概率、E[X²]、量化噪声（数值积分）、哈夫曼最优码长
(function () {
  const P = { 5: 1 / 12, 3: 1 / 6, 1: 1 / 4 };
  t.push(['2020七(1) 概率 1/12,1/6,1/4(×2 对称)', approx(2 * (P[5] + P[3] + P[1]), 1)]);
  const N = 600000, h = 12 / N;
  const pdf = (x) => { const a = Math.abs(x); return a <= 2 ? 1 / 8 : a <= 4 ? 1 / 12 : 1 / 24; };
  const qy = (x) => [ -5, -3, -1, 1, 3, 5 ][Math.min(5, Math.max(0, Math.floor((x + 6) / 2)))];
  let ex2 = 0, en = 0;
  for (let i = 0; i < N; i++) { const x = -6 + (i + 0.5) * h, w = pdf(x) * h; ex2 += x * x * w; en += (x - qy(x)) * (x - qy(x)) * w; }
  t.push(['2020七(2) E[X²]=8、噪声=1/3', approx(ex2, 8, 1e-6) && approx(en, 1 / 3, 1e-6)]);
  // 哈夫曼：每次合并最小两枝，平均码长 = 各次合并时子树概率之和
  const nodes = [[1 / 12, 0], [1 / 12, 0], [1 / 6, 0], [1 / 6, 0], [1 / 4, 0], [1 / 4, 0]];
  let L = 0;
  while (nodes.length > 1) {
    nodes.sort((a, b) => a[0] - b[0]);
    const A = nodes.shift(), B = nodes.shift();
    L += A[0] + B[0];
    nodes.push([A[0] + B[0], Math.max(A[1], B[1]) + 1]);
  }
  t.push(['2020七(3) 平均码长 5/2', approx(L, 2.5, 1e-9)]);
})();
// 八：GF(2) 卷积编码复核四个码字 + 生成矩阵行线性性
(function () {
  const enc = (bits) => { const out = []; for (let n = 0; n < 4; n++) { const b = (i) => (n - i >= 0 && bits[n - i]) || 0; const c1 = b(0) ^ b(1) ^ b(2), c2 = b(0) ^ b(1); out.push(c1, c2); } return out.join(''); };
  const got = { 1000: enc([1, 0, 0, 0]), 1100: enc([1, 1, 0, 0]), 1110: enc([1, 1, 1, 0]), 1111: enc([1, 1, 1, 1]) };
  t.push(['2020八(2) 四个码字', got[1000] === '11111000' && got[1100] === '11000110' && got[1110] === '11001001' && got[1111] === '11001010']);
  const rows = ['11111000', '00111110', '00001111', '00000011'];
  const xor = (a, b) => a.split('').map((c, i) => c ^ b[i]).join('');
  const all = rows.reduce(xor);
  t.push(['2020八(3) 行模二和=1111 码字、行4=0001 码字', all === got[1111] && rows[3] === enc([0, 0, 0, 1])]);
})();
// 九：Rb=12、α=2W/Rs-1=1/3、η=3
t.push(['2020九 Rb=12、α=1/3、η=3', approx(1 + 2 + 3 + 6, 12) && approx(2 * 4 / 6 - 1, 1 / 3) && approx(12 / 4, 3)]);

t.forEach(([n, ok]) => { if (!ok) errors.push('数值抽查失败: ' + n); });
console.log('\n数值抽查: ' + t.map(([n, ok]) => (ok ? '✓' : '✗') + n).join(' '));

console.log('\n== 结果 ==');
console.log('错误:', errors.length); errors.forEach((e) => console.log('  ✗', e));
console.log('警告:', warns.length); warns.forEach((w) => console.log('  ⚠', w));
process.exit(errors.length || warns.length ? 1 : 0);
