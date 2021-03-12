import inside from 'is-path-inside'
import { basename, dirname, extname, join, relative, toUnix } from 'upath'
import chalk from 'chalk'
import { InternalConfig } from '..'
import { consola } from '../util'

export class ServerRouter {
  root: string

  config: InternalConfig

  routes = new Map<string, string>()

  useSource: boolean

  constructor(root: string, config: InternalConfig, useSource = true) {
    this.root = root
    this.config = config
    this.useSource = useSource
  }

  // src/apis
  get source() {
    if (this.useSource) {
      return join(this.root, this.config.source)
    }
    return join(this.root, this.config.build.outDir)
  }

  getRouteConfig(file: string) {
    const { routes } = this.config
    const index = routes.findIndex((route) => {
      const dir = this.getApiDirectory(route.baseDir)
      return this.inside(file, dir)
    })

    if (!routes[index]) {
      return null
    }

    return {
      underscore: false,
      ...routes[index],
    }
  }

  // src/apis/lambda
  getApiDirectory(baseDir: string) {
    return join(this.source, baseDir)
  }

  isApiFile(file: string) {
    if (file.endsWith('.test.ts') || file.endsWith('.test.js')) {
      return false
    }

    if (extname(file) !== '.ts' && extname(file) !== '.js') {
      return false
    }

    const route = this.getRouteConfig(file)
    return !!route
  }

  protected inside(child: string, parent: string) {
    return inside(toUnix(child), toUnix(parent))
  }

  getBaseUrl(file: string) {
    const url = this.getHTTPPath(file, '', true)
    if (url === '/*') {
      return '/'
    }

    if (url.endsWith('/*')) {
      return url.slice(0, -2)
    }

    return url
  }

  getHTTPPath(file: string, method: string, isExportDefault: boolean) {
    const { basePath, baseDir, underscore } = this.getRouteConfig(file)
    const lambdaDirectory = this.getApiDirectory(baseDir)

    const { isCatchAllRoutes, filename } = parseFilename(
      basename(file, extname(file))
    )
    const fileRoute = filename === 'index' ? '' : filename
    // TODO remove underscore support in future
    const ApiMethodPrefix = '_'
    const methodPrefix = underscore ? ApiMethodPrefix : ''
    const func = isExportDefault ? '' : `${methodPrefix}${method}`

    const api = toUnix(
      join(
        basePath,
        /**
         * /apis/lambda/index.ts -> ''
         * /apis/lambda/todo/index.ts -> 'todo'
         */
        relative(lambdaDirectory, dirname(file)),
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
    if (existPath && existPath !== toUnix(file)) {
      duplicateLogger(this.root, existPath, file, api)
    }
    this.routes.set(api, toUnix(file))

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
  consola.info(
    '[ %s ] Duplicate routes detected. %s and %s both resolve to %s. Reference: %s',
    chalk.yellow('warn'),
    chalk.cyan(relative(root, existPath)),
    chalk.cyan(relative(root, currentPath)),
    chalk.cyan(api),
    'https://www.yuque.com/midwayjs/faas/et7x4k'
  )
}
