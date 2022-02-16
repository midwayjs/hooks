import { setConfig, setProjectRoot } from '.'

type Mod = {
  file: string
  mod: any
}

type HydateOptions = {
  modules: Mod[]
}

const MIDWAY_HOOKS_HYDRATE_OPTIONS = 'MIDWAY_HOOKS_HYDRATE_OPTIONS'

export function isHydrate() {
  return !!globalThis[MIDWAY_HOOKS_HYDRATE_OPTIONS]
}

export function setHydrateOptions(options: HydateOptions) {
  setProjectRoot('/')
  setConfig({})
  globalThis[MIDWAY_HOOKS_HYDRATE_OPTIONS] = options
}

export function getHydrateOptions(): HydateOptions {
  return globalThis[MIDWAY_HOOKS_HYDRATE_OPTIONS]
}
