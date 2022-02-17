import { AbstractRouter, ApiRoute, HttpTriggerType } from '@midwayjs/hooks-core'
import { AbstractBundlerAdapter } from '@midwayjs/bundler'
import { join } from 'upath'
import { getExpressDevPack } from '@midwayjs/serverless-dev-pack'
import {
  getConfig,
  getProjectRoot,
  getRouter,
  getSource,
  normalizeUrl,
  ProjectConfig,
} from '@midwayjs/hooks/internal'
import cloneDeep from 'lodash/cloneDeep'

export class MidwayBundlerAdapter extends AbstractBundlerAdapter {
  private root: string
  private source: string
  private router: AbstractRouter

  private projectConfig: ProjectConfig

  constructor() {
    const source = getSource({ useSourceFile: true })
    const router = getRouter(source)
    super({
      name: '@midwayjs/hooks-bundler',
      router,
    })
    this.root = getProjectRoot()
    this.projectConfig = getConfig()
    this.source = source
    this.router = router
  }

  override transformApiRoutes(apis: ApiRoute[]): ApiRoute[] {
    apis = cloneDeep(apis)
    for (const api of apis) {
      if (api.trigger.type === HttpTriggerType) {
        api.trigger.path = normalizeUrl(this.router, api)
      }
    }
    return apis
  }

  override getSource(): string {
    return this.source
  }

  override getUnplugin() {
    const ctx = this
    return {
      vite: {
        resolveId(_: string, importer: string) {
          if (
            process.env.NODE_ENV !== 'production' &&
            importer &&
            ctx.router.isSourceFile(importer, ctx.source) &&
            ctx.router.isApiFile({ mod: require(importer), file: importer })
          ) {
            return 'MIDWAY_HOOKS_VIRTUAL_FILE'
          }

          return null
        },
        async configureServer(server) {
          // TODO support custom plugins
          const devPack = getExpressDevPack(ctx.root, {
            sourceDir: join(ctx.root, ctx.projectConfig.source),
            plugins: [],
          })

          server.middlewares.use(
            devPack({
              functionDir: ctx.root,
              ignorePattern: ctx.projectConfig.dev.ignorePattern,
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
