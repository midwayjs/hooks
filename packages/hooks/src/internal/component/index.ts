import { FileRouter, validateArray, isDevelopment } from '@midwayjs/hooks-core'

import { getConfig, getProjectRoot } from '../config'
import { RuntimeConfig } from '../config/type'
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
    root: root,
    projectConfig: projectConfig,
    useSourceFile: isDevelopment(),
  })

  const hooks = new HooksComponent({
    root: root,
    router,
    runtimeConfig,
    projectConfig: projectConfig,
  })

  return hooks.load()
}
