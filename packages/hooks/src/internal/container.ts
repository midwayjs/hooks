import { __decorate } from 'tslib'
import { Inject, Provide } from '@midwayjs/decorator'
import { als, ApiFunction } from '@midwayjs/hooks-core'

type CreateOptions = {
  fn: ApiFunction
  functionId: string
  parseArgs: (ctx: any, ...args: any) => any[]
  handlerDecorators?: any[]
  classDecorators?: any[]
  runWithAsyncLocalStorage?: boolean
}

export function createFunctionContainer(options: CreateOptions) {
  const {
    fn,
    functionId,
    parseArgs,
    handlerDecorators = [],
    classDecorators = [],
    runWithAsyncLocalStorage,
  } = options

  let FunctionContainer = class {
    ctx: any
    async handler(...handlerArgs: any[]) {
      const args = parseArgs(this.ctx, ...handlerArgs)
      return runWithAsyncLocalStorage
        ? await als.run({ ctx: this.ctx }, async () => await fn(...args))
        : await fn(...args)
    }
  }

  Object.defineProperty(FunctionContainer, 'name', {
    value: functionId,
  })

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
