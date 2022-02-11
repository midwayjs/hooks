import { AsyncLocalStorageRuntime } from './AsyncLocalStorage'
import { HooksContext } from './type'

export * from './type'
export * from './AsyncLocalStorage'

export const ContextManager = {
  getValue(key: string) {
    return AsyncLocalStorageRuntime.getValue(key)
  },
  run(ctx: HooksContext, callback: () => Promise<any>) {
    return AsyncLocalStorageRuntime.run(ctx, callback)
  },
}

export function useContext<T = any>(): T {
  return ContextManager.getValue('ctx')
}
