import { IMidwayApplication } from '@midwayjs/core'
import {
  RuntimeConfig,
  validateArray,
  als,
  useHooksMiddleware,
  HooksMiddleware,
} from '@midwayjs/hooks-core'

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
    onReady(_, app: MidwayApplication) {
      registerGlobalMiddleware(app, runtimeConfig.middleware)
    },
  })

  // TODO
  /**
   * register api routes
   * 1. load api routes from file system
   * 2. load user predefined api routes
   * 3. enable middleware
   */
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

// For http
async function useHooksRuntime(ctx: any, next: any) {
  await als.run({ ctx }, async () => await next())
}
