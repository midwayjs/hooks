import { Context, IMidwayKoaNext } from '@midwayjs/koa'
import { useContext } from '../../../../src'

export function createLogger(level: string) {
  return async (next: IMidwayKoaNext) => {
    const ctx = useContext<Context>()
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${level}] <-- [${ctx.method}] ${ctx.url}`)
    }
    const start = Date.now()
    await next()
    const cost = Date.now() - start
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${level}] --> [${ctx.method}] ${ctx.url} ${cost}ms`)
    }
    ctx.set(level, `${cost}ms`)
  }
}
