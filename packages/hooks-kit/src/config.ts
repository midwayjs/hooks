import type { UserConfig } from '@midwayjs/hooks-internal'
import { getConfig } from '@midwayjs/hooks-internal'
import { ServeOptions } from '@midwayjs/serve'
import type { UserConfig as ViteConfig } from 'vite'

export interface KitConfig extends Omit<UserConfig, 'source'> {
  [key: string]: any
  vite?: ViteConfig
  static?: boolean | ServeOptions
}

export function defineConfig(config: KitConfig): KitConfig {
  return config
}

export function resolveConfig(cwd: string): KitConfig {
  return Object.assign({ static: true }, getConfig(cwd))
}
