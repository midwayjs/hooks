import { EnhancedFunc } from './type'

type Controller = {
  middleware?: any[]
}

export async function withController<T extends EnhancedFunc>(config: Controller, func: T) {
  const proxy = async function proxy(...args: any[]) {
    return func.apply(this, ...args)
  }

  if (Array.isArray(config.middleware)) {
    func.middleware = config.middleware
  }

  return proxy as T
}
