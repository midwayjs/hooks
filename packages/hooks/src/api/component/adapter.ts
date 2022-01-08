import {
  AbstractFrameworkAdapter,
  AbstractRouter,
  als,
  ApiRoute,
  createDebug,
  HooksMiddleware,
  HttpTriggerType,
  isHooksMiddleware,
  ResponseMetaData,
  ResponseMetaType,
  urlJoin,
  useContext,
  validateOneOf,
} from '@midwayjs/hooks-core'
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
  createFunctionContainer,
  isDev,
  isFileSystemRouter,
} from '../../internal'

const debug = createDebug('hooks:MidwayFrameworkAdapter')

export interface MidwayApplication extends IMidwayApplication {
  use?: (middleware: any) => void
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

  private controllers = []
  bindControllers() {
    for (const controller of this.controllers) {
      this.container.bind(controller)
    }
  }

  registerApiRoutes(apis: ApiRoute[]) {
    for (const api of apis) {
      switch (api.trigger.type) {
        case 'HTTP':
          api.middleware = api.middleware?.map((mw) =>
            this.useHooksMiddleware(mw)
          )
          this.controllers.push(this.createHttpApi(api))
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

    debug('create http api: %s %s %s', functionId, trigger.method, url)

    if (isDev()) {
      globalThis['HOOKS_ROUTER'] ??= []
      globalThis['HOOKS_ROUTER'].push({
        type: HttpTriggerType.toLowerCase(),
        path: url,
        method: trigger.method,
        functionId,
        handler: `${functionId}.handler`,
      })
    }

    return createFunctionContainer({
      fn,
      functionId,
      parseArgs(ctx) {
        return ctx.request?.body?.args || []
      },
      classDecorators: [Controller()],
      handlerDecorators: [Method(url, { middleware: api.middleware })],
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
        case ResponseMetaType.CODE:
          ctx.status = meta.code
          break
        case ResponseMetaType.HEADER:
          ctx.set(meta.header.key, meta.header.value)
          break
        case ResponseMetaType.CONTENT_TYPE:
          ctx.type = meta.contentType
          break
        case ResponseMetaType.REDIRECT:
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
    const basePath = router.getRoute(file).basePath
    return urlJoin(basePath, trigger.path, {})
  }

  return trigger.path
}
