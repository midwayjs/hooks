import { loader } from 'webpack'

import {
  getConfig,
  getProjectRoot,
  createApiClient,
} from '@midwayjs/hooks-core'
import { FileRouter } from '@midwayjs/hooks-core'

export default async function MidwayHooksLoader(
  this: loader.LoaderContext,
  source: string
) {
  const callback = this.async()

  const root = getProjectRoot()
  const config = getConfig()
  const router = new FileRouter(root, config, true)

  if (!router.isApiFile(this.resourcePath)) {
    return callback(null, source)
  }

  const route = router.getRoute(this.resourcePath)
  const Gateway = router.getGatewayByRoute(route)
  const client = await Gateway.createApiClient(
    this.resourcePath,
    source,
    new Gateway.router(root, config, true)
  )

  // const client = await createApiClient(
  //   router.getBaseUrl(this.resourcePath),
  //   source,
  //   config.superjson,
  //   config.request.client
  // )
  callback(null, client)
}
