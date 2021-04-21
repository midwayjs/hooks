import { ApiFunction } from '@midwayjs/hooks-core'
import { ServerRouter } from '../../router'
import { InternalConfig, RuntimeConfig } from '../../types/config'

export interface CreateApiParam {
  fn: ApiFunction
  file: string
  isExportDefault: boolean
}

export type ComponentConfig = {
  runtime: RuntimeConfig
  internal: InternalConfig
  router: ServerRouter
  root: string
}

export type Class<T = unknown, Arguments extends any[] = any[]> = new (
  ...arguments_: Arguments
) => T
