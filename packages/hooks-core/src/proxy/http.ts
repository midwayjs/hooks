import { proxy } from './proxy'
import { request } from '../request'
import { getHTTPMethod } from '../router'

export function createRequestProxy(baseUrl: string) {
  return proxy(async (func, thisArg, args) => {
    const name = func._param.meta.name
    return request({
      url: baseUrl + name,
      method: getHTTPMethod(args.length),
      data: { args },
      meta: {},
    })
  })
}
