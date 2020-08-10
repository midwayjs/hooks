import inside from 'path-is-inside'
import fse from 'fs'
import { LambdaMethodPrefix, MidwayHookApiDirectory } from './const'
import { resolve, dirname, join, relative, basename, extname } from 'path'
import chalk from 'chalk'

export class RouteHelper {
  rules: helperRuleItems
  root: string
  prefix = '/api'
  routes = new Map<string, string>()

  get projectRoot() {
    if (fse.existsSync(resolve(this.root, 'f.yml'))) {
      return this.root
    }

    return resolve(this.root, '../../')
  }

  get lambdaDirectory() {
    return resolve(this.source, MidwayHookApiDirectory)
  }

  get source() {
    return this.root
  }

  getDistPath(sourceFilePath: string) {
    const regexp = new RegExp(`${extname(sourceFilePath)}$`)
    return relative(this.source, sourceFilePath).replace(regexp, '.js')
  }

  isLambdaFile(sourceFilePath: string) {
    return !!this.findFileMatchRule(sourceFilePath)
  }

  getLambdaDirectoryByRule(rule) {
    return resolve(this.source, rule?.baseDir || '')
  }

  getLambdaDirectory(sourceFilePath: string) {
    const rule = this.findFileMatchRule(sourceFilePath)
    if (rule) {
      return this.getLambdaDirectoryByRule(rule)
    }
    return this.lambdaDirectory
  }

  findFileMatchRule(sourceFilePath: string, matchEvent?: 'http') {
    return this.rules.find((rule) => {
      if (matchEvent) {
        const findEvent = rule.events?.find((event) => !!event[matchEvent])
        if (!findEvent) {
          return false
        }
      }
      return inside(sourceFilePath, this.getLambdaDirectoryByRule(rule))
    })
  }

  isProjectFile(sourceFilePath: string) {
    return inside(sourceFilePath, this.source)
  }

  getHTTPPath(filePath: string, method: string, isExportDefault: boolean) {
    const filename = basename(filePath, extname(filePath))
    const file = filename === 'index' ? '' : filename
    const func = isExportDefault ? '' : `${LambdaMethodPrefix}${method}`

    const rule = this.findFileMatchRule(filePath, 'http')
    const event = rule.events?.find((event) => !!event.http)
    const prefix = event?.http?.basePath || this.prefix
    const lambdaDirectory = this.getLambdaDirectoryByRule(rule)

    const api = join(
      prefix,
      /**
       * /apis/lambda/index.ts -> ''
       * /apis/lambda/todo/index.ts -> 'todo'
       */
      relative(lambdaDirectory, dirname(filePath)),
      /**
       * index -> ''
       * demo -> '/demo'
       */
      file,
      // getTodoList -> _getTodoList
      func
    )

    /**
     * 重复的路由
     */
    const originPath = this.routes.get(api)
    if (originPath && originPath !== filePath) {
      console.log(
        '[ %s ] Duplicate routes detected. %s and %s both resolve to %s. Reference: %s',
        chalk.yellow('warn'),
        chalk.cyan(relative(this.root, originPath)),
        chalk.cyan(relative(this.root, filePath)),
        chalk.cyan(api),
        'https://www.yuque.com/midwayjs/faas/et7x4k'
      )
    }

    this.routes.set(api, filePath)
    return api
  }
}

export const helper = new RouteHelper()

export interface helperRuleItem {
  baseDir: string
  events: {
    http: {
      basePath: string
    }
    [otherEvent: string]: any
  }
}

export type helperRuleItems = helperRuleItem[]
