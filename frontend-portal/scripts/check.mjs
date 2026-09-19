#!/usr/bin/env node
/**
 * 门户网站上线前统一检查流程
 *
 *   步骤 1/3  依赖安装与缓存：依据 package-lock.json 哈希决定是否执行 npm ci，
 *             未变更则跳过（npm 自身的下载缓存仍会复用）
 *   步骤 2/3  类型校验：vue-tsc --noEmit
 *   步骤 3/3  代码检查：eslint
 *
 * 本地与上线前（Dockerfile 构建阶段）执行的都是这一条命令：npm run check
 * 任一步骤失败立即终止并标明步骤、原因与退出码；修复后重跑会自动跳过已通过步骤。
 *
 * 用法：
 *   npm run check                 # 完整流程
 *   npm run check -- --skip-install   # 跳过依赖安装（依赖已装好时使用）
 *   CHECK_SKIP_INSTALL=1 npm run check
 */
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import process from 'node:process'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const lockfilePath = join(projectRoot, 'package-lock.json')
const nodeModulesDir = join(projectRoot, 'node_modules')
const stampPath = join(nodeModulesDir, '.check-installed-lock')

const args = process.argv.slice(2)
const skipInstall = args.includes('--skip-install') || process.env.CHECK_SKIP_INSTALL === '1'
const isWindows = process.platform === 'win32'

function run(command, commandArgs) {
  return new Promise((resolve) => {
    const child = spawn(command, commandArgs, {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: isWindows
    })
    child.on('error', (err) => resolve({ code: -1, error: err }))
    child.on('close', (code) => resolve({ code: code ?? -1 }))
  })
}

function hashLockfile() {
  return createHash('sha256').update(readFileSync(lockfilePath)).digest('hex')
}

function fmtDuration(ms) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
}

function printHeader(step, title, detail) {
  console.log(`\n=== [${step}/3] ${title}${detail ? `（${detail}）` : ''} ===`)
}

function fail(step, title, reason) {
  console.error(`\n✖ [${step}/3] ${title}失败：${reason}`)
  console.error('  请根据上面的输出修复问题后重新执行 npm run check，已通过的步骤会自动跳过。')
  process.exit(1)
}

async function stepInstall() {
  printHeader(1, '依赖安装与缓存', 'npm ci')

  if (skipInstall) {
    if (!existsSync(nodeModulesDir)) {
      fail(1, '依赖安装与缓存', '指定了 --skip-install 但 node_modules 不存在，请先去掉该参数执行一次 npm run check')
    }
    console.log('ℹ 已指定 --skip-install，跳过依赖安装')
    return
  }

  if (!existsSync(lockfilePath)) {
    fail(1, '依赖安装与缓存', '缺少 package-lock.json，无法执行 npm ci，请先提交 lockfile')
  }

  const currentHash = hashLockfile()
  const previousHash = existsSync(stampPath)
    ? readFileSync(stampPath, 'utf8').trim()
    : null

  if (existsSync(nodeModulesDir) && previousHash === currentHash) {
    console.log('✔ package-lock.json 自上次安装后未变更，跳过安装（如需强制重装请删除 node_modules）')
    return
  }

  if (!previousHash) {
    console.log('ℹ 未检测到安装记录，开始安装依赖……')
  } else {
    console.log('ℹ package-lock.json 已变更，按 lockfile 重新安装依赖……')
  }

  const started = Date.now()
  const result = await run('npm', ['ci'])
  if (result.code !== 0) {
    if (result.code === -1 && result.error) {
      fail(1, '依赖安装与缓存', `无法启动 npm：${result.error.message}`)
    }
    fail(1, '依赖安装与缓存', `npm ci 退出码 ${result.code}，常见原因为 package.json 与 package-lock.json 不同步（可在本地执行 npm install 后提交 lockfile）`)
  }

  writeFileSync(stampPath, currentHash)
  console.log(`✔ 依赖安装完成（${fmtDuration(Date.now() - started)}）`)
}

async function runCheckedStep(step, title, detail, npmScript) {
  printHeader(step, title, detail)
  const started = Date.now()
  const result = await run('npm', ['run', npmScript])
  if (result.code !== 0) {
    if (result.code === -1 && result.error) {
      fail(step, title, `无法启动 npm：${result.error.message}（依赖是否已安装？）`)
    }
    fail(step, title, `退出码 ${result.code}`)
  }
  console.log(`✔ ${title}通过（${fmtDuration(Date.now() - started)}）`)
}

async function main() {
  console.log('门户网站上线前检查：依赖安装与缓存 → 类型校验 → 代码检查')

  await stepInstall()
  await runCheckedStep(2, '类型校验', 'vue-tsc --noEmit', 'type-check')
  await runCheckedStep(3, '代码检查', 'eslint', 'lint')

  console.log('\n🎉 全部检查通过（1/3 依赖安装与缓存、2/3 类型校验、3/3 代码检查）')
}

main().catch((err) => fail('?', '检查流程', err?.message || String(err)))
