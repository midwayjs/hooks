import { useContext, Get, Api, Middleware } from '@midwayjs/hooks'
import KoaStaticCache, { Options } from 'koa-static-cache'
import { join, isAbsolute } from 'path'

export { Options } from 'koa-static-cache'

const defaultOptions: Options = {
  dynamic: true,
  alias: { '/': 'index.html' },
  buffer: true,
}

export const serve = (options: Options) => {
  let middleware: any

  return async (next: any) => {
    const ctx = useContext()

    if (!middleware) {
      const baseDir: string = await ctx.requestContext.get('baseDir')
      options.dir = isAbsolute(options.dir)
        ? options.dir
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
  return Api(Get(url), Middleware(serve(options)), async () => {})
}
