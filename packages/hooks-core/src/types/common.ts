import type { LambdaParam } from './http'

export type EnhancedFunc = {
  (...args: any[]): Promise<any>
  middleware?: any[]
  /**
   * @private
   */
  _param?: Partial<LambdaParam>
}

export type LambdaModule = {
  config: {
    middleware: any[]
  }
  [index: string]: EnhancedFunc | any
}
