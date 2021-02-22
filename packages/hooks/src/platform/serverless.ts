import { IMidwayFaaSApplication } from '@midwayjs/faas'
import { useContext } from '../api/useContext'
import type { ILogger } from '@midwayjs/logger'

export { useContext } from '../api/useContext'

export function useLogger(): ILogger {
  const ctx = useContext()
  return ctx.logger
}

export function useConfig(key?: string) {
  const ctx = useContext()
  return ctx.hooks.useConfig(key)
}

export async function useInject<T = any>(identifier: (new () => T) | string) {
  const { requestContext } = useContext()
  return requestContext.getAsync<T>(identifier)
}

export function useApp(): IMidwayFaaSApplication {
  const ctx = useContext()
  return ctx.hooks.useApp()
}

export function usePlugin(key: string): any {
  const ctx = useContext()
  return ctx.hooks.usePlugin(key)
}
