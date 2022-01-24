import type { IMidwayContainer } from '@midwayjs/core'
import {
  AbstractRouter,
  createDebug,
  parseApiModule,
  validateArray,
} from '@midwayjs/hooks-core'
import { getRouter, getSource, isDev, RuntimeConfig } from '../internal'
import { createConfiguration } from './configuration'
import { run } from '@midwayjs/glob'
import flattenDeep from 'lodash/flattenDeep'
import { MidwayApplication, MidwayFrameworkAdapter } from './component/adapter'
import { getHydrateOptions, isHydrate } from '../internal/bundle/hydrate'

const debug = createDebug('hooks: component')

export function HooksComponent(runtimeConfig: RuntimeConfig = {}) {
  if (runtimeConfig.middleware !== undefined) {
    validateArray(runtimeConfig.middleware, 'runtimeConfig.middleware')
  }

  const useSourceFile = isDev()
  debug('useSourceFile: %s', useSourceFile)

  const source = getSource({ useSourceFile })
  const router = getRouter(source)
  const midway = new MidwayFrameworkAdapter(router, null, null)

  // TODO Rely on file system
  const apis = isHydrate()
    ? loadHydrateModules(router)
    : loadApiModules(source, router)

  if (apis.length === 0) {
    console.warn('No api routes found, source is:', source)
  }

  midway.registerApiRoutes(apis)

  const Configuration = createConfiguration({
    namespace: '@midwayjs/hooks',
    async onReady(container: IMidwayContainer, app: MidwayApplication) {
      midway.container = container
      midway.app = app

      midway.registerGlobalMiddleware(runtimeConfig.middleware)
      midway.bindControllers()
    },
  })

  return { Configuration }
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

function loadHydrateModules(router: AbstractRouter) {
  const { modules } = getHydrateOptions()
  debug('load hydrate modules %O', modules)
  const routes = modules.map(({ mod, file }) =>
    parseApiModule(mod, file, router)
  )
  return flattenDeep(routes)
}

function loadApiModules(source: string, router: AbstractRouter) {
  const routes = loadApiFiles(source, router).map((file) =>
    parseApiModule(require(file), file, router)
  )
  return flattenDeep(routes)
}
