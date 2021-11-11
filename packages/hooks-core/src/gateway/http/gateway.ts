import { All, Controller } from '@midwayjs/decorator'

import { useApiClientMatcher } from '../../request/builder'
import { als, createFunctionContainer } from '../../runtime'
import { Route } from '../../types/config'
import {
  ComponentOptions,
  CreateApiOptions,
  GatewayAdapterOptions,
  HooksGatewayAdapter,
  OnReadyArgs,
} from '../../types/gateway'
import { useHooksMiddleware } from '../../util'
import { createHTTPClientMatcher } from './client'
import { HTTPRouter } from './router'

export class HTTPGateway implements HooksGatewayAdapter {
  options: GatewayAdapterOptions

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
