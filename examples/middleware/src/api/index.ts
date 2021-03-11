import { ApiConfig, withController } from '@midwayjs/hooks'
import { Context, IMidwayKoaNext } from '@midwayjs/koa'

function createLogger(level: string) {
  return async (ctx: Context, next: IMidwayKoaNext) => {
    console.log(`[${level}] <-- [${ctx.method}] ${ctx.url}`)
    const start = Date.now()
    await next()
    const cost = Date.now() - start
    console.log(`[${level}] --> [${ctx.method}] ${ctx.url} ${cost}ms`)
  }
}

// File Level Middleware
export const config: ApiConfig = {
  middleware: [createLogger('File')],
}

// Function Level Middleware
export default withController(
  { middleware: [createLogger('Api')] },
  async () => {
    return {
      message: 'Hello World',
      framework: '@midwayjs/hooks',
    }
  }
)
