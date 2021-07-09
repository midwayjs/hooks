import { defineConfig, UserConfig } from '../../../..'

export default defineConfig({
  presets: [defaultPreset, secondPreset, thirdPreset],
})

export function defaultPreset() {
  return {
    source: 'src',
    routes: [
      {
        baseDir: 'lambda',
        basePath: '/preset-api',
      },
    ],
  }
}

export function secondPreset() {
  return {
    source: 'src',
    routes: [
      {
        baseDir: 'lambda-second',
        basePath: '/second-preset-api',
      },
    ],
  }
}

export function thirdPreset(config: UserConfig): UserConfig {
  return {
    routes: [
      {
        baseDir: 'lambda-second',
        basePath: '/third-preset-api',
      },
    ],
    request: {
      client: '@TEST/' + config.request.client,
    },
  }
}
