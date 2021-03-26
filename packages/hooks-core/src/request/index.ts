import axios, { AxiosError } from 'axios'
import type { ApiParam } from '../types/http'
import superjson from 'superjson'

export const defaults = {
  get request() {
    throw new Error('request is deprecated in 2.0')
  },
  get baseUrl() {
    throw new Error('baseUrl is deprecated in 2.0')
  },
}

axios.defaults.transformResponse = [superjson.parse]

async function request(param: ApiParam) {
  try {
    const response = await axios(param)
    return response && response.data
  } catch (error) {
    const e: AxiosError = error
    throw e.response.data
  }
}

/**
 * @internal private api
 */
export function createRequest(baseUrl: string, name: string) {
  return (...args: any[]) => {
    return request({
      url: getUrl(baseUrl, name),
      method: args.length === 0 ? 'GET' : 'POST',
      data: {
        args,
      },
      meta: {},
    })
  }
}

function getUrl(baseUrl: string, name: string) {
  if (name === 'default') {
    return baseUrl
  }

  if (baseUrl.endsWith('/')) {
    return `${baseUrl}${name}`
  }

  return `${baseUrl}/${name}`
}
