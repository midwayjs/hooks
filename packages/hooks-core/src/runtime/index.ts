import { als as AsyncLocalStoragePolyfill } from 'asynchronous-local-storage'

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
  getStore(key: string) {
    return AsyncLocalStoragePolyfill.get<any>(key)
  },
  run(ctx: HooksContext, callback: any) {
    return new Promise((resolve) => {
      AsyncLocalStoragePolyfill.runWith(async () => {
        resolve(await callback())
      }, ctx)
    })
  },
}
