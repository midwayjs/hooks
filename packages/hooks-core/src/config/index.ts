import path from 'path'
import { UserConfig } from '../types/config'
import { sync } from 'pkg-dir'

export function getProjectRoot() {
  return sync() || process.cwd()
}

export function getConfig(): UserConfig {
  if (global.MidwayConfig) {
    return global.MidwayConfig
  }

  const root = getProjectRoot()
  const configFile = path.join(root, 'midway.config.js')
  return require(configFile)
}

export function defineConfig(config: UserConfig): UserConfig {
  return config
}
