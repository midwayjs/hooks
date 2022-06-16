import { AbstractRouter, ApiRoute, HttpTriggerType } from '@midwayjs/hooks-core'
import { AbstractBundlerAdapter, requireWithoutCache } from '@midwayjs/bundler'
import { join } from 'upath'
import { createExpressDevPack } from '@midwayjs/dev-pack'
import {
  getRouter,
  getSource,
  normalizeUrl,
  ProjectConfig,
} from '@midwayjs/hooks/internal'
import { getConfig, getProjectRoot } from '@midwayjs/hooks-config'
import type { ViteDevServer } from 'vite'
import cloneDeep from 'lodash/cloneDeep'

export class MidwayBundlerAdapter extends AbstractBundlerAdapter {
  protected root: string
  protected source: string
  protected router: AbstractRouter

  protected projectConfig: ProjectConfig

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
            ctx.router.isApiFile({
              mod: requireWithoutCache(importer),
              file: importer,
            })
          ) {
            return 'MIDWAY_HOOKS_VIRTUAL_FILE'
          }

          return null
        },
        async configureServer(server: ViteDevServer) {
          const { middleware } = await createExpressDevPack({
            cwd: ctx.root,
            sourceDir: join(ctx.root, ctx.projectConfig.source),
            watch: true,
          })

          server.middlewares.use(middleware)
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
