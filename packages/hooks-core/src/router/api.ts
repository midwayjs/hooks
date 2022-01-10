import { basename, extname, removeExt, toUnix } from 'upath'
import { AbstractRouter } from './base'
import urlJoin from 'proper-url-join'
import some from 'lodash/some'
import { OperatorType } from '../api'
import { API_BASE_PATH } from '../common'

export type ApiRouterConfig = {
  source?: string
  basePath?: string
}


export class ApiRouter extends AbstractRouter {
  constructor(public config: ApiRouterConfig) {
    super()
    config.basePath ??= API_BASE_PATH
  }

  isApiFile(file: string): boolean {
    if (
      !super.isJavaScriptFile(file) ||
      !this.isPathInside(toUnix(file), toUnix(this.config.source))
    ) {
      return false
    }

    try {
      const mod = require(file)
      if (mod.__JITI_ERROR__) {
        throw mod.__JITI_ERROR__
      }
      return this.hasExportApiRoutes(mod)
    } catch (error) {
      console.log('require error', error)
      return false
    }
  }

  hasExportApiRoutes(mod: any) {
    return some(
      mod,
      (exp) =>
        typeof exp === 'function' &&
        !!Reflect.getMetadata(OperatorType.Trigger, exp)
    )
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
