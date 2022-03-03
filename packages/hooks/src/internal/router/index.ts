import {
  AbstractRouter,
  ApiRoute,
  ApiRouter,
  createDebug,
  urlJoin,
} from '@midwayjs/hooks-core'
import { getConfig, getProjectRoot } from '../config'
import { join } from 'upath'
import { run } from '@midwayjs/glob'
import { FileSystemRouter } from './file'

const debug = createDebug('hooks: router')

type GetSourceOptions = {
  useSourceFile: boolean
}

export function getRouter(source: string): AbstractRouter {
  const { routes } = getConfig()

  if (Array.isArray(routes) && routes.length > 0) {
    return new FileSystemRouter({ source, routes })
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

export function normalizeUrl(router: AbstractRouter, api: ApiRoute) {
  const { trigger, file } = api

  if (router instanceof FileSystemRouter) {
    const basePath = router.getRoute(file).basePath
    return urlJoin(basePath, trigger.path, {})
  }

  return trigger.path
}

export function loadApiFiles(source: string, router: AbstractRouter) {
  debug('load source: %s', source)

  const files = run(['**/*.{ts,js}'], {
    cwd: source,
    ignore: [
      '**/node_modules/**',
      '**/*.d.ts',
      '**/*.{test,spec}.{ts,tsx,js,jsx,mjs}',
      '**/_client/**/*.js',
    ],
  })

  debug('scan files: %O', files)

  const apiFiles = files.filter(
    (file) =>
      router.isSourceFile(file, source) &&
      router.isApiFile({ file, mod: require(file) })
  )

  debug('api files: %O', apiFiles)
  return apiFiles
}
