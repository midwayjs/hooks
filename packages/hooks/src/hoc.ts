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

export function withMiddleware<T extends ApiFunction>(
  middleware: HooksMiddleware,
  func: T
) {
  const proxy: ApiFunction = async (...args: any[]) => func.apply(this, args)
  proxy.middleware = middleware
  return proxy as T
}
