import { BaseTrigger, OperatorType } from './type'

export function getApiTrigger<T extends BaseTrigger = BaseTrigger>(
  target: any
): T {
  return Reflect.getOwnMetadata(OperatorType.Trigger, target)
}

export * from './api'
export * from './type'

export * from './operator/middleware'
export * from './operator/http'
export * from './operator/validate'
