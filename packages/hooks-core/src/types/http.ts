export type ApiHttpMethod = 'GET' | 'POST'

export type ApiParam = {
  url: string
  /**
   * Now the function accepts all http methods
   * @deprecated will be removed in next major version.
   */
  method: ApiHttpMethod
  data: {
    args: any[]
    [key: string]: any
  }
  meta: {
    functionName?: string
    superjson?: boolean
    [key: string]: any
  }
}
