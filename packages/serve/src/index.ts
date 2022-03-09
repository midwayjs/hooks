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

async function createMiddleware(ctx: any, options: ServeOptions) {
  const baseDir: string = await ctx.requestContext.get('baseDir')
  const dir = options.isKit
    ? join(baseDir, options.dir)
    : join(baseDir, '..', options.dir)

  return KoaStaticCache({
    ...defaultOptions,
    ...options,
    dir,
  })
}

export const serve = (options: ServeOptions) => {
  let middleware: ReturnType<typeof KoaStaticCache> = null
  return async (next: any) => {
    const ctx = useContext()
    middleware ??= await createMiddleware(ctx, options)
    return middleware(ctx, next)
  }
}

export function Serve(url: string, options: ServeOptions) {
  return Api(Get(url), Middleware(serve(options)), async () => {
    const ctx = useContext()

    if (!options.isKit) {
      ctx.status = 404
      return 'Not Found'
    }

    const forkedCtx = new Proxy(ctx, {
      get(target, property, receiver) {
        if (property === 'path') return '/'
        return Reflect.get(target, property, receiver)
      },
    })
    const mw = await createMiddleware(forkedCtx, options)
    await mw(forkedCtx, async () => {})
  })
}
