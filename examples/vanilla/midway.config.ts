import { defineConfig } from '@midwayjs/hooks';

export default defineConfig({
  superjson: true,
  source: 'function',
  routes: [
    {
      baseDir: 'api',
      basePath: '/api',
    },
  ],
});
