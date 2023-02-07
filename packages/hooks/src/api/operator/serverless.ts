import {
  FaaSMetadata,
  ServerlessTrigger,
  ServerlessTriggerType,
} from '@midwayjs/core'
import { Operator, OperatorType } from '@midwayjs/hooks-core'
import { HooksTrigger } from './type'

export interface ServerlessTrigger extends HooksTrigger {
  type: any
  options: any
}

function parseArgs({ args }) {
  const event = args[0]
  return event?.args || []
}

function createServerlessTrigger<O>(type: any) {
  return (options?: O): Operator<void> => {
    return {
      name: type,
      metadata({ setMetadata }) {
        setMetadata<ServerlessTrigger>(OperatorType.Trigger, {
          type,
          options: options || {},
          parseArgs,
        })
      },
    }
  }
}

export const Timer = createServerlessTrigger<FaaSMetadata.TimerTriggerOptions>(
  ServerlessTriggerType.TIMER
)
export const MTop = createServerlessTrigger<FaaSMetadata.MTopTriggerOptions>(
  ServerlessTriggerType.MTOP
)
export const HSF = createServerlessTrigger<FaaSMetadata.HSFTriggerOptions>(
  ServerlessTriggerType.HSF
)
export const MQ = createServerlessTrigger<FaaSMetadata.MQTriggerOptions>(
  ServerlessTriggerType.MQ
)

const SSRTrigger = createServerlessTrigger<FaaSMetadata.SSRTriggerOptions>(
  ServerlessTriggerType.SSR
)
export const SSR = (path: string, options?: FaaSMetadata.SSRTriggerOptions) => {
  const metadata = Object.assign({}, options, { path, method: 'get' })
  return SSRTrigger(metadata)
}
