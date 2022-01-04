import { UserConfig, getConfig } from '@midwayjs/hooks/internal'
import type { UserConfig as ViteConfig } from 'vite'

export type { UserConfig as ViteConfig } from 'vite'

export interface KitConfig extends Omit<UserConfig, 'source' | 'routes'> {
  [key: string]: any
  vite?: ViteConfig
}

export function defineConfig(config: KitConfig): KitConfig {
  return config
}

export function resolveConfig(cwd: string): KitConfig {
  return getConfig(cwd)
}
