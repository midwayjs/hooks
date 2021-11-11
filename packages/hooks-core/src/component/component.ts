import isFunction from 'lodash/isFunction'
import noop from 'lodash/noop'
import pickBy from 'lodash/pickBy'
import upath from 'upath'

import { createConfiguration, IMidwayApplication } from '@midwayjs/core'

import { lazyRequire, Route } from '..'
import { EXPORT_DEFAULT_FUNCTION_ALIAS } from '../const'
import { GatewayManager } from '../gateway/manager'
import { ApiFunction, ApiModule } from '../types/common'
import { ComponentOptions, HooksGatewayAdapter } from '../types/gateway'
import { useHooksMiddleware } from '../util'

export type LoadApiModuleOption = {
  mod: ApiModule
  file: string
}

export class HooksComponent {
  options: ComponentOptions
  gatewayManager: GatewayManager

  constructor(options: ComponentOptions) {
    this.options = options
    this.gatewayManager = GatewayManager.getInstance(
      this.options.root,
      this.options.projectConfig
    )
  }

  load() {
    this.loadByScanner()

    const configuration = createConfiguration({
      namespace: '@midwayjs/hooks',
    })

    configuration
      .onReady(async (container, app: IMidwayApplication) => {
        for (const gateway of this.gatewayManager.gateways) {
          await gateway.onReady?.({
            app,
            runtimeConfig: this.options.runtimeConfig,
          })
        }
      })
      .onStop(noop)

    return {
      Configuration: configuration,
    }
  }

  loadByScanner() {
    const { sync } = lazyRequire<typeof import('globby')>('globby')

    const {
      router,
      projectConfig: { routes },
    } = this.options

    for (const route of routes) {
      // Windows
      const dir = upath.join(router.source, route.baseDir)
      const files = sync([dir]).filter((file) => router.isApiFile(file))

      for (const file of files) {
        const mod: ApiModule = require(file)
        this.loadApiModule({ mod, file })
      }
    }
  }

  loadApiModule({ mod, file }: LoadApiModuleOption) {
    const route = this.options.router.getRoute(file)
    const gateway = this.gatewayManager.getGatewayByRoute(route)
    this.createApi(mod, gateway, file, route)
  }

  createApi(
    mod: ApiModule,
    gateway: HooksGatewayAdapter,
    file: string,
    route: Route
  ) {
    const modMiddleware = mod?.config?.middleware || []
    const funcs = pickBy<ApiFunction>(mod, isFunction)

    for (const [name, fn] of Object.entries(funcs)) {
      fn.middleware = (fn.middleware || (fn.middleware = []))
        .concat(modMiddleware)
        .map(useHooksMiddleware)

      const isExportDefault = name === 'default'
      const functionName = isExportDefault
        ? EXPORT_DEFAULT_FUNCTION_ALIAS
        : name
      const functionId = this.options.router.getFunctionId(
        file,
        functionName,
        isExportDefault
      )

      fn._param = { functionId }

      gateway.createApi({
        fn,
        functionName,
        isExportDefault,
        functionId,
        file,
        route,
      })
    }
  }
}
