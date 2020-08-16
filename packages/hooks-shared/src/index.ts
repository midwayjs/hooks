import type { SpecStructure } from '@midwayjs/serverless-spec-builder'

export type LambdaHTTPMethod = 'GET' | 'POST'

export type LambdaParam = {
  url?: string
  method?: LambdaHTTPMethod
  data?: {
    args?: any[]
  }
  meta: {
    functionName?: string
    functionGroup?: string
    gateway?: string
  }
}

export interface SpecStructureWithGateway extends SpecStructure {
  apiGateway?: {
    type?: string
  }
}
