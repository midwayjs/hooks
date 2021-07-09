import parseArgs from 'fn-args'
import createJITI from 'jiti'
import { last } from 'lodash'

export function isDevelopment() {
  if (
    process.env.MIDWAY_TS_MODE === 'true' ||
    /* istanbul ignore next */
    process.env.NODE_ENV === 'test' ||
    /* istanbul ignore next */
    process.env.NODE_ENV === 'development'
  ) {
    return true
  }

  /* istanbul ignore next */
  return false
}

export function useHooksMiddleware(fn: (...args: any[]) => any) {
  return (...args: any[]) => {
    /**
     * Hooks middleware
     * const middleware = (next) => { const ctx = useContext() }
     */
    if (parseArgs(fn).length === 1) {
      const next = last(args)
      return fn(next)
    }
    return fn(...args)
  }
}

export function tryRequire<T>(id: string): T {
  try {
    const jiti = createJITI()
    const mod = jiti(id)
    if ('default' in mod) return mod.default
    return mod
  } catch {
    return undefined
  }
}
