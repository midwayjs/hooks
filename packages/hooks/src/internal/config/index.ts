import { existsSync } from 'fs'
import createJITI from 'jiti'
import defaultsDeep from 'lodash/defaultsDeep'
import { sync } from 'pkg-dir'
import path from 'upath'

import { validateArray, PRE_DEFINE_PROJECT_CONFIG } from '@midwayjs/hooks-core'

import { ignorePattern } from './ignorePattern'
import { ProjectConfig, UserConfig } from './type'

export function getProjectRoot(cwd?: string) {
  return sync(cwd) || process.cwd()
}

export function setConfig(config: Partial<ProjectConfig>) {
  globalThis[PRE_DEFINE_PROJECT_CONFIG] = config
}

export function getConfig(cwd?: string): ProjectConfig {
  const userConfig = globalThis[PRE_DEFINE_PROJECT_CONFIG]
    ? globalThis[PRE_DEFINE_PROJECT_CONFIG]
    : getConfigFromFile(cwd)

  return defaultsDeep({}, userConfig, {
    source: './src/apis',
    dev: {
      ignorePattern,
    },
    gateway: [],
    build: {
      viteOutDir: './build',
      outDir: './dist',
    },
    request: {
      client: '@midwayjs/hooks/request',
    },
  })
}

function getConfigFromFile(cwd?: string) {
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
    ? requireByJiti<UserConfig>(configs.ts)
    : requireByJiti<UserConfig>(configs.js)
}

export function defineConfig(config: UserConfig): UserConfig {
  validateArray(config.routes, 'defineConfig.routes')
  return config
}

const requireByJiti = <T = unknown>(id: string): T => {
  const jiti = createJITI()
  const contents = jiti(id)
  if ('default' in contents) return contents.default
  return contents
}
