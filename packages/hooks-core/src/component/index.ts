import { getConfig, getProjectRoot } from '../config'
import { ServerRouter } from '../router'
import { RuntimeConfig } from '../types/config'
import { isDevelopment } from '../util'
import { HooksComponent } from './component'
import { HTTPGateway } from './gateway/http'

/**
 * Create hooks component
 */
export const hooks = (runtime: RuntimeConfig = {}) => {
  ;(runtime.gatewayAdapter || (runtime.gatewayAdapter = [])).push(HTTPGateway)

  const root = getProjectRoot()
  const midwayConfig = getConfig()
  const router = new ServerRouter(root, midwayConfig, isDevelopment())

  const cmp = new HooksComponent({
    runtimeConfig: runtime,
    midwayConfig: midwayConfig,
    router,
    root,
  })

  return cmp.init()
}
