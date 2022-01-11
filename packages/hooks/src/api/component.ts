import { IMidwayContainer } from '@midwayjs/core'
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

const debug = createDebug('hooks:component')

export function HooksComponent(runtimeConfig: RuntimeConfig = {}) {
  if (runtimeConfig.middleware !== undefined) {
    validateArray(runtimeConfig.middleware, 'runtimeConfig.middleware')
  }

  const useSourceFile = isDev()
  const source = getSource({ useSourceFile })
  const router = getRouter({ useSourceFile })
  const midway = new MidwayFrameworkAdapter(router, null, null)

  const apis = loadApiModules(source, router)
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

function loadApiModules(source: string, router: AbstractRouter) {
  debug('load api modules from: %s', source)

  const files = run(['**/*.{ts,js}'], {
    cwd: source,
    ignore: [
      '**/node_modules/**',
      '**/*.d.ts',
      '**/*.{test,spec}.{ts,tsx,js,jsx,mjs}',
      '**/_client/**/*.js',
    ],
  })

  debug('api files: %O', files)

  const routes = files
    .filter(
      (file) =>
        router.isSourceFile(file, source) &&
        router.isApiFile({ file, mod: require(file) })
    )
    .map((file) => {
      const apis = parseApiModule(require(file), file, router)
      debug('load api routes from file: %s %O', file, apis)
      return apis
    })

  return flattenDeep(routes)
}
