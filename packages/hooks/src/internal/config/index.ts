import { existsSync } from 'fs'
import defaultsDeep from 'lodash/defaultsDeep'
import path, { dirname, extname } from 'upath'
import { createDebug } from '@midwayjs/hooks-core'
import { ignorePattern } from './ignorePattern'
import { ProjectConfig, UserConfig } from './type'
import findUp from 'find-up'
import { PRE_DEFINE_PROJECT_CONFIG, PROJECT_ROOT } from '../const'

const debug = createDebug('hooks: config')

export function setProjectRoot(root: string) {
  debug('setProjectRoot: %s', root)
  process.env[PROJECT_ROOT] = root
}

export function getProjectRoot(cwd?: string) {
  if (process.env[PROJECT_ROOT]) {
    return process.env[PROJECT_ROOT]
  }

  const pkg = findUp.sync('package.json', { cwd })
  if (pkg) {
    return dirname(pkg)
  }

  return process.cwd()
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
