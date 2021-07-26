import { defineConfig } from '@midwayjs/hooks'

export default defineConfig({
  source: 'src',
  routes: [
    {
      baseDir: 'render',
      basePath: '/',
    },
    {
      baseDir: 'lambda',
      basePath: '/api',
    },
    {
      baseDir: 'wechat',
      event: 'wechat-miniapp',
    },
  ],
})
