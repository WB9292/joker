import path from 'path'
import process from 'process'
import fs from 'fs'
import fsPromises from 'fs/promises'

import inquirer from 'inquirer'
import { execa } from 'execa'

import { error, warn, info } from './logger'
import type { CreateOptions, Plugin, PluginReturnFn } from './types'
import { findRoot } from './utils'
import tsPlugin from './tsPlugin'
import eslintPlugin from './eslintPlugin'
import { hasGit, hasPnpm, hasYarn } from './env'

export async function create(options: CreateOptions) {
  const { projectName, force, merge } = options
  const cwd = (options.cwd = path.resolve(process.cwd(), options.cwd || process.cwd()))
  const projectPath = path.resolve(cwd, projectName)
  const removeExist = () => {
    fs.rmSync(projectPath, {
      force: true,
      recursive: true
    })
  }

  if (fs.existsSync(projectPath)) {
    if (force) {
      removeExist()
    } else if (merge === false) {
      error(`${projectPath}目录已存在`)
      return
    } else if (merge !== true) {
      const { action } = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: `目录${projectPath}已存在，请选择下一步的动作`,
          choices: [
            {
              name: '覆盖',
              value: 'overwrite'
            },
            {
              name: '合并',
              value: 'merge'
            },
            {
              name: '取消',
              value: false
            }
          ]
        }
      ])

      if (!action) {
        return
      } else if (action === 'overwrite') {
        removeExist()
      }
    }
  }

  return writeTemplateToProject(projectPath, options)
}

async function writeTemplateToProject(projectPath: string, createOptions: CreateOptions) {
  const { projectName, ts, eslint, prettier } = createOptions
  const packageTemplatePath = path.resolve(findRoot(), './template/package.template.json')
  const packageConfig = JSON.parse(fs.readFileSync(packageTemplatePath, 'utf-8'))
  const createRootDir = async () => {
    if (fs.existsSync(projectPath)) {
      return
    }
    await fsPromises.mkdir(projectPath)
  }
  const writePackageJson = () => {
    const outputPath = path.resolve(projectPath, './package.json')
    fs.writeFileSync(outputPath, JSON.stringify(packageConfig, null, 2), 'utf-8')
  }
  const serialRun = [createRootDir, writePackageJson]

  packageConfig.name = projectName

  const plugins: Array<Plugin> = []

  if (ts || eslint || prettier) {
    packageConfig.devDependencies = packageConfig.devDependencies || {}
  }

  if (ts) {
    plugins.push(tsPlugin)
  }

  if (eslint) {
    plugins.push(eslintPlugin)
  }

  formatPackageConfig(packageConfig)

  const pluginsResult = plugins
    .map((plugin) => plugin(projectPath, packageConfig, createOptions))
    .filter(Boolean) as Array<PluginReturnFn>

  serialRun.push(...pluginsResult)

  await serialRun.reduce((resultPromise, fn) => {
    return resultPromise.then(() => Promise.resolve(fn()))
  }, Promise.resolve())

  info('')
  info('😁 项目创建成功，开始安装依赖')

  await execInstall(projectPath, createOptions)

  info('😁 依赖已成功安装完成')

  await initGit(projectPath, createOptions)
}

function formatPackageConfig(packageConfig: any) {
  packageConfig.devDependencies = Object.keys(packageConfig.devDependencies)
    .sort()
    .reduce(
      (result, key) => ({
        ...result,
        [key]: packageConfig.devDependencies[key]
      }),
      {}
    )
}

const PACKAGE_MANAGER_CONFIG: Record<
  string,
  {
    install: Array<string>
    add: Array<string>
    upgrade: Array<string>
    remove: Array<string>
  }
> = {
  npm: {
    install: ['install', '--loglevel', 'error'],
    add: ['install', '--loglevel', 'error'],
    upgrade: ['update', '--loglevel', 'error'],
    remove: ['uninstall', '--loglevel', 'error']
  },
  pnpm: {
    install: ['install', '--reporter', 'silent', '--shamefully-hoist'],
    add: ['install', '--reporter', 'silent', '--shamefully-hoist'],
    upgrade: ['update', '--reporter', 'silent'],
    remove: ['uninstall', '--reporter', 'silent']
  },
  yarn: {
    install: [],
    add: ['add'],
    upgrade: ['upgrade'],
    remove: ['remove']
  }
}

async function execInstall(targetProjectPath: string, { packageManager }: CreateOptions) {
  const pm = packageManager || (hasYarn() ? 'yarn' : hasPnpm() ? 'pnpm' : 'npm')
  await execa(pm, [...PACKAGE_MANAGER_CONFIG[pm].install], {
    cwd: targetProjectPath,
    stdio: 'inherit'
  })
}

async function initGit(targetProjectPath: string, { git }: CreateOptions) {
  if (!hasGit() || git === false || git === 'false') {
    return
  }

  await execa('git', ['init'], {
    cwd: targetProjectPath
  })
  await execa('git', ['add', '-A'], {
    cwd: targetProjectPath
  })

  info('')
  info('😁 git初始化成功')

  const msg = typeof git === 'string' ? git : 'init'

  try {
    await execa('git', ['commit', '-m', msg, '--no-verify'], {
      cwd: targetProjectPath
    })

    info('😁 git commit 成功')
  } catch (e) {
    warn('😭 git commit 失败')
  }
}
