import { BaseTrigger, OperatorType } from './type'

export function getApiTrigger(target: any): BaseTrigger {
  return Reflect.getOwnMetadata(OperatorType.Trigger, target)
}

export * from './compose'
export * from './api'
export * from './type'

export * from './operator/middleware'
export * from './operator/http'
export * from './operator/validate'
