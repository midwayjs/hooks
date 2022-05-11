import { NextFunction, Request, Response } from 'express'
import { CreateOptions, DevServer } from './server'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { parse } from 'url'

export async function createExpressDevPack(options: CreateOptions) {
  options.cwd ??= process.cwd()
  options.sourceDir ??= 'src/api'

  const server = new DevServer(options)
  await server.run()

  const proxy = createProxyMiddleware({
    target: `http://localhost:${server.port}`,
    logLevel: 'error',
    followRedirects: true,
  })

  const middleware = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const path = parse(req.url).pathname
    if (await server.isMatch(path)) {
      proxy(req, res, next)
    } else {
      next()
    }
  }

  return {
    middleware,
    server,
  }
}
