import { ApiFunction } from '../../types/common'
import { ApiHttpMethod } from '../../types/http'
import {
  Inject,
  Controller,
  // Get,
  // Post,
  Provide,
  All,
} from '@midwayjs/decorator'
import { __decorate } from 'tslib'
import { superjson } from '../../lib'
import { ServerRoute } from '../../types/config'
import { CreateApiParam, HooksGatewayAdapter } from './adapter'
import {
  IMidwayContainer,
  IMidwayApplication,
  IMidwayContext,
} from '@midwayjs/core'
import { ComponentConfig } from './interface'
import { join } from 'upath'
import { existsSync } from 'fs'
import staticCache from 'koa-static-cache'
import { isDevelopment } from '../../util'
import parseArgs from 'fn-args'
import { useContext } from '../../runtime'

export class HTTPGateway implements HooksGatewayAdapter {
  config: ComponentConfig
  container: IMidwayContainer
  app: IMidwayApplication<IMidwayContext>

  constructor(config: ComponentConfig) {
    this.config = config
  }

  createApi(param: CreateApiParam) {
    const { fn, fnName, file } = param

    const isExportDefault = fnName === 'default'
    const functionName = isExportDefault ? '$default' : fnName
    const id = this.config.router.getFunctionId(
      file,
      functionName,
      isExportDefault
    )

    const containerId = 'hooks::' + id
    const httpPath = this.config.router.getHTTPPath(
      file,
      functionName,
      isExportDefault
    )
    const httpMethod: ApiHttpMethod =
      parseArgs(fn).length === 0 ? 'GET' : 'POST'

    // Set param for unit testing
    fn._param = {
      url: httpPath,
      method: httpMethod,
      meta: { functionName: id },
    }

    const apiFn = this.createApiFunction({
      containerId,
      httpPath,
      fn,
    })

    this.container.bind(containerId, apiFn)
  }

  createApiFunction(config: {
    containerId: string
    httpPath: string
    fn: ApiFunction
  }) {
    const { containerId, httpPath, fn } = config
    // const Method = httpMethod === 'GET' ? Get : Post

    // Source: https://www.typescriptlang.org/play?noImplicitAny=false&strictNullChecks=false&strictFunctionTypes=false&strictPropertyInitialization=false&strictBindCallApply=false&noImplicitThis=false&noImplicitReturns=false&alwaysStrict=false&importHelpers=true&emitDecoratorMetadata=false&ts=4.1.5&ssl=22&ssc=1&pln=4&pc=1#code/JYWwDg9gTgLgBAbzgSQHYCsCmBjGAaOAYQlRiggBsLMoCBxTfOABQgGcnnyA3YAE0xwAvnABm5EHADkAARD8A7gEMAnujYB6AdmhKY0KQChDO1BzgBZRgAsIfOAF5pdAKIAVKY4dOprj3AB+OAZ4AC4WdhgTEnNRVEc4AAoAOlSlKABzNnClVBUAbQBdAEpHAD5EIWMZLgheAUTiwxliUnIqGkSpDSkm7AolNjY4ADEAV1RcYBJWmCVgVBpEQzhVuBk0LFxGlbXcAA8cvOM19asYWz4uqQIkeT4+amUoTHCi4SbTwZVJuGtcx5LRrLU6rajwdJZBIXYBsZIHZIvACOY0wHGSACM7CpkpDhgAffFwIq7UFwYCiJIwFRgTAQSl4rw+DhQBYZXogsmgxlOABSAGUAPIAOWSYHSbEwiTxny5VS5cFM5hebEgZkETiUymA8DiKTSmTYsrJLxgYyg8RVaslpOEhiqQA
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
      [Provide(containerId), Controller('/')],
      FunctionContainer
    )

    return FunctionContainer
  }

  onError(ctx: any, error: any) {
    if (this.config.internal.superjson) {
      ctx.status = 500
      ctx.body = superjson.serialize(error)
    } else {
      throw error
    }
  }

  getGlobalMiddleware() {
    const mws = []
    const enableSuperjson = this.config.internal.superjson

    const deserialize = async (next: any) => {
      await next()
      const ctx = useContext()
      if (ctx.type.includes('application/json')) {
        ctx.body = superjson.serialize(ctx.body)
      }
    }

    if (enableSuperjson) {
      mws.push(deserialize)
    }

    return mws
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

    const apiFn = this.createApiFunction({
      containerId: 'hooks:host',
      httpPath: '/*',
      fn,
    })

    this.container.bind('hooks:host', apiFn)
  }

  get isViteProject() {
    return ['vite.config.ts', 'vite.config.js'].some((config) =>
      existsSync(join(this.config.root, config))
    )
  }
}
