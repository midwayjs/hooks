import { getConfig, getProjectRoot } from '../config'
import { ServerRouter } from '../router'
import { RuntimeConfig } from '../types/config'
import { isDevelopment } from '../util'
import { validateArray } from '../validator'
import { HooksComponent } from './component'
import { HTTPGateway } from './gateway/http'

/**
 * Create hooks component
 */
export const hooks = (runtime: RuntimeConfig = {}) => {
  if (runtime.middleware !== undefined) {
    validateArray(runtime.middleware, 'runtime.middleware')
  }

  const root = getProjectRoot()
  const midwayConfig = getConfig()
  midwayConfig.gateway.push(HTTPGateway)

  const router = new ServerRouter(root, midwayConfig, isDevelopment())

  const cmp = new HooksComponent({
    runtimeConfig: runtime,
    midwayConfig,
    router,
    root,
  })

  return cmp.init()
}
