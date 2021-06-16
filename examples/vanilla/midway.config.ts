import { defineConfig } from '@midwayjs/hooks';

export default defineConfig({
  superjson: true,
  source: 'server',
  routes: [
    {
      baseDir: 'api',
      basePath: '/api',
    },
  ],
});
