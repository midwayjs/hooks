import { getConfig, UserConfig } from '@midwayjs/hooks/internal'
import type { UserConfig as ViteConfig } from 'vite'

export interface KitConfig extends Omit<UserConfig, 'source'> {
  [key: string]: any
  vite?: ViteConfig
  static?: boolean
}

export function defineConfig(config: KitConfig): KitConfig {
  return config
}

export function resolveConfig(cwd: string): KitConfig {
  return Object.assign({ static: true }, getConfig(cwd))
}
