import merge from 'deepmerge'
import _ from 'lodash'
import { sync } from 'pkg-dir'
import path from 'upath'
import url from 'url'

import {
  HTTPRoute,
  IgnorePatternRequest,
  MidwayConfig,
  UserConfig,
} from '../types/config'
import { tryRequire } from '../util'

export function getProjectRoot(cwd?: string) {
  return sync(cwd) || process.cwd()
}

const defaultConfig: Partial<MidwayConfig> = {
  superjson: false,
  gateway: [],
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
}

export function getConfig(cwd?: string): MidwayConfig {
  const root = getProjectRoot(cwd)
  const userConfig = loadConfigFromFile(root)

  let midwayConfig = merge(defaultConfig, userConfig)
  return midwayConfig
}

export function ignorePattern(req: IgnorePatternRequest) {
  // Ignore Vite dev server
  if (req.url.includes('@vite')) {
    return true
  }
  const { pathname, query } = url.parse(req.url)
  const reg = /\.(js|css|ts|tsx|map|json|png|jpg|jpeg|gif|svg|eot|woff2|ttf)$/
  return reg.test(pathname) || reg.test(query)
}

export function defineConfig<T = HTTPRoute>(
  config: UserConfig<T>
): UserConfig<T> {
  return config
}

function loadConfigFromFile(root: string) {
  const configs = {
    ts: path.join(root, 'midway.config.ts'),
    js: path.join(root, 'midway.config.js'),
  }

  const userConfig =
    tryRequire<UserConfig>(configs.ts) || tryRequire<UserConfig>(configs.js)

  return userConfig
}
