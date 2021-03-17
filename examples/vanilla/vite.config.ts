import { defineConfig } from 'vite'
import hooks from '@midwayjs/vite-plugin-hooks'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [hooks()],
})
