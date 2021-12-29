import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { vite, build } from '@midwayjs/hooks/bundler';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vite(), react(), build()],
  build: {
    outDir: './dist/client',
  },
});
