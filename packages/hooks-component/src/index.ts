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

import { als } from '@midwayjs/hooks/lib/api/async_hooks/als'
import { WebRoute, WebRouterConfig, WebRouter } from '@midwayjs/hooks-router'

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
      filter: (
        mod: Object,
        sourceFilePath: string,
        container: IMidwayContainer
      ) => {
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

      let args = this.ctx?.request?.body?.args || []
      if (typeof args === 'string') {
        args = JSON.parse(args)
      }

      return await als.run(bindCtx, () => fn(...args))
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
