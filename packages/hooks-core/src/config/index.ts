import path from 'path'
import { InternalConfig, UserConfig } from '../types/config'
import { sync } from 'pkg-dir'
import createJITI from 'jiti'
import _ from 'lodash'

export function getProjectRoot(cwd?: string) {
  return sync(cwd) || process.cwd()
}

export function getConfig(cwd?: string): InternalConfig {
  if (global.MidwayConfig) {
    return global.MidwayConfig
  }

  const root = getProjectRoot(cwd)

  const configs = {
    ts: path.join(root, 'midway.config.ts'),
    js: path.join(root, 'midway.config.js'),
  }

  const userConfig =
    tryRequire<UserConfig>(configs.ts) || tryRequire<UserConfig>(configs.js)

  const internalConfig: InternalConfig = _.defaultsDeep(
    {
      source: './src/apis',
      build: {
        viteOutDir: './build',
        outDir: './dist',
      },
    },
    userConfig
  )

  global.MidwayConfig = internalConfig
  return internalConfig
}

export function defineConfig(config: UserConfig): UserConfig {
  return config
}

const tryRequire = <T = unknown>(id: string): T => {
  try {
    const jiti = createJITI()
    const contents = jiti(id)
    if ('default' in contents) return contents.default
    return contents
  } catch {
    return undefined
  }
}
