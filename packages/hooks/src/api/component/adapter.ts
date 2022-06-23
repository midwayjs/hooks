import {
  AbstractRouter,
  ApiRoute,
  ContextManager,
  createDebug,
  EXPORT_DEFAULT_FUNCTION_ALIAS,
  HooksMiddleware,
  HttpTrigger,
  HttpTriggerType,
  isHooksMiddleware,
  ResponseMetaData,
  ResponseMetaType,
  useContext,
  validateOneOf,
} from '@midwayjs/hooks-core'
import type { IMidwayApplication, IMidwayContainer } from '@midwayjs/core'
import {
  All,
  Controller,
  Del,
  Get,
  Head,
  Options,
  Patch,
  Post,
  Put,
} from '@midwayjs/decorator'
import { FileSystemRouter, isDev, normalizeUrl } from '@midwayjs/hooks-internal'
import { HooksTrigger } from '../operator/type'
import { createFunctionContainer } from '../container'
import camelCase from 'lodash/camelCase'

const debug = createDebug('hooks: MidwayFrameworkAdapter')

export interface MidwayApplication extends IMidwayApplication {
  use?: (middleware: any) => void
}

export class MidwayFrameworkAdapter {
  constructor(
    public source: string,
    public router: AbstractRouter,
    public app: MidwayApplication,
    public container: IMidwayContainer
  ) {}

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
    const { fn, trigger } = api
    const providerId = this.getUniqueProviderId(api)

    debug('create trigger: %s, providerId: %s', trigger.type, providerId)

    return createFunctionContainer({
      fn,
      providerId,
      parseArgs: trigger.parseArgs,
      handlerDecorators: trigger.handlerDecorators,
    })
  }

  createHttpApi(api: ApiRoute) {
    const { fn, trigger } = api

    validateOneOf(
      trigger.method,
      'trigger.method',
      Object.keys(this.methodDecorators)
    )
    const Method = this.methodDecorators[trigger.method]
    const url = normalizeUrl(this.router, api)

    const providerId = this.getUniqueProviderId(api)
    debug(
      'create http api. providerId: %s, trigger.method: %s, url: %s',
      providerId,
      trigger.method,
      url
    )

    if (isDev()) {
      // Midway Cli
      globalThis['HOOKS_ROUTER'] ??= []
      globalThis['HOOKS_ROUTER'].push({
        type: HttpTriggerType.toLowerCase(),
        path: url,
        method: trigger.method,
        functionId: providerId,
        handler: `${providerId}.handler`,
      })
    }

    return createFunctionContainer({
      fn,
      providerId,
      parseArgs({ ctx }) {
        return ctx.request?.body?.args || []
      },
      classDecorators: [Controller()],
      handlerDecorators: [Method(url, { middleware: api.middleware })],
    })
  }

  private getUniqueProviderId(api: ApiRoute) {
    if (this.router instanceof FileSystemRouter) return api.functionId
    if (api.functionName !== EXPORT_DEFAULT_FUNCTION_ALIAS)
      return camelCase(api.functionId)

    // api router & export default function
    const router = new FileSystemRouter({
      source: this.source,
      routes: [],
    })
    return router.getFunctionId(api.file, api.functionName, true)
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
    this.app.use?.(this.useUniversalRuntime)
    for (const mw of middlewares) {
      this.app.use?.(this.useHooksMiddleware(mw))
    }
  }

  private async useUniversalRuntime(ctx: any, next: any) {
    return await ContextManager.run({ ctx }, async () => await next())
  }

  private useHooksMiddleware(mw: (...args: any[]) => any | any) {
    if (!isHooksMiddleware(mw)) return mw

    return (...args: any[]) => {
      const next = args[1]
      return mw(next)
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
