import { HooksRouter } from './base'
import { join } from 'upath'
import { InternalConfig } from '../types/config'
import { isProduction } from '@midwayjs/hooks-core'

export class ServerRouter extends HooksRouter {
  config: InternalConfig

  constructor(root: string, config: InternalConfig) {
    super(root)
    this.config = config
  }

  get source() {
    if (isProduction()) {
      return join(this.root, this.config.build.outDir)
    }
    return join(this.root, this.config.source)
  }

  getRouteConfigBySourceFilePath(sourceFilePath: string) {
    const { routes } = this.config
    const dirs = routes.map((route) => this.getLambdaDirectory(route.baseDir))
    const index = dirs.findIndex((dir) => this.inside(sourceFilePath, dir))
    const route = routes[index]

    if (!route) {
      return null
    }

    return {
      underscore: false,
      ...route,
    }
  }
}
