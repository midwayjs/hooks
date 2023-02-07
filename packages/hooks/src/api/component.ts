import {
  IMidwayContainer,
  ApplicationContext,
  Configuration,
  Init,
} from '@midwayjs/core'
import { __decorate } from 'tslib'
import {
  AbstractRouter,
  ApiRouter,
  createDebug,
  useFrameworkAdapter,
  validateArray,
} from '@midwayjs/hooks-core'
import {
  getHydrateOptions,
  getRouter,
  getSource,
  HOOKS_DEV_MODULE_PATH,
  isDev,
  isHydrate,
  loadApiFiles,
  parseApiModule,
  RuntimeConfig,
} from '@midwayjs/hooks-internal'
import flattenDeep from 'lodash/flattenDeep'
import { MidwayFrameworkAdapter } from './component/adapter'

const debug = createDebug('hooks: component')

export function HooksComponent(runtimeConfig: RuntimeConfig = {}) {
  if (runtimeConfig.middleware !== undefined) {
    validateArray(runtimeConfig.middleware, 'runtimeConfig.middleware')
  }

  const useSourceFile = isDev()
  debug('useSourceFile: %s', useSourceFile)

  const source = getSource({ useSourceFile })
  const router = getRouter(source)
  const midway = new MidwayFrameworkAdapter(source, router, null)

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

  const Configuration = createConfiguration(async (container) => {
    await midway.initialize(container, apis, runtimeConfig.middleware)
  })

  return { Configuration }
}

// source: https://www.typescriptlang.org/play?target=99&moduleResolution=99&importHelpers=true&emitDecoratorMetadata=false&pretty=true#code/JYWwDg9gTgLgBAbzgSQHbBgGjgQTGAG2AGMBDGYCVAYSpgFMAPLOW1AM2AHMBXKcyqjgBfOOygQQcAEQABEMAAmAd1IBPAFYBnAPSL6xaOWjSA3AChL52W069+FKgAoE5uHFSkQ9LWFLF6AC4ZeSVVTV0ACwgIAGstaUxzYQBKc2ICUi0tOAAJGPjbbgdBRDc4WTxCEgEqNgZmJzT3Q1QYUmBUeihg0lQ1C3LZNAwm8qy1VGI4TtGUsvdFuFJVDDgqEZgnGEjgLQA6VvbO7uaRZPMgA
function createConfiguration(
  onInit: (container: IMidwayContainer) => Promise<void>
) {
  let HooksConfiguration = class HooksConfiguration {
    container: any
    async init() {
      await onInit(this.container)
    }
  }
  __decorate(
    [ApplicationContext()],
    HooksConfiguration.prototype,
    'container',
    void 0
  )
  __decorate([Init()], HooksConfiguration.prototype, 'init', null)
  HooksConfiguration = __decorate(
    [
      Configuration({
        namespace: '@midwayjs/hooks',
        importConfigs: [
          {
            default: {
              asyncContextManager: {
                enable: true,
              },
            },
          },
        ],
      }),
    ],
    HooksConfiguration
  )

  return HooksConfiguration
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
  const { apis } = loadApiFiles({
    source,
    router,
  })
  const routes = apis.map((file) => parseApiModule(require(file), file, router))
  return flattenDeep(routes)
}
