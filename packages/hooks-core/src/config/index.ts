import path from 'path'
import { UserConfig } from '../types/config'
import { sync } from 'pkg-dir'
import { existsSync } from 'fs'
import createJITI from 'jiti'

export function getProjectRoot(cwd?: string) {
  return sync(cwd) || process.cwd()
}

export function getConfig(cwd?: string): UserConfig {
  if (global.MidwayConfig) {
    return global.MidwayConfig
  }

  const root = getProjectRoot(cwd)

  const configs = {
    ts: path.join(root, 'midway.config.ts'),
    js: path.join(root, 'midway.config.js'),
  }

  const isTS = existsSync(configs.ts)
  if (isTS) {
    const jiti = createJITI(__filename)
    return jiti(configs.ts)
  }

  return require(configs.js)
}

export function defineConfig(config: UserConfig): UserConfig {
  return config
}
