import {
  AbstractFrameworkAdapter,
  AbstractRouter,
  ContextManager,
  ApiRoute,
  createDebug,
  HooksMiddleware,
  HttpTrigger,
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
  ServerlessTrigger,
  ServerlessTriggerType,
} from '@midwayjs/decorator'
import {
  createFunctionContainer,
  isDev,
  isFileSystemRouter,
} from '../../internal'
import {
  HSFTrigger,
  MTopTrigger,
  ServerlessTimerTrigger,
} from '../operator/serverless'

const debug = createDebug('hooks: MidwayFrameworkAdapter')

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

  isHttpTrigger(api: ApiRoute): api is ApiRoute<HttpTrigger> {
    return api.trigger.type === 'HTTP'
  }

  isServerlessTimerTrigger(
    api: ApiRoute
  ): api is ApiRoute<ServerlessTimerTrigger> {
    return api.trigger.type === ServerlessTriggerType.TIMER
  }

  isMTopTrigger(api: ApiRoute): api is ApiRoute<MTopTrigger> {
    return api.trigger.type === ServerlessTriggerType.MTOP
  }

  isHSFTrigger(api: ApiRoute): api is ApiRoute<HSFTrigger> {
    return api.trigger.type === ServerlessTriggerType.HSF
  }

  registerApiRoutes(apis: ApiRoute[]) {
    for (const api of apis) {
      if (this.isHttpTrigger(api)) {
        api.middleware = api.middleware?.map((mw) =>
          this.useHooksMiddleware(mw)
        )
        this.controllers.push(this.createHttpApi(api))
        continue
      }

      if (this.isHSFTrigger(api)) {
        this.controllers.push(this.createHSFApi(api))
        continue
      }

      if (this.isMTopTrigger(api)) {
        this.controllers.push(this.createMTopApi(api))
        continue
      }

      if (this.isServerlessTimerTrigger(api)) {
        this.controllers.push(this.createServerlessTimer(api))
        continue
      }

      throw new Error(`Unsupported trigger type: ${api.trigger.type}`)
    }
  }

  createHSFApi(api: ApiRoute<HSFTrigger>) {
    const { functionId, fn } = api

    debug('create hsf api: %s', functionId)

    return createFunctionContainer({
      fn,
      functionId,
      parseArgs({ args }) {
        const event = args[0]
        return event?.args || []
      },
      handlerDecorators: [ServerlessTrigger(ServerlessTriggerType.HSF)],
    })
  }

  createMTopApi(api: ApiRoute<MTopTrigger>) {
    const { functionId, fn } = api

    debug('create mtop api: %s', functionId)

    return createFunctionContainer({
      fn,
      functionId,
      parseArgs({ args }) {
        const event = args[0]
        return event?.args || []
      },
      handlerDecorators: [ServerlessTrigger(ServerlessTriggerType.MTOP)],
    })
  }

  createServerlessTimer(api: ApiRoute<ServerlessTimerTrigger>) {
    const { trigger, fn, functionId } = api

    debug('create serverless timer: %s %O', functionId, trigger.options)

    return createFunctionContainer({
      fn,
      functionId,
      parseArgs({ args }) {
        return args
      },
      handlerDecorators: [
        ServerlessTrigger(ServerlessTriggerType.TIMER, trigger.options),
      ],
    })
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
      parseArgs({ ctx }) {
        return ctx.request?.body?.args || []
      },
      classDecorators: [Controller()],
      handlerDecorators: [Method(url, { middleware: api.middleware })],
    })
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
    await ContextManager.run({ ctx }, async () => await next())
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
