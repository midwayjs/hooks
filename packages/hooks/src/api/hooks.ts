import type { IMidwayContainer } from '@midwayjs/core'
import {
  MidwayConfigService,
  getCurrentAsyncContextManager,
  ASYNC_CONTEXT_KEY,
} from '@midwayjs/core'
import { ERR_INVALID_ARG_TYPE, validateString } from '@midwayjs/hooks-core'

export function useContext<T = any>(): T {
  const ctx = getCurrentAsyncContextManager()
    .active()
    .getValue(ASYNC_CONTEXT_KEY)
  return ctx as T
}

export function useLogger() {
  const ctx = useContext()
  return ctx.logger
}

export function usePlugin(key: string): any {
  validateString(key, 'key')

  const ctx = useContext()
  return ctx.app[key] || ctx[key]
}

export function useInject<T = any>(identifier: new () => T): Promise<T>
export function useInject<T = any>(identifier: string): Promise<any>
export async function useInject(identifier) {
  if (typeof identifier !== 'function' && typeof identifier !== 'string') {
    throw new ERR_INVALID_ARG_TYPE('identifier', 'class, string', identifier)
  }

  const ctx = useContext()
  const requestContext: IMidwayContainer = ctx['requestContext']
  return requestContext.getAsync(identifier)
}

export function useConfig(key?: string) {
  if (key !== undefined) {
    validateString(key, 'key')
  }

  const ctx = useContext()
  const requestContext: IMidwayContainer = ctx['requestContext']
  return requestContext.get(MidwayConfigService).getConfiguration(key)
}
