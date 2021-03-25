import { ApiFunction, HooksMiddleware } from '@midwayjs/hooks-core'

type Controller = {
  middleware?: HooksMiddleware
}

export function withController<T extends ApiFunction>(
  controller: Controller,
  func: T
) {
  const withControllerProxy: ApiFunction = async function withControllerProxy(
    ...args: any[]
  ) {
    return func.apply(this, args)
  }

  withControllerProxy.middleware = controller.middleware

  return withControllerProxy as T
}
