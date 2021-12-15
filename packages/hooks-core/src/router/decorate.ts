import { basename, extname, removeExt } from 'upath'
import { AbstractRouter } from './base'
import urlJoin from 'proper-url-join'
import some from 'lodash/some'
import { OperatorType } from '../decorate/type'
import { DECORATE_BASE_PATH } from '../common'

type DecoratorRouterConfig = {
  basePath?: string
}

export class DecorateRouter extends AbstractRouter {
  constructor(public config: DecoratorRouterConfig) {
    super()
    this.config.basePath ??= DECORATE_BASE_PATH
  }

  isApiFile(file: string): boolean {
    if (!super.isJavaScriptFile(file)) {
      return false
    }

    const mod = require(file)
    return some(mod, (exp) => Reflect.getMetadata(OperatorType.Trigger, exp))
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
