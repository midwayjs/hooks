import { defineConfig } from 'vite';
import hooks from '@midwayjs/vite-plugin-hooks';
import svelte from '@svitejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [hooks(), svelte()],
});
