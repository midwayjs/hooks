import vue from '@vitejs/plugin-vue';
import { defineConfig } from '@midwayjs/hooks-kit';

export default defineConfig({
  vite: {
    plugins: [vue()],
  },
});
