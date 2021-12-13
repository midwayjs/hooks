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
  als,
  ApiRoute,
  createApplication,
  FrameworkConfig,
  HooksMiddleware,
  isHooksMiddleware,
  ResponseMetadata,
  ResponseMetaData,
  urlJoin,
  useContext,
  validateArray,
  validateOneOf,
} from '@midwayjs/hooks-core'
import { getConfig, getProjectRoot } from '../internal'
import { MidwayRoute, RuntimeConfig } from '../internal/config/type'
import { createFunctionContainer } from '../internal/container'
import { isDevelopment } from '../internal/util'
import { createConfiguration } from './configuration'

interface MidwayApplication extends IMidwayApplication {
  use?: (middleware: any) => void
}

export class MidwayFrameworkAdapter extends AbstractFrameworkAdapter {
  constructor(
    config: FrameworkConfig,
    public app: MidwayApplication,
    public container: IMidwayContainer
  ) {
    super(config)
  }

  private get frameworkType() {
    return this.app.getFrameworkType()
  }

  async handleApiRoutes(apis: ApiRoute[]): Promise<any> {
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
    const url = normalizeUrl(api)

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

  normalizeUrl(api: ApiRoute) {
    const { trigger, route } = api
    return urlJoin((route as MidwayRoute).basePath, trigger.path, {})
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

export function HooksComponent(runtimeConfig: RuntimeConfig = {}) {
  if (runtimeConfig.middleware !== undefined) {
    validateArray(runtimeConfig.middleware, 'runtimeConfig.middleware')
  }

  const Configuration = createConfiguration({
    namespace: '@midwayjs/hooks',
    async onReady(container: IMidwayContainer, app: MidwayApplication) {
      const root = getProjectRoot()
      const {
        source,
        build: { outDir },
        routes,
      } = getConfig()

      const midwayFrameworkAdapter = new MidwayFrameworkAdapter(
        {
          root,
          source: isDevelopment() ? source : outDir,
          routes,
        },
        app,
        container
      )

      midwayFrameworkAdapter.registerGlobalMiddleware(runtimeConfig.middleware)

      await createApplication(midwayFrameworkAdapter)
    },
  })

  return { Configuration }
}

export function normalizeUrl(api: ApiRoute) {
  const { trigger, route } = api
  return urlJoin((route as MidwayRoute).basePath, trigger.path, {})
}
