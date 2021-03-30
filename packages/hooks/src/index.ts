export * from './hooks'
export * from './hoc'
export { hooks, defineConfig, ApiConfig, superjson } from '@midwayjs/hooks-core'
import { createConfiguration as createConfigurationFromCore } from '@midwayjs/core'

const noop = () => {}

export function createConfiguration(
  options: Parameters<typeof createConfigurationFromCore>['0']
) {
  return createConfigurationFromCore(options).onReady(noop).onStop(noop)
}
