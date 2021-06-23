import { defineConfig } from '@midwayjs/hooks'

export default defineConfig({
  superjson: true,
  source: 'src',
  routes: [
    {
      baseDir: 'lambda',
      basePath: '/api',
    },
  ],
})
