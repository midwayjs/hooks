import parseArgs from 'fn-args'
import last from 'lodash/last'
import { relative, resolve, sep } from 'path'

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
     * @description Hooks middleware
     * @example const middleware = (next) => { const ctx = useContext() }
     */
    if (isHooksMiddleware(fn)) {
      const next = last(args)
      return fn(next)
    }
    return fn(...args)
  }
}

export function isHooksMiddleware(fn: (...args: any[]) => any) {
  return parseArgs(fn).length === 1
}

export function isPathInside(child: string, parent: string) {
  const relation = relative(parent, child)
  return Boolean(
    relation &&
      relation !== '..' &&
      !relation.startsWith(`..${sep}`) &&
      relation !== resolve(child)
  )
}

export function extractMetadata(target: any) {
  const metadata: any = {}
  const metaKeys = Reflect.getMetadataKeys(target)
  for (const key of metaKeys) {
    metadata[key] = Reflect.getMetadata(key, target)
  }
  return metadata
}
