import cac from 'cac'

import { startDevServer } from '.'

const cli = cac('jr')

cli
  .command('dev')
  .option('-h, --host <host>', '服务器ip')
  .option('-p, --port <port>', '服务器端口号')
  .action(startDevServer)

cli.help()
cli.version(require('../package.json').version)

cli.parse()
