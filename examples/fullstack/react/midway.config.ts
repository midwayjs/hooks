import { defineConfig } from '@midwayjs/hooks';

export default defineConfig({
  source: './src/api',
  build: {
    outDir: './dist/server',
  },
});
