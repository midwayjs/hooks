import { als as AsynchronousLocalStorage } from 'asynchronous-local-storage'

export type HooksContext = {
  ctx: any
}

/**
 * @private
 * private api, may change without notice.
 * Use asynchronous-local-storage due to serverless environment does not support node.js 12.17.0
 */
export const als = {
  get runtime() {
    return AsynchronousLocalStorage
  },
  getStore(key: string) {
    return als.runtime.get<any>(key)
  },
  run(ctx: HooksContext, callback: () => Promise<any>) {
    return new Promise((resolve, reject) => {
      als.runtime.runWith(() => callback().then(resolve).catch(reject), ctx)
    })
  },
}

export function useContext<T = any>(): T {
  return als.getStore('ctx')
}
