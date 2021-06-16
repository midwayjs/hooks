import { loader } from 'webpack'

import {
  getConfig,
  getProjectRoot,
  ServerRouter,
  createApiClient,
} from '@midwayjs/hooks-core'

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

  const client = await createApiClient(
    router.getBaseUrl(this.resourcePath),
    source,
    config.superjson,
    config.request.client
  )
  callback(null, client)
}
