import { createConfiguration, IMidwayApplication } from '@midwayjs/core'
import {
  RuntimeConfig,
  validateArray,
  als,
  useHooksMiddleware,
  HooksMiddleware,
} from '@midwayjs/hooks-core'

interface MidwayApplication extends IMidwayApplication {
  use?: (middleware: any) => void
}

export function HooksComponent(runtimeConfig: RuntimeConfig = {}) {
  if (runtimeConfig.middleware !== undefined) {
    validateArray(runtimeConfig.middleware, 'runtimeConfig.middleware')
  }

  const Configuration = createConfiguration({
    namespace: '@midwayjs/hooks',
  }).onReady((_, app: MidwayApplication) => {
    registerGlobalMiddleware(app, runtimeConfig.middleware)
  })

  // registry api routes

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
