import { basename, extname, removeExt, toUnix } from 'upath'
import { AbstractRouter } from './base'
import urlJoin from 'proper-url-join'
import some from 'lodash/some'
import { OperatorType } from '../decorate/type'
import { DECORATE_BASE_PATH } from '../common'

export type DecoratorRouterConfig = {
  source?: string
  basePath?: string
}

// TODO support manual setup
export class DecorateRouter extends AbstractRouter {
  constructor(public config: DecoratorRouterConfig) {
    super(config.source)
    config.basePath ??= DECORATE_BASE_PATH
  }

  isApiFile(file: string): boolean {
    if (
      !super.isJavaScriptFile(file) ||
      !this.isPathInside(toUnix(file), toUnix(this.source))
    ) {
      return false
    }

    try {
      return this.hasExportApiRoutes(require(file))
    } catch (error) {
      console.log('require error', error)
      return false
    }
  }

  hasExportApiRoutes(mod: any) {
    return some(mod, (exp) => !!Reflect.getMetadata(OperatorType.Trigger, exp))
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
