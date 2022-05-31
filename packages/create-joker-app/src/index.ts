import path from 'path'
import fs from 'fs'
import fsPromises from 'fs/promises'

import prompts from 'prompts'
import execa from 'execa'
import colors from 'picocolors'

import { error, warn, info } from './logger'
import type { CreateOptions, Plugin, PluginReturnFn } from './types'
import { findRoot } from './utils'
import tsPlugin from './tsPlugin'
import eslintPlugin from './eslintPlugin'
import { hasGit, hasPnpm, hasYarn } from './env'

export async function create(options: CreateOptions) {
  const { projectName, force, merge } = options
  const cwd = (options.cwd = path.resolve(options.cwd || '.'))
  const projectPath = path.resolve(cwd, projectName ?? '.')
  const removeExist = () => {
    fs.rmSync(projectPath, {
      force: true,
      recursive: true
    })
  }

  if (fs.existsSync(projectPath)) {
    if (force) {
      removeExist()
      info(`${projectPath}项目目录已存在，已直接强制删除`)
    } else if (merge === false) {
      // 如果明确设置不合并，但是文件夹又存在，则报错
      error(`${projectPath}项目目录已存在，退出`)
      return
    } else if (!merge) {
      const { action } = await prompts.prompt([
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
        info(colors.red('✖') + ' 操作已取消')
        return
      } else if (action === 'overwrite') {
        removeExist()
      }
    }
  }

  info('😁 开始创建项目')

  return writeTemplateToProject(projectPath, options)
}

async function writeTemplateToProject(projectPath: string, createOptions: CreateOptions) {
  const { projectName, ts, eslint } = createOptions
  const packageTemplatePath = path.resolve(findRoot(), './template/package.template.json')
  const packageConfig = JSON.parse(fs.readFileSync(packageTemplatePath, 'utf-8'))
  const createRootDir = async () => {
    if (fs.existsSync(projectPath)) {
      return
    }
    await fsPromises.mkdir(projectPath)
  }
  const writeBaseFiles = () => {
    const packageJSONFilePath = path.resolve(projectPath, './package.json')
    fs.writeFileSync(packageJSONFilePath, JSON.stringify(packageConfig, null, 2), 'utf-8')
  }
  const serialRun = [createRootDir, writeBaseFiles]

  packageConfig.name = projectName ?? path.basename(projectPath)

  const plugins: Array<Plugin> = []

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

  const gitIgnoreTemplatePath = path.resolve(findRoot(), './template/_gitignore')
  const gitIgnoreFilePath = path.resolve(targetProjectPath, './.gitignore')
  fs.writeFileSync(gitIgnoreFilePath, fs.readFileSync(gitIgnoreTemplatePath))

  try {
    await execa('git', ['commit', '-m', msg, '--no-verify'], {
      cwd: targetProjectPath
    })

    info('😁 git commit 成功')
  } catch (e) {
    warn('😭 git commit 失败')
  }
}
