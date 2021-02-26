import { proxy } from './proxy'
import { request } from '../request'
export function createRequestProxy(baseUrl: string) {
  return proxy(async (func, thisArg, args) => {
    const name = func._param.meta.name
    return request({
      url: baseUrl + baseUrl.endsWith('/') ? name : `/${name}`,
      method: args.length === 0 ? 'GET' : 'POST',
      data: { args },
      meta: {},
    })
  })
}
