import { basename, extname, removeExt } from 'upath'
import { AbstractRouter } from './base'
import urlJoin from 'proper-url-join'
import { isApiFunction } from '../api/common'
import { API_BASE_PATH } from '../common'
import isObject from 'lodash/isObject'

export type ApiRouterConfig = {
  basePath?: string
}

export class ApiRouter extends AbstractRouter {
  constructor(public config: ApiRouterConfig = {}) {
    super()
    config.basePath ??= API_BASE_PATH
  }

  isApiFile(options): boolean {
    return this.hasExportApiRoutes(options.mod)
  }

  hasExportApiRoutes(mod: object) {
    return isObject(mod) && Object.values(mod).some(isApiFunction)
  }

  getFunctionId(
    file: string,
    functionName: string,
    exportDefault: boolean
  ): string {
    return exportDefault
      ? removeExt(basename(file), extname(file))
      : functionName
  }

  functionToHttpPath(
    file: string,
    functionName: string,
    exportDefault: boolean
  ): string {
    return urlJoin(
      this.config.basePath,
      this.getFunctionId(file, functionName, exportDefault),
      { trailingSlash: false }
    )
  }
}
