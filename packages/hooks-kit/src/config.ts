import { getConfigFromFile } from '@midwayjs/hooks/internal'
import type { UserConfig as ViteConfig } from 'vite'

export type { UserConfig as ViteConfig } from 'vite'

type KitConfig = {
  [key: string]: any
  vite?: ViteConfig
}

export function defineConfig(config: KitConfig): KitConfig {
  return config
}

export function resolveConfig(cwd: string) {
  return getConfigFromFile<KitConfig>(cwd)
}
