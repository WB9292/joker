import path from 'path'
import process from 'process'
import fs from 'fs'
import fsPromises from 'fs/promises'
import inquirer from 'inquirer'
import { error } from './logger'

interface CreateOptions {
  // 项目名称
  projectName: string
  // 是否使用 typescript
  ts?: boolean
  // 是否使用 eslint
  eslint?: boolean
  // 是否使用 prettier
  prettier?: boolean
  // 当前工作目录
  cwd?: string
  // 包管理器
  packageManager?: string
  // 是否强制删除已存在的目录
  force?: boolean
  // 如果已存在，是否合并
  merge?: boolean
  // 是否初始化 git
  git?: boolean
}

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
      error(`${projectName}目录已存在`)
      return
    } else if (merge !== true) {
      const { action } = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
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

  writeTemplateToProject(projectPath, options)
}

function writeTemplateToProject(
  projectPath: string,
  { projectName, ts, eslint, prettier }: CreateOptions
) {
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

  if (ts || eslint || prettier) {
    packageConfig.devDependencies = packageConfig.devDependencies || {}
  }

  if (ts) {
    const tsconfigTemplatePath = path.resolve(
      __dirname,
      '../template/tsconfig.template.json'
    )
    const writeTsconfig = () => {
      const outputPath = path.resolve(projectPath, './tsconfig.json')
      fs.copyFileSync(tsconfigTemplatePath, outputPath)
    }

    serialRun.push(writeTsconfig)

    packageConfig.devDependencies = {
      ...packageConfig.devDependencies,
      typescript: '^4.6.4'
    }
  }

  if (eslint) {
    packageConfig.devDependencies = {
      ...packageConfig.devDependencies,
      eslint: '^8.15.0',
      'eslint-define-config': '^1.4.0',
      'eslint-plugin-import': '^2.26.0',
      'eslint-plugin-node': '^11.1.0',
      'eslint-plugin-prettier': '^4.0.0'
    }

    if (ts) {
      packageConfig.devDependencies = {
        ...packageConfig.devDependencies,
        '@typescript-eslint/eslint-plugin': '^5.23.0',
        '@typescript-eslint/parser': '^5.23.0'
      }
    }
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

  serialRun.forEach(async (fn) => await fn())
}
