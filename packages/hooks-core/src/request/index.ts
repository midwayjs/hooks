import axios from 'axios'

import type { ApiParam } from '../types/http'

export type { ApiParam, ApiHttpMethod } from '../types/http'

export const defaults = {
  async request(param: ApiParam) {
    const method = param.data.args.length === 0 ? 'GET' : 'POST'

    const response = await axios({
      baseURL: defaults.baseURL,
      method,
      ...param,
    })

    return response?.data
  },
  baseURL: '',
}

export function request(param: ApiParam) {
  return defaults.request(param)
}
