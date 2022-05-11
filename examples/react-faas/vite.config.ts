import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ServerlessBundlerPlugin } from '@midwayjs/hooks-bundler';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'build',
    emptyOutDir: true,
  },
  plugins: [ServerlessBundlerPlugin.vite(), react()],
});
