import { getConfig, getProjectRoot } from '../config'
import { FileRouter } from '../router/file'
import { RuntimeConfig } from '../types/config'
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

  const root = getProjectRoot()
  const projectConfig = getConfig()
  const router = new FileRouter({
    root,
    projectConfig,
    useSourceFile: isDevelopment(),
  })

  const hooks = new HooksComponent({
    root,
    router,
    runtimeConfig,
    projectConfig,
  })

  return hooks.init()
}
