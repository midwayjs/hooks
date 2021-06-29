import { createConfiguration as createConfigurationFromCore } from '@midwayjs/core'
import { InjectionConfigurationOptions } from '@midwayjs/decorator'

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

export function createConfiguration(options: InjectionConfigurationOptions) {
  return createConfigurationFromCore(options).onReady(noop).onStop(noop)
}
