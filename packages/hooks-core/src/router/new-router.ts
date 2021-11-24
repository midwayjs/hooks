import kebabCase from 'lodash/kebabCase'
import {
  basename,
  dirname,
  extname,
  join,
  relative,
  toUnix,
  removeExt,
} from 'upath'

import { isPathInside, Route } from '..'

export interface RouterConfig {
  root: string
  source: string
  routes: Route[]
}

export class NewFileRouter {
  constructor(public config: RouterConfig) {}

  get source() {
    return join(this.config.root, this.config.source)
  }

  getApiDirectory(baseDir: string) {
    return join(this.source, baseDir)
  }

  getRoute(file: string) {
    return this.config.routes.find((route) => {
      const apiDir = this.getApiDirectory(route.baseDir)
      return isPathInside(toUnix(file), toUnix(apiDir))
    })
  }

  isApiFile(file: string) {
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs']
    if (!extensions.includes(extname(file))) {
      return false
    }

    const testExt = ['.test.ts', '.test.tsx', '.test.js', '.test.jsx']
    if (testExt.some((ext) => file.endsWith(ext))) {
      return false
    }

    const route = this.getRoute(file)
    return !!route
  }

  getFunctionId(file: string, functionName: string, isExportDefault: boolean) {
    const relativePath = relative(this.source, file)
    // src/apis/lambda/index.ts -> apis-lambda-index
    const id = kebabCase(removeExt(relativePath, extname(relativePath)))
    const name = [id, isExportDefault ? '' : `-${functionName}`].join('')
    return name.toLowerCase()
  }

  fileToHttpPath(file: string, functionName: string, exportDefault: boolean) {
    const { basePath, baseDir } = this.getRoute(file)

    const { isCatchAllRoutes, filename } = this.parseFilename(
      basename(file, extname(file))
    )

    const dirPath = relative(this.getApiDirectory(baseDir), dirname(file))

    const api = toUnix(
      join(
        basePath,
        /**
         * /apis/lambda/index.ts -> ''
         * /apis/lambda/note/index.ts -> 'note'
         */
        dirPath,
        /**
         * index -> ''
         * demo -> '/demo'
         */
        filename === 'index' ? '' : filename,
        exportDefault ? '' : functionName,
        isCatchAllRoutes ? '/*' : ''
      )
    )

    return api
  }

  private parseFilename(filename: string) {
    const re = /\[\.{3}(.+)]/
    const isCatchAllRoutes = re.test(filename)

    return {
      isCatchAllRoutes,
      filename: isCatchAllRoutes ? re.exec(filename)?.[1] : filename,
    }
  }
}
