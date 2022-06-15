const { defineConfig } = require('../../../../')

module.exports = defineConfig({
  source: 'src',
  routes: [
    {
      baseDir: 'lambda',
      basePath: '/api',
    },
  ],
})
