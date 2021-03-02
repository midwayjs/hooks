import { createConfiguration, IMidwayContainer } from '@midwayjs/core'
import { Inject, Controller, Get, Post, Provide } from '@midwayjs/decorator'
import { als } from '../runtime'
import { EnhancedFunc } from '../types/common'
import { ServerRouter, getFunctionId } from '../router'
import { getConfig, getProjectRoot } from '../config'
import { UserConfig } from '../types/config'

/**
 * Create hooks component
 */
export const hooks = () => {
  const config = getConfig()
  const configuration = createConfiguration({
    namespace: '@midwayjs/hooks',
    directoryResolveFilter: createResolveFilter(config),
  })
    .onReady(() => {})
    .onStop(() => {})

  return {
    Configuration: configuration,
  }
}

function createResolveFilter(config: UserConfig) {
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
        const root = getProjectRoot()
        const router = new ServerRouter(root, {
          routes: config.routes,
          source: config.source,
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
  router: ServerRouter
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
  const httpMethod = fn.length === 0 ? 'GET' : 'POST'

  fn._param = {
    url: httpPath,
    method: httpMethod,
    meta: {
      functionName: id,
    },
  }

  createContainer({
    containerId,
    container,
    httpMethod,
    httpPath,
    fn,
  })
}

function createContainer(config: {
  containerId: string
  httpMethod: any
  httpPath: string
  container: IMidwayContainer
  fn: EnhancedFunc
}) {
  const { containerId, httpMethod, httpPath, container, fn } = config
  const Method = httpMethod === 'GET' ? Get : Post

  @Provide(containerId)
  @Controller('/')
  class FunctionContainer {
    @Inject()
    ctx: any

    @Method(httpPath, { middleware: fn.middleware || [] })
    async handler() {
      const bindCtx = {
        ctx: this.ctx,
      }

      let args = this.ctx.request?.body?.args || []
      if (typeof args === 'string') {
        args = JSON.parse(args)
      }

      return await als.run(bindCtx, () => fn(...args))
    }
  }

  container.bind(containerId, FunctionContainer)
}
