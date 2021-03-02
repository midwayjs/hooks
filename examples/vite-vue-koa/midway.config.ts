import { defineConfig, MidwayFrameworkType } from '@midwayjs/hooks'

export default defineConfig({
  framework: MidwayFrameworkType.WEB_KOA,
  routes: [
    {
      baseDir: 'lambda',
      basePath: '/api',
    },
  ],
})
