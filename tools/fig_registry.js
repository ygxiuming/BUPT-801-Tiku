// 图库注册表共享模块：.svg 真身 ↔ _index.js 注册表 之间的解析/重建逻辑。
// 被两处使用：tools/emit_figures.mjs（ESM 落盘链路）与 server/index.js（启动同步 + svg 变更监听）。
// 约定（过 Mimosa 扫描）：路径一律 path.join；写文件前先比对内容，无变化不写（防 git 噪音与监听自触发）。
const fs = require('fs');
const path = require('path');

// —— 生成器输出的 .js 块解析（格式由生成器保证，全仓统一；embed 工具产物是双引号，兼容两种）——
const FIG_RE = /\(window\.BUPT801\.figures\["(\d{4})"\][^)]*\)\.([A-Za-z0-9_]+) = ('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*");/s;
const META_RE = /\(window\.BUPT801\.figureMeta\["(\d{4})"\][^)]*\)\.([A-Za-z0-9_]+) = (\{[^}]*\});/s;
const META_COMMENT_RE = /^<!--\s*figureMeta\s+([\s\S]*?)\s*-->\s*([\s\S]*)$/;

function unescape1(s) {
  // 单/双引号 JS 字符串字面量 → 原文。要认全转义：\' \\ \" \uXXXX \u{...} \xXX \n \t 等，
  // 否则像 2016 a11trellis 里的 \u3000（全角空格）会被啃成 u3000。
  return s.replace(/\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[\s\S])/g, (_, e) => {
    if (e[0] === 'u' || e[0] === 'x') {
      const hex = e[0] === 'u' && e[1] === '{' ? e.slice(2, -1) : e.slice(1);
      const cp = parseInt(hex, 16);
      return cp > 0xffff ? String.fromCodePoint(cp) : String.fromCharCode(cp);
    }
    const map = { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', v: '\v', '0': '\0' };
    return Object.prototype.hasOwnProperty.call(map, e) ? map[e] : e;
  });
}

function escape1(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// fig[3] 带首尾引号（单/双两种包裹都在组里），剥壳后再反转义
function payloadOf(quoted) {
  return unescape1(quoted.slice(1, -1));
}

// 从生成器 .js 块里抠出 meta 三字段（q/kind/desc 都是 "..." 字面量）
function parseMetaObj(literal) {
  const get = (k) => {
    const m = literal.match(new RegExp(k + ':\\s*"([^"]*)"'));
    if (!m) throw new Error('meta 缺字段 ' + k + '：' + literal);
    return m[1];
  };
  return { q: get('q'), kind: get('kind'), desc: get('desc') };
}

function parseSvgFile(text, rel) {
  const m = text.match(META_COMMENT_RE);
  if (!m) throw new Error(rel + ' 缺 figureMeta 注释（首行应为 <!-- figureMeta {...} -->）');
  const meta = JSON.parse(m[1]);
  if (!meta.key) throw new Error(rel + ' figureMeta 注释缺 key');
  return { meta, svg: m[2].trim() };
}

function svgTextOf(meta, svg) {
  return '<!-- figureMeta ' + JSON.stringify(meta) + ' -->\n' + svg.trim() + '\n';
}

// 从一个 _index.js 文本里按注册出现顺序取 key（保序重建用）
function readIndexHint(text) {
  const keys = [];
  for (const m of text.matchAll(/figures\["\d{4}"\][^=]*?\.([A-Za-z0-9_]+)\s*=/g)) keys.push(m[1]);
  return keys;
}

// 扫描年目录全部 .svg 重建 _index.js。orderHint 是 key 的期望顺序（来自生成器 _index 块或
// 迁移脚本）——图库页按注册顺序显示，必须跟着题号走，不能按文件名排；不传时沿用现有 _index.js。
// 内容无变化不写盘。返回 { count, changed }。
function rebuildIndex(figDir, year, orderHint) {
  const items = [];
  const addDir = (dir, sub) => {
    for (const name of fs.readdirSync(dir).sort()) {
      if (!name.endsWith('.svg')) continue;
      const rel = sub ? sub + '/' + name : name;
      const parsed = parseSvgFile(fs.readFileSync(path.join(dir, name), 'utf8'), 'figures/' + year + '/' + rel);
      parsed.file = rel;
      items.push(parsed);
    }
  };
  addDir(figDir, '');
  const ansDir = path.join(figDir, 'answer');
  let hasAns = false;
  try { fs.readdirSync(ansDir); hasAns = true; } catch { /* 无 answer/ 目录 */ }
  if (hasAns) addDir(ansDir, 'answer');

  let hint = orderHint && orderHint.length ? orderHint : null;
  if (!hint) {
    try { hint = readIndexHint(fs.readFileSync(path.join(figDir, '_index.js'), 'utf8')); } catch { /* 首次无旧表 */ }
  }
  const rank = (it) => {
    const i = (hint || []).indexOf(it.meta.key);
    return i === -1 ? (hint || []).length + 1000 + items.indexOf(it) : i;
  };
  items.sort((a, b) => rank(a) - rank(b));

  const lines = [
    '// ' + year + ' 图库注册表 —— 由 tools/emit_figures.mjs / server 启动同步自动生成；',
    '// 源文件是本目录（含 answer/）的 *.svg（唯一维护对象），勿手改本文件',
    'window.BUPT801 = window.BUPT801 || {};',
    'window.BUPT801.figures = window.BUPT801.figures || {};',
    'window.BUPT801.figureMeta = window.BUPT801.figureMeta || {};',
    '',
  ];
  for (const it of items) {
    lines.push('(window.BUPT801.figures["' + year + '"] = window.BUPT801.figures["' + year + '"] || {}).' +
      it.meta.key + " = '" + escape1(it.svg) + "';");
  }
  lines.push('');
  for (const it of items) {
    lines.push('(window.BUPT801.figureMeta["' + year + '"] = window.BUPT801.figureMeta["' + year + '"] || {}).' +
      it.meta.key + ' = { q: ' + JSON.stringify(it.meta.q) + ', kind: ' + JSON.stringify(it.meta.kind) +
      ', desc: ' + JSON.stringify(it.meta.desc) + ' };');
  }
  const text = lines.join('\n') + '\n';
  const out = path.join(figDir, '_index.js');
  let changed = true;
  try { changed = fs.readFileSync(out, 'utf8') !== text; } catch { /* 首次生成 */ }
  if (changed) fs.writeFileSync(out, text);
  return { count: items.length, changed: changed };
}

module.exports = { FIG_RE, META_RE, unescape1, escape1, payloadOf, parseMetaObj, parseSvgFile, svgTextOf, readIndexHint, rebuildIndex };
