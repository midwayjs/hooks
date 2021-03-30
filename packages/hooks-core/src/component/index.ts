import { ServerRouter } from '../router'
import { getConfig, getProjectRoot } from '../config'
import { RuntimeConfig } from '../types/config'
import { isDevelopment } from '../util'
import { HooksDevComponent } from './dev'
import { HooksProductionComponent } from './production'

/**
 * Create hooks component
 */
export const hooks = (runtime: RuntimeConfig = {}) => {
  const root = getProjectRoot()
  const internal = getConfig()
  const router = new ServerRouter(root, internal, isDevelopment())
  const Component = isDevelopment()
    ? HooksDevComponent
    : HooksProductionComponent

  const cmp = new Component({
    runtime,
    internal,
    router,
    root,
  })

  return cmp.init()
}
