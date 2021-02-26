import { getConfig, getProjectRoot, WebRouter } from '@midwayjs/hooks-core'
import { loader } from 'webpack'

export default async function loader(
  this: loader.LoaderContext,
  source: string
) {
  const callback = this.async()
  const resourcePath = this.resourcePath

  const root = getProjectRoot()
  const config = getConfig()
  const router = new WebRouter(root, config)

  if (!router.isLambdaFile(resourcePath)) {
    return callback(null, source)
  }

  let baseUrl = router.getHTTPPath(resourcePath, '', true)
  if (baseUrl === '/*') {
    baseUrl = '/'
  } else if (baseUrl.endsWith('/*')) {
    baseUrl = baseUrl.slice(0, -1)
  }

  const proxy = `
const { createRequestProxy } = require('@midwayjs/hooks-core/lib/proxy/http');
const baseUrl = '${baseUrl}';
module.exports = createRequestProxy(baseUrl);
  `.trim()

  callback(null, proxy)
}
