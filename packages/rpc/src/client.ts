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
  async fetcher(req: HttpRequestOptions, options: SetupOptions) {
    const res = await axios({
      method: req.method as Options['method'],
      url: req.url,
      data: req.data,
      params: req.query,
      headers: req.headers,
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

export type Fetcher = (
  req: HttpRequestOptions,
  options: SetupOptions
) => Promise<any>

export function setupHttpClient(options: SetupOptions) {
  Object.assign(client, options)
}
