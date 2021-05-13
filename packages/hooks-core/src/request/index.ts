import axios, { AxiosError } from 'axios'
import type { ApiParam } from '../types/http'

export type { ApiParam, ApiHttpMethod } from '../types/http'

export const defaults = {
  async request(param: ApiParam) {
    const enableSuperjson = param.meta && param.meta.superjson
    try {
      const response = await axios({
        baseURL: defaults.baseURL,
        ...param,
      })

      if (
        response &&
        response.headers['content-type'] &&
        response.headers['content-type'].indexOf('application/json') !== -1 &&
        enableSuperjson
      ) {
        const superjson = await import('superjson')
        return superjson.deserialize(response.data)
      }

      return response.data
    } catch (error) {
      const e: AxiosError = error
      if (enableSuperjson) {
        const superjson = await import('superjson')
        throw superjson.deserialize(e.response.data)
      }
      throw e
    }
  },
  baseURL: '',
}

export function request(param: ApiParam) {
  return defaults.request(param)
}
