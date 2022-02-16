const { defineConfig } = require('@midwayjs/hooks');

module.exports = defineConfig({
  source: './src',
  build: {
    outDir: './dist',
  },
});
