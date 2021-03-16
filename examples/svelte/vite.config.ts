import { defineConfig } from 'vite'
import svelte from '@svitejs/vite-plugin-svelte'
import hooks from '@midwayjs/vite-plugin-hooks'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [hooks(), svelte()],
})
