import { defineConfig } from '@midwayjs/hooks'

export default defineConfig({
  // Global Level Middleware
  source: 'src',
  routes: [
    {
      baseDir: 'api',
      basePath: '/',
    },
  ],
})
