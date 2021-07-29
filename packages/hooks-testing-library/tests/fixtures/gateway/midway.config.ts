import { defineConfig } from '@midwayjs/hooks'

import { CustomGateway } from './custom'

export default defineConfig({
  source: 'src',
  gateway: [CustomGateway],
  routes: [
    {
      baseDir: 'lambda',
      basePath: '/api',
    },
    {
      baseDir: 'custom',
      custom: true,
    },
    {
      baseDir: 'wechat',
      event: 'wechat-miniprogram',
    },
  ],
})
