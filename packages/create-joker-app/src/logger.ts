import colors from 'picocolors'

type LogType = 'error' | 'warn' | 'info'

const prefix = '[create-joker-app]'

function output(type: LogType, msg: string) {
  const tag =
    type === 'info'
      ? colors.cyan(colors.bold(prefix))
      : type === 'error'
      ? colors.red(prefix)
      : colors.yellow(prefix)
  const method = type === 'info' ? 'log' : type
  console[method](`${colors.dim(new Date().toLocaleTimeString())} ${tag} ${msg}`)
}

export function warn(msg: string) {
  output('warn', msg)
}

export function error(msg: string) {
  output('error', msg)
}

export function info(msg: string) {
  output('info', msg)
}
