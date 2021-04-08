import { defineConfig } from '@midwayjs/hooks';

export default defineConfig({
  superjson: true,
  routes: [
    {
      baseDir: 'lambda',
      basePath: '/api',
    },
  ],
});
