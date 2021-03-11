import {
  createConfiguration,
  IMidwayContainer,
  MidwayFrameworkType,
} from '@midwayjs/core'
import { __decorate } from 'tslib'
import { Inject, Controller, Get, Post, Provide } from '@midwayjs/decorator'
import { als } from '../runtime'
import { ApiFunction, ApiModule } from '../types/common'
import { ServerRouter } from '../router'
import { getConfig, getProjectRoot } from '../config'
import { InternalConfig } from '../types/config'
import { isProduction } from '../util'
import { kebabCase, noop } from 'lodash'
import { join } from 'path'
import staticCache from 'koa-static-cache'
import { extname, relative } from 'upath'

/**
 * Create hooks component
 */
export const hooks = () => {
  return new HooksComponent().createConfiguration()
}

class HooksComponent {
  private readonly root: string
  private readonly config: InternalConfig
  private readonly router: ServerRouter
  private container: IMidwayContainer

  constructor() {
    this.root = getProjectRoot()
    this.config = getConfig()
    this.router = new ServerRouter(this.root, this.config)
  }

  createConfiguration() {
    const configuration = createConfiguration({
      namespace: '@midwayjs/hooks',
      directoryResolveFilter: this.config.routes.map((route, index) => {
        return {
          pattern: route.baseDir,
          ignoreRequire: true,
          filter: (
            mod: void,
            sourceFilePath: string,
            container: IMidwayContainer
          ) => {
            if (!this.container) this.container = container
            if (!this.router.isApiFile(sourceFilePath)) return

            this.createApiFromSourceFile(sourceFilePath)

            if (index === this.config.routes.length - 1) {
              this.createRenderFunction()
            }
          },
        }
      }),
    })

    configuration
      .onReady((container, app) => {
        this.applyMiddleware(app)
      })
      .onStop(noop)

    return {
      Configuration: configuration,
    }
  }

  createApiFromSourceFile(sourceFilePath: string) {
    const mod: ApiModule = require(sourceFilePath)
    const modMiddleware = mod?.config?.middleware ? mod.config.middleware : []

    if (typeof mod === 'function') {
      this.createFunction({
        fn: mod,
        sourceFilePath,
        isExportDefault: true,
        modMiddleware,
      })
    }

    Object.keys(mod)
      .filter((key) => typeof mod[key] === 'function')
      .forEach((key) => {
        this.createFunction({
          fn: mod[key],
          sourceFilePath,
          isExportDefault: key === 'default',
          modMiddleware,
        })
      })
  }

  private createFunction(config: {
    fn: ApiFunction
    sourceFilePath: string
    isExportDefault: boolean
    modMiddleware: any[]
  }) {
    const { fn, sourceFilePath, isExportDefault, modMiddleware } = config

    const fnName = isExportDefault ? '$default' : fn.name
    const id = this.getFunctionId({
      sourceFilePath,
      functionName: fnName,
      isExportDefault,
    })

    const containerId = 'hooks::' + id
    const httpPath = this.router.getHTTPPath(
      sourceFilePath,
      fnName,
      isExportDefault
    )
    const httpMethod = fn.length === 0 ? 'GET' : 'POST'

    // Set param for unit testing
    fn._param = {
      url: httpPath,
      method: httpMethod,
      meta: { functionName: id },
    }

    // Apply module middleware
    ;(fn.middleware || (fn.middleware = [])).unshift(...modMiddleware)

    this.registerFunctionToContainer({
      containerId,
      httpMethod,
      httpPath,
      fn,
    })
  }

  private registerFunctionToContainer(config: {
    containerId: string
    httpMethod: any
    httpPath: string
    fn: ApiFunction
  }) {
    const { containerId, httpMethod, httpPath, fn } = config
    const Method = httpMethod === 'GET' ? Get : Post

    // Source: https://shorturl.at/pqI06
    let FunctionContainer = class FunctionContainer {
      ctx: any
      async handler() {
        const bindCtx = { ctx: this.ctx }
        let args = this.ctx.request?.body?.args || []
        if (typeof args === 'string') {
          args = JSON.parse(args)
        }
        return await als.run(bindCtx, async () => fn(...args))
      }
    }
    __decorate([Inject()], FunctionContainer.prototype, 'ctx', void 0)
    __decorate(
      [Method(httpPath, { middleware: fn.middleware || [] })],
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

  private hasRender = false
  private createRenderFunction() {
    if (!isProduction() || this.hasRender) {
      return
    }

    const fn = async () => {}
    this.registerFunctionToContainer({
      containerId: 'hooks:page-render',
      httpMethod: 'GET',
      httpPath: '/*',
      fn,
    })

    this.hasRender = true
  }

  private applyMiddleware(app: any) {
    // Apply global middleware from config
    this.config.middleware.forEach((middleware) => app.use(middleware))

    // Serve vite static html
    const type = app.getFrameworkType()
    const requireStaticCache =
      type === MidwayFrameworkType.WEB_KOA || type === MidwayFrameworkType.FAAS

    if (isProduction() && requireStaticCache) {
      const baseDir = app.getBaseDir()
      app.use(
        staticCache({
          dir: join(baseDir, '..', this.config.build.viteOutDir),
          dynamic: true,
          alias: {
            '/': 'index.html',
          },
          buffer: true,
        })
      )
    }
  }

  private getFunctionId(config: {
    sourceFilePath: string
    functionName: string
    isExportDefault: boolean
  }) {
    const { sourceFilePath, functionName, isExportDefault } = config

    const rule = this.router.getRouteConfigBySourceFilePath(sourceFilePath)
    const lambdaDirectory = this.router.getApiDirectory(rule.baseDir)

    const length = this.router.config.routes.length
    // 多个 source 的情况下，根据各自的 lambdaDirectory 来增加前缀命名
    const relativeDirectory = length > 1 ? this.router.source : lambdaDirectory
    const relativePath = relative(relativeDirectory, sourceFilePath)
    // a/b/c -> a-b-c
    const id = kebabCase(removeExtension(relativePath))
    const name = [id, isExportDefault ? '' : `-${functionName}`].join('')
    return name.toLowerCase()
  }
}

export function removeExtension(file: string) {
  return file.replace(extname(file), '')
}
