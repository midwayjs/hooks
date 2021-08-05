import axios from 'axios'

import type { ApiParam } from '../types/http'

export type { ApiParam, ApiHttpMethod } from '../types/http'

export const defaults = {
  async request(param: ApiParam) {
    const response = await axios({
      baseURL: defaults.baseURL,
      ...param,
    })

    return response?.data
  },
  baseURL: '',
}

export function request(param: ApiParam) {
  return defaults.request(param)
}
