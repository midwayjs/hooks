import { defineConfig } from '@midwayjs/hooks'
import bodyParser from 'koa-bodyparser'
import { Context, IMidwayKoaNext } from '@midwayjs/koa'

const logger = async (ctx: Context, next: IMidwayKoaNext) => {
  console.log(`[Global] <-- [${ctx.method}] ${ctx.url}`)
  const start = Date.now()
  await next()
  const cost = Date.now() - start
  console.log(`[Global] --> [${ctx.method}] ${ctx.url} ${cost}ms`)
}

export default defineConfig({
  // Global Level Middleware
  middleware: [bodyParser(), logger],
  source: 'src',
  routes: [
    {
      baseDir: 'api',
      basePath: '/',
    },
  ],
})
