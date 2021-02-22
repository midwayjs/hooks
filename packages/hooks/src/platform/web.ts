import { useContext as useContextImpl } from '../api/async_hooks/useContextImpl'
import type { IMidwayContainer } from '@midwayjs/core'

export function useContext(): any {
  return useContextImpl()
}

export function useLogger() {
  const ctx = useContext()
  return ctx.logger
}

export function usePlugin(key: any): any {
  const ctx = useContext()
  return ctx.app[key] || ctx[key]
}

export function useApp() {
  const ctx = useContext()
  return ctx.app
}

export async function useInject<T = any>(identifier: (new () => T) & string) {
  const ctx = useContext()
  const requestContext: IMidwayContainer = ctx['requestContext']
  return requestContext.getAsync<T>(identifier)
}

export function useConfig(key?: string) {
  const ctx = useContext()
  const requestContext: IMidwayContainer = ctx['requestContext']
  return requestContext.getConfigService().getConfiguration(key)
}
