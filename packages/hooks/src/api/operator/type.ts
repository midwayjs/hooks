import { BaseTrigger } from '@midwayjs/hooks-core'

export interface HooksTrigger extends BaseTrigger {
  parseArgs: (inputs: { ctx: any; args: any[] }) => any[]
}
