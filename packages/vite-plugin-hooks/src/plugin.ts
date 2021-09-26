import { join } from 'path'
import { Plugin } from 'vite'

import {
  FileRouter,
  getConfig,
  getProjectRoot,
  ProjectConfig,
  buildApiClient,
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

    const client = await buildApiClient(file, code, this.router)

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
