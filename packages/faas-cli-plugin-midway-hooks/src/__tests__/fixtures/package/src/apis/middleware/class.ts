import { Provide, ScopeEnum, Scope } from '@midwayjs/decorator'
import { FaaSContext } from '@midwayjs/faas'

@Provide('classMiddleware')
@Scope(ScopeEnum.Singleton)
export class ClassMiddleware {
  resolve() {
    return async (ctx: FaaSContext, next: () => Promise<void>) => {
      ctx.query.from = 'classMiddleware'
      await next()
    }
  }
}
