import { defineConfig } from '../../../'

export default defineConfig({
  source: 'src',
  routes: [
    {
      baseDir: 'api',
      basePath: '/',
    },
  ],
})
