import { defineConfig } from '@midwayjs/hooks'

export default defineConfig({
  source: 'src',
  routes: [
    {
      baseDir: 'lambda',
      basePath: '/api',
    },
    {
      baseDir: 'custom',
      custom: true,
    },
  ],
})
