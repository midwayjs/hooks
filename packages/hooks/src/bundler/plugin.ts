import { ApiRoute, HttpTriggerType } from '@midwayjs/hooks-core'
import { AbstractBundlerAdapter, createBundlerPlugin } from '@midwayjs/bundler'
import { normalizeUrl } from '../api/component'
import { getRouter } from '../internal/router'
import { join } from 'upath'
import { getExpressDevPack } from '@midwayjs/serverless-dev-pack'
import { getConfig, getProjectRoot } from '../internal'

const root = getProjectRoot()
const projectConfig = getConfig()
const router = getRouter(true)

class MidwayBundlerAdapter extends AbstractBundlerAdapter {
  override transformApiRoutes(apis: ApiRoute[]): ApiRoute[] {
    for (const api of apis) {
      if (api.trigger.type === HttpTriggerType) {
        api.trigger.path = normalizeUrl(router, api)
      }
    }
    return apis
  }

  override getUnplugin() {
    return {
      vite: {
        resolveId(_: string, importer: string) {
          if (
            process.env.NODE_ENV !== 'production' &&
            importer &&
            router.isApiFile(importer)
          ) {
            return 'MIDWAY_HOOKS_VIRTUAL_FILE'
          }

          return null
        },
        async configureServer(server) {
          const devPack = getExpressDevPack(root, {
            sourceDir: join(root, projectConfig.source),
            plugins: [],
          })

          server.middlewares.use(
            devPack({
              functionDir: root,
              ignorePattern: projectConfig.dev.ignorePattern,
            })
          )
        },
        config() {
          return {
            optimizeDeps: {
              include: ['@midwayjs/rpc'],
            },
            build: {
              manifest: true,
            },
          }
        },
      },
    }
  }
}

const midwayBundlerAdapter = new MidwayBundlerAdapter({
  name: '@midwayjs/hooks-bundler',
  router,
})

const plugin = createBundlerPlugin(midwayBundlerAdapter)

export const webpack = plugin.webpack
export const vite = plugin.vite
