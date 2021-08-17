import type AsynchronousLocalStorage from 'asynchronous-local-storage'

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

function getAls(): typeof AsynchronousLocalStorage {
  return require('asynchronous-local-storage').als
}

/**
 * @private
 * private api, may change without notice.
 * Use asynchronous-local-storage due to serverless environment does not support node.js 12.17.0
 */
export const als = {
  getStore(key: string) {
    if (GlobalLocalStorage.isSingleConcurrencyMode()) {
      return GlobalLocalStorage.getStore(key)
    }

    return getAls().get<any>(key)
  },
  run(ctx: HooksContext, callback: any) {
    if (GlobalLocalStorage.isSingleConcurrencyMode()) {
      return GlobalLocalStorage.run(ctx, callback)
    }

    return new Promise((resolve) => {
      getAls().runWith(async () => {
        resolve(await callback())
      }, ctx)
    })
  },
}

export function useContext<T = any>(): T {
  return als.getStore('ctx')
}
