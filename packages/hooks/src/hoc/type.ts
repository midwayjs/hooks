import type { LambdaParam } from '@midwayjs/hooks-shared'

export type EnhancedFunc = {
  (...args: any[]): Promise<any>
  middleware?: any[]
  /**
   * @private
   */
  _param?: Partial<LambdaParam>
}
