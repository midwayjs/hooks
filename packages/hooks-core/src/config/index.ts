import { existsSync } from 'fs'
import createJITI from 'jiti'
import _ from 'lodash'
import { HooksGatewayAdapterStatic } from 'packages/hooks-core/dist/midwayjs-hooks-core.cjs'
import { sync } from 'pkg-dir'
import path from 'upath'

import { Class, HooksGatewayAdapter } from '../'
import { EventGateway } from '../component/gateway/event/gateway'
import { HTTPGateway } from '../component/gateway/http/gateway'
import { IgnorePattern, ProjectConfig, UserConfig } from '../types/config'
import { validateArray } from '../validator'

export function getProjectRoot(cwd?: string) {
  return sync(cwd) || process.cwd()
}

export const ignorePattern: IgnorePattern = (req) => {
  // Ignore Vite dev server
  const vite = ['@vite', '@react-refresh']
  if (vite.some((api) => req.url.includes(api))) {
    return true
  }

  const url = require('url')
  const { pathname, query } = url.parse(req.url)
  const reg =
    /\.(js|ts|tsx|css|less|sass|scss|map|json|png|jpg|jpeg|gif|svg|eot|woff2|ttf)$/
  return reg.test(pathname) || reg.test(query)
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

  const userConfig =
    tryRequire<UserConfig>(configs.ts) || tryRequire<UserConfig>(configs.js)

  const builtinGateways = new Set<HooksGatewayAdapterStatic>()
  for (const route of userConfig.routes) {
    if (route.basePath) builtinGateways.add(HTTPGateway)
    if (route.event) builtinGateways.add(EventGateway)
  }
  userConfig.gateway = userConfig.gateway || []
  userConfig.gateway.push(...builtinGateways)

  return _.defaultsDeep({}, userConfig, {
    superjson: false,
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

export function defineConfig(config: UserConfig): UserConfig {
  validateArray(config.routes, 'defineConfig.routes')
  return config
}

const tryRequire = <T = unknown>(id: string): T => {
  try {
    const jiti = createJITI()
    const contents = jiti(id)
    if ('default' in contents) return contents.default
    return contents
  } catch {
    return undefined
  }
}
