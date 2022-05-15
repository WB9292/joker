import path from 'path'
import process from 'process'
import fs from 'fs'
import { error } from './logger'

interface CreateOptions {
  // 项目名称
  projectName: string
  // 是否使用 typescript
  ts: boolean
  // 是否使用 eslint
  eslint: boolean
  // 是否使用 prettier
  prettier: boolean
}

export function create({ projectName }: CreateOptions) {
  const projectPath = path.resolve(process.cwd(), projectName)

  if (fs.existsSync(projectPath)) {
    error(`${projectName}目录已存在`)
  } else {
  }
}
