import type {
  SpecStructure,
  FunctionStructure,
} from '@midwayjs/serverless-spec-builder'

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

export interface HooksSpecStructure
  extends Omit<SpecStructure, 'functionsRule'> {
  apiGateway?: {
    type?: string
  }
  functionsRule?: FunctionsRule
  hooks?: {
    runtime?: 'compiler' | 'async_hooks'
  }
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

export interface MidwayHooksFunctionStructure extends FunctionStructure {
  deployName: string
  handler: string
  // dist path
  sourceFilePath?: string
  // sourceFile
  sourceFile?: string
  exportFunction?: string
  isFunctional?: boolean
  argsPath?: string
  gatewayConfig: Partial<LambdaParam>
  event: FunctionRule['events']
}
