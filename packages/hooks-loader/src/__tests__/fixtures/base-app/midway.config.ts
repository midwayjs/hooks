const { defineConfig } = require('@midwayjs/hooks')

module.exports = defineConfig({
  source: '/src',
  routes: [
    {
      baseDir: 'render',
      basePath: '/',
    },
    {
      baseDir: 'lambda',
      basePath: '/api',
    },
  ],
})
