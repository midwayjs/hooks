import { defineConfig } from '@midwayjs/hooks'

export default defineConfig({
  source: 'server',
  routes: [
    {
      baseDir: 'api',
      basePath: '/api',
    },
  ],
})
