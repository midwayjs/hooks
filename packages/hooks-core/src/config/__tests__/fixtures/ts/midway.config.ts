import { defineConfig } from '../../../../'

module.exports = defineConfig({
  source: '/src',
  routes: [
    {
      baseDir: 'lambda',
      basePath: '/api',
    },
  ],
})
