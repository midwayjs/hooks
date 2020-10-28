import inside from 'is-path-inside'
import { LambdaMethodPrefix } from './const'
import { basename, dirname, extname, join, relative, resolve, toUnix } from 'upath'
import chalk from 'chalk'
import { transform } from '@midwayjs/serverless-spec-builder'
import type { FunctionRule, FunctionsRule, SpecStructureWithGateway } from '@midwayjs/hooks-shared'

const defaultFunctionsRule: FunctionsRule = {
  source: '/src/apis',
  rules: [
    {
      baseDir: 'lambda',
      events: {
        http: {
          basePath: '/api',
          underscore: true,
        },
      },
    },
  ],
}

export class RouteHelper {
  root: string
  routes = new Map<string, string>()
  private _spec: SpecStructureWithGateway = null

  get spec(): SpecStructureWithGateway {
    this._spec = this._spec || transform(resolve(this.root, 'f.yml'))
    return this._spec
  }

  get functionsRule() {
    return Array.isArray(this.spec?.functionsRule?.rules) ? this.spec.functionsRule : defaultFunctionsRule
  }

  // src/apis
  get source() {
    return join(this.root, this.functionsRule.source)
  }

  getLambdaDirectory(rule: FunctionRule) {
    return join(this.root, this.functionsRule.source, rule.baseDir)
  }

  getRuleBySourceFilePath(sourceFilePath: string) {
    const { source, rules } = this.functionsRule
    const dirs = rules.map((rule) => join(this.root, source, rule.baseDir))
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

  getHTTPPath(filePath: string, method: string, isExportDefault: boolean) {
    const rule = this.getRuleBySourceFilePath(filePath)
    const lambdaDirectory = this.getLambdaDirectory(rule)

    const { isCatchAllRoutes, filename } = parseRoute(basename(filePath, extname(filePath)))
    const fileRoute = filename === 'index' ? '' : filename
    const methodPrefix = rule.events.http.underscore ? LambdaMethodPrefix : ''
    const func = isExportDefault ? '' : `${methodPrefix}${method}`

    const api = join(
      rule.events.http.basePath,
      /**
       * /apis/lambda/index.ts -> ''
       * /apis/lambda/todo/index.ts -> 'todo'
       */
      relative(lambdaDirectory, dirname(filePath)),
      /**
       * index -> ''
       * demo -> '/demo'
       */
      fileRoute,
      // getTodoList -> _getTodoList
      func,
      isCatchAllRoutes ? '/*' : ''
    )

    /**
     * 重复的路由
     */
    const originPath = this.routes.get(api)
    if (originPath && originPath !== toUnix(filePath)) {
      console.log(
        '[ %s ] Duplicate routes detected. %s and %s both resolve to %s. Reference: %s',
        chalk.yellow('warn'),
        chalk.cyan(relative(this.root, originPath)),
        chalk.cyan(relative(this.root, filePath)),
        chalk.cyan(api),
        'https://www.yuque.com/midwayjs/faas/et7x4k'
      )
    }

    this.routes.set(api, toUnix(filePath))
    return api
  }
}

export function parseRoute(filename: string) {
  const re = /\[\.{3}(.+)]/

  return {
    isCatchAllRoutes: re.test(filename),
    filename: re.exec(filename)?.[1] || filename,
  }
}

export const helper = new RouteHelper()
