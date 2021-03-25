import type { ApiParam } from './http'

export type ApiFunction = {
  (...args: any[]): Promise<any>
  middleware?: HooksMiddleware
  /**
   * @private
   */
  _param?: Partial<ApiParam>
}

export type ApiConfig = {
  middleware?: HooksMiddleware
}

export type ApiModule = {
  config?: ApiConfig
  [index: string]: ApiFunction | any
}

export type HooksMiddleware = Array<any>
