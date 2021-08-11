import { defineConfig } from '@midwayjs/hooks';

export default defineConfig({
  source: 'src',
  routes: [
    {
      baseDir: 'apis',
      basePath: '/api',
    },
  ],
});
