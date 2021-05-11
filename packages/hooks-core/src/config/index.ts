import path from 'path'
import { HTTPRoute, InternalConfig, UserConfig } from '../types/config'
import { sync } from 'pkg-dir'
import createJITI from 'jiti'
import _ from 'lodash'
import URL from 'url'

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
    source: './src/apis',
    dev: {
      ignorePattern(req) {
        const { pathname, query } = URL.parse(req.url)
        const reg = /\.(js|css|map|json|png|jpg|jpeg|gif|svg|eot|woff2|ttf)$/
        return reg.test(pathname) || reg.test(query)
      },
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
