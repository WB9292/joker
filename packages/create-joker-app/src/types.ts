export interface CreateOptions {
  // 项目名称
  projectName: string
  // 是否使用 typescript
  ts?: boolean
  // 是否使用 eslint
  eslint?: boolean
  // 是否使用 prettier
  prettier?: boolean
  // 当前工作目录
  cwd?: string
  // 包管理器
  packageManager?: string
  // 是否强制删除已存在的目录
  force?: boolean
  // 如果已存在，是否合并
  merge?: boolean
  // 是否初始化 git
  git?: boolean
}

export type PluginReturnFn = () => Promise<void> | void

export type Plugin = (
  targetProjectPath: string,
  packageConfig: any,
  createOptions: CreateOptions
) => PluginReturnFn | void
