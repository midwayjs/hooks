import { IMidwayApplication } from '@midwayjs/core'

import { ApiFunction } from '..'
import { FileRouter } from '../router'
import { ProjectConfig, Route, RuntimeConfig } from './config'

export type GatewayAdapterOptions = {
  root: string
  projectConfig: ProjectConfig
}

export interface ComponentOptions extends GatewayAdapterOptions {
  router?: FileRouter
  runtimeConfig?: RuntimeConfig
}

export type Class<T = unknown, Arguments extends any[] = any[]> = new (
  ...arguments_: Arguments
) => T

export interface CreateApiOptions {
  fn: ApiFunction

  functionId: string
  functionName?: string
  isExportDefault?: boolean

  file?: string
  route?: Route
}

interface GatewayBuilder {
  createApi(options: CreateApiOptions): void
}

export type OnReadyArgs = {
  app: IMidwayApplication<any>
  runtimeConfig: RuntimeConfig
}

export interface HooksGatewayAdapter extends GatewayBuilder {
  is(route: Route): boolean
  onReady?(args: OnReadyArgs): Promise<void> | void
}
