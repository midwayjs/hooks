import { AsyncLocalStorageRuntime } from './AsyncLocalStorage'
import { HooksContext } from './type'
import {
  isEnableSingleLocalStorage,
  SingletonLocalStorageRuntime,
} from './SingletonLocalStorage'

export * from './type'
export * from './AsyncLocalStorage'

export const ContextManager = {
  get runtime() {
    if (isEnableSingleLocalStorage()) {
      return SingletonLocalStorageRuntime
    }
    return AsyncLocalStorageRuntime
  },
  getValue(key: string) {
    return ContextManager.runtime.getValue(key)
  },
  run(ctx: HooksContext, callback: () => Promise<any>) {
    return ContextManager.runtime.run(ctx, callback)
  },
}

export function useContext<T = any>(): T {
  return ContextManager.getValue('ctx')
}
