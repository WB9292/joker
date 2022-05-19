import path from 'path'
import { fileURLToPath } from 'url'

import typescript from '@rollup/plugin-typescript'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default (commandLineArgs) => {
  const idDev = commandLineArgs.watch
  const idProduction = !idDev

  /**
   * @type { import('rollup').RollupOptions }
   */
  const config = {
    input: {
      index: path.resolve(__dirname, 'src/index.ts'),
      cli: path.resolve(__dirname, 'src/cli.ts')
    },
    output: {
      dir: path.resolve(__dirname, 'dist'),
      entryFileNames: '[name].js',
      // chunkFileNames: 'chunks/dep-[hash].js',
      format: 'esm',
      exports: 'named',
      sourcemap: idDev
    },
    plugins: [typescript()]
  }

  return config
}
