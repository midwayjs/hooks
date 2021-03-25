import {
  createConfiguration,
  IMidwayContainer,
  MidwayFrameworkType as Framework,
} from '@midwayjs/core'
import { __decorate } from 'tslib'
import { Inject, Controller, Get, Post, Provide } from '@midwayjs/decorator'
import { als } from '../runtime'
import { ApiFunction, ApiModule } from '../types/common'
import { ServerRouter } from '../router'
import { getConfig, getProjectRoot } from '../config'
import { ComponentConfig, InternalConfig } from '../types/config'
import { consola, isProduction } from '../util'
import { kebabCase, noop } from 'lodash'
import { join } from 'path'
import staticCache from 'koa-static-cache'
import { extname, relative, removeExt } from 'upath'
import { ApiHttpMethod } from '../types/http'
import { existsSync } from 'fs'
import { superjson } from '../lib'

/**
 * Create hooks component
 */
export const hooks = (config: ComponentConfig = {}) => {
  return new HooksComponent(config).createConfiguration()
}

class HooksComponent {
  private readonly root: string
  private readonly globalConfig: InternalConfig
  private readonly componentConfig: ComponentConfig
  private readonly router: ServerRouter
  private container: IMidwayContainer

  constructor(componentConfig: ComponentConfig) {
    this.componentConfig = componentConfig
    this.root = getProjectRoot()
    this.globalConfig = getConfig()
    this.router = new ServerRouter(
      this.root,
      this.globalConfig,
      !isProduction()
    )
  }

  createConfiguration() {
    let count = 0

    const { routes } = this.globalConfig

    const configuration = createConfiguration({
      namespace: '@midwayjs/hooks',
      directoryResolveFilter: routes.map((route) => {
        return {
          pattern: route.baseDir,
          ignoreRequire: true,
          filter: (_: void, file: string, container: IMidwayContainer) => {
            this.container = container
            if (!this.router.isApiFile(file)) {
              return
            }

            this.createApi(file)

            count++
            if (count === routes.length) {
              this.createPageRender()
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

  private createApiFunction(config: {
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
      .map(useHooksMiddleware)

    this.registerApiFunction({
      containerId,
      httpMethod,
      httpPath,
      fn,
    })
  }

  private registerApiFunction(config: {
    containerId: string
    httpMethod: ApiHttpMethod
    httpPath: string
    fn: ApiFunction
  }) {
    const { containerId, httpMethod, httpPath, fn } = config
    const Method = httpMethod === 'GET' ? Get : Post

    // Source: https://shorturl.at/pqI06
    let FunctionContainer = class FunctionContainer {
      ctx: any
      async handler() {
        let args = this.ctx.request?.body?.args || []
        if (typeof args === 'string') {
          args = JSON.parse(args)
        }
        return superjson.serialize(await fn(...args))
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

  private createPageRender() {
    if (!(this.isFullStackProject() && isProduction())) {
      return
    }

    if (this.existRootPath) {
      consola.info(
        'The route `/` or `/*` is registered, you need to host the front-end page manually'
      )
      return
    }

    this.registerApiFunction({
      containerId: 'hooks:render',
      httpMethod: 'GET',
      httpPath: '/*',
      fn: async () => {},
    })
  }

  get existRootPath() {
    return this.router.routes.has('/') || this.router.routes.has('/*')
  }

  private useGlobalMiddleware(app: any) {
    app.use(this.useAsyncLocalStorage)

    // Apply global middleware from config
    if (Array.isArray(this.componentConfig.middleware)) {
      this.componentConfig.middleware.forEach((middleware) =>
        app.use(useHooksMiddleware(middleware))
      )
    }

    // Serve vite static html
    const type = app.getFrameworkType()
    const requireStaticCache =
      type === Framework.WEB_KOA || type === Framework.FAAS

    if (
      isProduction() &&
      requireStaticCache &&
      this.isFullStackProject() &&
      !this.existRootPath
    ) {
      const baseDir = app.getBaseDir()
      app.use(
        staticCache({
          dir: join(baseDir, '..', this.globalConfig.build.viteOutDir),
          dynamic: true,
          alias: {
            '/': 'index.html',
          },
          buffer: true,
          gzip: true,
        })
      )
    }
  }

  private async useAsyncLocalStorage(ctx: any, next: any) {
    await als.run({ ctx }, async () => {
      try {
        await next()
      } catch (error) {
        ctx.status = 500
        ctx.body = superjson.serialize(error)
      }
    })
  }

  private getFunctionId(
    file: string,
    functionName: string,
    isExportDefault: boolean
  ) {
    const relativePath = relative(this.router.source, file)
    // src/apis/lambda/index.ts -> apis-lambda-index
    const id = kebabCase(removeExt(relativePath, extname(relativePath)))
    const name = [id, isExportDefault ? '' : `-${functionName}`].join('')
    return name.toLowerCase()
  }

  // TODO Refactor to use config
  private isFullStackProject() {
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

function useHooksMiddleware(fn: Function) {
  return (...args: any[]) => {
    /**
     * Hooks middleware
     * const middleware = (next) => { const ctx = useContext() }
     */
    if (fn.length === 1) {
      return fn(args.pop())
    }
    return fn(...args)
  }
}
