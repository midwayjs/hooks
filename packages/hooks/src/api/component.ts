import type { IMidwayContainer } from '@midwayjs/core'
import {
  AbstractRouter,
  createDebug,
  parseApiModule,
  useFrameworkAdapter,
  validateArray,
} from '@midwayjs/hooks-core'
import {
  getHydrateOptions,
  getRouter,
  getSource,
  isDev,
  isHydrate,
  loadApiFiles,
  RuntimeConfig,
} from '../internal'
import { createConfiguration } from './configuration'
import flattenDeep from 'lodash/flattenDeep'
import { MidwayApplication, MidwayFrameworkAdapter } from './component/adapter'

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

  useFrameworkAdapter({
    name: 'Midway',
    handleResponseMetaData: midway.handleResponseMetaData,
  })

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
