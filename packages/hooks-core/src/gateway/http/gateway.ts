import { existsSync } from 'fs'
import { join } from 'upath'

import { IMidwayContainer } from '@midwayjs/core'
import { All, Controller } from '@midwayjs/decorator'

import { useApiClientMatcher } from '../../request/builder'
import { als, createFunctionContainer } from '../../runtime'
import { ApiFunction } from '../../types/common'
import { Route } from '../../types/config'
import {
  ComponentOptions,
  CreateApiOptions,
  GatewayAdapterOptions,
  HooksGatewayAdapter,
  OnReadyArgs,
} from '../../types/gateway'
import { isDevelopment, lazyRequire, useHooksMiddleware } from '../../util'
import { createHTTPClientMatcher } from './client'
import { HTTPRouter } from './router'

export class HTTPGateway implements HooksGatewayAdapter {
  options: GatewayAdapterOptions
  container: IMidwayContainer

  private readonly router: HTTPRouter

  is(route: Route) {
    return !!route?.basePath
  }

  constructor(options: ComponentOptions) {
    this.options = options
    this.router = new HTTPRouter(options)

    useApiClientMatcher(createHTTPClientMatcher(this.router))
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

    createFunctionContainer({
      runWithAsyncLocalStorage: false,
      fn,
      functionId,
      parseArgs(ctx) {
        return ctx.request?.body?.args || []
      },
      classDecorators: [Controller(httpPath)],
      handlerDecorators: [All('/', { middleware })],
    })
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

    // TODO get base dir
    const baseDir = 'TODO'
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

  async onReady(args: OnReadyArgs) {
    const { app, runtimeConfig } = args
    const mws = [this.useAsyncLocalStorage]
    runtimeConfig.middleware?.forEach?.((mw) =>
      mws.push(useHooksMiddleware(mw))
    )

    for (const mw of mws) {
      ;(app as any).use(mw)
    }
  }

  useAsyncLocalStorage = async (ctx: any, next: any) => {
    await als.run({ ctx }, async () => await next())
  }
}
