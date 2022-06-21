import { isFunction } from '../common'

export enum OperatorType {
  Trigger = 'Trigger',
  Middleware = 'Middleware',
}

export const isApiFunction = (target: any): boolean => {
  return (
    isFunction(target) && !!Reflect.getMetadata(OperatorType.Trigger, target)
  )
}
