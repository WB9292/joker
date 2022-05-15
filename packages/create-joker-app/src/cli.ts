import inquirer from 'inquirer'
import { create } from '.'

inquirer
  .prompt([
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
  ])
  .then(create)
