import { isHooksMiddleware } from '@midwayjs/hooks-core'

export function useHooksMiddleware(mw: (...args: any[]) => any | any) {
  if (!isHooksMiddleware(mw)) return mw

  return (...args: any[]) => {
    const next = args[1]
    return mw(next)
  }
}
