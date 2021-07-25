import { join } from 'path'
import { Plugin } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import {
  getProjectRoot,
  ServerRouter,
  getConfig,
  createApiClient,
  ProjectConfig,
} from '@midwayjs/hooks-core'
import { getExpressDevPack } from '@midwayjs/serverless-dev-pack'

export class VitePlugin implements Plugin {
  root: string
  router: ServerRouter

  projectConfig: ProjectConfig
  midwayPlugins: any[]

  constructor() {
    this.projectConfig = getConfig()
    this.root = getProjectRoot()
    this.router = new ServerRouter(this.root, this.projectConfig, true)
  }

  name = 'vite:@midwayjs/hooks'

  transform = async (code: string, file: string) => {
    if (!this.router.isApiFile(file)) {
      return null
    }

    const client = await createApiClient(
      this.router.getBaseUrl(file),
      code,
      this.projectConfig.superjson,
      this.projectConfig.request.client
    )

    return {
      code: client,
      map: null,
    }
  }

  configureServer = async (server) => {
    const devPack = getExpressDevPack(this.root, {
      sourceDir: join(this.root, this.projectConfig.source),
      plugins: this.midwayPlugins,
    })

    server.middlewares.use(
      devPack({
        functionDir: this.root,
        ignorePattern: this.projectConfig.dev.ignorePattern,
      })
    )
  }

  config = () => {
    return {
      plugin: [tsconfigPaths({ root: this.root })],
      optimizeDeps: {
        include: [this.projectConfig.request.client],
      },
      resolve: {
        alias: [
          {
            find: '@midwayjs/hooks',
            replacement: '@midwayjs/hooks/universal',
          },
        ],
      },
      build: {
        manifest: true,
        outDir: this.projectConfig.build.viteOutDir,
      },
    }
  }
}
