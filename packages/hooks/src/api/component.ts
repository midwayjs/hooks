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
} from '@midwayjs/decorator'
import {
  validateArray,
  als,
  HooksMiddleware,
  loadApiRoutes,
  ApiRoute,
  validateOneOf,
  isHooksMiddleware,
} from '@midwayjs/hooks-core'
import { getConfig, getProjectRoot } from '../internal'
import { RuntimeConfig } from '../internal/config/type'
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

  const Configuration = createConfiguration({
    namespace: '@midwayjs/hooks',
    onReady(container: IMidwayContainer, app: MidwayApplication) {
      registerApiRoutes(container)
      registerGlobalMiddleware(app, runtimeConfig.middleware)
    },
  })

  return { Configuration }
}

function registerApiRoutes(container: IMidwayContainer) {
  const root = getProjectRoot()
  const {
    source,
    build: { outDir },
    routes,
  } = getConfig()
  const apis = loadApiRoutes({
    root,
    source: isDevelopment() ? source : outDir,
    routes: routes,
  })

  for (const api of apis) {
    switch (api.trigger.type) {
      case 'HTTP':
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
  const middleware = api.middleware?.map(useHooksMiddleware) as any

  validateOneOf(trigger.method, 'trigger.method', Object.keys(methodDecorators))
  const Method = methodDecorators[trigger.method]

  return createFunctionContainer({
    runWithAsyncLocalStorage: false,
    fn,
    functionId,
    parseArgs(ctx) {
      return ctx.request?.body?.args || []
    },
    classDecorators: [Controller(trigger.path)],
    handlerDecorators: [Method('/', { middleware })],
  })
}

// For http
async function useHooksRuntime(ctx: any, next: any) {
  await als.run({ ctx }, async () => await next())
}

function registerGlobalMiddleware(
  app: MidwayApplication,
  middlewares: HooksMiddleware[] = []
) {
  app.use?.(useHooksRuntime)
  for (const mw of middlewares) {
    app.use?.(useHooksMiddleware(mw))
  }
}

function useHooksMiddleware(fn: (...args: any[]) => any) {
  return (...args: any[]) => {
    /**
     * @description Hooks middleware
     * @example const middleware = (next) => { const ctx = useContext() }
     */
    if (isHooksMiddleware(fn)) {
      const next = args[1]
      return fn(next)
    }
    return fn(...args)
  }
}
