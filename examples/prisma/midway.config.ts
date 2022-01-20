import react from '@vitejs/plugin-react';
import { defineConfig } from '@midwayjs/hooks-kit';

export default defineConfig({
  vite: {
    plugins: [react()],
  },
});
