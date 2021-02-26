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
    [key: string]: any
  }
}
