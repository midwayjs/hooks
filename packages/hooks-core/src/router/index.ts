import inside from 'is-path-inside'
import { kebabCase } from 'lodash'
import {
  basename,
  dirname,
  extname,
  join,
  relative,
  toUnix,
  removeExt,
} from 'upath'

import { InternalConfig } from '..'
import { duplicateLogger } from './logger'

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

    return routes[index]
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
         * /apis/lambda/note/index.ts -> 'note'
         */
        relative(lambdaDirectory, dirname(file)),
        /**
         * index -> ''
         * demo -> '/demo'
         */
        fileRoute,
        // underscore: getNoteList -> _getNoteList
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

  getFunctionId(file: string, functionName: string, isExportDefault: boolean) {
    const relativePath = relative(this.source, file)
    // src/apis/lambda/index.ts -> apis-lambda-index
    const id = kebabCase(removeExt(relativePath, extname(relativePath)))
    const name = [id, isExportDefault ? '' : `-${functionName}`].join('')
    return name.toLowerCase()
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
