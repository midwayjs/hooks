import parseArgs from 'fn-args'
import { sync } from 'globby'
import _ from 'lodash'
import path from 'path'
import upath from 'upath'

import { createConfiguration, IMidwayContainer } from '@midwayjs/core'

import { ServerRoute } from '..'
import { als } from '../runtime'
import { ApiFunction, ApiModule } from '../types/common'
import { ComponentConfig, HooksGatewayAdapter } from '../types/gateway'
import { ApiHttpMethod } from '../types/http'
import { useHooksMiddleware } from '../util'
import { HTTPGateway } from './gateway/http'

export class HooksComponent {
  config: ComponentConfig

  adapters: HooksGatewayAdapter[]

  constructor(config: ComponentConfig) {
    this.config = config
    this.adapters = config.runtime.gatewayAdapters.map(
      (adapter) => new adapter(this.config)
    )
  }

  init() {
    const {
      router,
      internal: { routes },
    } = this.config

    let count = 0
    const totalCount = routes.reduce((totalCount, route) => {
      // Windows
      const dir = upath.join(router.source, route.baseDir)
      const files = sync([dir]).filter((file) => router.isApiFile(file))
      return totalCount + files.length
    }, 0)

    const configuration = createConfiguration({
      namespace: '@midwayjs/hooks',
      directoryResolveFilter: routes.map((route) => {
        return {
          // Windows
          pattern: path.join(router.source, route.baseDir),
          ignoreRequire: true,
          filter: (_: void, file: string, container: IMidwayContainer) => {
            if (!router.isApiFile(file)) {
              return
            }

            // Initialize container
            this.adapters.forEach((adapter) => (adapter.container = container))

            // Create api function
            const adapter = this.getAdapterByRoute(route)
            const mod: ApiModule = require(file)
            this.createApi(mod, file, adapter)
            container.bindClass(mod, '', file)

            // Call afterCreate hooks
            count++
            if (count === totalCount) {
              this.adapters.forEach((adapter) => adapter.afterCreate?.())
            }
          },
        }
      }),
    })

    configuration
      .onReady((_, app) => {
        this.adapters.forEach((adapter) => (adapter.app = app))

        // Setup global middleware
        for (const mw of this.getGlobalMiddleware()) {
          ;(app as any).use(mw)
        }
      })
      .onStop(_.noop)

    return {
      Configuration: configuration,
    }
  }

  getAdapterByRoute(route: ServerRoute<any>) {
    const adapter = this.adapters.find((adapter) => adapter.is(route))

    if (!adapter) {
      throw new Error(
        `Can't find the correct gateway adapter, please check if midway.config.ts is correct`
      )
    }

    return adapter
  }

  createApi(mod: ApiModule, file: string, adapter: HooksGatewayAdapter) {
    const modMiddleware = mod?.config?.middleware || []
    const funcs = _.pickBy<ApiFunction>(mod, _.isFunction)

    for (const [name, fn] of Object.entries(funcs)) {
      fn.middleware = (fn.middleware || (fn.middleware = []))
        .concat(modMiddleware)
        .map(useHooksMiddleware)

      const isExportDefault = name === 'default'
      const functionName = isExportDefault ? '$default' : name
      const id = this.config.router.getFunctionId(
        file,
        functionName,
        isExportDefault
      )

      let httpPath = ''

      if (adapter instanceof HTTPGateway) {
        httpPath = this.config.router.getHTTPPath(
          file,
          functionName,
          isExportDefault
        )
      }

      const httpMethod: ApiHttpMethod =
        parseArgs(fn).length === 0 ? 'GET' : 'POST'

      // Set param for unit testing
      fn._param = {
        url: httpPath,
        method: httpMethod,
        meta: { functionName: id },
      }

      adapter.createApi({ fn, id, httpPath })
    }
  }

  getGlobalMiddleware() {
    const mws = [this.useAsyncLocalStorage]
    this.config.runtime.middleware?.forEach?.((mw) =>
      mws.push(useHooksMiddleware(mw))
    )
    return mws
  }

  useAsyncLocalStorage = async (ctx: any, next: any) => {
    await als.run({ ctx }, async () => {
      await next()
    })
  }
}
