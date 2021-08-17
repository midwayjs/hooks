import { existsSync } from 'fs'
import defaultsDeep from 'lodash/defaultsDeep'
import path from 'upath'

import { HooksGatewayAdapterStatic, lazyRequire } from '..'
import { EventGateway } from '../gateway/event/gateway'
import { HTTPGateway } from '../gateway/http/gateway'
import { ProjectConfig, UserConfig } from '../types/config'
import { validateArray } from '../validator'
import { ignorePattern } from './ignorePattern'

export function getProjectRoot(cwd?: string) {
  const { sync } = lazyRequire('pkg-dir')
  return sync(cwd) || process.cwd()
}

export function getConfig(cwd?: string): ProjectConfig {
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

  const userConfig = existsSync(configs.ts)
    ? requireByJiti<UserConfig>(configs.ts)
    : requireByJiti<UserConfig>(configs.js)

  const builtinGateways = getBuiltInGateways(userConfig)
  userConfig.gateway ??= []
  userConfig.gateway.push(...builtinGateways)

  return defaultsDeep({}, userConfig, {
    source: './src/apis',
    dev: {
      ignorePattern,
    },
    build: {
      viteOutDir: './build',
      outDir: './dist',
    },
    request: {
      client: '@midwayjs/hooks-core/request',
    },
  })
}

export function getBuiltInGateways(userConfig: ProjectConfig) {
  const builtinGateways = new Set<HooksGatewayAdapterStatic>()
  for (const route of userConfig.routes) {
    if (route.basePath) builtinGateways.add(HTTPGateway)
    if (route.event) builtinGateways.add(EventGateway)
  }
  return [...builtinGateways]
}

export function defineConfig(config: UserConfig): UserConfig {
  validateArray(config.routes, 'defineConfig.routes')
  return config
}

const requireByJiti = <T = unknown>(id: string): T => {
  const jiti = lazyRequire('jiti')
  const contents = jiti(id)
  if ('default' in contents) return contents.default
  return contents
}
