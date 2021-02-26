import { WebRouterConfig } from '../router'

export interface UserConfig extends Omit<WebRouterConfig, 'source'> {
  [key: string]: any
}
