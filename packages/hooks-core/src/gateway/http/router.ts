import { basename, dirname, extname, join, relative, toUnix } from 'upath'

import { FileRouter } from '../../router'
import { duplicateLogger } from './logger'

export class HTTPRouter extends FileRouter {
  routes = new Map<string, string>()

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
    const { basePath, baseDir, underscore } = this.getRoute(file)
    const lambdaDirectory = this.getApiDirectory(baseDir)

    const { isCatchAllRoutes, filename } = this.parseFilename(
      basename(file, extname(file))
    )
    const fileRoute = filename === 'index' ? '' : filename
    // TODO remove underscore support in future
    const func = isExportDefault ? '' : `${underscore ? '_' : ''}${method}`

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

  parseFilename(filename: string) {
    const re = /\[\.{3}(.+)]/
    const isCatchAllRoutes = re.test(filename)

    return {
      isCatchAllRoutes,
      filename: isCatchAllRoutes ? re.exec(filename)?.[1] : filename,
    }
  }
}
