import { defineConfig, MidwayFrameworkType } from '@midwayjs/hooks'

export default defineConfig({
  framework: MidwayFrameworkType.WEB_KOA,
  source: '/src/apis',
  routes: [
    {
      baseDir: 'lambda',
      basePath: '/api',
    },
  ],
})
