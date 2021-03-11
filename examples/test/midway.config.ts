import { defineConfig } from '@midwayjs/hooks'
import bodyParser from 'koa-bodyparser'

export default defineConfig({
  middleware: [bodyParser()],
  source: 'src',
  routes: [
    {
      baseDir: 'lambda',
      basePath: '/api',
    },
  ],
})
