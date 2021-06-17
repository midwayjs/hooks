import { defineConfig } from '@midwayjs/hooks'

export default defineConfig({
  source: 'src',
  routes: [
    {
      baseDir: 'lambda',
      basePath: '/api',
    },
    {
      baseDir: 'underscore',
      basePath: '/underscore',
      underscore: true,
    },
  ],
})
