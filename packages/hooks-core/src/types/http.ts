export type ApiHttpMethod = 'GET' | 'POST'

export type ApiParam = {
  url: string
  method: ApiHttpMethod
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
