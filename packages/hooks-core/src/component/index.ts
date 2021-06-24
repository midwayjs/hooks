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
  ;(runtime.gatewayAdapters || (runtime.gatewayAdapters = [])).push(HTTPGateway)

  const root = getProjectRoot()
  const internal = getConfig()
  const router = new ServerRouter(root, internal, isDevelopment())

  const cmp = new HooksComponent({
    runtime,
    internal,
    router,
    root,
  })

  return cmp.init()
}
