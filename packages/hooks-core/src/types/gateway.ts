import {
  IMidwayApplication,
  IMidwayContainer,
  IMidwayContext,
} from '@midwayjs/core'

import { ApiFunction } from '..'
import { ServerRouter } from '../router'
import { InternalConfig, RuntimeConfig, ServerRoute } from './config'

export type ComponentConfig = {
  runtime: RuntimeConfig
  internal: InternalConfig
  router: ServerRouter
  root: string
}

export type Class<T = unknown, Arguments extends any[] = any[]> = new (
  ...arguments_: Arguments
) => T

export interface CreateApiParam {
  fn: ApiFunction

  id: string

  httpPath: string
}

export interface HooksGatewayAdapter {
  config: ComponentConfig
  container: IMidwayContainer
  app: IMidwayApplication<IMidwayContext>

  createApi(config: CreateApiParam): void
  afterCreate?(): void

  is(route: ServerRoute<any>): boolean
}
