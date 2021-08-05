import { getConfig, getProjectRoot } from '../config'
import { FileRouter } from '../router/file'
import { getSnapshot } from '../runtime/snapshot'
import { RuntimeConfig } from '../types/config'
import { ComponentOptions } from '../types/gateway'
import { isDevelopment } from '../util'
import { validateArray } from '../validator'
import { HooksComponent } from './component'

/**
 * @description Create hooks component
 */
export const hooks = (runtimeConfig: RuntimeConfig = {}) => {
  if (runtimeConfig.middleware !== undefined) {
    validateArray(runtimeConfig.middleware, 'runtimeConfig.middleware')
  }

  const options: Partial<ComponentOptions> = {}
  const snapshot = getSnapshot()

  if (snapshot) {
    options.root = snapshot.root
    options.projectConfig = snapshot.projectConfig
  } else {
    options.root = getProjectRoot()
    options.projectConfig = getConfig()
  }

  const router = new FileRouter({
    root: options.root,
    projectConfig: options.projectConfig,
    useSourceFile: isDevelopment(),
  })

  const hooks = new HooksComponent({
    root: options.root,
    router,
    runtimeConfig,
    projectConfig: options.projectConfig,
  })

  return hooks.load()
}
