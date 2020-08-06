import 'isomorphic-unfetch'
import type { LambdaParam } from '@midwayjs/hooks-shared'
export type { LambdaHTTPMethod, LambdaParam } from '@midwayjs/hooks-shared'

type Defaults = {
  baseURL: string
  request: (param: LambdaParam) => any
}

export const defaults: Defaults = {
  baseURL: '',
  request: (params: LambdaParam) => {
    const { url, method, data } = params
    const body = method === 'POST' ? JSON.stringify(data) : null

    return fetch(`${defaults.baseURL}${url}`, {
      method,
      body,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((resp) => {
      return resp
        .clone()
        .json()
        .catch(() => resp.clone().text())
    })
  },
}

export function request(param: LambdaParam) {
  return defaults.request(param)
}
