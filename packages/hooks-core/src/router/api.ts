import { basename, extname, removeExt } from 'upath'
import { AbstractRouter } from './base'
import urlJoin from 'proper-url-join'
import some from 'lodash/some'
import { isApiFunction } from '../api/common'
import { API_BASE_PATH } from '../common'

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

  hasExportApiRoutes(mod: any) {
    return some(mod, isApiFunction)
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
