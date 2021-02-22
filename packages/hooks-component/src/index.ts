import { createConfiguration, IMidwayContainer } from '@midwayjs/core'

import { Inject, Controller, Get, Post, Provide } from '@midwayjs/decorator'

import { als } from '@midwayjs/hooks/lib/api/async_hooks/als'
import { EnhancedFunc } from '@midwayjs/hooks/lib/hoc/type'
import {
  WebRouterConfig,
  WebRouter,
  getFunctionId,
} from '@midwayjs/hooks-router'

interface HooksConfig extends Omit<WebRouterConfig, 'source'> {}

export const fnMap = new Map<EnhancedFunc, any>()

export const createHooks = (config: HooksConfig) => {
  const configuration = createConfiguration({
    namespace: 'hooks',
    directoryResolveFilter: createResolveFilter(config),
  })
    .onReady(() => {})
    .onStop(() => {})

  return {
    Configuration: configuration,
  }
}

function createResolveFilter(config: HooksConfig) {
  return config.routes.map((route) => {
    return {
      pattern: route.baseDir,
      filter: (
        mod: {
          default?: any
          [key: string]: any
        },
        sourceFilePath: string,
        container: IMidwayContainer
      ) => {
        const root: string = container.get('appDir')
        const router = new WebRouter(root, {
          routes: config.routes,
          source: (config as any).source,
        })

        // export default
        const defaultExports = mod.default || mod
        if (typeof defaultExports === 'function') {
          createFunctionContainer({
            container,
            router,
            fn: defaultExports,
            sourceFilePath,
            isExportDefault: true,
          })
        }

        for (const key of Object.keys(mod)) {
          if (key === 'default') {
            continue
          }

          const value = mod[key]
          if (typeof value === 'function') {
            createFunctionContainer({
              container,
              router,
              fn: value,
              sourceFilePath,
              isExportDefault: false,
            })
          }
        }
      },
    }
  })
}

function createFunctionContainer(config: {
  container: IMidwayContainer
  fn: EnhancedFunc
  sourceFilePath: string
  router: WebRouter
  isExportDefault: boolean
}) {
  const { container, fn, router, sourceFilePath, isExportDefault } = config

  const fnName = isExportDefault ? '$default' : fn.name
  const id = getFunctionId({
    router,
    sourceFilePath,
    functionName: fnName,
    isExportDefault,
  })

  const containerId = 'hooks_func::' + id
  const httpPath = router.getHTTPPath(sourceFilePath, fnName, isExportDefault)
  const HttpMethod = fn.length === 0 ? Get : Post

  fnMap.set(fn, {
    containerId,
    httpPath,
    httpMethod: fn.length === 0 ? 'GET' : 'POST',
  })

  @Provide(containerId)
  @Controller('/')
  class FunctionContainer {
    @Inject()
    ctx: any

    @HttpMethod(httpPath, { middleware: fn.middleware || [] })
    async handler() {
      const bindCtx = {
        ctx: this.ctx,
      }

      let args = this.ctx?.request?.body?.args || []
      if (typeof args === 'string') {
        args = JSON.parse(args)
      }

      return await als.run(bindCtx, () => fn(...args))
    }
  }

  container.bind(containerId, FunctionContainer)
}
