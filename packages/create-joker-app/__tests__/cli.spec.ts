import 'jest'
import path from 'path'
import fs from 'fs'

import type { SyncOptions } from 'execa'
import { command, commandSync } from 'execa'

const BIN_PATH = path.resolve(__dirname, '../src/cli.ts')

const projectName = 'test-app'
const projectPath = path.resolve(__dirname, projectName)

function remove() {
  fs.rmSync(projectPath, {
    force: true,
    recursive: true
  })
}

function genCommand(args: string[]) {
  return `node --loader ts-node/esm ${BIN_PATH} ${args.join(' ')}`
}

function run(args: string[], options: SyncOptions = {}) {
  return command(genCommand(args), {
    ...options,
    cwd: __dirname
  })
}

/**
 * 异步的方式获取日志输出
 * @param args
 * @param options
 * @param logAmount 收集的日志的个数
 */
function runForLogs(args: string[], options: SyncOptions = {}, logAmount = 1) {
  const subprocess = run(args, options)
  const logs: Array<string> = []
  return new Promise<Array<string>>((resolve) => {
    if (subprocess.stdout) {
      subprocess.stdout.on('data', (data) => {
        logs.push(`${data}`)
        if (--logAmount === 0) {
          resolve(logs)
          subprocess.kill()
        }
      })
    } else {
      resolve(
        Array.from({
          length: logAmount
        }).map(() => '')
      )
    }
  })
}

function runSync(args: string[], options: SyncOptions = {}) {
  return commandSync(genCommand(args), {
    ...options,
    cwd: __dirname
  })
}

function createMockProject() {
  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath, {
      recursive: true
    })
  }
  const packageJSONPath = path.resolve(projectPath, 'package.json')
  fs.writeFileSync(
    packageJSONPath,
    JSON.stringify(
      {
        name: projectName
      },
      null,
      2
    )
  )
}

function hasFile(targetFileName: string) {
  const files = fs.readdirSync(projectPath)
  return files.some((name) => name.includes(targetFileName))
}

describe('测试cli命令以及提示', () => {
  beforeAll(remove)
  afterEach(remove)

  test('提示输入项目名称', () => {
    const { stdout } = runSync([])
    expect(stdout).toContain('请输入项目名称')
  })

  test('提示是否使用 Typescript', () => {
    const { stdout } = runSync([projectName])
    expect(stdout).toContain('Typescript')
  })

  test('提示是否使用 Eslint', () => {
    const { stdout } = runSync([projectName, '--ts'])
    expect(stdout).toContain('ESLint')
  })

  test('提示是否使用 Prettier', () => {
    const { stdout } = runSync([projectName, '--ts', '--eslint'])
    expect(stdout).toContain('Prettier')
  })

  test('正常开始创建项目', async () => {
    const [log] = await runForLogs([projectName, '--ts', '--eslint', '--prettier'])
    expect(log).toContain('开始创建项目')
  })

  test('项目目录已存在，设置--force，强制删除', async () => {
    createMockProject()

    const [log] = await runForLogs([projectName, '--ts', '--eslint', '--prettier', '-f'])
    expect(log).toContain('目录已存在，已直接强制删除')
  })

  test('项目目录已存在，设置--merge=false，报错', () => {
    createMockProject()
    const { stderr } = runSync([
      projectName,
      '--ts',
      '--eslint',
      '--prettier',
      '--merge=false'
    ])
    expect(stderr).toContain('项目目录已存在，退出')
  })

  test('项目目录已存在，选择下一步动作', () => {
    createMockProject()
    const { stdout } = runSync([projectName, '--ts', '--eslint', '--prettier'])
    expect(stdout).toContain('请选择下一步的动作')
  })

  test('正常创建项目，只有基本文件', () => {
    const { stdout } = runSync([
      projectName,
      '--ts=false',
      '--eslint=false',
      '--prettier=false',
      '--git=false'
    ])
    expect(stdout).toContain('依赖已成功安装完成')

    expect(hasFile('package.json')).toBeTruthy()
    expect(hasFile('tsconfig.json')).toBeFalsy()
    expect(hasFile('.eslintrc.js')).toBeFalsy()
    expect(hasFile('.git')).toBeFalsy()
    expect(hasFile('.gitignore')).toBeFalsy()
  })

  test('设置--ts', () => {
    const { stdout } = runSync([
      projectName,
      '--ts=true',
      '--eslint=false',
      '--prettier=false',
      '--git=false'
    ])
    expect(stdout).toContain('依赖已成功安装完成')

    expect(hasFile('package.json')).toBeTruthy()
    expect(hasFile('tsconfig.json')).toBeTruthy()
    expect(hasFile('.eslintrc.js')).toBeFalsy()
    expect(hasFile('.git')).toBeFalsy()
    expect(hasFile('.gitignore')).toBeFalsy()
  })

  test('设置--eslint', () => {
    const { stdout } = runSync([
      projectName,
      '--ts=true',
      '--eslint=true',
      '--prettier=false',
      '--git=false'
    ])
    expect(stdout).toContain('依赖已成功安装完成')

    expect(hasFile('package.json')).toBeTruthy()
    expect(hasFile('tsconfig.json')).toBeTruthy()
    expect(hasFile('.eslintrc.js')).toBeTruthy()
    expect(hasFile('.git')).toBeFalsy()
    expect(hasFile('.gitignore')).toBeFalsy()
  })

  test('设置--git', () => {
    const { stdout } = runSync([
      projectName,
      '--ts=true',
      '--eslint=true',
      '--prettier=false',
      '--git=true'
    ])
    expect(stdout).toContain('依赖已成功安装完成')
    expect(stdout).toContain('git commit 成功')

    expect(hasFile('package.json')).toBeTruthy()
    expect(hasFile('tsconfig.json')).toBeTruthy()
    expect(hasFile('.eslintrc.js')).toBeTruthy()
    expect(hasFile('.git')).toBeTruthy()
    expect(hasFile('.gitignore')).toBeTruthy()
  })
})
