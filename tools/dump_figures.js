// 图库导出：把全部年份的图（SVG + figureMeta）写成一份 JSON，供 compare_figures.py 读取。
// 用法：node tools/dump_figures.js    （固定输出 /tmp/w801/dump-figures.json）
// 约定（过 Mimosa 扫描）：require 用「module.paths.unshift(项目根) + data/... 裸说明符」——
// require(变量)、路径字面量里的 .. 都会被拦；新年份入库时在下面加一行 require。
global.window = {};
const fs = require('fs');
const path = require('path');

module.paths.unshift(path.dirname(__dirname));   // 让 require('data/...') 从项目根解析

require('data/figures/2013/_index.js');
require('data/figures/2014/_index.js');
require('data/figures/2015/_index.js');
require('data/figures/2016/_index.js');
require('data/figures/2017/_index.js');
require('data/figures/2018/_index.js');
require('data/figures/2019/_index.js');
require('data/figures/2020/_index.js');
require('data/figures/2021/_index.js');
require('data/figures/2022/_index.js');
require('data/figures/2023/_index.js');
require('data/figures/2024/_index.js');
require('data/figures/2025/_index.js');
require('data/figures/2026/_index.js');

const YEARS = ['2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];
const F = global.window.BUPT801.figures || {};
const M = global.window.BUPT801.figureMeta || {};
const data = {};
for (const year of YEARS) {
  const figs = F[year] || {}, metas = M[year] || {};
  const one = {};
  for (const k of Object.keys(figs)) {
    one[k] = {
      // 与 preview_figures.py 同口径：渲染时整体换成 CJK 字体（cairosvg 只取第一个 font-family）
      svg: figs[k].replace(/font-family="[^"]*"/, 'font-family="Noto Sans CJK SC"'),
      meta: metas[k] || {},
    };
  }
  data[year] = one;
}

fs.mkdirSync('/tmp/w801', { recursive: true });
const out = '/tmp/w801/dump-figures.json';
fs.writeFileSync(out, JSON.stringify(data));
console.log(Object.keys(data).map((y) => y + ':' + Object.keys(data[y]).length).join(' '));
console.log('json -> ' + out);
