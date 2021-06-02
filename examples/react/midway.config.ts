import { defineConfig } from '@midwayjs/hooks';

export default defineConfig({
  superjson: true,
  source: './src/apis',
  routes: [
    {
      baseDir: 'lambda',
      basePath: '/api',
    },
  ],
});
