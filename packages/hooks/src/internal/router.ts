import {
  AbstractRouter,
  DecorateRouter,
  FileSystemRouter,
} from '@midwayjs/hooks-core'
import { getConfig, getProjectRoot } from './config'
import { isDevelopment } from './util'
import { join } from 'upath'

export function getRouter(isDevelopment: boolean): AbstractRouter {
  const root = getProjectRoot()
  const {
    source,
    build: { outDir },
    routes,
  } = getConfig()

  if (Array.isArray(routes)) {
    return new FileSystemRouter({
      root,
      source: isDevelopment ? source : outDir,
      routes,
    })
  }

  return new DecorateRouter({
    source: join(root, isDevelopment ? source : outDir),
  })
}

export function getSource() {
  const root = getProjectRoot()
  const {
    source,
    build: { outDir },
  } = getConfig()

  return join(root, isDevelopment() ? source : outDir)
}

export function isFileSystemRouter(router: any): router is FileSystemRouter {
  return router instanceof FileSystemRouter
}
