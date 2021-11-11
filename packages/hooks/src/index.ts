import { createConfiguration as createConfigurationFromCore } from '@midwayjs/core'
import { InjectionConfigurationOptions } from '@midwayjs/decorator'

export * from './hoc'
export {
  hooks,
  defineConfig,
  ApiConfig,
  useContext,
  useConfig,
  useInject,
  usePlugin,
  useLogger,
} from '@midwayjs/hooks-core'

const noop = () => {}

type FunctionalConfiguration = ReturnType<typeof createConfigurationFromCore>

interface ConfigurationOptions extends InjectionConfigurationOptions {
  onReady: FunctionalConfiguration['onReady']
  onStop: FunctionalConfiguration['onStop']
  onConfigLoad: FunctionalConfiguration['onConfigLoad']
}

export function createConfiguration(options: ConfigurationOptions) {
  const { onReady, onStop, onConfigLoad } = options
  return createConfigurationFromCore(options)
    .onReady(onReady || noop)
    .onStop(onStop || noop)
    .onConfigLoad(onConfigLoad || noop)
}
