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
import fs from 'fs'
import { serialize } from 'superjson'

/**
 * Create hooks component
 */
export const hooks = (config: ComponentConfig = {}) => {
  return new HooksComponent(config).createConfiguration()
}

class HooksComponent {
  private readonly root: string
  private readonly config: InternalConfig
  private readonly componentConfig: ComponentConfig
  private readonly router: ServerRouter
  private container: IMidwayContainer

  constructor(componentConfig: ComponentConfig) {
    this.componentConfig = componentConfig
    this.root = getProjectRoot()
    this.config = getConfig()
    this.router = new ServerRouter(this.root, this.config, !isProduction())
  }

  createConfiguration() {
    let count = 0
    const configuration = createConfiguration({
      namespace: '@midwayjs/hooks',
      directoryResolveFilter: this.config.routes.map((route, index) => {
        return {
          pattern: route.baseDir,
          ignoreRequire: true,
          filter: (_: void, file: string, container: IMidwayContainer) => {
            if (!this.container) this.container = container
            if (!this.router.isApiFile(file)) return

            this.createApi(file)

            count++
            if (count === this.config.routes.length) {
              this.createRender()
            }
          },
        }
      }),
    })

    configuration
      .onReady((_, app) => {
        this.applyMiddleware(app)
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
        this.createFunction({
          fn: mod[key],
          file: file,
          isExportDefault: key === 'default',
          modMiddleware,
        })
      })
  }

  private createFunction(config: {
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

    // Apply module middleware
    ;(fn.middleware || (fn.middleware = [])).unshift(...modMiddleware)
    fn.middleware = fn.middleware.map((middleware) => covert(middleware))

    this.registerFunctionToContainer({
      containerId,
      httpMethod,
      httpPath,
      fn,
    })
  }

  private registerFunctionToContainer(config: {
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
        return serialize(await fn(...args))
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

  private createRender() {
    // Only available  in production and does not register /* routes
    if (!isProduction() || !this.isFullStackProject()) {
      return
    }

    if (this.existRootPath) {
      consola.info(
        'The route `/` or `/*` is registered, you need to host the front-end page manually'
      )
      return
    }

    this.registerFunctionToContainer({
      containerId: 'hooks:render',
      httpMethod: 'GET',
      httpPath: '/*',
      fn: async () => {},
    })
  }

  get existRootPath() {
    return this.router.routes.has('/') || this.router.routes.has('/*')
  }

  private applyMiddleware(app: any) {
    app.use(async (ctx: any, next: any) => {
      await als.run({ ctx }, async () => await next())
    })

    // Apply global middleware from config
    if (Array.isArray(this.componentConfig.middleware)) {
      this.componentConfig.middleware.forEach((middleware) =>
        app.use(covert(middleware))
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
          dir: join(baseDir, '..', this.config.build.viteOutDir),
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

  private getFunctionId(
    file: string,
    functionName: string,
    isExportDefault: boolean
  ) {
    const rule = this.router.getRouteConfig(file)
    const lambdaDirectory = this.router.getApiDirectory(rule.baseDir)

    const length = this.router.config.routes.length
    // 多个 source 的情况下，根据各自的 lambdaDirectory 来增加前缀命名
    const relativeDirectory = length > 1 ? this.router.source : lambdaDirectory
    const relativePath = relative(relativeDirectory, file)
    // a/b/c -> a-b-c
    const id = kebabCase(removeExt(relativePath, extname(relativePath)))
    const name = [id, isExportDefault ? '' : `-${functionName}`].join('')
    return name.toLowerCase()
  }

  // TODO Refactor to use config
  private isFullStackProject() {
    const configs = ['vite.config.ts', 'vite.config.js']
    return configs.some((config) => fs.existsSync(join(this.root, config)))
  }
}

function covert(fn: Function) {
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
