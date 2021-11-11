import { createConfiguration as createConfigurationFromCore } from '@midwayjs/core'
import { InjectionConfigurationOptions } from '@midwayjs/decorator'

type FunctionalConfiguration = ReturnType<typeof createConfigurationFromCore>

interface ConfigurationOptions extends InjectionConfigurationOptions {
  onReady: FunctionalConfiguration['onReady']
  onStop: FunctionalConfiguration['onStop']
  onConfigLoad: FunctionalConfiguration['onConfigLoad']
}

const noop = () => {}

export function createConfiguration(options: ConfigurationOptions) {
  const { onReady, onStop, onConfigLoad } = options
  return createConfigurationFromCore(options)
    .onReady(onReady || noop)
    .onStop(onStop || noop)
    .onConfigLoad(onConfigLoad || noop)
}
