import kebabCase from 'lodash/kebabCase'
import last from 'lodash/last'
import urlJoin from 'proper-url-join'
import { extname, join, relative, removeExt, toUnix } from 'upath'

import { isPathInside, Route } from '..'

export enum RouteKeyword {
  INDEX = 'index',
  CATCH_ALL = '/*',
  DYNAMIC = ':',
}

export interface RouterConfig {
  root: string
  source: string
  routes: Route[]
}

type Part = {
  content: string
  dynamic: boolean
  qualifier?: string
  catchAll?: boolean
}

export class FileRouter {
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

    const filePath = removeExt(
      relative(this.getApiDirectory(baseDir), file),
      extname(file)
    )

    return toUnix(
      urlJoin(
        basePath,
        this.buildUrl(filePath, exportDefault ? '' : functionName),
        { trailingSlash: false }
      )
    )
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
