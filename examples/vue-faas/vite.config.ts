import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { vite } from '@midwayjs/hooks-bundler';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'build',
    emptyOutDir: true,
  },
  plugins: [vite(), vue()],
});
