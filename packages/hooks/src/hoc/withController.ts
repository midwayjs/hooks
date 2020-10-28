import { EnhancedFunc } from './type'

type Controller = {
  middleware?: any[]
}

export async function withController<T extends EnhancedFunc>(controller: Controller, func: T) {
  const proxy: EnhancedFunc = async function proxy(...args: any[]) {
    return func.apply(this, ...args)
  }

  proxy.middleware = controller.middleware

  return proxy as T
}
