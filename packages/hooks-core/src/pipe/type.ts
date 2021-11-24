import { Merge } from 'type-fest'

export type ArrayToObject<T, R = {}> = T extends [infer First, ...infer Rest]
  ? First extends PromiseLike<infer PromiseValue>
    ? PromiseValue
    : First extends object
    ? Merge<First, ArrayToObject<Rest, R>>
    : ArrayToObject<Rest, R>
  : R

export type PipeHandler<
  Meta extends object | void,
  Handler extends (...args: any) => Promise<any>
> = (
  ...args: Meta extends void
    ? Parameters<Handler>
    : [meta: Meta, ...args: Parameters<Handler>]
) => ReturnType<Handler>

export enum OperatorProperty {
  Trigger = 'Trigger',
  Middleware = 'Middleware',
}

export type DefineHelper = {
  setProperty: (type: any, value: any) => void
  getProperty: (type: any) => any
}

type ExecuteHelper = {
  next: () => Promise<void>
}
export type Operator<MetaType> = {
  name: string
  meta?: MetaType
  defineMeta?: (helper: DefineHelper) => void | Promise<void>
  execute?: (helper: ExecuteHelper) => Promise<void>
}

export type ExtractMeta<T> = {
  [key in keyof T]: T[key] extends Operator<any> ? T[key]['meta'] : void
}
