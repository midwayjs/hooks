import get from 'lodash/get'
import defaultsDeep from 'lodash/defaultsDeep'
import path from 'upath'
import { existsSync } from 'fs'
import { createDebug } from '@midwayjs/hooks-core'
import { getProjectRoot } from '../root'
import { HOOKS_PROJECT_CONFIG } from '../const'
import { ProjectConfig, UserConfig } from './type'

const debug = createDebug('hooks-internal: config')

export function setConfig(config: Partial<ProjectConfig>) {
  debug('setConfig: %O', config)
  process.env[HOOKS_PROJECT_CONFIG] = JSON.stringify(config)
}

export function getConfig(cwd = getProjectRoot()): ProjectConfig {
  const preDefineConfig = process.env[HOOKS_PROJECT_CONFIG]

  const userConfig: UserConfig = preDefineConfig
    ? JSON.parse(preDefineConfig)
    : getConfigFromFile(cwd)

  const deprecatedConfig = ['dev.include', 'dev.exclude', 'dev.ignorePattern']

  for (const key of deprecatedConfig) {
    if (get(userConfig, key)) {
      console.warn(
        `[hooks] ${key} is no longer supported, please remove it from your config`
      )
    }
  }

  return defaultsDeep({}, userConfig, {
    source: './src/api',
    build: { outDir: './dist' },
  })
}

export function getConfigFromFile<T>(root: string): T {
  const configs = [
    path.join(root, 'midway.config.ts'),
    path.join(root, 'midway.config.js'),
  ]

  const config = configs.find(existsSync)

  if (!config) {
    throw new Error(
      `[ERR_INVALID_CONFIG] midway.config.[ts|js] is not found at ${root}`
    )
  }

  return requireMod<T>(config)
}

export function defineConfig(config: UserConfig): UserConfig {
  return config
}

const requireMod = <T = unknown>(id: string): T => {
  const contents = require(id)
  debug('requireMod: %s, %O', id, contents)
  if ('default' in contents) return contents.default
  return contents
}
