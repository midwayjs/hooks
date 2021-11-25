// Fork from koa-compose, but remove context.

export function compose(functions?: Function[]) {
  if (!Array.isArray(functions))
    throw new TypeError('Middleware stack must be an array!')
  for (const fn of functions) {
    if (typeof fn !== 'function')
      throw new TypeError('Middleware must be composed of functions!')
  }

  return function (next?: () => void): Promise<any> {
    // last called middleware #
    let index = -1
    return dispatch(0)

    function dispatch(i: number) {
      if (i <= index)
        return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = functions[i]
      if (i === functions.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(dispatch.bind(null, i + 1)))
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
