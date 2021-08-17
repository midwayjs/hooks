import { existsSync } from 'fs'
import { join } from 'upath'

import { IMidwayContainer } from '@midwayjs/core'
import { All, Controller } from '@midwayjs/decorator'

import { createFunctionContainer } from '../../runtime'
import { ApiFunction } from '../../types/common'
import { Route } from '../../types/config'
import {
  ComponentOptions,
  CreateApiOptions,
  HooksGatewayAdapter,
} from '../../types/gateway'
import { isDevelopment, lazyRequire } from '../../util'
import { createHTTPApiClient } from './client'
import { HTTPRouter } from './router'

export class HTTPGateway implements HooksGatewayAdapter {
  static is(route: Route) {
    return !!route?.basePath
  }

  static router = HTTPRouter
  static createApiClient = createHTTPApiClient

  options: ComponentOptions
  container: IMidwayContainer
  router: HTTPRouter

  constructor(options: ComponentOptions) {
    this.options = options
    this.router = new HTTPRouter({
      root: this.options.root,
      projectConfig: this.options.projectConfig,
      useSourceFile: this.options.router.useSourceFile,
    })
  }

  createApi(options: CreateApiOptions) {
    const { file, functionName, isExportDefault, fn } = options
    const httpPath = this.router.getHTTPPath(
      file,
      functionName,
      isExportDefault
    )

    fn._param.url = httpPath
    this.createHTTPApi(httpPath, options)
  }

  createHTTPApi(httpPath: string, options: CreateApiOptions) {
    const { functionId, fn } = options
    // setup middleware
    const middleware = [...fn.middleware]

    const FunctionContainer = createFunctionContainer({
      isHTTP: true,
      fn,
      functionId,
      parseArgs(ctx) {
        const args = ctx.request?.body?.args || []
        return args
      },
      classDecorators: [Controller('/')],
      handlerDecorators: [All(httpPath, { middleware })],
    })

    this.container.bind(functionId, FunctionContainer)
  }

  afterCreate() {
    if (isDevelopment()) {
      return
    }

    if (!this.isViteProject) {
      return
    }

    const { routes } = this.router
    if (routes.has('/') || routes.has('/*')) {
      return
    }

    const baseDir = this.container.get('baseDir')
    const staticCache = lazyRequire('koa-static-cache')
    const mw = staticCache({
      dir: join(baseDir, '..', this.options.projectConfig.build.viteOutDir),
      dynamic: true,
      alias: {
        '/': 'index.html',
        /**
         * Add alias for windows, '/' -> '\\'
         * https://github.com/koajs/static-cache/blob/master/index.js#L45
         */
        '\\': 'index.html',
      },
      buffer: true,
      gzip: true,
    })

    const fn: ApiFunction = async () => {}
    fn.middleware = [mw]

    this.createHTTPApi('/*', {
      functionId: 'hooks-host',
      fn,
    })
  }

  get isViteProject() {
    return ['vite.config.ts', 'vite.config.js'].some((config) =>
      existsSync(join(this.options.root, config))
    )
  }
}
