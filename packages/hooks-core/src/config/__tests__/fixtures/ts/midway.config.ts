import { defineConfig, MidwayFrameworkType } from '../../../../'

module.exports = defineConfig({
  framework: MidwayFrameworkType.WEB_KOA,
  source: '/src',
  routes: [
    {
      baseDir: 'lambda',
      basePath: '/api',
    },
  ],
})
