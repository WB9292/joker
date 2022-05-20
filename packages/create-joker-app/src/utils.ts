import Module from 'module'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

export function createRequire() {
  return Module.createRequire(path.resolve(findRoot(), './package.json'))
}

export function getFileAndDirName(fileURL: string) {
  const __filename = fileURLToPath(fileURL)
  const __dirname = path.dirname(__filename)
  return {
    __filename,
    __dirname
  }
}

export const findRoot = (function () {
  let rootDir: string
  const find: (dir: string) => string = (dir: string) => {
    const files = fs.readdirSync(dir, {
      encoding: 'utf-8'
    })

    if (files.some((file) => file === 'package.json')) {
      return dir
    }

    const parentDir = path.dirname(dir)

    if (!parentDir || parentDir === dir) {
      throw new Error('未找到项目根目录')
    }

    return find(parentDir)
  }
  return () => {
    if (rootDir) {
      return rootDir
    }

    const { __dirname } = getFileAndDirName(import.meta.url)

    return (rootDir = find(__dirname))
  }
})()
