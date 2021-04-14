import {
  IMidwayApplication,
  IMidwayContainer,
  IMidwayContext,
} from '@midwayjs/core'
import { ApiFunction, ServerRoute } from '../..'
import { ComponentConfig } from './interface'

export interface CreateApiParam {
  fn: ApiFunction
  file: string
  isExportDefault: boolean
}

export interface HooksGatewayAdapter {
  config: ComponentConfig
  container: IMidwayContainer
  app: IMidwayApplication<IMidwayContext>

  createApi(config: CreateApiParam): void
  is(route: ServerRoute): boolean
  afterCreate?(): void

  onError(ctx: any, error: any): void

  getGlobalMiddleware?(): any[]
}
