import type { IMidwayContainer } from '@midwayjs/core'
import { als } from '@midwayjs/hooks-core'

export function useContext<T = any>(): T {
  return als.getStore('ctx')
}

export function useLogger() {
  const ctx = useContext()
  return ctx.logger
}

export function usePlugin(key: any): any {
  const ctx = useContext()
  return ctx.app[key] || ctx[key]
}

// TODO add useInject unit test
export function useInject<T = any>(identifier: new () => T): Promise<T>
export function useInject<T = any>(identifier: string): Promise<any>
export async function useInject(identifier) {
  const ctx = useContext()
  const requestContext: IMidwayContainer = ctx['requestContext']
  return requestContext.getAsync(identifier)
}

// TODO add useConfig unit test
export function useConfig(key?: string) {
  const ctx = useContext()
  const requestContext: IMidwayContainer = ctx['requestContext']
  return requestContext.getConfigService().getConfiguration(key)
}
