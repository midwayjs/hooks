import type { ApiParam } from './http'

export type FunctionId = string

export type ApiFunction = {
  (...args: any[]): Promise<any>
  middleware?: HooksMiddleware[]
  /**
   * @private
   */
  _param?: Partial<ApiParam>
}

export type PipeApiFunction = {
  (...args: any[]): Promise<any>
  meta?: Map<any, any>
  isPipe?: boolean
}

export type ApiConfig = {
  middleware?: HooksMiddleware[]
}

export type ApiModule = {
  config?: ApiConfig
  [index: string]: ApiFunction | any
}

export type HooksMiddleware = (next: () => Promise<void>) => any
