import Module from 'module'
import path from 'path'
import { fileURLToPath } from 'url'

const { __dirname } = getFileAndDirName(import.meta.url)

export function createRequire() {
  return Module.createRequire(path.resolve(__dirname, '../package.json'))
}

export function getFileAndDirName(fileURL: string) {
  const __filename = fileURLToPath(fileURL)
  const __dirname = path.dirname(__filename)
  return {
    __filename,
    __dirname
  }
}
