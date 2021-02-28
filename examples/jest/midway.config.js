const { defineConfig, MidwayFrameworkType } = require('@midwayjs/hooks')

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
