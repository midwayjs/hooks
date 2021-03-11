import { defineConfig } from '@midwayjs/hooks'
import bodyParser from 'koa-bodyparser'

export default defineConfig({
  middleware: [bodyParser()],
  routes: [
    {
      baseDir: 'lambda',
      basePath: '/api',
    },
  ],
})
