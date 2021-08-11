import { defineConfig } from 'vite';
import hooks from '@midwayjs/vite-plugin-hooks';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [hooks(), vue()],
});
