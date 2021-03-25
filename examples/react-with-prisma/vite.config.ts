import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import hooks from '@midwayjs/vite-plugin-hooks';
import WindiCSS from 'vite-plugin-windicss';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [WindiCSS(), hooks(), reactRefresh()],
});
