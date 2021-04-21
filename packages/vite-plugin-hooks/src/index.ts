import {
  getProjectRoot,
  ServerRouter,
  getConfig,
  generate,
} from '@midwayjs/hooks-core'
import { Plugin } from 'vite'
import { getExpressDevPack } from '@midwayjs/serverless-dev-pack'
import { join } from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'

function plugin(): Plugin {
  const root = getProjectRoot()
  const config = getConfig()
  const router = new ServerRouter(root, config, true)

  return {
    name: 'vite:@midwayjs/hooks',
    async transform(code: string, file: string) {
      if (!router.isApiFile(file)) {
        return null
      }

      const sdk = await generate(
        router.getBaseUrl(file),
        code,
        config.superjson,
        config.request.client
      )

      return {
        code: sdk,
        map: null,
      }
    },
    config: () => ({
      plugin: [tsconfigPaths({ root })],
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
        outDir: config.build.viteOutDir,
      },
    }),
    configureServer(server) {
      const devPack = getExpressDevPack(root, {
        sourceDir: join(root, config.source),
      })

      server.middlewares.use(
        devPack({
          functionDir: root,
          ignorePattern: config.dev.ignorePattern,
        })
      )
    },
  }
}

export default plugin
