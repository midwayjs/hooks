import parseArgs from 'fn-args'
import { last } from 'lodash'
import { relative, resolve, sep } from 'path'
import type Prettier from 'prettier'

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

export function formatCode(code: string) {
  try {
    const prettier = lazyRequire('prettier')
    return prettier.format(code, {
      semi: true,
      singleQuote: true,
      parser: 'babel',
    })
  } catch {
    return code
  }
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

export function lazyRequire <T = any>(id: string):T {
  return eval('require')(id)
}
