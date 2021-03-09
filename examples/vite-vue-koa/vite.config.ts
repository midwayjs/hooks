import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import hooks from '@midwayjs/vite-plugin-hooks'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [hooks(), vue()],
})
