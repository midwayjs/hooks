import { AsyncLocalStorage } from 'async_hooks'
import { FaaSContext } from '@midwayjs/faas'
import { debug } from '../../util'

debug('create AsyncLocalStorage')

export type HooksContext = {
  ctx: FaaSContext
  event?: any
}

/**
 * @private
 * private api, may change without notice.
 */
export const als = new AsyncLocalStorage<HooksContext>()
