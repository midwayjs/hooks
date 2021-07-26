import inside from 'is-path-inside'
import { kebabCase } from 'lodash'
import { extname, join, relative, removeExt, toUnix } from 'upath'

import { ProjectConfig, Route } from '../types/config'

interface RouterOptions {
  root: string
  projectConfig: ProjectConfig
  useSourceFile: boolean
}

export class FileRouter {
  root: string

  projectConfig: ProjectConfig

  useSourceFile: boolean

  constructor(options: RouterOptions) {
    const { root, projectConfig, useSourceFile } = options
    this.root = root
    this.projectConfig = projectConfig
    this.useSourceFile = useSourceFile
  }

  get source() {
    if (this.useSourceFile) {
      return join(this.root, this.projectConfig.source)
    }
    return join(this.root, this.projectConfig.build.outDir)
  }

  // src/apis/lambda
  getApiDirectory(baseDir: string) {
    return join(this.source, baseDir)
  }

  getRoute(file: string) {
    const { routes } = this.projectConfig
    return routes.find((route) => {
      const dir = this.getApiDirectory(route.baseDir)
      return this.inside(file, dir)
    })
  }

  getGatewayByRoute(route: Route) {
    const gateway = this.projectConfig.gateway.find((adapter) =>
      adapter.is(route)
    )

    if (!gateway) {
      throw new Error(
        `Can't find the correct gateway adapter, please check if midway.config.ts is correct`
      )
    }

    return gateway
  }

  isApiFile(file: string) {
    if (file.endsWith('.test.ts') || file.endsWith('.test.js')) {
      return false
    }

    if (extname(file) !== '.ts' && extname(file) !== '.js') {
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

  protected inside(child: string, parent: string) {
    return inside(toUnix(child), toUnix(parent))
  }
}
