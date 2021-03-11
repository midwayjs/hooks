import axios from 'axios'
import { ApiParam } from '../types/http'

const defaults = axios.defaults

async function request(param: ApiParam) {
  const response = await axios(param)
  return response.data
}
/**
 * @internal private api
 */

function createRequest(baseUrl, name) {
  return (...args) => {
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

function getUrl(baseUrl, name) {
  if (name === 'default') {
    return baseUrl
  }

  if (baseUrl.endsWith('/')) {
    return `${baseUrl}${name}`
  }

  return `${baseUrl}/${name}`
}

export { createRequest, defaults, request }
