import type { HttpRequestOptions } from '@midwayjs/hooks-core'
import axios, { Options } from 'redaxios'
import fetch from 'isomorphic-unfetch'

export type Context = {
  req: HttpRequestOptions
  res: any
}

export type Middleware = (ctx: Context, next: () => Promise<any>) => void

export const client: SetupOptions = {
  baseURL: '',
  async fetcher(options: HttpRequestOptions) {
    const res = await axios({
      method: options.method as Options['method'],
      url: options.url,
      data: options.data,
      params: options.query,
      headers: options.headers,
      baseURL: options.baseURL,
      withCredentials: options.withCredentials,
      fetch,
    })
    return res.data
  },
  middleware: [],
  withCredentials: false,
}

export type SetupOptions = {
  fetcher?: Fetcher
  middleware?: Middleware[]
  // request config
  baseURL?: string
  withCredentials?: boolean
}

export type Fetcher = (options: HttpRequestOptions) => Promise<any>

export function setupHttpClient(options: SetupOptions) {
  Object.assign(client, options)
}
