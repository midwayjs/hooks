import kebabCase from 'lodash/kebabCase'
import { extname, join, relative, removeExt, toUnix } from 'upath'

import { ProjectConfig } from '../types'
import { isDevelopment, isPathInside } from '../util'

interface RouterOptions {
  root: string
  projectConfig: ProjectConfig
  useSourceFile?: boolean
}

export class FileRouter {
  root: string
  projectConfig: ProjectConfig
  useSourceFile: boolean

  constructor(options: RouterOptions) {
    this.root = options.root
    this.projectConfig = options.projectConfig
    this.useSourceFile = options.useSourceFile ?? isDevelopment()
  }

  get source() {
    // src
    if (this.useSourceFile) {
      return join(this.root, this.projectConfig.source)
    }
    // dist
    return join(this.root, this.projectConfig.build.outDir)
  }

  // src/apis/lambda
  getApiDirectory(baseDir: string) {
    return join(this.source, baseDir)
  }

  getRoute(file: string) {
    const { routes } = this.projectConfig
    return routes.find((route) => {
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
}
