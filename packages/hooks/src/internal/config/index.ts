import { existsSync } from 'fs'
import defaultsDeep from 'lodash/defaultsDeep'
import { sync } from 'pkg-dir'
import path from 'upath'
import {
  createDebug,
  PRE_DEFINE_PROJECT_CONFIG,
  PROJECT_ROOT,
} from '@midwayjs/hooks-core'
import { ignorePattern } from './ignorePattern'
import { ProjectConfig, UserConfig } from './type'

const debug = createDebug('hooks: config')

export function setProjectRoot(root: string) {
  debug('setProjectRoot: %s', root)
  process.env[PROJECT_ROOT] = root
}

export function getProjectRoot(cwd?: string) {
  return process.env[PROJECT_ROOT] || sync(cwd) || process.cwd()
}

export function setConfig(config: Partial<ProjectConfig>) {
  debug('setConfig: %O', config)
  process.env[PRE_DEFINE_PROJECT_CONFIG] = JSON.stringify(config)
}

export function getConfig(cwd = getProjectRoot()): ProjectConfig {
  const preDefineConfig = process.env[PRE_DEFINE_PROJECT_CONFIG]
  if (preDefineConfig) {
    debug('getConfig from PRE_DEFINE_PROJECT_CONFIG')
  }

  const userConfig: UserConfig = preDefineConfig
    ? JSON.parse(preDefineConfig)
    : getConfigFromFile(cwd)

  return defaultsDeep({}, userConfig, {
    source: './src/api',
    dev: { ignorePattern },
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
      `[ERR_INVALID_CONFIG] midway.config.[ts|js]  is not found at ${root}`
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
