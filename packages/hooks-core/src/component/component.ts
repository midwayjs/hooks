import {
  createConfiguration,
  IMidwayApplication,
  IMidwayContainer,
  IMidwayContext,
} from '@midwayjs/core'
import { __decorate } from 'tslib'
import { als } from '../runtime'
import { ApiFunction, ApiModule } from '../types/common'
import { join } from 'path'
import { sync } from 'globby'
import { ComponentConfig } from './gateway/interface'
import _ from 'lodash'
import { HooksGatewayAdapter } from './gateway/adapter'
import parseArgs from 'fn-args'

export class HooksComponent {
  config: ComponentConfig

  app: IMidwayApplication<IMidwayContext>

  adapter: HooksGatewayAdapter

  constructor(config: ComponentConfig) {
    this.config = config
    this.adapter = new config.runtime.adapter(this.config)
  }

  init() {
    const {
      router,
      internal: { routes },
    } = this.config

    let count = 0
    const totalCount = routes.reduce((totalCount, route) => {
      const dir = join(router.source, route.baseDir)
      const files = sync([dir]).filter((file) => router.isApiFile(file))
      return totalCount + files.length
    }, 0)

    const configuration = createConfiguration({
      namespace: '@midwayjs/hooks',
      directoryResolveFilter: routes.map((route) => {
        return {
          pattern: join(router.source, route.baseDir),
          ignoreRequire: true,
          filter: (_: void, file: string, container: IMidwayContainer) => {
            if (!router.isApiFile(file)) {
              return
            }

            // Initalize container
            if (!this.adapter.container) {
              this.adapter.container = container
            }

            // Create api function
            const mod: ApiModule = require(file)
            this.createApi(mod, file)
            container.bindClass(mod, '', file)

            // Call afterCreate hooks
            count++
            if (count === totalCount) {
              this.adapter.afterCreate?.()
            }
          },
        }
      }),
    })

    configuration
      .onReady((_, app) => {
        this.adapter.app = app

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

  createApi(mod: ApiModule, file: string) {
    const modMiddleware = mod?.config?.middleware || []
    const funcs = _.pickBy<ApiFunction>(mod, _.isFunction)

    for (const [key, fn] of Object.entries(funcs)) {
      fn.middleware = (fn.middleware || (fn.middleware = []))
        .concat(modMiddleware)
        .map(this.useHooksMiddleware)

      this.adapter.createApi({ fn, file, isExportDefault: key === 'default' })
    }
  }

  getGlobalMiddleware() {
    const mws = [this.useAsyncLocalStorage]
    this.config.runtime.middleware?.forEach?.((mw) =>
      mws.push(this.useHooksMiddleware(mw))
    )
    this.adapter?.getGlobalMiddleware?.()?.forEach((mw) => {
      mws.push(this.useHooksMiddleware(mw))
    })
    return mws
  }

  useAsyncLocalStorage = async (ctx: any, next: any) => {
    await als.run({ ctx }, async () => {
      try {
        await next()
      } catch (error) {
        this.adapter.onError(ctx, error)
      }
    })
  }

  useHooksMiddleware(fn: (...args: any[]) => any) {
    return (...args: any[]) => {
      /**
       * Hooks middleware
       * const middleware = (next) => { const ctx = useContext() }
       */
      if (parseArgs(fn).length === 1) {
        const next = _.last(args)
        return fn(next)
      }
      return fn(...args)
    }
  }
}
