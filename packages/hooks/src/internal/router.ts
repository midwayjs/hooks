import {
  AbstractRouter,
  ApiRoute,
  ApiRouter,
  FileSystemRouter,
  urlJoin,
} from '@midwayjs/hooks-core'
import { getConfig, getProjectRoot } from './config'
import { join } from 'upath'

type GetSourceOptions = {
  useSourceFile: boolean
}

export function getRouter(source: string): AbstractRouter {
  const { routes } = getConfig()

  if (Array.isArray(routes)) {
    return new FileSystemRouter({ source, routes })
  }

  return new ApiRouter()
}

export function getSource(options: GetSourceOptions) {
  const root = getProjectRoot()
  const {
    source,
    build: { outDir },
  } = getConfig()

  return join(root, options.useSourceFile ? source : outDir)
}

export function isFileSystemRouter(router: any): router is FileSystemRouter {
  return router instanceof FileSystemRouter
}

export function normalizeUrl(router: AbstractRouter, api: ApiRoute) {
  const { trigger, file } = api

  if (isFileSystemRouter(router)) {
    const basePath = router.getRoute(file).basePath
    return urlJoin(basePath, trigger.path, {})
  }

  return trigger.path
}
