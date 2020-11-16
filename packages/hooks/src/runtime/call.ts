import { FaaSContext } from '@midwayjs/faas'

interface HooksRequestContext {
  ctx: Partial<FaaSContext>
  event?: any
}

export function call(hook: string, requestContext: HooksRequestContext) {
  return (...args: any[]) => {
    return requestContext.ctx.hooks[hook](...args)
  }
}
