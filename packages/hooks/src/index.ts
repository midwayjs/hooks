import { createConfiguration as createConfigurationFromCore } from '@midwayjs/core'

export * from './hoc'
export {
  hooks,
  defineConfig,
  ApiConfig,
  superjson,
  useContext,
  useConfig,
  useInject,
  usePlugin,
  useLogger,
} from '@midwayjs/hooks-core'

const noop = () => {}

export function createConfiguration(
  options: Parameters<typeof createConfigurationFromCore>['0']
) {
  return createConfigurationFromCore(options).onReady(noop).onStop(noop)
}
