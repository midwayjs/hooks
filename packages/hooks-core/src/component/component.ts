import isFunction from 'lodash/isFunction'
import noop from 'lodash/noop'
import pickBy from 'lodash/pickBy'
import upath from 'upath'

import {
  createConfiguration,
  IMidwayApplication,
  IMidwayContainer,
} from '@midwayjs/core'
import type { ResolveFilter } from '@midwayjs/decorator'

import { lazyRequire, Route } from '..'
import { EXPORT_DEFAULT_FUNCTION_ALIAS } from '../const'
import { GatewayManager, getGatewayManager } from '../gateway/manager'
import { als } from '../runtime'
import { getSnapshot, SnapShot } from '../runtime/snapshot'
import { ApiFunction, ApiModule } from '../types/common'
import { ComponentOptions, HooksGatewayAdapter } from '../types/gateway'
import { useHooksMiddleware } from '../util'

export type LoadApiModuleOption = {
  mod: ApiModule
  file: string
  container?: IMidwayContainer
}

export class HooksComponent {
  options: ComponentOptions
  gatewayManager: GatewayManager

  constructor(options: ComponentOptions) {
    this.options = options
    this.gatewayManager = getGatewayManager(
      this.options.root,
      this.options.projectConfig
    )
  }

  load() {
    const snapshot = getSnapshot()
    if (snapshot) {
      this.loadBySnapshot(snapshot)
    } else {
      this.loadByScanner()
    }

    const configuration = createConfiguration({
      namespace: '@midwayjs/hooks',
    })

    configuration
      .onReady(async (container, app: IMidwayApplication) => {
        for (const gateway of this.gateways) {
          await gateway.onReady?.({
            container,
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

  get gateways() {
    return this.gatewayManager.gateways
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

    this.gateways.forEach((gateway) => gateway.afterCreate?.())
  }

  loadBySnapshot(snapshot: SnapShot) {
    const { router } = this.options
    const { container, modules } = snapshot

    // Initialize container
    this.gateways.forEach((gateway) => (gateway.container = container))

    // Create api function
    for (const { mod, file } of modules) {
      if (router.isApiFile(file)) {
        this.loadApiModule({ mod, file, container })
      }
    }

    this.gateways.forEach((adapter) => adapter.afterCreate?.())
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
