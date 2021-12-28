import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { vite } from '@midwayjs/hooks/bundler';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vite(), react()],
  build: {
    outDir: './dist/client',
  },
});
