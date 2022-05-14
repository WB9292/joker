import inquirer from 'inquirer'

inquirer
  .prompt([
    {
      type: 'confirm',
      message: '是否使用 Typescript'
    }
  ])
  .then((answers) => {})
