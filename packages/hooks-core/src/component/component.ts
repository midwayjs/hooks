import { sync } from 'globby'
import _ from 'lodash'
import path from 'path'
import upath from 'upath'

import { createConfiguration, IMidwayContainer } from '@midwayjs/core'

import { Route } from '..'
import { als } from '../runtime'
import { ApiFunction, ApiModule } from '../types/common'
import { ComponentOptions, HooksGatewayAdapter } from '../types/gateway'
import { useHooksMiddleware } from '../util'

export class HooksComponent {
  options: ComponentOptions

  adapters: HooksGatewayAdapter[]

  constructor(options: ComponentOptions) {
    this.options = options
    this.adapters = options.projectConfig.gateway.map(
      (Adapter) => new Adapter(this.options)
    )
  }

  init() {
    const {
      router,
      projectConfig: { routes },
    } = this.options

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
            this.createApi(mod, adapter, file, route)
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

  getAdapterByRoute(route: Route) {
    const Adapter = this.options.router.getGatewayByRoute(route)
    return this.adapters.find((inst) => inst instanceof Adapter)
  }

  createApi(
    mod: ApiModule,
    adapter: HooksGatewayAdapter,
    file: string,
    route: Route
  ) {
    const modMiddleware = mod?.config?.middleware || []
    const funcs = _.pickBy<ApiFunction>(mod, _.isFunction)

    for (const [name, fn] of Object.entries(funcs)) {
      fn.middleware = (fn.middleware || (fn.middleware = []))
        .concat(modMiddleware)
        .map(useHooksMiddleware)

      const isExportDefault = name === 'default'
      const functionName = isExportDefault ? '$default' : name
      const functionId = this.options.router.getFunctionId(
        file,
        functionName,
        isExportDefault
      )

      fn._param = { functionId }
      adapter.createApi({
        fn,
        functionName,
        isExportDefault,
        functionId,
        file,
        route,
      })
    }
  }

  getGlobalMiddleware() {
    const mws = [this.useAsyncLocalStorage]
    this.options.runtimeConfig.middleware?.forEach?.((mw) =>
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
