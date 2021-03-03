import { HooksRouter } from './base'
import { join } from 'upath'
import { InternalConfig } from '../types/config'
import { isTypeScriptEnvironment } from '@midwayjs/bootstrap'

export class ServerRouter extends HooksRouter {
  config: InternalConfig

  constructor(root: string, config: InternalConfig) {
    super(root)
    this.config = config
  }

  get source() {
    if (isTypeScriptEnvironment()) {
      return join(this.root, this.config.source)
    }
    return join(this.root, this.config.build.outDir)
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
