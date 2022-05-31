import path from 'path'
import fs from 'fs'

import type { NextHandleFunction } from 'connect'

import { clearUrl, send } from '../../utils'

function htmlMiddleware(): NextHandleFunction {
  return function (req, res, next) {
    const url = req.url && clearUrl(req.url)

    if (url && url.endsWith('.html')) {
      try {
        const filePath = path.resolve(url.slice(1))
        if (fs.existsSync(filePath)) {
          let content = fs.readFileSync(filePath, {
            encoding: 'utf-8'
          })
          content = content.replace(
            /(<head.*?>)/,
            '$1 <script type="module" src="/@joker/__client.js"></script>'
          )
          send(res, content, 'text/html;charset=UTF-8')
          return
        }
      } catch (e) {
        next()
      }
    } else {
      next()
    }
  }
}

export default htmlMiddleware
