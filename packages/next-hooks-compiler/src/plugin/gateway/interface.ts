import type { LambdaParam } from '@midwayjs/hooks-shared'

export interface GatewayConfig extends LambdaParam {
  handler: string
  isExportDefault?: boolean
}
