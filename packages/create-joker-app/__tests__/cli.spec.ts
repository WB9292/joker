import 'jest'
import path from 'path'

import type { SyncOptions } from 'execa'
import { commandSync } from 'execa'

const remove = () => {}

const BIN_PATH = path.resolve(__dirname, '../src/cli.ts')

const projectName = 'test-app'
const projectPath = path.resolve(__dirname, projectName)

function run(args: string[], options: SyncOptions<string> = {}) {
  return commandSync(`node --loader ts-node/esm ${BIN_PATH} ${args.join(' ')}`, options)
}

test('提示输入项目名称', async () => {
  const { stdout } = run([])

  expect(stdout).toContain('请输入项目名称')
})
