import { AsyncLocalStorage } from 'async_hooks'
import { FaaSContext } from '@midwayjs/faas'
import { debug } from '../util'

debug('create AsyncLocalStorage')

export type HooksContext = {
  ctx: FaaSContext
  event?: any
}

export const als = new AsyncLocalStorage<HooksContext>()
