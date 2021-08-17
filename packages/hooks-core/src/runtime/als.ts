import type AsynchronousLocalStorage from 'asynchronous-local-storage'

import { lazyRequire } from '..'

export type HooksContext = {
  ctx: any
  event?: any
}

export const SINGLE_CONCURRENCY_MODE = Symbol.for(
  'MIDWAY_HOOKS_SINGLE_CONCURRENCY_MODE'
)

const GlobalLocalStorage = {
  isSingleConcurrencyMode: () => !!globalThis[SINGLE_CONCURRENCY_MODE],
  getStore(key: string) {
    return globalThis[SINGLE_CONCURRENCY_MODE][key]
  },
  async run(ctx: HooksContext, callback: any) {
    globalThis[SINGLE_CONCURRENCY_MODE] = ctx
    return await callback()
  },
}

const AsyncLocalStorage = {
  get runtime(): typeof AsynchronousLocalStorage {
    return lazyRequire('asynchronous-local-storage').als
  },
  getStore(key: string) {
    return AsyncLocalStorage.runtime.get<any>(key)
  },
  run(ctx: HooksContext, callback: any) {
    return new Promise((resolve) => {
      AsyncLocalStorage.runtime.runWith(async () => {
        resolve(await callback())
      }, ctx)
    })
  },
}

/**
 * @private
 * private api, may change without notice.
 * Use asynchronous-local-storage due to serverless environment does not support node.js 12.17.0
 */
export const als = {
  get runtime() {
    return GlobalLocalStorage.isSingleConcurrencyMode()
      ? GlobalLocalStorage
      : AsyncLocalStorage
  },
  getStore(key: string) {
    return als.runtime.getStore(key)
  },
  run(ctx: HooksContext, callback: any) {
    return als.runtime.run(ctx, callback)
  },
}

export function useContext<T = any>(): T {
  return als.getStore('ctx')
}
