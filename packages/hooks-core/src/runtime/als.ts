import { AsyncLocalStorage } from 'async_hooks'

export type HooksContext = {
  ctx: any
  event?: any
}

/**
 * @private
 * private api, may change without notice.
 */
export const als = new AsyncLocalStorage<HooksContext>()
