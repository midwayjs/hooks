import { BaseTrigger, HttpMethod } from '..'
import { HttpTrigger } from '../api'

export type FunctionId = string

export type AsyncFunction = (...args: any[]) => Promise<any>

export interface ApiFunction extends AsyncFunction {}

export type ApiConfig = {
  middleware?: HooksMiddleware[] | any[]
}

export type ApiModule = {
  config?: ApiConfig
  [index: string]: ApiFunction | any
}

export type HooksMiddleware = (next: () => any | Promise<any>) => any

export type RawRequestOptions = {
  trigger: BaseTrigger
  args?: any
  metadata?: any
}

export type HttpRequestOptions = {
  url: string
  method: HttpMethod
  data?: { args: any[] } | FormData

  // query & headers
  query?: Record<string, string>
  headers?: Record<string, string>
  files?: Record<string, File | FileList>
}

export type RequestRoute<T = any> = {
  trigger: BaseTrigger & T
  functionId: FunctionId
  useInputMetadata: boolean
}

export type RequestArgs<
  Trigger,
  InputMetaData = void
> = InputMetaData extends void
  ? [...args: any[], route: RequestRoute<Trigger>]
  : [...args: any[], inputMetadata: InputMetaData, route: RequestRoute<Trigger>]
