import { loader } from 'webpack'

import { FileRouter, getConfig, getProjectRoot } from '@midwayjs/hooks-core'

export default async function MidwayHooksLoader(
  this: loader.LoaderContext,
  source: string
) {
  const callback = this.async()

  const root = getProjectRoot()
  const projectConfig = getConfig()
  const router = new FileRouter({
    root,
    projectConfig,
    useSourceFile: true,
  })

  if (!router.isApiFile(this.resourcePath)) {
    return callback(null, source)
  }

  const route = router.getRoute(this.resourcePath)
  const Gateway = router.getGatewayByRoute(route)
  const client = await Gateway.createApiClient(
    this.resourcePath,
    source,
    new Gateway.router({
      root,
      projectConfig,
      useSourceFile: true,
    })
  )

  callback(null, client)
}
