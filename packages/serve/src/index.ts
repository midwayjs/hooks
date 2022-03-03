import { useContext, Get, Api, Middleware } from '@midwayjs/hooks'
import KoaStaticCache, { Options } from 'koa-static-cache'
import { join } from 'path'

export interface ServeOptions extends Options {
  isKit?: boolean
}

const defaultOptions: ServeOptions = {
  dynamic: true,
  alias: { '/': 'index.html' },
  buffer: true,
}

export const serve = (options: ServeOptions) => {
  let middleware: ReturnType<typeof KoaStaticCache>

  return async (next: any) => {
    const ctx = useContext()

    if (!middleware) {
      const baseDir: string = await ctx.requestContext.get('baseDir')
      options.dir = options.isKit
        ? join(baseDir, options.dir)
        : join(baseDir, '..', options.dir)

      middleware = KoaStaticCache({
        ...defaultOptions,
        ...options,
      })
    }

    return middleware(ctx, next)
  }
}

export function Serve(url: string, options: Options) {
  return Api(Get(url), Middleware(serve(options)), async () => {
    const ctx = useContext()
    ctx.status = 404
    return 'Not Found'
  })
}
