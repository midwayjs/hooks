import { extname, join, relative, resolve } from 'upath'
import { transform } from '@midwayjs/serverless-spec-builder'
import type { HooksSpecStructure } from '../types/serverless'
import { HooksRouter } from './base'

const defaultSource = '/src/apis'

export class ServerlessRouter extends HooksRouter {
  private _spec: HooksSpecStructure = null

  get spec(): HooksSpecStructure {
    this._spec = this._spec || transform(resolve(this.root, 'f.yml'))
    return this._spec
  }

  get functionsRule() {
    if (!this.spec.functionsRule) {
      throw new Error('functionsRule is required in f.yml')
    }
    return this.spec.functionsRule
  }

  get isAsyncHooksRuntime() {
    return this.spec.hooks?.runtime === 'async_hooks'
  }

  // src/apis
  get source() {
    return join(this.root, this.functionsRule.source ?? defaultSource)
  }

  getRuleBySourceFilePath(sourceFilePath: string) {
    const { rules } = this.functionsRule
    const dirs = rules.map((rule) => this.getLambdaDirectory(rule.baseDir))
    const index = dirs.findIndex((dir) => this.inside(sourceFilePath, dir))
    return rules[index]
  }

  // src/apis/lambda
  getRouteConfigBySourceFilePath(sourceFilePath: string) {
    const rule = this.getRuleBySourceFilePath(sourceFilePath)

    if (!rule) {
      return null
    }

    return {
      baseDir: rule.baseDir,
      basePath: rule.events.http.basePath,
      underscore: rule.events.http.underscore,
    }
  }

  getDistPath(sourceFilePath: string) {
    const regexp = new RegExp(`${extname(sourceFilePath)}$`)
    return relative(this.source, sourceFilePath).replace(regexp, '.js')
  }
}
