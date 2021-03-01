import {
  getProjectRoot,
  ServerRouter,
  getConfig,
  parseAndGenerateSDK,
} from '@midwayjs/hooks-core'
import { Plugin } from 'vite'
import { getExpressDevPack } from '@midwayjs/faas-dev-pack'
import URL from 'url'

function ignorePattern(req) {
  const { pathname, query } = URL.parse(req.url)
  const reg = /\.(js|css|map|json|png|jpg|jpeg|gif|svg|eot|woff2|ttf)$/
  return reg.test(pathname) || reg.test(query)
}

function hooksPlugin(): Plugin {
  const root = getProjectRoot()
  const config = getConfig()
  const router = new ServerRouter(root, config)

  return {
    name: 'vite:midway-hooks',
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
      optimizeDeps: {
        include: ['@midwayjs/hooks-core/lib/request/sdk'],
      },
    }),
    configureServer(server) {
      const devPack = getExpressDevPack(root)
      server.middlewares.use(
        devPack({
          functionDir: root,
          ignorePattern,
        })
      )
    },
  }
}

module.exports = hooksPlugin

export default hooksPlugin
