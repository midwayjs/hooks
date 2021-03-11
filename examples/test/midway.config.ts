import { defineConfig } from '@midwayjs/hooks'
import bodyParser from 'koa-bodyparser'

module.exports = defineConfig({
  middlewares: [bodyParser()],
  source: 'src',
  routes: [
    {
      baseDir: 'lambda',
      basePath: '/api',
    },
  ],
})
