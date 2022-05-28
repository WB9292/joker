import cac from 'cac'
import prompts from 'prompts'
import colors from 'picocolors'

import { create } from '.'

const cli = cac('create-joker-app')

cli
  .command('[projectName]', '创建项目')
  .alias('create')
  .option('--cwd <cwd>', '[string] 项目的工作目录')
  .option('-m, --packageManager <packageManager>', '[string] 指定使用的包管理器')
  .option('-f, --force', '[boolean] 如果项目存在，强制删除')
  .option('--merge', '[boolean] 如果项目存在，合并项目')
  .option('-g, --git', '[boolean] 初始化 git，并生成一个提交')
  .option('--ts', '[boolean] 是否使用Typescript')
  .option('--eslint', '[boolean] 是否使用eslint')
  .option('--prettier', '[boolean] 是否使用Prettier')
  .action(async (projectName, options) => {
    const { ts, eslint, prettier } = options
    try {
      const promptOptions = await prompts(
        [
          {
            type: projectName ? null : 'text',
            name: 'projectName',
            message: '请输入项目名称'
          },
          {
            type: typeof ts === 'boolean' ? null : 'confirm',
            name: 'ts',
            message: '是否使用 Typescript'
          },
          {
            type: typeof eslint === 'boolean' ? null : 'confirm',
            name: 'eslint',
            message: '是否使用 ESLint'
          },
          {
            type: typeof prettier === 'boolean' ? null : 'confirm',
            name: 'prettier',
            message: '是否使用 Prettier'
          }
        ],
        {
          onCancel: () => {
            throw new Error(colors.red('✖') + ' 操作已取消')
          }
        }
      )

      create({
        ...(promptOptions || {}),
        ...(options || {}),
        projectName
      })
    } catch (cancelled) {
      console.log(cancelled.message)
      return
    }
  })

cli.help()
cli.version(require('../package.json').version)

cli.parse()
