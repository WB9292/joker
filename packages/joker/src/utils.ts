import type { ServerResponse } from 'http'

export function send(res: ServerResponse, content: string | Buffer, mine: string) {
  res.setHeader('Content-Type', mine)
  res.end(content)
}

export function sendJS(res: ServerResponse, content: string | Buffer) {
  send(res, content, 'application/javascript')
}

const hashRE = /#.*$/s
const queryRE = /\?.*$/s

export function clearUrl(url: string) {
  return url.replace(hashRE, '').replace(queryRE, '')
}
