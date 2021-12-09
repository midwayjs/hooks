import { IMidwayApplication, IMidwayContainer } from '@midwayjs/core'
import {
  Controller,
  All,
  Get,
  Post,
  Put,
  Del,
  Patch,
  Head,
  Options,
  MidwayFrameworkType,
} from '@midwayjs/decorator'
import {
  validateArray,
  als,
  HooksMiddleware,
  loadApiRoutes,
  ApiRoute,
  validateOneOf,
  isHooksMiddleware,
  urlJoin,
  useContext,
  setDriver,
  ResponseMetaType,
} from '@midwayjs/hooks-core'
import { getConfig, getProjectRoot } from '../internal'
import { MidwayRoute, RuntimeConfig } from '../internal/config/type'
import { createFunctionContainer } from '../internal/container'
import { isDevelopment } from '../internal/util'
import { createConfiguration } from './configuration'

interface MidwayApplication extends IMidwayApplication {
  use?: (middleware: any) => void
}

export function HooksComponent(runtimeConfig: RuntimeConfig = {}) {
  if (runtimeConfig.middleware !== undefined) {
    validateArray(runtimeConfig.middleware, 'runtimeConfig.middleware')
  }

  setDriver({
    handleResponseMetaData(metadata) {
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
          case ResponseMetaType.REDIRCT:
            ctx.status = meta.code || 302
            ctx.redirect(meta.url)
            break
        }
      }
    },
  })

  const Configuration = createConfiguration({
    namespace: '@midwayjs/hooks',
    onReady(container: IMidwayContainer, app: MidwayApplication) {
      registerApiRoutes(app, container)
      registerGlobalMiddleware(app, runtimeConfig.middleware)
    },
  })

  return { Configuration }
}

function registerApiRoutes(
  app: MidwayApplication,
  container: IMidwayContainer
) {
  const root = getProjectRoot()
  const {
    source,
    build: { outDir },
    routes,
  } = getConfig()

  const apis = loadApiRoutes({
    root,
    source: isDevelopment() ? source : outDir,
    routes,
  })

  for (const api of apis) {
    switch (api.trigger.type) {
      case 'HTTP':
        api.middleware = api.middleware?.map((mw) =>
          useHooksMiddleware(mw, app.getFrameworkType())
        )
        container.bind(createHttpContainer(api))
        break
      default:
        throw new Error(`Unsupported trigger type: ${api.trigger.type}`)
    }
  }
}

const methodDecorators = {
  GET: Get,
  POST: Post,
  PUT: Put,
  DELETE: Del,
  PATCH: Patch,
  HEAD: Head,
  OPTIONS: Options,
  ALL: All,
}

export function createHttpContainer(api: ApiRoute) {
  const { functionId, fn, trigger } = api

  validateOneOf(trigger.method, 'trigger.method', Object.keys(methodDecorators))
  const Method = methodDecorators[trigger.method]
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

export function normalizeUrl(api: ApiRoute) {
  const { trigger, route } = api
  return urlJoin((route as MidwayRoute).basePath, trigger.path, {})
}

// For non-express framework
async function useUniversalRuntime(ctx: any, next: any) {
  await als.run({ ctx }, async () => await next())
}

async function useExpressRuntime(req: any, res: any, next: any) {
  throw new Error('Express runtime is not supported. Please use koa.')
  // await als.run({ ctx: { req, res } }, async () => { next() })
}

function registerGlobalMiddleware(
  app: MidwayApplication,
  middlewares: HooksMiddleware[] = []
) {
  const frameworkType = app.getFrameworkType()
  const runtime =
    frameworkType === MidwayFrameworkType.WEB_EXPRESS
      ? useExpressRuntime
      : useUniversalRuntime

  app.use?.(runtime)
  for (const mw of middlewares) {
    app.use?.(useHooksMiddleware(mw, frameworkType))
  }
}

function useHooksMiddleware(
  fn: (...args: any[]) => any,
  frameworkType: MidwayFrameworkType
) {
  if (!isHooksMiddleware(fn)) return fn

  return (...args: any[]) => {
    const next =
      frameworkType === MidwayFrameworkType.WEB_EXPRESS
        ? args[args.length - 1]
        : args[1]
    return fn(next)
  }
}
