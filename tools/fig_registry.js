// 图库注册表共享模块：.svg 真身 ↔ _index.js 注册表 之间的解析/重建逻辑。
// 被两处使用：tools/emit_figures.mjs（ESM 落盘链路）与 server/index.js（启动同步 + svg 变更监听）。
// 约定（过 Mimosa 扫描）：路径一律 path.join；写文件前先比对内容，无变化不写（防 git 噪音与监听自触发）。
const fs = require('fs');
const path = require('path');

// —— 生成器输出的 .js 块解析（格式由生成器保证，全仓统一；embed 工具产物是双引号，兼容两种）——
const FIG_RE = /\(window\.BUPT801\.figures\["(\d{4})"\][^)]*\)\.([A-Za-z0-9_]+) = ('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*");/s;
const META_RE = /\(window\.BUPT801\.figureMeta\["(\d{4})"\][^)]*\)\.([A-Za-z0-9_]+) = (\{[^}]*\});/s;

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
  // \n \r \t 也要转义：Inkscape 存盘的 svg 是多行文本，直接嵌单引号 JS 字符串会语法错误
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
    .replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
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
  // Inkscape 存盘会在最前面插 <?xml ...?> 声明，把 figureMeta 注释挤到第二行——
  // 所以只要求"注释出现在 <svg 之前"，不锁第一行。
  const ci = text.indexOf('<!-- figureMeta')
  const si = text.indexOf('<svg')
  if (ci === -1 || si === -1 || ci > si) {
    throw new Error(rel + ' 缺 figureMeta 注释（<svg 之前应有 <!-- figureMeta {...} -->，' +
      'Inkscape 编辑时别删它；误删可从其他图复制一行并改 key）')
  }
  const m = text.slice(ci).match(/^<!--\s*figureMeta\s+([\s\S]*?)\s*-->/)
  const meta = JSON.parse(m[1])
  if (!meta.key) throw new Error(rel + ' figureMeta 注释缺 key')
  return { meta, svg: text.slice(si).trim() }
}

function svgTextOf(meta, svg) {
  return '<!-- figureMeta ' + JSON.stringify(meta) + ' -->\n' + svg.trim() + '\n';
}

// —— 图件来源与优先级（2026-10-29 定稿）——
// **默认画法仍是 SVG 重绘**：`data/figures/<年>/**.svg` 是唯一维护对象，新图照第 5.1~5.11 节规范画。
// 允许**逐张**把某张图换成原卷截图（照片型题图：眼图、星座仪屏摄、实测谱——重绘必然失真）：
//   data/images/<年>/<年>-<题号>-<key>.png          题图（可选覆盖，用户点名才做）
//   data/images/<年>/answer/<年>-<题号>-<key>.png   解析配图（可选覆盖）
//   data/images/<年>/_meta.json                    可选：{ "<key>": { q, kind, desc } }，键序 = 图库显示序
//                                                  （只有截图、没有 .svg 的 key 靠它补题号/说明）
//   data/figures/<年>/assets/<key>.png              2026-10 的旧截图通道（仍兼容，优先级低于 images/）
//   data/figures/<年>/<年>-<题号>-<key>.svg         矢量图真身（默认来源，.svg 一律不动）
// **优先级：data/images > figures/<年>/assets > figures/<年>/*.svg**，同一 key 取最高优先级那个
// —— 也就是「换了图片就用图片」。删掉那张图片即自动回落 svg，一秒钟复原。
// 命名与 svg 完全一致：去掉扩展名、去掉「年份-题号-」前缀，剩下的就是题目数据里 fig:"key" 的 key；
// 目录格式也照抄 figures（根目录 = 题图，answer/ = 解析图）。
const IMG_EXT = ['.png', '.jpg', '.jpeg', '.webp', '.gif']; // 越前优先级越高

// 读图片像素尺寸（注册表要 w/h，外壳 svg 才能算对 viewBox）。只解析文件头，不依赖任何库。
function imgSize(buf) {
  const u32 = (o) => buf.readUInt32BE(o);
  const u16be = (o) => buf.readUInt16BE(o);
  const u16le = (o) => buf.readUInt16LE(o);
  if (buf.length > 24 && buf.slice(1, 4).toString('latin1') === 'PNG') {
    return { w: u32(16), h: u32(20) };
  }
  if (buf.slice(0, 4).toString('latin1') === 'GIF8') return { w: u16le(6), h: u16le(8) };
  if (buf.slice(0, 4).toString('latin1') === 'RIFF' && buf.slice(8, 12).toString('latin1') === 'WEBP') {
    const ck = buf.slice(12, 16).toString('latin1');
    if (ck === 'VP8X') return { w: buf.readUIntLE(24, 3) + 1, h: buf.readUIntLE(27, 3) + 1 };
    if (ck === 'VP8 ') return { w: u16le(26) & 0x3fff, h: u16le(28) & 0x3fff };
    if (ck === 'VP8L') {
      const b = buf.readUInt32LE(21);
      return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
    }
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) { // JPEG：扫 SOF 段
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const m = buf[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
        return { w: u16be(i + 7), h: u16be(i + 5) };
      }
      i += 2 + u16be(i + 2);
    }
  }
  return null; // 认不出来：调用方退回像素级无法计算，用占位并告警
}

// 扫 assets/ 目录，返回 { key: { src, w, h, file } }。同名多格式按 IMG_EXT 优先级取一张。
function scanShots(figDir, year, keys) {
  const dir = path.join(figDir, 'assets');
  const shots = {};
  let names = [];
  try { names = fs.readdirSync(dir); } catch { return shots; }
  for (const name of names) {
    const ext = path.extname(name).toLowerCase();
    const pri = IMG_EXT.indexOf(ext);
    if (pri === -1) continue;
    const key = path.basename(name, path.extname(name));
    if (!keys.has(key)) {
      shots['\u0000unused:' + name] = { file: name, unused: true };
      continue;
    }
    const cur = shots[key];
    if (cur && IMG_EXT.indexOf(path.extname(cur.file).toLowerCase()) <= pri) continue;
    let size = null;
    try { size = imgSize(fs.readFileSync(path.join(dir, name))); } catch { /* 读不了当未知 */ }
    shots[key] = {
      src: '/data/figures/' + year + '/assets/' + name,
      w: (size && size.w) || 1200,
      h: (size && size.h) || 800,
      file: name,
      sizeKnown: !!size,
    };
  }
  return shots;
}

// 从截图文件名推 key / 题号：`2026-三-q3recv.png` → { key:'q3recv', q:'三' }；
// 没有「年份-题号-」前缀时整段当 key（自己乱命名的兜底，仍能注册）。
function keyFromImageName(name) {
  const stem = path.basename(name, path.extname(name))
  const m = /^\d{4}-([^-]+)-(.+)$/.exec(stem)
  return m ? { key: m[2].trim(), q: m[1].trim() } : { key: stem.trim(), q: '' }
}

// data/images/<年>/_meta.json（可选）：给只有截图的 key 补 q/kind/desc，键序同时充当即显示顺序。
// 两种写法都认：{ "key": {...} } 与 { "figures": { "key": {...} } }。
function readMetaJson(imgDir) {
  try {
    const o = JSON.parse(fs.readFileSync(path.join(imgDir, '_meta.json'), 'utf8'))
    const map = (o && typeof o === 'object' && o.figures && typeof o.figures === 'object') ? o.figures : o
    return map && typeof map === 'object' && !Array.isArray(map) ? map : {}
  } catch { return {} }
}

// 扫 data/images/<年>/（含 answer/ 及任意子目录），返回 { map, bad }：
//   map: key → { src, w, h, rel, kind, q }，键序 = 文件名字典序（图库页在 _meta.json 缺席时也有稳定顺序）
//   bad: 文件名不合规范、未注册的图（截图工具默认名如「截图 2026-10-29 19-32-25.png」全落这里）
// 同一 key 多格式/多处出现时按 IMG_EXT 取优先级最高的一张（同名 png 胜过 jpg）。
function scanImageDir(imgDir, year) {
  const map = new Map()
  const bad = []
  const walk = (dir, sub) => {
    let names = []
    try { names = fs.readdirSync(dir).sort() } catch { return } // 目录不存在 = 这一年没有截图
    for (const name of names) {
      if (name.startsWith('_') || name.startsWith('.')) continue // _meta.json / 草稿不注册
      const root = path.resolve(dir)
      const full = path.resolve(root, name)
      if (!full.startsWith(root + path.sep)) continue // 越出扫描根的目录项不收（防御 crafted 名）
      let st = null
      try { st = fs.statSync(full) } catch { continue }
      if (st.isDirectory()) { walk(full, sub ? sub + '/' + name : name); continue }
      const ext = path.extname(name).toLowerCase()
      const pri = IMG_EXT.indexOf(ext)
      if (pri === -1) continue
      const { key, q } = keyFromImageName(name)
      // key 必须是 ASCII 标识符，且要跟题目数据里的 fig:"key" 对得上；
      // 「截图 2026-10-29 19-32-25.png」这种截图工具默认名一律不注册，只告警。
      if (!/^[A-Za-z0-9_-]+$/.test(key)) { bad.push((sub ? sub + '/' : '') + name); continue }
      const rel = sub ? sub + '/' + name : name
      const cur = map.get(key)
      if (cur && IMG_EXT.indexOf(path.extname(cur.rel).toLowerCase()) <= pri) continue
      let size = null
      try { size = imgSize(fs.readFileSync(full)) } catch { /* 读不了按未知尺寸 */ }
      map.set(key, {
        src: '/data/images/' + year + '/' + rel,
        w: (size && size.w) || 1200,
        h: (size && size.h) || 800,
        sizeKnown: !!size,
        rel,
        q,
        kind: /^answer(\/|$)/.test(sub || '') ? 'answer' : 'paper',
      })
    }
  }
  walk(imgDir, '')
  return { map, bad }
}


// 从一个 _index.js 文本里按注册出现顺序取 key（保序重建用）
function readIndexHint(text) {
  const keys = [];
  for (const m of text.matchAll(/figures\["\d{4}"\][^=]*?\.([A-Za-z0-9_]+)\s*=/g)) keys.push(m[1]);
  return keys;
}

// 扫描年目录的截图（data/images/<年>）与历史 .svg（data/figures/<年>）重建 _index.js。
// orderHint 是 key 的期望顺序（来自生成器 _index 块或迁移脚本）——图库页按注册顺序显示，
// 必须跟着题号走，不能按文件名排；不传时用 data/images/<年>/_meta.json 的键序，再不行沿用现有 _index.js。
// 内容无变化不写盘。返回 { count, changed, shots, shotKeys, unused, unknown, imgs }。
// 只有截图、没有 svg 的年份也走这里（figDir 会被建出来，因为 index.html 引用的是 figures/<年>/_index.js）。
function rebuildIndex(figDir, year, orderHint) {
  fs.mkdirSync(figDir, { recursive: true }) // 新年份可能只有 data/images/，注册表仍写在 figures/<年>/

  const imgDir = path.resolve(figDir, '..', '..', 'images', year) // data/figures/<年> → data/images/<年>
  const { map: imageMap, bad: badNames } = scanImageDir(imgDir, year)
  const metaJson = readMetaJson(imgDir)

  const items = [];
  const addDir = (dir, sub) => {
    for (const name of fs.readdirSync(dir).sort()) {
      if (!name.endsWith('.svg') || name.startsWith('_')) continue // _ 前缀 = 备份/草稿，不注册
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

  // 同名 key 防护：备份/副本文件（如 "xxx (副本).svg"）混进图库会让注册表二义
  const seen = new Set();
  for (const it of items) {
    if (seen.has(it.meta.key)) {
      throw new Error(`figures/${year}: key "${it.meta.key}" 重复（文件 ${it.file}）。` +
        '请把备份/副本文件挪出 data/figures/ 再重建注册表');
    }
    seen.add(it.meta.key);
  }

  // 只有截图、没有对应 .svg 的 key（新年份的常态）：meta 从 _meta.json 补，缺了按文件名推。
  // q 用「题」+ 文件名里的题号段；desc 缺省用 key（图库页显示成 "题三 · q3recv"，够认）。
  const svgKeys = new Set(items.map((it) => it.meta.key));
  for (const [k, im] of imageMap) {
    if (svgKeys.has(k)) continue;
    const mj = metaJson[k] || {};
    items.push({
      meta: {
        key: k,
        q: mj.q || (im.q ? '题' + im.q : ''),
        kind: mj.kind || im.kind,
        desc: mj.desc || k,
      },
      file: 'images/' + im.rel,
      imageOnly: true,
    });
  }

  let hint = orderHint && orderHint.length ? orderHint : null;
  if (!hint) {
    const mjOrder = Object.keys(metaJson);
    if (mjOrder.length) hint = mjOrder;
  }
  if (!hint) {
    try { hint = readIndexHint(fs.readFileSync(path.join(figDir, '_index.js'), 'utf8')); } catch { /* 首次无旧表 */ }
  }
  const rank = (it) => {
    const i = (hint || []).indexOf(it.meta.key);
    return i === -1 ? (hint || []).length + 1000 + items.indexOf(it) : i;
  };
  items.sort((a, b) => rank(a) - rank(b));

  // 截图描述符：data/images/<年>/** 优先，其次 figures/<年>/assets/*。命中时该 key 注册成
  // { src, w, h }；前端 figToSvg() 会把它包成「只有一张 <image> 的 svg 外壳」，于是图库页 / 正文 /
  // 灯箱 / 版式审计 / 遮挡检查全都不用改，截图上页面仍然是一张 <svg>。
  const assetShots = scanShots(figDir, year, new Set(items.map((it) => it.meta.key)));
  const unused = Object.keys(assetShots).filter((k) => k.startsWith('\u0000unused:')).map((k) => assetShots[k].file);
  const pics = new Map();
  for (const [k, v] of Object.entries(assetShots)) if (!k.startsWith('\u0000unused:')) pics.set(k, v);
  for (const [k, v] of imageMap) pics.set(k, v); // 截图目录优先级最高，覆盖 assets/ 同名图
  const shotKeys = [...pics.keys()];

  const lines = [
    '// ' + year + ' 图库注册表 —— 由 tools/emit_figures.mjs / server 启动同步自动生成；',
    '// 源文件：data/images/' + year + '/**（原卷截图，唯一维护对象）→ 优先级最高',
    '//         data/figures/' + year + '/**.svg（历史矢量，只读保留，没有同名截图时才用）',
    '// 有截图的 key 注册为位图描述符 { src, w, h }，否则注册 svg 字符串；勿手改本文件',
    'window.BUPT801 = window.BUPT801 || {};',
    'window.BUPT801.figures = window.BUPT801.figures || {};',
    'window.BUPT801.figureMeta = window.BUPT801.figureMeta || {};',
    '',
  ];
  for (const it of items) {
    // key 必须是合法 JS 标识符才能裸写；截图工具命名的纯数字 key（如 2020-七-3.png → key `3`）要加引号，
    // 否则生成的 _index.js 直接语法错误、整年图库加载失败（2020-10-31 踩过）
    const qk = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(it.meta.key) ? it.meta.key : JSON.stringify(it.meta.key);
    const k = it.meta.key;
    const s = pics.get(k);
    lines.push('(window.BUPT801.figures["' + year + '"] = window.BUPT801.figures["' + year + '"] || {}).' + qk +
      ' = ' + (s
        ? "{ src: '" + escape1(s.src) + "', w: " + s.w + ', h: ' + s.h + ' };'
        : "'" + escape1(it.svg) + "';"));
  }
  lines.push('');
  for (const it of items) {
    const qk = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(it.meta.key) ? it.meta.key : JSON.stringify(it.meta.key);
    lines.push('(window.BUPT801.figureMeta["' + year + '"] = window.BUPT801.figureMeta["' + year + '"] || {}).' +
      qk + ' = { q: ' + JSON.stringify(it.meta.q) + ', kind: ' + JSON.stringify(it.meta.kind) +
      ', desc: ' + JSON.stringify(it.meta.desc) + ' };');
  }
  const text = lines.join('\n') + '\n';
  const out = path.join(figDir, '_index.js');
  let changed = true;
  try { changed = fs.readFileSync(out, 'utf8') !== text; } catch { /* 首次生成 */ }
  if (changed) fs.writeFileSync(out, text);
  const unknown = shotKeys.filter((k) => !pics.get(k).sizeKnown);
  return {
    count: items.length, changed: changed, shots: shotKeys.length, shotKeys: shotKeys,
    imgs: imageMap.size, badNames: badNames, unused: unused, unknown: unknown,
  };
}

module.exports = {
  FIG_RE, META_RE, unescape1, escape1, payloadOf, parseMetaObj, parseSvgFile, svgTextOf,
  readIndexHint, rebuildIndex, scanShots, scanImageDir, readMetaJson, keyFromImageName, imgSize, IMG_EXT,
};
