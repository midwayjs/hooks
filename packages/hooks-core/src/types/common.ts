import type { ApiParam } from './http'

export type ApiFunction = {
  (...args: any[]): Promise<any>
  middleware?: any[]
  /**
   * @private
   */
  _param?: Partial<ApiParam>
}

export type ApiConfig = {
  middleware?: any[]
}

export type ApiModule = {
  config?: ApiConfig
  [index: string]: ApiFunction | any
}
