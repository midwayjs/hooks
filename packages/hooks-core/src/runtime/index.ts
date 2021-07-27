import { als as AsyncLocalStoragePolyfill } from 'asynchronous-local-storage'
import { __decorate } from 'tslib'

import { Inject, Provide } from '@midwayjs/decorator'

import { ApiFunction } from '..'

export type HooksContext = {
  ctx: any
  event?: any
}

/**
 * @private
 * private api, may change without notice.
 * Use asynchronous-local-storage due to serverless environment does not support node.js 12.17.0
 */
export const als = {
  getStore(key: string) {
    return AsyncLocalStoragePolyfill.get<any>(key)
  },
  run(ctx: HooksContext, callback: any) {
    return new Promise((resolve) => {
      AsyncLocalStoragePolyfill.runWith(async () => {
        resolve(await callback())
      }, ctx)
    })
  },
}

export function useContext<T = any>(): T {
  return als.getStore('ctx')
}

type CreateFunctionContainerOptions = {
  fn: ApiFunction
  functionId: string
  parseArgs: (ctx: any, ...args: any) => any[]
  handlerDecorators?: any[]
  classDecorators?: any[]
  isHTTP?: boolean
}

export function createFunctionContainer(
  options: CreateFunctionContainerOptions
) {
  const {
    fn,
    functionId,
    parseArgs,
    handlerDecorators = [],
    classDecorators = [],
    isHTTP,
  } = options

  let FunctionContainer = class FunctionContainer {
    ctx: any
    async handler(...handlerArgs: any[]) {
      const args = parseArgs(this.ctx, ...handlerArgs)
      return isHTTP
        ? await fn(...args)
        : await als.run({ ctx: this.ctx }, async () => await fn(...args))
    }
  }

  __decorate([Inject()], FunctionContainer.prototype, 'ctx', void 0)
  __decorate(
    [...handlerDecorators],
    FunctionContainer.prototype,
    'handler',
    null
  )
  FunctionContainer = __decorate(
    [Provide(functionId), ...classDecorators],
    FunctionContainer
  )
  return FunctionContainer
}
