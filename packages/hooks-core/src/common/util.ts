import parseArgs from 'fn-args'
import debug from 'debug'
import isClass from 'is-class'

export function isFunction(arg: any) {
  return typeof arg === 'function' && !isClass(arg)
}

export function isHooksMiddleware(fn: (...args: any[]) => any) {
  return isFunction(fn) && parseArgs(fn).length === 1
}

export function extractMetadata(target: any) {
  const metadata: any = {}
  const metaKeys = Reflect.getMetadataKeys(target)
  for (const key of metaKeys) {
    metadata[key] = Reflect.getMetadata(key, target)
  }
  return metadata
}

export function createDebug(namespace: string) {
  return debug(namespace)
}
