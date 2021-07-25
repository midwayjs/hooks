import { getConfig, getProjectRoot } from '../config'
import { ServerRouter } from '../router'
import { RuntimeConfig } from '../types/config'
import { Class, HooksGatewayAdapter } from '../types/gateway'
import { isDevelopment } from '../util'
import { validateArray } from '../validator'
import { HooksComponent } from './component'
import { EventGateway } from './gateway/event'
import { HTTPGateway } from './gateway/http'

/**
 * Create hooks component
 */
export const hooks = (runtimeConfig: RuntimeConfig = {}) => {
  if (runtimeConfig.middleware !== undefined) {
    validateArray(runtimeConfig.middleware, 'runtime.middleware')
  }

  const root = getProjectRoot()
  const projectConfig = getConfig()

  const builtinGateways = new Set<Class<HooksGatewayAdapter>>()
  for (const route of projectConfig.routes) {
    if (route.basePath) builtinGateways.add(HTTPGateway)
    if (route.event) builtinGateways.add(EventGateway)
  }
  projectConfig.gateway.push(...builtinGateways)

  const router = new ServerRouter(root, projectConfig, isDevelopment())

  const hooks = new HooksComponent({
    root,
    router,
    runtimeConfig,
    projectConfig,
  })

  return hooks.init()
}
