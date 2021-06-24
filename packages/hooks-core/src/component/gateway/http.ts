import { existsSync } from 'fs'
import staticCache from 'koa-static-cache'
import {
  HTTPRoute,
  ServerRoute,
} from 'packages/hooks-core/dist/midwayjs-hooks-core.cjs'
import { __decorate } from 'tslib'
import { join } from 'upath'

import {
  IMidwayApplication,
  IMidwayContainer,
  IMidwayContext,
} from '@midwayjs/core'
import { All, Controller, Inject, Provide } from '@midwayjs/decorator'

import { superjson } from '../../lib'
import { useContext } from '../../runtime'
import { ApiFunction } from '../../types/common'
import {
  ComponentConfig,
  CreateApiParam,
  HooksGatewayAdapter,
} from '../../types/gateway'
import { isDevelopment, useHooksMiddleware } from '../../util'

export class HTTPGateway implements HooksGatewayAdapter {
  config: ComponentConfig
  container: IMidwayContainer
  app: IMidwayApplication<IMidwayContext>

  constructor(config: ComponentConfig) {
    this.config = config
  }

  is(route: ServerRoute<HTTPRoute>) {
    return !!route?.basePath
  }

  createApi(param: CreateApiParam) {
    const { id, fn, httpPath } = param

    // 设置中间件
    fn.middleware.unshift(...this.getMiddleware())

    // Source: https://www.typescriptlang.org/play?noImplicitAny=false&strictNullChecks=false&strictFunctionTypes=false&strictPropertyInitialization=false&strictBindCallApply=false&noImplicitThis=false&noImplicitReturns=false&alwaysStrict=false&importHelpers=true&emitDecoratorMetadata=false&ts=4.1.5#code/JYWwDg9gTgLgBAbzgSQHYCsCmBjGAaOAYQlRiggBsLMoCBBKggBXIDdgATTOAXzgDNyIOAHIAAiE4B3AIYBPdAGcA9F2zQZMaCIBQO9akXx+qOAF44ACgB0tmVADmigFxwZqOQG0AugEpzAHyIPHpiLBDsXJa+OmLEpORUNJYiyiIx2BQyiopwAGIArqi4wCTxMDLAqDSIOnD1cGJoWLjRdQ24AB6u7nJ6DY0MFCkiBEiSHBzUslCYrj68MQPZcsVwABbuUzXRtQP11PD2TuZwMOvAitZd1rMAjgWYRtYARhAcctbHuQA+P3A+dr7OCzGAFKCmGSyYDGVA2OyORRLBohEJAA
    let FunctionContainer = class FunctionContainer {
      ctx: any
      async handler() {
        let args = this.ctx.request?.body?.args || []
        return await fn(...args)
      }
    }
    __decorate([Inject()], FunctionContainer.prototype, 'ctx', void 0)
    __decorate(
      [All(httpPath, { middleware: fn.middleware })],
      FunctionContainer.prototype,
      'handler',
      null
    )
    FunctionContainer = __decorate(
      [Provide(id), Controller('/')],
      FunctionContainer
    )

    this.container.bind(id, FunctionContainer)
  }

  getMiddleware() {
    const mws = [this.handleError]

    const enableSuperjson = this.config.internal.superjson
    if (enableSuperjson) {
      mws.push(this.deserializeSuperjson)
    }

    return mws.map(useHooksMiddleware)
  }

  async deserializeSuperjson(next: any) {
    await next()
    const ctx = useContext()
    if (ctx.type.includes('application/json')) {
      ctx.body = superjson.serialize(ctx.body)
    }
  }

  handleError = async (next: any) => {
    try {
      await next()
    } catch (error) {
      const ctx = useContext()

      if (this.config.internal.superjson) {
        ctx.status = 500
        ctx.body = superjson.serialize(error)
      } else {
        throw error
      }
    }
  }

  afterCreate() {
    if (isDevelopment()) {
      return
    }

    if (!this.isViteProject) {
      return
    }

    const {
      router: { routes },
    } = this.config
    if (routes.has('/') || routes.has('/*')) {
      return
    }

    const baseDir = this.container.get('baseDir')
    const mw = staticCache({
      dir: join(baseDir, '..', this.config.internal.build.viteOutDir),
      dynamic: true,
      alias: {
        '/': 'index.html',
        /**
         * Add alias for windows, '/' -> '\\'
         * https://github.com/koajs/static-cache/blob/master/index.js#L45
         */
        '\\': 'index.html',
      },
      buffer: true,
      gzip: true,
    })

    const fn: ApiFunction = async () => {}
    fn.middleware = [mw]

    this.createApi({
      id: 'hooks-host',
      httpPath: '/*',
      fn,
    })
  }

  get isViteProject() {
    return ['vite.config.ts', 'vite.config.js'].some((config) =>
      existsSync(join(this.config.root, config))
    )
  }
}
