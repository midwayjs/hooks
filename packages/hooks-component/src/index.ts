import { createConfiguration, IMidwayContainer } from '@midwayjs/core'

import {
  saveModule,
  CONTROLLER_KEY,
  saveProviderId,
  attachClassMetadata,
  savePropertyInject,
  WEB_ROUTER_KEY,
  RouterOption,
  ControllerOption,
} from '@midwayjs/decorator'

import { WebRoute, WebRouterConfig } from '@midwayjs/hooks-router'

interface HooksConfig extends Omit<WebRouterConfig, 'source'> {}

export const createHooks = (config: HooksConfig) => {
  const configuration = createConfiguration({
    namespace: 'hooks',
    directoryResolveFilter: createResolveFilter(config.routes),
  })
    .onReady(async () => {
      console.log('onReady in hooks')
    })
    .onStop(async () => {
      console.log('onStop in hooks')
    })

  return {
    Configuration: configuration,
  }
}

function createResolveFilter(routes: WebRoute[]) {
  return routes.map((route) => {
    return {
      pattern: route.baseDir,
      filter: (mod: Object, filePath: string, container: IMidwayContainer) => {
        for (const fnName of Object.keys(mod)) {
          const value = mod[fnName]
          if (typeof value === 'function') {
            createFunctionContainer(
              container,
              fnName,
              value,
              `/${fnName}`,
              value.length === 0 ? 'GET' : 'POST'
            )
          }
        }
      },
    }
  })
}

function createFunctionContainer(
  container: IMidwayContainer,
  fnName: string,
  fn: any,
  path: string,
  method: string
) {
  class FunctionContainer {
    ctx: any
    async handler() {
      const bindCtx = {
        ctx: this.ctx,
      }

      return fn(bindCtx)
    }
  }

  const id = 'bind_func::' + fnName
  savePropertyInject({
    target: FunctionContainer.prototype,
    targetKey: 'ctx',
    identifier: null,
  })
  // @Provide
  saveProviderId(id, FunctionContainer, true)
  container.bind(id, FunctionContainer)

  // @Controller
  saveModule(CONTROLLER_KEY, FunctionContainer)
  attachClassMetadata(
    CONTROLLER_KEY,
    {
      prefix: '/',
    } as ControllerOption,
    FunctionContainer
  )

  // @Get / @Post
  attachClassMetadata(
    WEB_ROUTER_KEY,
    {
      path,
      requestMethod: method,
      method: 'handler',
      middleware: fn.middleware || [],
    } as RouterOption,
    FunctionContainer.prototype
  )
}
