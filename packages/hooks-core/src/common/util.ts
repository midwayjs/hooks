import parseArgs from 'fn-args'
import debug from 'debug'

export function isHooksMiddleware(fn: (...args: any[]) => any) {
  return typeof fn === 'function' && parseArgs(fn).length === 1
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
