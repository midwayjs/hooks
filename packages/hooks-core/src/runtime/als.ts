import type AsynchronousLocalStorage from 'asynchronous-local-storage'

import { lazyRequire } from '..'

export type HooksContext = {
  ctx: any
  event?: any
}

/**
 * @private
 * private api, may change without notice.
 * Use asynchronous-local-storage due to serverless environment does not support node.js 12.17.0
 */
export const als = {
  get runtime(): typeof AsynchronousLocalStorage {
    return lazyRequire('asynchronous-local-storage').als
  },
  getStore(key: string) {
    return als.runtime.get<any>(key)
  },
  run(ctx: HooksContext, callback: any) {
    return new Promise((resolve) => {
      als.runtime.runWith(async () => {
        resolve(await callback())
      }, ctx)
    })
  },
}

export function useContext<T = any>(): T {
  return als.getStore('ctx')
}
