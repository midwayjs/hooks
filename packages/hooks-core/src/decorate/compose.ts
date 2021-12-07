import { ExecuteHelper } from './type'

type Executor = (helper: ExecuteHelper) => void | Promise<void>

export function compose(
  functions: Executor[],
  preDefineHelper: Omit<ExecuteHelper, 'next'> = {}
) {
  if (!Array.isArray(functions))
    throw new TypeError('Middleware stack must be an array!')
  for (const fn of functions) {
    if (typeof fn !== 'function')
      throw new TypeError('Middleware must be composed of functions!')
  }

  return function (): Promise<any> {
    // last called middleware #
    let index = -1
    return execute()

    async function execute() {
      await dispatch(0)
      return preDefineHelper.result
    }

    function dispatch(i: number) {
      if (i <= index)
        return Promise.reject(new Error('next() called multiple times'))

      index = i
      let fn = functions[i]
      if (!fn) return Promise.resolve()

      try {
        const helper = Object.assign(preDefineHelper, {
          next: dispatch.bind(null, i + 1),
        })
        return Promise.resolve(fn(helper))
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
