import { existsSync } from 'fs'
import createJITI from 'jiti'
import defaultsDeep from 'lodash/defaultsDeep'
import { sync } from 'pkg-dir'
import path from 'upath'
import { PRE_DEFINE_PROJECT_CONFIG } from '@midwayjs/hooks-core'
import { ignorePattern } from './ignorePattern'
import { ProjectConfig, UserConfig } from './type'

export function getProjectRoot(cwd?: string) {
  return sync(cwd) || process.cwd()
}

export function setConfig(config: Partial<ProjectConfig>) {
  process.env[PRE_DEFINE_PROJECT_CONFIG] = JSON.stringify(config)
}

export function getConfig(cwd?: string): ProjectConfig {
  const userConfig: UserConfig = process.env[PRE_DEFINE_PROJECT_CONFIG]
    ? JSON.parse(process.env[PRE_DEFINE_PROJECT_CONFIG])
    : getConfigFromFile(cwd)

  return defaultsDeep({}, userConfig, {
    source: './src/api',
    dev: { ignorePattern },
    build: { outDir: './dist' },
  })
}

export function getConfigFromFile<T>(cwd?: string): T {
  const root = getProjectRoot(cwd)

  const configs = {
    ts: path.join(root, 'midway.config.ts'),
    js: path.join(root, 'midway.config.js'),
  }

  if (!existsSync(configs.ts) && !existsSync(configs.js)) {
    throw new Error(
      `[ERR_INVALID_CONFIG] midway.config.ts is not found, root: ${root}`
    )
  }

  return existsSync(configs.ts)
    ? requireByJiti(configs.ts)
    : requireByJiti(configs.js)
}

export function defineConfig(config: UserConfig): UserConfig {
  return config
}

const requireByJiti = <T = unknown>(id: string): T => {
  const jiti = createJITI()
  const contents = jiti(id)
  if ('default' in contents) return contents.default
  return contents
}
