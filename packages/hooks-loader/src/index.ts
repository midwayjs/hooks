import {
  getConfig,
  getProjectRoot,
  ServerRouter,
  parseAndGenerateSDK,
} from '@midwayjs/hooks-core'
import { loader } from 'webpack'

process.env.MIDWAY_TS_MODE = 'true'

export default async function loader(
  this: loader.LoaderContext,
  source: string
) {
  const callback = this.async()
  const resourcePath = this.resourcePath

  const root = getProjectRoot()
  const config = getConfig()
  const router = new ServerRouter(root, config)

  if (!router.isLambdaFile(resourcePath)) {
    return callback(null, source)
  }

  const sdk = await parseAndGenerateSDK(router, resourcePath, source, 'cjs')
  callback(null, sdk)
}
