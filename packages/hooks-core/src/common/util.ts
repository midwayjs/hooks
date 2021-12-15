import parseArgs from 'fn-args'

export function isHooksMiddleware(fn: (...args: any[]) => any) {
  return parseArgs(fn).length === 1
}

export function extractMetadata(target: any) {
  const metadata: any = {}
  const metaKeys = Reflect.getMetadataKeys(target)
  for (const key of metaKeys) {
    metadata[key] = Reflect.getMetadata(key, target)
  }
  return metadata
}
