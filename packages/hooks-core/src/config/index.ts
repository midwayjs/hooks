import createJITI from 'jiti'
import _ from 'lodash'
import { sync } from 'pkg-dir'
import path from 'upath'
import url from 'url'

import {
  HTTPRoute,
  IgnorePatternRequest,
  InternalConfig,
  UserConfig,
} from '../types/config'

export function getProjectRoot(cwd?: string) {
  return sync(cwd) || process.cwd()
}

export function getConfig(cwd?: string): InternalConfig {
  const root = getProjectRoot(cwd)

  const configs = {
    ts: path.join(root, 'midway.config.ts'),
    js: path.join(root, 'midway.config.js'),
  }

  const userConfig =
    tryRequire<UserConfig>(configs.ts) || tryRequire<UserConfig>(configs.js)

  return _.defaultsDeep({}, userConfig, {
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
  })
}

function ignorePattern(req: IgnorePatternRequest) {
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
