import { DevServer } from './DevServer'
import type { DevServerOptions } from './DevServer'

export function startDevServer(options: DevServerOptions) {
  const server = new DevServer(options)
  server.start()
}
