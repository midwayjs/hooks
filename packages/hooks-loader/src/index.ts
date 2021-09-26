import { loader } from 'webpack'

import {
  FileRouter,
  getConfig,
  getProjectRoot,
  buildApiClient,
} from '@midwayjs/hooks-core'

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

  const client = await buildApiClient(this.resourcePath, source, router)
  callback(null, client)
}
