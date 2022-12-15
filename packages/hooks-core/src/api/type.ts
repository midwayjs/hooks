import { AsyncFunction } from '../types/common'

type Merge<T, U> = T & Omit<U, keyof T>

export type ArrayToObject<T, R = {}> = T extends [infer First, ...infer Rest]
  ? First extends PromiseLike<infer PromiseValue>
    ? PromiseValue
    : First extends object
    ? Merge<First, ArrayToObject<Rest, R>>
    : ArrayToObject<Rest, R>
  : R

export type ApiRunner<
  Input extends object | void | unknown,
  Handler extends AsyncFunction
> = (
  ...args: Input extends void
    ? Parameters<Handler>
    : [...args: Parameters<Handler>, input: Input]
) => ReturnType<Handler>

export type MetadataHelper = {
  setMetadata: <T = any>(key: any, value: T) => void
  getMetadata: <T = any>(key: any) => T
}

export type ExecuteHelper = {
  result?: any
  getInputArguments?: () => any[]
}

export type Operator<Input> = {
  name: string
  type?: Input
  input?: boolean
  metadata?: (helper: MetadataHelper) => void
  execute?: (helper: ExecuteHelper, next: () => Promise<any>) => Promise<void>
}

export type ExtractInputType<T> = {
  [key in keyof T]: T[key] extends Operator<any> ? T[key]['type'] : void
}

export type BaseTrigger = {
  type: string
  requestClient?: {
    fetcher: string
    client: string
  }
  [key: string]: any
}
