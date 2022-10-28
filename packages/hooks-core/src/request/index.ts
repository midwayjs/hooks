import axios, { AxiosError } from 'axios'

import type { ApiParam } from '../types/http'

export type { ApiParam, ApiHttpMethod } from '../types/http'

export const defaults = {
  async request(param: ApiParam) {
    const requestConfig = Object.assign({ baseURL: defaults.baseURL }, param)
    const response = await axios(requestConfig)
    return response?.data
  },
  baseURL: '',
}

export function request(param: ApiParam) {
  return defaults.request(param)
}
