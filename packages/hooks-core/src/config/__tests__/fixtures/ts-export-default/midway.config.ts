import { defineConfig, MidwayFrameworkType } from '../../../../'

export default defineConfig({
  framework: MidwayFrameworkType.WEB_KOA,
  source: '/src',
  routes: [
    {
      baseDir: 'lambda',
      basePath: '/api',
    },
  ],
})
