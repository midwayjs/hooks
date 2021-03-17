import { defineConfig } from '@midwayjs/hooks';

export default defineConfig({
  source: 'function',
  routes: [
    {
      baseDir: 'api',
      basePath: '/api',
    },
  ],
});
