export * from './hooks'
export * from './hoc'
export { hooks, defineConfig, ApiConfig } from '@midwayjs/hooks-core'
import { createConfiguration as createConfigurationFromCore } from '@midwayjs/core'

const noop = () => {}

export function createConfiguration(
  options: Parameters<typeof createConfigurationFromCore>['0']
) {
  const configuration = createConfigurationFromCore(options)
  configuration.onReady(noop).onStop(noop)
  return configuration
}
