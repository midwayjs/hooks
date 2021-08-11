import { defineConfig } from '@midwayjs/hooks';

export default defineConfig({
  routes: [
    {
      baseDir: 'lambda',
      basePath: '/api',
    },
  ],
});
