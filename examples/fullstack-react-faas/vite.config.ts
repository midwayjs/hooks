import { defineConfig } from 'vite';
import hooks from '@midwayjs/vite-plugin-hooks';
import reactRefresh from '@vitejs/plugin-react-refresh';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [hooks(), reactRefresh()],
});
