import { defineConfig, ConfigPreset } from '../../../..'

const defaultPreset: ConfigPreset = (config) => {
  return {
    source: 'src',
    routes: [
      {
        baseDir: 'lambda',
        basePath: '/preset-api',
      },
    ],
    request: {
      client: '@TEST/' + config.request.client,
    },
  }
}

export default defineConfig({
  presets: [defaultPreset],
})
