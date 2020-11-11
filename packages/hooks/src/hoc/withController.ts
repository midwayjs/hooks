import { EnhancedFunc } from './type'

type Controller = {
  middleware?: any[]
}

export function withController<T extends EnhancedFunc>(controller: Controller, func: T) {
  const withControllerProxy: EnhancedFunc = async function withControllerProxy(...args: any[]) {
    return func.apply(this, args)
  }

  withControllerProxy.middleware = controller.middleware

  return withControllerProxy as T
}
