import {
  AbstractRouter,
  ApiRoute,
  ContextManager,
  createDebug,
  EXPORT_DEFAULT_FUNCTION_ALIAS,
  HooksMiddleware,
  HttpTrigger,
  ResponseMetaData,
  ResponseMetaType,
  validateOneOf,
} from '@midwayjs/hooks-core'
import type { IMidwayApplication, IMidwayContainer } from '@midwayjs/core'
import {
  MidwayApplicationManager,
  MidwayServerlessFunctionService,
  MidwayWebRouterService,
  All,
  Del,
  Get,
  Head,
  Options,
  Patch,
  Post,
  Put,
  ServerlessTriggerType,
} from '@midwayjs/core'
import { FileSystemRouter, normalizePath } from '@midwayjs/hooks-internal'
import camelCase from 'lodash/camelCase'
import { ServerlessTrigger } from '../operator/serverless'
import { useHooksMiddleware } from '../middleware'
import { useContext } from '../hooks'

const debug = createDebug('hooks: MidwayFrameworkAdapter')

export interface MidwayApplication extends IMidwayApplication {
  use?: (middleware: any) => void
}

export class MidwayFrameworkAdapter {
  constructor(
    public source: string,
    public router: AbstractRouter,
    public app: MidwayApplication
  ) {}

  async initialize(
    container: IMidwayContainer,
    apis: ApiRoute[],
    globalMiddlewares: HooksMiddleware[]
  ) {
    const applicationManager = await container.getAsync(
      MidwayApplicationManager
    )

    const faas = applicationManager.getApplication('faas')
    const koa = applicationManager.getApplication('koa')

    if (faas) {
      this.app = faas
      this.createServerlessApi(
        apis,
        await container.getAsync(MidwayServerlessFunctionService)
      )
    } else {
      this.app = koa
      this.createWebApi(apis, await container.getAsync(MidwayWebRouterService))
    }

    this.registerGlobalMiddleware(globalMiddlewares)
  }

  isHttpTrigger(api: ApiRoute): api is ApiRoute<HttpTrigger> {
    return api.trigger.type === 'HTTP'
  }

  isServerlessTrigger(api: ApiRoute): api is ApiRoute<ServerlessTrigger> {
    return typeof (api.trigger as ServerlessTrigger)?.parseArgs === 'function'
  }

  createWebApi(
    apis: ApiRoute[],
    midwayWebRouterService: MidwayWebRouterService
  ) {
    for (const api of apis) {
      const providerId = this.getUniqueProviderId(api)

      debug('create trigger: %s, providerId: %s', api.trigger.type, providerId)

      if (this.isHttpTrigger(api)) {
        const http = this.createHttpApi(api)
        midwayWebRouterService.addRouter(http.handler, {
          url: http.path,
          middleware: http.middleware,
          requestMethod: http.method,
        })
      }
    }
  }

  createHttpApi(api: ApiRoute<HttpTrigger>) {
    validateOneOf(
      api.trigger.method,
      'trigger.method',
      Object.keys(this.methodDecorators)
    )

    const parseHTTPArgs = ({ ctx }) => {
      return ctx.request?.body?.args || []
    }

    return {
      path: normalizePath(this.router, api),
      middleware: api.middleware?.map(useHooksMiddleware),
      handler: this.createHandler(api.fn, parseHTTPArgs),
      method: api.trigger.method.toLowerCase(),
    }
  }

  private createHandler(
    fn: Function,
    parseArgs: (inputs: { ctx: any; args: any[] }) => any[]
  ) {
    return (ctx: any, ...args: unknown[]) => {
      return fn(...parseArgs({ ctx, args }))
    }
  }

  createServerlessApi(
    apis: ApiRoute[],
    midwayServerlessFunctionService: MidwayServerlessFunctionService
  ) {
    for (const api of apis) {
      const providerId = this.getUniqueProviderId(api)

      debug('create trigger: %s, providerId: %s', api.trigger.type, providerId)

      if (this.isHttpTrigger(api)) {
        const http = this.createHttpApi(api)
        midwayServerlessFunctionService.addServerlessFunction(http.handler, {
          type: ServerlessTriggerType.HTTP,
          metadata: {
            name: ServerlessTriggerType.HTTP,
            method: http.method as any,
            path: http.path,
            middleware: http.middleware,
          },
          functionName: providerId,
          handlerName: `${providerId}.handler`,
        })
        continue
      }

      if (this.isServerlessTrigger(api)) {
        midwayServerlessFunctionService.addServerlessFunction(
          this.createHandler(api.fn, api.trigger.parseArgs),
          {
            name: api.trigger.type,
            type: api.trigger.type,
            metadata: {
              ...api.trigger.options,
              name: api.trigger.type,
              functionName: providerId,
              middleware: api.middleware?.map(useHooksMiddleware),
            },
            functionName: providerId,
            handlerName: `${providerId}.handler`,
          } as any
        )
      }
    }
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
    for (const mw of middlewares) {
      this.app.use?.(useHooksMiddleware(mw))
    }
  }

  private async useUniversalRuntime(ctx: any, next: any) {
    return await ContextManager.run({ ctx }, async () => await next())
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
