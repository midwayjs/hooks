import {
  getConfig,
  getProjectRoot,
  ServerRouter,
  generate,
} from '@midwayjs/hooks-core'
import { loader } from 'webpack'

export default async function MidwayHooksLoader(
  this: loader.LoaderContext,
  source: string
) {
  const callback = this.async()

  const root = getProjectRoot()
  const config = getConfig()
  const router = new ServerRouter(root, config, true)

  if (!router.isApiFile(this.resourcePath)) {
    return callback(null, source)
  }

  const sdk = await generate(
    router.getBaseUrl(this.resourcePath),
    source,
    config.superjson,
    config.request.client
  )
  callback(null, sdk)
}
