import { NextFunction, Request, Response } from 'express'
import { CreateOptions, DevServer } from './server'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { parse } from 'url'
import { ServerState } from './share'
import { createDebug } from '@midwayjs/hooks-core'

const debug = createDebug('hooks-dev-pack: middleware')

export async function createExpressDevPack(options: CreateOptions) {
  options.cwd ??= process.cwd()
  options.sourceDir ??= 'src/api'

  const server = new DevServer(options)
  debug('options', options)
  await server.run()

  const proxy = createProxyMiddleware({
    target: `http://localhost:${server.port}`,
    logLevel: 'error',
    followRedirects: false,
  })

  const MidwayHooksDevPackMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const path = parse(req.url).pathname

    const internalServerError = () => {
      res.statusCode = 500
      const send = typeof res.send === 'function' ? res.send : res.end
      send.call(
        res,
        `Server error, please check the console output and fix the problem\n服务端错误，请查看控制台输出并修复问题`
      )
    }

    if (server.state === ServerState.Error) {
      return internalServerError()
    }

    try {
      await server.ready()
    } catch {
      return internalServerError()
    }

    if (await server.isMatch(path, req.method)) {
      proxy(req, res, next)
    } else {
      next()
    }
  }

  return {
    middleware: MidwayHooksDevPackMiddleware,
    server,
  }
}
