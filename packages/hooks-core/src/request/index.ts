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
        response?.headers?.['content-type']?.indexOf('application/json') !==
          -1 &&
        enableSuperjson &&
        response?.data
      ) {
        const superjson = await import('superjson')
        return superjson.deserialize(response.data)
      }

      return response?.data
    } catch (error) {
      const e: AxiosError = error
      if (enableSuperjson && e?.response?.data) {
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
