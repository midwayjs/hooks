import type { ApiParam } from './http'

export type ApiFunction = {
  (...args: any[]): Promise<any>
  middleware?: any[]
  /**
   * @private
   */
  _param?: Partial<ApiParam>
}

export type ApiModule = {
  config: {
    middleware: any[]
  }
  [index: string]: ApiFunction | any
}
