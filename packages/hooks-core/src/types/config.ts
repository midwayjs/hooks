import { ServerRouterConfig } from '../router'
import { MidwayFrameworkType } from '@midwayjs/core'

export { MidwayFrameworkType } from '@midwayjs/core'

export interface UserConfig extends Omit<ServerRouterConfig, 'source'> {
  framework: MidwayFrameworkType
  [key: string]: any
}
