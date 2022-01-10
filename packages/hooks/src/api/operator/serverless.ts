import { FaaSMetadata, ServerlessTriggerType } from '@midwayjs/decorator'
import { BaseTrigger, Operator, OperatorType } from '@midwayjs/hooks-core'

export interface ServerlessTimerTrigger extends BaseTrigger {
  type: ServerlessTriggerType.TIMER
  options: FaaSMetadata.TimerTriggerOptions
}

export function ServerlessTimer(
  options: FaaSMetadata.TimerTriggerOptions
): Operator<void> {
  return {
    name: ServerlessTriggerType.TIMER,
    metadata({ setMetadata }) {
      setMetadata<ServerlessTimerTrigger>(OperatorType.Trigger, {
        type: ServerlessTriggerType.TIMER,
        options,
      })
    },
  }
}

export interface MTopTrigger extends BaseTrigger {
  type: ServerlessTriggerType.MTOP
}

export function MTop(): Operator<void> {
  return {
    name: ServerlessTriggerType.MTOP,
    metadata({ setMetadata }) {
      setMetadata<MTopTrigger>(OperatorType.Trigger, {
        type: ServerlessTriggerType.MTOP,
      })
    },
  }
}

export interface HSFTrigger extends BaseTrigger {
  type: ServerlessTriggerType.HSF
}

export function HSF(): Operator<void> {
  return {
    name: ServerlessTriggerType.HSF,
    metadata({ setMetadata }) {
      setMetadata<HSFTrigger>(OperatorType.Trigger, {
        type: ServerlessTriggerType.HSF,
      })
    },
  }
}
