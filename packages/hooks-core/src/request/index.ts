import axios, { AxiosError } from 'axios'
import type { ApiParam } from '../types/http'
import superjson from 'superjson'

export const defaults = {
  async request(param: ApiParam) {
    const enableSuperjson = param.meta && param.meta.superjson
    try {
      const response = await axios({
        ...param,
        baseURL: defaults.baseURL,
      })

      if (response) {
        return enableSuperjson ? superjson.parse(response.data) : response.data
      }

      return response
    } catch (error) {
      if (enableSuperjson) {
        const e: AxiosError = error
        throw e.response.data
      }
      throw error
    }
  },
  baseURL: '',
}

export function request(param: ApiParam) {
  return defaults.request(param)
}
