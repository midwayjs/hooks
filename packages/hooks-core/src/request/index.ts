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
        response.headers['content-type']?.indexOf?.('application/json') !== -1
      ) {
        const superjson = await import('superjson')
        return enableSuperjson
          ? superjson.deserialize(response.data)
          : response.data
      }

      return response
    } catch (error) {
      if (enableSuperjson) {
        const e: AxiosError = error
        const superjson = await import('superjson')
        throw superjson.deserialize(e.response.data)
      }
      throw error
    }
  },
  baseURL: '',
}

export function request(param: ApiParam) {
  return defaults.request(param)
}
