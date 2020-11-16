/**
 * @internal
 * Runtime Bind Api
 */
export function bind(from: Function, ctx?: any) {
  if (typeof from === 'function') {
    const target = from.bind(ctx)
    extend(from, target)
    return target
  }
  return from
}

function extend(from: Function, to: Function) {
  for (const key in from) {
    if (from.hasOwnProperty(key)) {
      to[key] = from[key]
    }
  }
}
