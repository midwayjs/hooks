import { ServerRouterConfig } from '../router'

export interface UserConfig extends Omit<ServerRouterConfig, 'source'> {
  [key: string]: any
}
