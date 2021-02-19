import inside from 'is-path-inside'
import {
  basename,
  dirname,
  extname,
  join,
  relative,
  resolve,
  toUnix,
} from 'upath'
import { transform } from '@midwayjs/serverless-spec-builder'
import type { FunctionRule, HooksSpecStructure } from '@midwayjs/hooks-shared'
import chalk from 'chalk'

const defaultSource = '/src/apis'
const LambdaMethodPrefix = '_'

export class HooksRouter {
  root: string
  routes = new Map<string, string>()
  private _spec: HooksSpecStructure = null

  private duplicateWarning: Function

  constructor(root: string, duplicateWarning = duplicateLogger) {
    this.root = root
    this.duplicateWarning = duplicateWarning
  }

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

  // src/apis/lambda
  getLambdaDirectory(rule: FunctionRule) {
    return join(this.source, rule.baseDir)
  }

  getRuleBySourceFilePath(sourceFilePath: string) {
    const { rules } = this.functionsRule
    const dirs = rules.map((rule) => this.getLambdaDirectory(rule))
    const index = dirs.findIndex((dir) => this.inside(sourceFilePath, dir))
    return rules[index]
  }

  getDistPath(sourceFilePath: string) {
    const regexp = new RegExp(`${extname(sourceFilePath)}$`)
    return relative(this.source, sourceFilePath).replace(regexp, '.js')
  }

  isProjectFile(sourceFilePath: string) {
    return this.inside(sourceFilePath, this.source)
  }

  isLambdaFile(sourceFilePath: string) {
    const rule = this.getRuleBySourceFilePath(sourceFilePath)
    return !!rule
  }

  private inside(child: string, parent: string) {
    return inside(toUnix(child), toUnix(parent))
  }

  getHTTPPath(
    sourceFilePath: string,
    method: string,
    isExportDefault: boolean
  ) {
    const rule = this.getRuleBySourceFilePath(sourceFilePath)
    const lambdaDirectory = this.getLambdaDirectory(rule)

    const { isCatchAllRoutes, filename } = parseFilename(
      basename(sourceFilePath, extname(sourceFilePath))
    )
    const fileRoute = filename === 'index' ? '' : filename
    const methodPrefix = rule.events.http.underscore ? LambdaMethodPrefix : ''
    const func = isExportDefault ? '' : `${methodPrefix}${method}`

    const api = toUnix(
      join(
        rule.events.http.basePath,
        /**
         * /apis/lambda/index.ts -> ''
         * /apis/lambda/todo/index.ts -> 'todo'
         */
        relative(lambdaDirectory, dirname(sourceFilePath)),
        /**
         * index -> ''
         * demo -> '/demo'
         */
        fileRoute,
        // getTodoList -> _getTodoList
        func,
        isCatchAllRoutes ? '/*' : ''
      )
    )

    /**
     * duplicate routes
     */
    const existPath = this.routes.get(api)
    if (existPath && existPath !== toUnix(sourceFilePath)) {
      this.duplicateWarning(this.root, existPath, sourceFilePath, api)
    }
    this.routes.set(api, toUnix(sourceFilePath))

    return api
  }
}

function parseFilename(filename: string) {
  const re = /\[\.{3}(.+)]/
  const isCatchAllRoutes = re.test(filename)

  return {
    isCatchAllRoutes,
    filename: isCatchAllRoutes ? re.exec(filename)?.[1] : filename,
  }
}

function duplicateLogger(
  root: string,
  existPath: string,
  currentPath: string,
  api: string
) {
  console.log(
    '[ %s ] Duplicate routes detected. %s and %s both resolve to %s. Reference: %s',
    chalk.yellow('warn'),
    chalk.cyan(relative(root, existPath)),
    chalk.cyan(relative(root, currentPath)),
    chalk.cyan(api),
    'https://www.yuque.com/midwayjs/faas/et7x4k'
  )
}
