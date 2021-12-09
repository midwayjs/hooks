import parseArgs from 'fn-args'
import { relative, resolve, sep } from 'path'

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
