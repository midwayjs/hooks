const { defineConfig } = require('@midwayjs/hooks')

module.exports = defineConfig({
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
