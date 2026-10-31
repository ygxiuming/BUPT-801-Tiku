// 图库注册表共享模块：data/images/<年>/**.png ↔ _index.js 注册表 之间的扫描/重建逻辑。
// 被两处使用：tools/emit_figures.mjs（落盘链路）与 server/index.js（启动同步 + 图片变更监听）。
// 约定（过 Mimosa 扫描）：路径一律 path.join；写文件前先比对内容，无变化不写（防 git 噪音与监听自触发）。
//
// 存储形态（2026-11 定稿：图件只有位图，SVG 重绘已退役）：
//   data/images/<年>/<年>-<题号>-<key>.png          题图（唯一维护对象：用户提供的截图，只许改名/垫边）
//   data/images/<年>/answer/<年>-<题号>-<key>.png   解析配图，同命名
//   data/images/<年>/_meta.json                    可选：{ "<key>": { q, kind, desc } }，键序 = 图库显示序
//   data/images/<年>/_index.js                     自动生成的注册表（浏览器/Node 两用，勿手改）
// 注册值一律是位图描述符 { src, w, h }，前端 figToSvg() 包成「只有一张 <image> 的 svg 外壳」，
// 于是正文 / 图库 / 灯箱 / 版式审计全部照旧工作，页面上仍是一张 <svg>。
const fs = require('fs');
const path = require('path');

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
  for (const m of text.matchAll(/figures\["\d{4}"\][^=]*?(?:\.([A-Za-z0-9_]+)|\[("(?:[^"\\]|\\.)*")\])\s*=/g)) {
    keys.push(m[1] || JSON.parse(m[2]));
  }
  return keys;
}

// 扫 data/images/<年>/ 重建该年注册表 _index.js（注册值一律 { src, w, h } 位图描述符）。
// orderHint 是 key 的期望顺序——图库页按注册顺序显示，必须跟着题号走：优先 _meta.json 的键序，
// 再不行沿用现有 _index.js 的注册序。内容无变化不写盘。返回 { count, changed, shotKeys, imgs, badNames, unknown }。
function rebuildIndex(imgDir, year, orderHint) {
  fs.mkdirSync(imgDir, { recursive: true }) // 首次也把目录建出来

  const { map: imageMap, bad: badNames } = scanImageDir(imgDir, year)
  const metaJson = readMetaJson(imgDir)

  const items = [];
  for (const [k, im] of imageMap) {
    // meta：_meta.json 补 q/kind/desc；缺了按文件名推（q 用「题」+ 文件名里的题号段，
    // desc 缺省用 key，图库页显示成 "题三 · q3recv"，够认）。
    const mj = metaJson[k] || {};
    items.push({
      key: k,
      meta: {
        key: k,
        q: mj.q || (im.q ? '题' + im.q : ''),
        kind: mj.kind || im.kind,
        desc: mj.desc || k,
      },
      pic: im,
    });
  }

  let hint = orderHint && orderHint.length ? orderHint : null;
  if (!hint) {
    const mjOrder = Object.keys(metaJson);
    if (mjOrder.length) hint = mjOrder;
  }
  if (!hint) {
    try { hint = readIndexHint(fs.readFileSync(path.join(imgDir, '_index.js'), 'utf8')); } catch { /* 首次无旧表 */ }
  }
  const rank = (it) => {
    const i = (hint || []).indexOf(it.meta.key);
    return i === -1 ? (hint || []).length + 1000 + items.indexOf(it) : i;
  };
  items.sort((a, b) => rank(a) - rank(b));

  const lines = [
    '// ' + year + ' 图库注册表 —— 由 tools/emit_figures.mjs / server 启动同步自动生成；',
    '// 源文件：data/images/' + year + '/**（原卷截图，唯一维护对象）；勿手改本文件',
    '// 每个 key 注册为位图描述符 { src, w, h }，前端 figToSvg() 包成 svg 外壳显示',
    'window.BUPT801 = window.BUPT801 || {};',
    'window.BUPT801.figures = window.BUPT801.figures || {};',
    'window.BUPT801.figureMeta = window.BUPT801.figureMeta || {};',
    '',
  ];
  for (const it of items) {
    // key 必须是合法 JS 标识符才能裸写；纯数字 key（如 2016-一-20.png → key `20`）要走方括号
    // obj["20"]——点号接引号 ."20" 是语法错误，整年图库加载失败（2020-10-31 / 2016 踩过）
    const acc = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(it.key)
      ? '.' + it.key
      : '[' + JSON.stringify(it.key) + ']';
    lines.push('(window.BUPT801.figures["' + year + '"] = window.BUPT801.figures["' + year + '"] || {})' + acc +
      " = { src: '" + it.pic.src + "', w: " + it.pic.w + ', h: ' + it.pic.h + ' };');
  }
  lines.push('');
  for (const it of items) {
    const acc = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(it.key)
      ? '.' + it.key
      : '[' + JSON.stringify(it.key) + ']';
    lines.push('(window.BUPT801.figureMeta["' + year + '"] = window.BUPT801.figureMeta["' + year + '"] || {})' +
      acc + ' = { q: ' + JSON.stringify(it.meta.q) + ', kind: ' + JSON.stringify(it.meta.kind) +
      ', desc: ' + JSON.stringify(it.meta.desc) + ' };');
  }
  const text = lines.join('\n') + '\n';
  const out = path.join(imgDir, '_index.js');
  let changed = true;
  try { changed = fs.readFileSync(out, 'utf8') !== text; } catch { /* 首次生成 */ }
  if (changed) fs.writeFileSync(out, text);
  const unknown = items.filter((it) => !it.pic.sizeKnown).map((it) => it.key);
  return {
    count: items.length, changed: changed, shotKeys: items.map((it) => it.key),
    imgs: imageMap.size, badNames: badNames, unknown: unknown,
  };
}

module.exports = {
  readIndexHint, rebuildIndex, scanImageDir, readMetaJson, keyFromImageName, imgSize, IMG_EXT,
};
