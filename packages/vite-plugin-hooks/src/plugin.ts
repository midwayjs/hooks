import { join } from 'path'
import { Plugin } from 'vite'

import {
  FileRouter,
  getConfig,
  getProjectRoot,
  ProjectConfig,
} from '@midwayjs/hooks-core'
import { getExpressDevPack } from '@midwayjs/serverless-dev-pack'

export class VitePlugin implements Plugin {
  root: string
  router: FileRouter

  projectConfig: ProjectConfig
  midwayPlugins: any[]

  constructor() {
    this.root = getProjectRoot()
    this.projectConfig = getConfig()
    this.router = new FileRouter({
      root: this.root,
      projectConfig: this.projectConfig,
      useSourceFile: true,
    })
  }

  enforce: 'pre' | 'post' = 'pre'
  name = 'vite:@midwayjs/hooks'

  transform = async (code: string, file: string) => {
    if (!this.router.isApiFile(file)) {
      return null
    }

    const route = this.router.getRoute(file)
    const Gateway = this.router.getGatewayByRoute(route)
    const client = await Gateway.createApiClient(
      file,
      code,
      new Gateway.router({
        root: this.root,
        projectConfig: this.projectConfig,
        useSourceFile: true,
      })
    )

    return {
      code: client,
      map: null,
    }
  }

  resolveId = (_: string, importer: string) => {
    if (
      process.env.NODE_ENV !== 'production' &&
      importer &&
      this.router.isApiFile(importer)
    ) {
      return 'MIDWAY_HOOKS_VIRTUAL_FILE'
    }

    return null
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
      optimizeDeps: {
        include: [this.projectConfig.request.client],
      },
      build: {
        manifest: true,
        outDir: this.projectConfig.build.viteOutDir,
      },
    }
  }
}
