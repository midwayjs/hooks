import { __decorate } from 'tslib'

import { Inject, Provide } from '@midwayjs/decorator'

import { ApiFunction } from '..'
import { als } from './als'

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
