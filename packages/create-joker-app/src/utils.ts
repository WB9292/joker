import path from 'path'
import fs from 'fs'

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

    return (rootDir = find(__dirname))
  }
})()
