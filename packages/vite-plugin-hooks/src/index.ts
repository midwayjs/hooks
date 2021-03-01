import {
  getProjectRoot,
  ServerRouter,
  getConfig,
  parseAndGenerateSDK,
} from '@midwayjs/hooks-core'
import { Plugin } from 'vite'

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
  }
}

module.exports = hooksPlugin

export default hooksPlugin
