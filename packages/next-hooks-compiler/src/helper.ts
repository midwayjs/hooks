import inside from 'is-path-inside'
import { LambdaMethodPrefix } from './const'
import { basename, dirname, extname, join, relative, resolve, toUnix } from 'upath'
import { transform } from '@midwayjs/serverless-spec-builder'
import type { FunctionRule, FunctionsRule, SpecStructureWithGateway } from '@midwayjs/hooks-shared'
import { duplicateWarning } from './routes'

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
    return join(this.root, this.functionsRule.source || defaultFunctionsRule.source)
  }

  getLambdaDirectory(rule: FunctionRule) {
    return join(this.source, rule.baseDir)
  }

  getRuleBySourceFilePath(sourceFilePath: string) {
    const { rules } = this.functionsRule
    const dirs = rules.map((rule) => join(this.source, rule.baseDir))
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

  getHTTPPath(currentPath: string, method: string, isExportDefault: boolean) {
    const rule = this.getRuleBySourceFilePath(currentPath)
    const lambdaDirectory = this.getLambdaDirectory(rule)

    const { isCatchAllRoutes, filename } = parseRoute(basename(currentPath, extname(currentPath)))
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
        relative(lambdaDirectory, dirname(currentPath)),
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
    if (existPath && existPath !== toUnix(currentPath)) {
      duplicateWarning(this.root, existPath, currentPath, api)
    }
    this.routes.set(api, toUnix(currentPath))

    return api
  }
}

function parseRoute(filename: string) {
  const re = /\[\.{3}(.+)]/

  return {
    isCatchAllRoutes: re.test(filename),
    filename: re.exec(filename)?.[1] || filename,
  }
}

export const helper = new RouteHelper()
