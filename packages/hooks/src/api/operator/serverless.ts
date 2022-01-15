import {
  FaaSMetadata,
  ServerlessTrigger,
  ServerlessTriggerType,
} from '@midwayjs/decorator'
import { BaseTrigger, Operator, OperatorType } from '@midwayjs/hooks-core'
import { HooksTrigger } from './type'

export interface ServerlessTimerTrigger extends HooksTrigger {
  type: ServerlessTriggerType.TIMER
  options: FaaSMetadata.TimerTriggerOptions
}

function parseArgs({ args }) {
  const event = args[0]
  return event?.args || []
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
        parseArgs,
        handlerDecorators: [
          ServerlessTrigger(ServerlessTriggerType.TIMER, options),
        ],
      })
    },
  }
}

export interface MTopTrigger extends HooksTrigger {
  type: ServerlessTriggerType.MTOP
}

export function MTop(): Operator<void> {
  return {
    name: ServerlessTriggerType.MTOP,
    metadata({ setMetadata }) {
      setMetadata<MTopTrigger>(OperatorType.Trigger, {
        type: ServerlessTriggerType.MTOP,
        parseArgs,
        handlerDecorators: [ServerlessTrigger(ServerlessTriggerType.MTOP)],
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
        parseArgs,
        handlerDecorators: [ServerlessTrigger(ServerlessTriggerType.HSF)],
      })
    },
  }
}
