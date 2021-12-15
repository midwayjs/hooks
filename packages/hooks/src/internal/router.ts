import { AbstractRouter, FileRouter } from '@midwayjs/hooks-core'
import { getConfig, getProjectRoot } from './config'
import { isDevelopment } from './util'
import { join } from 'upath'

export function getRouter(): AbstractRouter {
  const root = getProjectRoot()
  const {
    source,
    build: { outDir },
    routes,
  } = getConfig()

  return new FileRouter({
    root,
    source: isDevelopment() ? source : outDir,
    routes,
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

export function isFileSystemRouter(router: any): router is FileRouter {
  return router instanceof FileRouter
}
