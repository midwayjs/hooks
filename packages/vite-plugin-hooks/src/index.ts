import { join } from 'path'
import { Plugin } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import {
  getProjectRoot,
  ServerRouter,
  getConfig,
  generate,
  InternalConfig,
} from '@midwayjs/hooks-core'
import { getExpressDevPack } from '@midwayjs/serverless-dev-pack'

export class VitePlugin implements Plugin {
  root: string
  router: ServerRouter

  midwayConfig: InternalConfig
  midwayPlugins: any[]

  constructor() {
    this.midwayConfig = getConfig()
    this.root = getProjectRoot()
    this.router = new ServerRouter(this.root, this.midwayConfig, true)
  }

  name = 'vite:@midwayjs/hooks'
  transform = async (code: string, file: string) => {
    if (!this.router.isApiFile(file)) {
      return null
    }

    const sdk = await generate(
      this.router.getBaseUrl(file),
      code,
      this.midwayConfig.superjson,
      this.midwayConfig.request.client
    )

    return {
      code: sdk,
      map: null,
    }
  }

  configureServer = async (server) => {
    const devPack = getExpressDevPack(this.root, {
      sourceDir: join(this.root, this.midwayConfig.source),
      plugins: this.midwayPlugins,
    })

    server.middlewares.use(
      devPack({
        functionDir: this.root,
        ignorePattern: this.midwayConfig.dev.ignorePattern,
      })
    )
  }

  config = () => {
    return {
      plugin: [tsconfigPaths({ root: this.root })],
      optimizeDeps: {
        include: ['@midwayjs/hooks-core/request'],
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
        outDir: this.midwayConfig.build.viteOutDir,
      },
    }
  }
}

function createPlugin() {
  return new VitePlugin()
}

export default createPlugin

module.exports = createPlugin
