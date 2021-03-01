import { request } from './'

export function createRequest(baseUrl: string, name: string) {
  return (...args: any[]) => {
    return request({
      url: getUrl(baseUrl, name),
      method: args.length === 0 ? 'GET' : 'POST',
      data: { args },
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
