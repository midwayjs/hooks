import { als as AsyncLocalStoragePolyfill } from 'asynchronous-local-storage'

export type HooksContext = {
  ctx: any
  event?: any
}

/**
 * @private
 * private api, may change without notice.
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

// /**
//  * @private
//  * private api, may change without notice.
//  */
// export const als = new AsyncLocalStorage<HooksContext>()
