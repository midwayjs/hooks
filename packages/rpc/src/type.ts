import { HttpRequestOptions } from '@midwayjs/hooks-core'

export type RequestContext<T, R = any> = {
  req: T
  res: R
}

export type HttpContext = RequestContext<HttpRequestOptions>

export type NextFunction = () => Promise<any>

export type Middleware<T = any> = (ctx: T, next: NextFunction) => void

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
