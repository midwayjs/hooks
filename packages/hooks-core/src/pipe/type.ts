import type { Merge } from 'type-fest'

export type ArrayToObject<T, R = {}> = T extends [infer First, ...infer Rest]
  ? First extends PromiseLike<infer PromiseValue>
    ? PromiseValue
    : First extends object
    ? Merge<First, ArrayToObject<Rest, R>>
    : ArrayToObject<Rest, R>
  : R

export type PipeHandler<
  Input extends object | void,
  Handler extends (...args: any) => Promise<any>
> = (
  ...args: Input extends void
    ? Parameters<Handler>
    : [input: Input, ...args: Parameters<Handler>]
) => ReturnType<Handler>

export enum OperatorType {
  Trigger = 'Trigger',
  Middleware = 'Middleware',
}

export type DefineHelper = {
  setProperty: (key: any, value: any) => void
  getProperty: (key: any) => any
}

type ExecuteHelper = {
  next?: () => Promise<void>
}

export type Operator<Input> = {
  name: string
  type?: Input
  requireInput?: boolean
  defineMeta?: (helper: DefineHelper) => void
  execute?: (helper: ExecuteHelper) => Promise<void>
}

export type ExtractInputType<T> = {
  [key in keyof T]: T[key] extends Operator<any> ? T[key]['type'] : void
}
