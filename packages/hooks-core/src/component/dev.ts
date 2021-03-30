import { createConfiguration, IMidwayContainer } from '@midwayjs/core'
import { __decorate } from 'tslib'
import { Inject, Controller, Get, Post, Provide } from '@midwayjs/decorator'
import { als } from '../runtime'
import { ApiFunction, ApiModule } from '../types/common'
import { ServerRouter } from '../router'
import { RuntimeConfig, InternalConfig } from '../types/config'
import { kebabCase, noop } from 'lodash'
import { extname, relative, removeExt } from 'upath'
import { ApiHttpMethod } from '../types/http'
import { superjson } from '../lib'
import { join } from 'path'
import { existsSync } from 'fs'

export type ComponentConfig = {
  runtime: RuntimeConfig
  internal: InternalConfig
  router: ServerRouter
  root: string
}

export class HooksDevComponent {
  internal: InternalConfig
  runtime: RuntimeConfig
  router: ServerRouter
  root: string
  container: IMidwayContainer

  constructor(config: ComponentConfig) {
    this.runtime = config.runtime
    this.internal = config.internal
    this.router = config.router
    this.root = config.root
  }

  init() {
    let count = 0
    const { routes } = this.internal
    const configuration = createConfiguration({
      namespace: '@midwayjs/hooks',
      directoryResolveFilter: routes.map((route) => {
        return {
          pattern: route.baseDir,
          ignoreRequire: true,
          filter: (_: void, file: string, container: IMidwayContainer) => {
            if (!this.router.isApiFile(file)) {
              return
            }
            this.container = container
            this.createApi(file)

            count++
            if (count === routes.length) {
              this.afterCreate?.()
            }
          },
        }
      }),
    })

    configuration
      .onReady((_, app) => {
        this.useGlobalMiddleware(app)
      })
      .onStop(noop)

    return {
      Configuration: configuration,
    }
  }

  afterCreate() {}

  createApi(file: string) {
    const mod: ApiModule = require(file)
    const modMiddleware = mod?.config?.middleware || []

    Object.keys(mod)
      .filter((key) => typeof mod[key] === 'function')
      .forEach((key) => {
        this.createApiFunction({
          fn: mod[key],
          file: file,
          isExportDefault: key === 'default',
          modMiddleware,
        })
      })
  }

  createApiFunction(config: {
    fn: ApiFunction
    file: string
    isExportDefault: boolean
    modMiddleware: any[]
  }) {
    const { fn, file, isExportDefault, modMiddleware } = config

    const fnName = isExportDefault ? '$default' : fn.name
    const id = this.getFunctionId(file, fnName, isExportDefault)

    const containerId = 'hooks::' + id
    const httpPath = this.router.getHTTPPath(file, fnName, isExportDefault)
    const httpMethod: ApiHttpMethod = fn.length === 0 ? 'GET' : 'POST'

    // Set param for unit testing
    fn._param = {
      url: httpPath,
      method: httpMethod,
      meta: { functionName: id },
    }

    // Apply mod middleware
    fn.middleware = (fn.middleware || (fn.middleware = []))
      .concat(modMiddleware)
      .map(this.useHooksMiddleware)

    this.registerApiFunction({
      containerId,
      httpMethod,
      httpPath,
      fn,
    })
  }

  getFunctionId(file: string, functionName: string, isExportDefault: boolean) {
    const relativePath = relative(this.router.source, file)
    // src/apis/lambda/index.ts -> apis-lambda-index
    const id = kebabCase(removeExt(relativePath, extname(relativePath)))
    const name = [id, isExportDefault ? '' : `-${functionName}`].join('')
    return name.toLowerCase()
  }

  registerApiFunction(config: {
    containerId: string
    httpMethod: ApiHttpMethod
    httpPath: string
    fn: ApiFunction
  }) {
    const { containerId, httpMethod, httpPath, fn } = config
    const Method = httpMethod === 'GET' ? Get : Post
    const enableSuperjson = this.internal.superjson

    let FunctionContainer = class FunctionContainer {
      ctx: any
      async handler() {
        let args = this.ctx.request?.body?.args || []
        if (typeof args === 'string') {
          args = JSON.parse(args)
        }

        const response = await fn(...args)
        if (enableSuperjson) {
          return superjson.serialize(response)
        }
        return response
      }
    }
    __decorate([Inject()], FunctionContainer.prototype, 'ctx', void 0)
    __decorate(
      [Method(httpPath, { middleware: fn.middleware })],
      FunctionContainer.prototype,
      'handler',
      null
    )
    FunctionContainer = __decorate(
      [Provide(containerId), Controller('/')],
      FunctionContainer
    )
    this.container.bind(containerId, FunctionContainer)
  }

  useGlobalMiddleware(app: any) {
    app.use(this.useAsyncLocalStorage)

    // Apply global middleware from config
    if (Array.isArray(this.runtime.middleware)) {
      this.runtime.middleware.forEach((middleware) =>
        app.use(this.useHooksMiddleware(middleware))
      )
    }
  }

  useAsyncLocalStorage = async (ctx: any, next: any) => {
    const enableSuperjson = this.internal.superjson
    await als.run({ ctx }, async () => {
      try {
        await next()
      } catch (error) {
        if (enableSuperjson) {
          ctx.status = 500
          ctx.body = superjson.serialize(error)
        } else {
          throw error
        }
      }
    })
  }

  useHooksMiddleware(fn: Function) {
    return (...args: any[]) => {
      /**
       * Hooks middleware
       * const middleware = (next) => { const ctx = useContext() }
       */
      if (fn.length === 1) {
        const next = args[args.length - 1]
        return fn(next)
      }
      return fn(...args)
    }
  }

  isFullStackProject() {
    return [
      // Vite
      'vite.config.ts',
      'vite.config.js',
      // build-scritps
      'build.json',
      'build.js',
    ].some((config) => existsSync(join(this.root, config)))
  }
}
