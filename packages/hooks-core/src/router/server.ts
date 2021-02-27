import { HooksRouter } from './base'
import { join } from 'upath'

export type WebRoute = {
  baseDir: string
  basePath: string
}

export type ServerRouterConfig = {
  source?: string
  routes: WebRoute[]
}

const defaultSource = '/src/apis'

export class ServerRouter extends HooksRouter {
  config: ServerRouterConfig

  constructor(root: string, config: ServerRouterConfig) {
    super(root)
    this.config = config
  }

  get source() {
    return join(this.root, this.config.source ?? defaultSource)
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
