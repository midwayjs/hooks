import {
  getProjectRoot,
  ServerRouter,
  getConfig,
  generate,
} from '@midwayjs/hooks-core'
import { Plugin } from 'vite'
import { getExpressDevPack } from '@midwayjs/serverless-dev-pack'
import URL from 'url'
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
          ignorePattern(req) {
            // TODO Refactor ignorePattern
            const { pathname, query } = URL.parse(req.url)
            const reg = /\.(js|css|map|json|png|jpg|jpeg|gif|svg|eot|woff2|ttf)$/
            return reg.test(pathname) || reg.test(query)
          },
        })
      )
    },
  }
}

export default plugin
