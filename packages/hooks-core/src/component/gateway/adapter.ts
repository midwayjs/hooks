import {
  IMidwayApplication,
  IMidwayContainer,
  IMidwayContext,
} from '@midwayjs/core'
import { ApiFunction } from '../..'
import { ComponentConfig } from './interface'

export interface CreateApiParam {
  fn: ApiFunction
  file: string

  fnName: string
}

export interface HooksGatewayAdapter {
  config: ComponentConfig
  container: IMidwayContainer
  app: IMidwayApplication<IMidwayContext>

  createApi(config: CreateApiParam): void
  afterCreate?(): void

  onError(ctx: any, error: any): void

  getGlobalMiddleware?(): any[]
}
