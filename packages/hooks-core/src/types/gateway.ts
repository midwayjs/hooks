import {
  IMidwayApplication,
  IMidwayContainer,
  IMidwayContext,
} from '@midwayjs/core'

import { ApiFunction } from '..'
import { FileRouter } from '../router/file'
import { ProjectConfig, RuntimeConfig, Route } from './config'

export type ComponentOptions = {
  root: string
  router: FileRouter
  runtimeConfig: RuntimeConfig
  projectConfig: ProjectConfig
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

export interface HooksGatewayAdapter {
  options?: ComponentOptions
  container: IMidwayContainer
  app?: IMidwayApplication<IMidwayContext>

  createApi(config: CreateApiOptions): void
  afterCreate?(): void
}

export interface HooksGatewayAdapterStatic {
  new (options?: ComponentOptions): HooksGatewayAdapter
  is(route: Route): any

  router: Class<FileRouter>

  createApiClient(file: string, code: string, router: FileRouter): any
}
