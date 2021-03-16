import axios from 'axios'
import { ApiParam } from '../types/http'
import { parse } from 'superjson'

export const defaults = axios.defaults

axios.defaults.transformResponse = [parse]

export async function request(param: ApiParam) {
  const response = await axios(param)
  // For unit testing
  return response && response.data
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
