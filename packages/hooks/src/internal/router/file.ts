import kebabCase from 'lodash/kebabCase'
import last from 'lodash/last'
import { extname, join, relative, removeExt, toUnix } from 'upath'
import { AbstractRouter, Route, urlJoin } from '@midwayjs/hooks-core'

export enum RouteKeyword {
  INDEX = 'index',
  CATCH_ALL = '/*',
  DYNAMIC = ':',
}

export interface FileSystemRouterConfig {
  source: string
  routes: Route[]
}

type Part = {
  content: string
  dynamic: boolean
  qualifier?: string
  catchAll?: boolean
}

export class FileSystemRouter extends AbstractRouter {
  constructor(public config: FileSystemRouterConfig) {
    super()
  }

  getApiDirectory(baseDir: string) {
    return join(this.config.source, baseDir)
  }

  getFunctionId(file: string, functionName: string, isExportDefault: boolean) {
    const relativePath = relative(this.config.source, file)
    // src/apis/lambda/index.ts -> apis-lambda-index
    const id = kebabCase(removeExt(relativePath, extname(relativePath)))
    const name = [id, isExportDefault ? '' : `-${functionName}`].join('')
    return name.toLowerCase()
  }

  getRoute(file: string) {
    return this.config.routes.find((route) => {
      const apiDir = this.getApiDirectory(route.baseDir)
      return this.isPathInside(toUnix(file), toUnix(apiDir))
    })
  }

  isApiFile({ file }) {
    const route = this.getRoute(file)
    return !!route
  }

  functionToHttpPath(
    file: string,
    functionName: string,
    exportDefault: boolean
  ) {
    const { baseDir } = this.getRoute(file)

    const filePath = removeExt(
      relative(this.getApiDirectory(baseDir), file),
      extname(file)
    )

    return urlJoin(this.buildUrl(filePath, exportDefault ? '' : functionName), {
      trailingSlash: false,
    })
  }

  buildUrl(file: string, functionName = '') {
    const parts: Part[] = file
      .split(/\[(.+?\(.+?\)|.+?)\]/)
      .map((str, i) => {
        if (!str) return null
        const dynamic = i % 2 === 1

        const [, content, qualifier] = dynamic
          ? /([^(]+)(\(.+\))?$/.exec(str)
          : [null, str, null]

        return {
          content,
          dynamic,
          catchAll: /^\.{3}.+$/.test(content),
          qualifier,
        }
      })
      .filter(Boolean)

    const catchAllIndex = parts.findIndex((part) => part.catchAll)
    if (catchAllIndex !== -1 && catchAllIndex !== parts.length - 1) {
      throw new Error(
        `Catch all routes must be the last part of the path. Current input: ${file}`
      )
    }

    const segments: string[] = []

    for (let [idx, { content, dynamic, catchAll }] of parts.entries()) {
      if (!content) continue

      if (catchAll) {
        if (content.slice(3) !== RouteKeyword.INDEX) {
          segments.push(content.slice(3))
        }
        continue
      }

      /**
       * /[api]/id -> /:api/id
       */
      if (dynamic) {
        segments.push(`${RouteKeyword.DYNAMIC}${content}`)
        continue
      }

      if (idx === parts.length - 1) {
        const contents = content.split('/')
        if (last(contents) === RouteKeyword.INDEX) {
          contents.pop()
          segments.push(contents.join('/'))
          continue
        }
      }

      segments.push(content)
    }

    segments.push(functionName)
    if (catchAllIndex !== -1) {
      segments.push(RouteKeyword.CATCH_ALL)
    }

    return urlJoin.apply(null, [...segments, {}])
  }
}
