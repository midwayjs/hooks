import isFunction from 'lodash/isFunction'
import { createConfiguration as createConfigurationFromCore } from '@midwayjs/core'
import { InjectionConfigurationOptions } from '@midwayjs/decorator'

type FunctionalConfiguration = ReturnType<typeof createConfigurationFromCore>
type FirstArgument<T> = T extends (arg: infer A, ...args: any[]) => any
  ? A
  : never
type ConfigurationLifeCycle = FirstArgument<FunctionalConfiguration['onReady']>

interface ConfigurationOptions extends InjectionConfigurationOptions {
  onReady?: ConfigurationLifeCycle
  onStop?: ConfigurationLifeCycle
  onConfigLoad?: ConfigurationLifeCycle
  onServerReady?: ConfigurationLifeCycle
}

const noop = () => {}

export function createConfiguration(options: ConfigurationOptions) {
  const { onReady, onStop, onConfigLoad, onServerReady } = options
  return createConfigurationFromCore(options)
    .onReady(isFunction(onReady) ? onReady : noop)
    .onStop(isFunction(onStop) ? onStop : noop)
    .onConfigLoad(isFunction(onConfigLoad) ? onConfigLoad : noop)
    .onServerReady(isFunction(onServerReady) ? onServerReady : noop)
}
