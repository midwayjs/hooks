import { IMidwayApplication } from '@midwayjs/core'
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
  useHooksMiddleware,
  HooksMiddleware,
  loadApiRoutes,
  ApiRoute,
  validateOneOf,
} from '@midwayjs/hooks-core'

import { getConfig, getProjectRoot } from '../internal'
import { createFunctionContainer } from '../internal/container'
import { isDevelopment } from '../internal/util'
import { createConfiguration } from './configuration'

interface MidwayApplication extends IMidwayApplication {
  use?: (middleware: any) => void
}

type RuntimeConfig = {
  /**
   * @description global middleware, only available in http mode
   */
  middleware?: HooksMiddleware[]
}

export function HooksComponent(runtimeConfig: RuntimeConfig = {}) {
  if (runtimeConfig.middleware !== undefined) {
    validateArray(runtimeConfig.middleware, 'runtimeConfig.middleware')
  }

  const Configuration = createConfiguration({
    namespace: '@midwayjs/hooks',
    onReady(_, app: MidwayApplication) {
      registerGlobalMiddleware(app, runtimeConfig.middleware)
    },
  })

  const root = getProjectRoot()
  const projectConfig = getConfig()
  const apis = loadApiRoutes({
    root,
    source: isDevelopment() ? projectConfig.source : projectConfig.build.outDir,
    routes: projectConfig.routes,
  })
  registerApiRoutes(apis)

  return { Configuration }
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

export function registerApiRoutes(apis: ApiRoute[]) {
  for (const api of apis) {
    switch (api.trigger.type) {
      case 'HTTP':
        registerHTTPRoute(api)
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

function registerHTTPRoute(api: ApiRoute) {
  const { functionId, fn, trigger } = api
  const middleware = api.middleware as any

  validateOneOf(trigger.method, 'trigger.method', Object.keys(methodDecorators))
  const Method = methodDecorators[trigger.method]

  createFunctionContainer({
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
