import { IMidwayApplication, IMidwayContainer } from '@midwayjs/core'
import {
  All,
  Controller,
  Del,
  Get,
  Head,
  MidwayFrameworkType,
  Options,
  Patch,
  Post,
  Put,
} from '@midwayjs/decorator'
import {
  AbstractFrameworkAdapter,
  AbstractRouter,
  als,
  ApiRoute,
  createApplication,
  HooksMiddleware,
  isHooksMiddleware,
  ResponseMetadata,
  ResponseMetaData,
  urlJoin,
  useContext,
  validateArray,
  validateOneOf,
} from '@midwayjs/hooks-core'
import { RuntimeConfig } from '../internal/config/type'
import { createFunctionContainer } from '../internal/container'
import { createConfiguration } from './configuration'
import { getRouter, getSource, isFileSystemRouter } from '../internal/router'

interface MidwayApplication extends IMidwayApplication {
  use?: (middleware: any) => void
}

export function HooksComponent(runtimeConfig: RuntimeConfig = {}) {
  if (runtimeConfig.middleware !== undefined) {
    validateArray(runtimeConfig.middleware, 'runtimeConfig.middleware')
  }

  const Configuration = createConfiguration({
    namespace: '@midwayjs/hooks',
    async onReady(container: IMidwayContainer, app: MidwayApplication) {
      const source = getSource()
      const router = getRouter()

      const midway = new MidwayFrameworkAdapter(router, app, container)
      midway.registerGlobalMiddleware(runtimeConfig.middleware)

      await createApplication(source, midway)
    },
  })

  return { Configuration }
}

export class MidwayFrameworkAdapter extends AbstractFrameworkAdapter {
  constructor(
    router: AbstractRouter,
    public app: MidwayApplication,
    public container: IMidwayContainer
  ) {
    super(router)
  }

  private get frameworkType() {
    return this.app.getFrameworkType()
  }

  async registerApiRoutes(apis: ApiRoute[]): Promise<any> {
    for (const api of apis) {
      switch (api.trigger.type) {
        case 'HTTP':
          api.middleware = api.middleware?.map((mw) =>
            this.useHooksMiddleware(mw)
          )
          this.container.bind(this.createHttpApi(api))
          break
        default:
          throw new Error(`Unsupported trigger type: ${api.trigger.type}`)
      }
    }
  }

  private methodDecorators = {
    GET: Get,
    POST: Post,
    PUT: Put,
    DELETE: Del,
    PATCH: Patch,
    HEAD: Head,
    OPTIONS: Options,
    ALL: All,
  }

  createHttpApi(api: ApiRoute) {
    const { functionId, fn, trigger } = api

    validateOneOf(
      trigger.method,
      'trigger.method',
      Object.keys(this.methodDecorators)
    )
    const Method = this.methodDecorators[trigger.method]
    const url = normalizeUrl(this.router, api)

    return createFunctionContainer({
      fn,
      functionId,
      parseArgs(ctx) {
        return ctx.request?.body?.args || []
      },
      classDecorators: [Controller(url)],
      handlerDecorators: [Method('/', { middleware: api.middleware })],
    })
  }

  registerGlobalMiddleware(middlewares: HooksMiddleware[] = []) {
    const runtime =
      this.frameworkType === MidwayFrameworkType.WEB_EXPRESS
        ? this.useExpressRuntime
        : this.useUniversalRuntime

    this.app.use?.(runtime)
    for (const mw of middlewares) {
      this.app.use?.(this.useHooksMiddleware(mw))
    }
  }

  private async useExpressRuntime(req: any, res: any, next: any) {
    throw new Error('Express runtime is not supported. Please use koa.')
  }

  private async useUniversalRuntime(ctx: any, next: any) {
    await als.run({ ctx }, async () => await next())
  }

  private useHooksMiddleware(fn: (...args: any[]) => any) {
    if (!isHooksMiddleware(fn)) return fn

    return (...args: any[]) => {
      const next =
        this.frameworkType === MidwayFrameworkType.WEB_EXPRESS
          ? args[args.length - 1]
          : args[1]
      return fn(next)
    }
  }

  async handleResponseMetaData(metadata: ResponseMetaData[]): Promise<any> {
    const ctx = useContext()

    for (const meta of metadata) {
      switch (meta.type) {
        case ResponseMetadata.CODE:
          ctx.status = meta.code
          break
        case ResponseMetadata.HEADER:
          ctx.set(meta.header.key, meta.header.value)
          break
        case ResponseMetadata.CONTENT_TYPE:
          ctx.type = meta.contentType
          break
        case ResponseMetadata.REDIRECT:
          ctx.status = meta.code || 302
          ctx.redirect(meta.url)
          break
      }
    }
  }
}

export function normalizeUrl(router: AbstractRouter, api: ApiRoute) {
  const { trigger, file } = api

  if (isFileSystemRouter(router)) {
    return urlJoin(router.getRoute(file).basePath, trigger.path, {})
  }

  return trigger.path
}
