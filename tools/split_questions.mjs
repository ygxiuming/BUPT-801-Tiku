// 把旧版 data/questions/<年>.js / <年>-b.js / <年>-big.js 拆分为新年份目录：
//   data/questions/<年>/paper.js   —— 真题：试卷元数据 + groups + 题干/选项（无答案无解析）
//   data/questions/<年>/answer.js  —— 答案与解析：{ "<题目id>": { answer?, exp?, sol? } }
// 用法：node tools/split_questions.mjs <年>   （默认 2025）
// 页面/服务端加载后由 hydrateAnswers() 把 answer 合并回题目（见 app/src/lib/data.js）
import { existsSync, mkdirSync, readdirSync, writeFileSync, unlinkSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const root = join(dirname(dirname(fileURLToPath(import.meta.url)))) // 项目根
const year = process.argv[2] || '2025'
const dirOld = join(root, 'data', 'questions')

// 旧数据脚本是 CJS 风格向全局 window 挂载
global.window = { BUPT801: {} }
const req = createRequire(import.meta.url)
const loads = [year + '.js', year + '-b.js', year + '-big.js']
for (const f of loads) {
  const p = join(dirOld, f)
  if (existsSync(p)) req(p)
}

const paper = global.window.BUPT801.papers && global.window.BUPT801.papers[year]
if (!paper) { console.error('未找到 ' + year + ' 年题目数据'); process.exit(1) }

// 拆分：paper 去掉 answer/exp/sol；answer 按题目 id 收集
const answers = {}
const paperOnly = JSON.parse(JSON.stringify(paper))
for (const q of paperOnly.questions) {
  const a = {}
  if (q.answer !== undefined) a.answer = q.answer
  if (q.exp !== undefined) a.exp = q.exp
  if (q.sol !== undefined) a.sol = q.sol
  if (Object.keys(a).length) answers[q.id] = a
  delete q.answer; delete q.exp; delete q.sol
}

const dirNew = join(dirOld, year)
mkdirSync(dirNew, { recursive: true })
const head = 'window.BUPT801 = window.BUPT801 || {};\n'
writeFileSync(join(dirNew, 'paper.js'),
  '// ' + year + ' · 真题（试卷元数据 + groups + 题干/选项）—— 答案与解析在同目录 answer.js\n' +
  head + 'window.BUPT801.papers = window.BUPT801.papers || {};\n' +
  'window.BUPT801.papers["' + year + '"] = ' + JSON.stringify(paperOnly, null, 2) + ';\n')
writeFileSync(join(dirNew, 'answer.js'),
  '// ' + year + ' · 答案与解析（按题目 id 索引；加载后由 hydrateAnswers() 合并回题目）\n' +
  head + 'window.BUPT801.answers = window.BUPT801.answers || {};\n' +
  'window.BUPT801.answers["' + year + '"] = ' + JSON.stringify(answers, null, 2) + ';\n')

// 删除旧格式文件（内容已完整迁移）
for (const f of loads) {
  const p = join(dirOld, f)
  if (existsSync(p)) unlinkSync(p)
}
console.log('split done: data/questions/' + year + '/paper.js + answer.js，题目 ' +
  paperOnly.questions.length + ' 道，答案条目 ' + Object.keys(answers).length + ' 条')
console.log('questions/ 现有:', readdirSync(dirOld).join(', '))
