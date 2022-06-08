import type { IMidwayContainer } from '@midwayjs/core'
import {
  AbstractRouter,
  ApiRouter,
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
import { MidwayFrameworkAdapter } from './component/adapter'
import { MidwayApplicationManager } from '@midwayjs/core'
import { HOOKS_DEV_MODULE_PATH } from '../internal/const'

const debug = createDebug('hooks: component')

export function HooksComponent(runtimeConfig: RuntimeConfig = {}) {
  if (runtimeConfig.middleware !== undefined) {
    validateArray(runtimeConfig.middleware, 'runtimeConfig.middleware')
  }

  const useSourceFile = isDev()
  debug('useSourceFile: %s', useSourceFile)

  const source = getSource({ useSourceFile })
  const router = getRouter(source)
  const midway = new MidwayFrameworkAdapter(source, router, null, null)

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

  debug('HOOKS_DEV_MODULE_PATH', process.env[HOOKS_DEV_MODULE_PATH])
  if (process.env[HOOKS_DEV_MODULE_PATH]) {
    const devApis = loadApiModules(
      process.env[HOOKS_DEV_MODULE_PATH],
      router instanceof ApiRouter ? router : new ApiRouter()
    )
    debug('load dev apis %O', devApis)
    apis.push(...devApis)
  }

  midway.registerApiRoutes(apis)

  const Configuration = createConfiguration({
    namespace: '@midwayjs/hooks',
    async onReady(container: IMidwayContainer) {
      midway.container = container
      const applicationManager = await container.getAsync(
        MidwayApplicationManager
      )
      applicationManager
        .getApplications(['koa', 'faas'])
        .forEach((app) => (midway.app = app))
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
  const { apis } = loadApiFiles(source, router)
  const routes = apis.map((file) => parseApiModule(require(file), file, router))
  return flattenDeep(routes)
}
