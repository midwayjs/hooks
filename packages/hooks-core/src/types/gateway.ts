import {
  IMidwayApplication,
  IMidwayContainer,
  IMidwayContext,
} from '@midwayjs/core'

import { ApiFunction } from '..'
import { ServerRouter } from '../router'
import { ProjectConfig, RuntimeConfig, ServerRoute } from './config'

export type ComponentOptions = {
  root: string
  router: ServerRouter
  runtimeConfig: RuntimeConfig
  projectConfig: ProjectConfig
}

export type Class<T = unknown, Arguments extends any[] = any[]> = new (
  ...arguments_: Arguments
) => T

export interface CreateApiParam {
  fn: ApiFunction

  id: string

  httpPath: string

  route?: ServerRoute
}

export interface HooksGatewayAdapter {
  options?: ComponentOptions
  container: IMidwayContainer
  app?: IMidwayApplication<IMidwayContext>

  createApi(config: CreateApiParam): void
  afterCreate?(): void

  is(route: ServerRoute): boolean
}
