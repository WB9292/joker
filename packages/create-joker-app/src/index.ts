import path from 'path'
import process from 'process'
import fs from 'fs'
import fsPromises from 'fs/promises'

import inquirer from 'inquirer'
import { execa } from 'execa'

import { error } from './logger'
import type { CreateOptions, Plugin, PluginReturnFn } from './types'
import { getFileAndDirName } from './utils'
import tsPlugin from './tsPlugin'
import eslintPlugin from './eslintPlugin'

const { __dirname } = getFileAndDirName(import.meta.url)

export async function create(options: CreateOptions) {
  const { projectName, force, merge } = options
  const cwd = (options.cwd = path.resolve(process.cwd(), options.cwd || process.cwd()))
  const projectPath = path.resolve(cwd, projectName)
  const removeExist = async () => {
    await fsPromises.rm(projectPath, {
      force: true,
      recursive: true
    })
  }

  if (fs.existsSync(projectPath)) {
    if (force) {
      await removeExist()
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
        await removeExist()
      }
    }
  }

  return writeTemplateToProject(projectPath, options)
}

async function writeTemplateToProject(projectPath: string, createOptions: CreateOptions) {
  const { projectName, ts, eslint, prettier, packageManager } = createOptions
  const packageTemplatePath = path.resolve(__dirname, '../template/package.template.json')
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

  packageConfig.devDependencies = Object.keys(packageConfig.devDependencies)
    .sort()
    .reduce(
      (result, key) => ({
        ...result,
        [key]: packageConfig.devDependencies[key]
      }),
      {}
    )

  const pluginsResult = plugins
    .map((plugin) => plugin(projectPath, packageConfig, createOptions))
    .filter(Boolean) as Array<PluginReturnFn>

  serialRun.push(...pluginsResult)

  serialRun.forEach(async (fn) => await fn())

  await execa(packageManager || 'npm', ['install'], {
    cwd: projectPath
  })
}
