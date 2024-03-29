import path from 'path'
import fs from 'fs'

import type { Plugin } from './types'
import { findRoot } from './utils'

const tsPlugin: Plugin = function (targetProjectPath, packageConfig, { ts }) {
  if (ts) {
    const tsconfigTemplatePath = path.resolve(
      findRoot(),
      './template/tsconfig.template.json'
    )
    packageConfig.devDependencies = {
      ...packageConfig.devDependencies,
      typescript: '^4.6.4'
    }
    return () => {
      const outputPath = path.resolve(targetProjectPath, './tsconfig.json')
      fs.copyFileSync(tsconfigTemplatePath, outputPath)
    }
  }
}

export default tsPlugin
