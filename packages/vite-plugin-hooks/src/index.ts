import {
  getProjectRoot,
  ServerRouter,
  getConfig,
  parseAndGenerateSDK,
} from '@midwayjs/hooks-core'
import { Plugin } from 'vite'
import { getExpressDevPack } from '@midwayjs/serverless-dev-pack'
import URL from 'url'
import { join } from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'

function ignorePattern(req) {
  const { pathname, query } = URL.parse(req.url)
  const reg = /\.(js|css|map|json|png|jpg|jpeg|gif|svg|eot|woff2|ttf)$/
  return reg.test(pathname) || reg.test(query)
}

function plugin(): Plugin {
  const root = getProjectRoot()
  const config = getConfig()
  const router = new ServerRouter(root, config)

  return {
    name: 'vite:@midwayjs/hooks',
    async transform(code: string, id: string) {
      if (!router.isLambdaFile(id)) {
        return null
      }

      const sdk = await parseAndGenerateSDK(router, id, code)
      if (!sdk) {
        return null
      }

      return {
        code: sdk,
        map: null,
      }
    },
    config: () => ({
      plugin: [tsconfigPaths({ root })],
      optimizeDeps: {
        exclude: ['@midwayjs/hooks'],
        include: ['@midwayjs/hooks-core/request'],
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
          ignorePattern,
        })
      )
    },
  }
}

export default plugin
