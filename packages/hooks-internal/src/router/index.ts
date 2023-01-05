import {
  AbstractRouter,
  Api,
  ApiModule,
  ApiRoute,
  ApiRouter,
  createDebug,
  Get,
  isFunction,
  OperatorType,
  parseApiModule as parseApiModuleBase,
  Post,
  urlJoin,
} from '@midwayjs/hooks-core'
import { getConfig } from '../config'
import { join } from 'upath'
import { run } from '@midwayjs/glob'
import { FileSystemRouter } from './file'
import { getProjectRoot } from '../root'
import pickBy from 'lodash/pickBy'
import parseFunctionArgs from 'fn-args'

const debug = createDebug('hooks-internal: router')

type GetSourceOptions = {
  useSourceFile: boolean
}

export function getRouter(source: string): AbstractRouter {
  const { routes, legacy } = getConfig()

  if (Array.isArray(routes) && routes.length > 0) {
    return new FileSystemRouter({ source, routes, legacy })
  }

  return new ApiRouter()
}

export function getSource(options: GetSourceOptions) {
  const root = getProjectRoot()
  const {
    source,
    build: { outDir },
  } = getConfig()

  return join(root, options.useSourceFile ? source : outDir)
}

export function normalizePath(router: AbstractRouter, api: ApiRoute) {
  const { trigger, file } = api

  if (router instanceof FileSystemRouter) {
    const basePath = router.getRoute(file).basePath
    return urlJoin(basePath, trigger.path, {})
  }

  return trigger.path
}

type LoadOptions = {
  source: string
  router: AbstractRouter
}

export function loadApiFiles(options: LoadOptions) {
  const { source, router } = options

  debug('load source: %s', source)

  const files = run(['**/*.{ts,js}'], {
    cwd: source,
    ignore: [
      '**/node_modules/**',
      '**/*.d.ts',
      '**/*.{test,spec}.{ts,tsx,js,jsx,mjs}',
      '**/_client/**/*.js',
      '**/configuration.{ts,js}',
    ],
  })

  debug('scan files: %O', files)
  if (files.length === 0) {
    console.warn('No api files found, source is:', source)
  }

  const apis = files.filter(
    (file) =>
      router.isSourceFile(file, source) &&
      router.isApiFile({ file, mod: require(file) })
  )

  debug('api files: %O', apis)

  return {
    apis,
    files,
  }
}

export function parseApiModule(
  mod: ApiModule,
  file: string,
  router: AbstractRouter
) {
  if (router instanceof FileSystemRouter) {
    for (const [name, fn] of Object.entries(pickBy(mod, isFunction))) {
      if (!Reflect.getMetadata(OperatorType.Trigger, fn)) {
        // default is http
        const HttpMethod = parseFunctionArgs(fn).length === 0 ? Get : Post
        mod[name] = Api(HttpMethod(), fn)
      }
    }
  }
  return parseApiModuleBase(mod, file, router)
}
