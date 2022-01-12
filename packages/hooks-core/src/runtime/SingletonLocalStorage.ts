import { ContextRuntime } from '.'
import { createDebug } from '../common/util'

const debug = createDebug('hooks-core: runtime')

const USE_SINGLETON_LOCAL_STORAGE = 'MIDWAY_HOOKS_USE_SINGLETON_LOCAL_STORAGE'

export const enableSingleLocalStorage = () => {
  debug('Enable SingletonLocalStorageRuntime')
  globalThis[USE_SINGLETON_LOCAL_STORAGE] = true
}

export const isEnableSingleLocalStorage = () => {
  return !!globalThis[USE_SINGLETON_LOCAL_STORAGE]
}

const STORAGE = Symbol.for('STORAGE')

export const SingletonLocalStorageRuntime: ContextRuntime = {
  name: 'SingletonLocalStorageRuntime',
  getValue(key: string) {
    return globalThis[STORAGE][key]
  },
  async run(ctx: any, callback: () => Promise<any>) {
    globalThis[STORAGE] = ctx
    return await callback()
  },
}
