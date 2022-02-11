import {
  AbstractRouter,
  ApiRoute,
  ContextManager,
  createDebug,
  HooksMiddleware,
  HttpTrigger,
  HttpTriggerType,
  isHooksMiddleware,
  ResponseMetaData,
  ResponseMetaType,
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
import { createFunctionContainer, isDev, normalizeUrl } from '../../internal'
import { HooksTrigger } from '../operator/type'

const debug = createDebug('hooks: MidwayFrameworkAdapter')

export interface MidwayApplication extends IMidwayApplication {
  use?: (middleware: any) => void
}

export class MidwayFrameworkAdapter {
  constructor(
    public router: AbstractRouter,
    public app: MidwayApplication,
    public container: IMidwayContainer
  ) {}

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

  isHooksTrigger(api: ApiRoute): api is ApiRoute<HooksTrigger> {
    return typeof (api.trigger as HooksTrigger)?.parseArgs === 'function'
  }

  registerApiRoutes(apis: ApiRoute[]) {
    for (const api of apis) {
      const type = api.trigger.type

      if (this.isHttpTrigger(api)) {
        api.middleware = api.middleware?.map((mw) =>
          this.useHooksMiddleware(mw)
        )
        this.controllers.push(this.createHttpApi(api))
        continue
      }

      if (this.isHooksTrigger(api)) {
        this.controllers.push(
          this.createServerlessApi(api as ApiRoute<HooksTrigger>)
        )
        continue
      }

      throw new Error(`Unsupported trigger type: ${type}`)
    }
  }

  createServerlessApi(api: ApiRoute<HooksTrigger>) {
    const { functionId, fn, trigger } = api

    debug('create %s api: %s', trigger.type, functionId)

    return createFunctionContainer({
      fn,
      functionId,
      parseArgs: trigger.parseArgs,
      handlerDecorators: trigger.handlerDecorators,
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
      // Midway Cli
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
    return await ContextManager.run({ ctx }, async () => await next())
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
