import inquirer from 'inquirer'
import cac from 'cac'

import { createRequire } from './utils'

import { create } from '.'

const require = createRequire()
const cli = cac('create-joker-app')

cli
  .command('[projectName]', '创建项目')
  .alias('create')
  .option('--cwd <cwd>', '[string] 项目的工作目录')
  .option('-m, --packageManager <packageManager>', '[string] 指定使用的包管理器')
  .option('-f, --force', '[boolean] 如果项目存在，强制删除')
  .option('--merge', '[boolean] 如果项目存在，合并项目')
  .option('-g, --git', '[boolean] 初始化 git，并生成一个提交')
  .action((projectName, options) => {
    inquirer
      .prompt(
        [
          {
            type: 'input',
            name: 'projectName',
            message: '请输入项目名称'
          },
          {
            type: 'confirm',
            name: 'ts',
            message: '是否使用 Typescript',
            default: true
          },
          {
            type: 'confirm',
            name: 'eslint',
            message: '是否使用 ESLint',
            default: true
          },
          {
            type: 'confirm',
            name: 'prettier',
            message: '是否使用 Prettier',
            default: true
          }
        ],
        {
          projectName
        }
      )
      .then((promptOptions) => {
        create({
          ...(promptOptions || {}),
          ...(options || {})
        })
      })
  })

cli.help()
cli.version(require('./package.json').version)

cli.parse()
