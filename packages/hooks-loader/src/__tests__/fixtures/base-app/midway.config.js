const { defineConfig, MidwayFrameworkType } = require('@midwayjs/hooks')

module.exports = defineConfig({
  framework: MidwayFrameworkType,
  source: '/src',
  routes: [
    {
      baseDir: 'lambda',
      basePath: '/api',
    },
    {
      baseDir: 'render',
      basePath: '/',
    },
  ],
})
