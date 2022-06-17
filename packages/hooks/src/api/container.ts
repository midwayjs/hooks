import { __decorate } from 'tslib'
import { Inject, Provide } from '@midwayjs/decorator'
import { ApiFunction } from '@midwayjs/hooks-core'

export type CreateOptions = {
  fn: ApiFunction
  providerId: string
  parseArgs: (inputs: { ctx: any; args: any[] }) => any[]
  handlerDecorators?: any[]
  classDecorators?: any[]
}

export function createFunctionContainer(options: CreateOptions) {
  const {
    fn,
    providerId,
    parseArgs,
    handlerDecorators = [],
    classDecorators = [],
  } = options

  let FunctionContainer = class {
    ctx: any
    async handler(...handlerArgs: any[]) {
      const args = parseArgs({
        ctx: this.ctx,
        args: handlerArgs,
      })
      return await fn(...args)
    }
  }

  Object.defineProperty(FunctionContainer, 'name', {
    value: providerId,
  })

  __decorate([Inject()], FunctionContainer.prototype, 'ctx', void 0)
  __decorate(
    [...handlerDecorators],
    FunctionContainer.prototype,
    'handler',
    null
  )
  FunctionContainer = __decorate(
    [Provide(providerId), ...classDecorators],
    FunctionContainer
  )
  return FunctionContainer
}
