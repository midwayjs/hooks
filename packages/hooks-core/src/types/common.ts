export type FunctionId = string

export type ApiFunction = {
  (...args: any[]): Promise<any>
}

export type ApiConfig = {
  middleware?: HooksMiddleware[]
}

export type ApiModule = {
  config?: ApiConfig
  [index: string]: ApiFunction | any
}

export type HooksMiddleware = (next: () => Promise<void>) => any
