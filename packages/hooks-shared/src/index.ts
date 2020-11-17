import type { SpecStructure } from '@midwayjs/serverless-spec-builder'

export type LambdaHTTPMethod = 'GET' | 'POST'

export type LambdaParam = {
  url: string
  method: LambdaHTTPMethod
  data: {
    args: any[]
    [key: string]: any
  }
  meta: {
    functionName?: string
    functionGroup?: string
    gateway?: string
    /**
     * @private Unstable and subject to change at any time and without additional notice
     */
    unstable_params?: string[]
    [key: string]: any
  }
}

export interface SpecStructureWithGateway extends Omit<SpecStructure, 'functionsRule'> {
  apiGateway?: {
    type?: string
  }
  functionsRule?: FunctionsRule
}

export interface FunctionsRule {
  /**
   * @internal
   */
  source?: string
  rules: FunctionRule[]
}

export interface FunctionRule {
  baseDir: string
  events: {
    http?: {
      basePath: string
      underscore?: boolean
    }
    [event: string]: any
  }
}
