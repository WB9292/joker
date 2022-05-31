import http from 'http'

import connect from 'connect'

import htmlMiddleware from './middlewares/htmlMiddleware'

export interface DevServerOptions {
  host?: string
  port?: string
}

export class DevServer {
  constructor(private options: DevServerOptions) {}

  start() {
    const { host = 'localhost', port = 8080 } = this.options
    const middlewares = connect()
    const server = http.createServer(middlewares)

    middlewares.use(htmlMiddleware())

    server.listen({
      port,
      host
    })
  }
}
