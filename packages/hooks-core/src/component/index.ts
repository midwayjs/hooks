import {
  createConfiguration,
  IMidwayApplication,
  IMidwayContainer,
  MidwayFrameworkType,
} from '@midwayjs/core'
import { Inject, Controller, Get, Post, Provide } from '@midwayjs/decorator'
import { als } from '../runtime'
import { EnhancedFunc } from '../types/common'
import { ServerRouter, getFunctionId } from '../router'
import { getConfig, getProjectRoot } from '../config'
import { InternalConfig } from '../types/config'
import { isProduction } from '@midwayjs/hooks-core'
import { noop } from 'lodash'
import { join } from 'path'
import staticCache from 'koa-static-cache'

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
            if (!this.container) {
              this.container = container
            }
            if (!this.router.isLambdaFile(sourceFilePath)) return
            this.createLambdaFromSourceFile(sourceFilePath)

            if (index === this.config.routes.length - 1) {
              this.createRenderFunction()
            }
          },
        }
      }),
    })

    configuration
      .onReady((container, app) => this.applyMiddleware(container, app))
      .onStop(noop)

    return {
      Configuration: configuration,
    }
  }

  createLambdaFromSourceFile(sourceFilePath: string) {
    const mod = require(sourceFilePath)

    if (typeof mod === 'function') {
      this.createFunction({
        fn: mod,
        sourceFilePath,
        isExportDefault: true,
      })
    }

    Object.keys(mod)
      .filter((key) => typeof mod[key] === 'function')
      .forEach((key) => {
        this.createFunction({
          fn: mod[key],
          sourceFilePath,
          isExportDefault: key === 'default',
        })
      })
  }

  private createFunction(config: {
    fn: EnhancedFunc
    sourceFilePath: string
    isExportDefault: boolean
  }) {
    const { fn, sourceFilePath, isExportDefault } = config

    const fnName = isExportDefault ? '$default' : fn.name
    const id = getFunctionId({
      router: this.router,
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

    fn._param = {
      url: httpPath,
      method: httpMethod,
      meta: {
        functionName: id,
      },
    }

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
    fn: EnhancedFunc
  }) {
    const { containerId, httpMethod, httpPath, fn } = config
    const Method = httpMethod === 'GET' ? Get : Post

    @Provide(containerId)
    @Controller('/')
    class FunctionContainer {
      @Inject()
      ctx: any

      @Method(httpPath, { middleware: fn.middleware || [] })
      async handler() {
        const bindCtx = {
          ctx: this.ctx,
        }

        let args = this.ctx.request?.body?.args || []
        if (typeof args === 'string') {
          args = JSON.parse(args)
        }

        return await als.run(bindCtx, async () => fn(...args))
      }
    }

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

  private applyMiddleware(
    container: IMidwayContainer,
    app: IMidwayApplication
  ) {
    const type = app.getFrameworkType()

    // Serve vite static html
    if (
      (type === MidwayFrameworkType.WEB_KOA ||
        type === MidwayFrameworkType.FAAS) &&
      isProduction()
    ) {
      const baseDir = app.getBaseDir()
      ;(app as any).use(
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
}
