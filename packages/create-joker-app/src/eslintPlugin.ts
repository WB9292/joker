import path from 'path'
import fs from 'fs'

import ejs from 'ejs'

import type { Plugin } from './types'
import { findRoot } from './utils'

const eslintPlugin: Plugin = (targetProjectPath, packageConfig, { eslint, ts }) => {
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

    return () => {
      const eslintTemplatePath = path.resolve(findRoot(), './template/eslint.template.js')
      const eslintContent = fs.readFileSync(eslintTemplatePath, 'utf-8')
      const result = ejs.render(eslintContent, {
        options: {
          ts
        }
      })
      const outputPath = path.resolve(targetProjectPath, './.eslintrc.js')
      fs.writeFileSync(outputPath, result, 'utf-8')
    }
  }
}

export default eslintPlugin
