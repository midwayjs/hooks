import { setConfig, setProjectRoot } from '.'

type Mod = {
  file: string
  mod: any
}

type HydrateOptions = {
  modules: Mod[]
}

const MIDWAY_HOOKS_HYDRATE_OPTIONS = 'MIDWAY_HOOKS_HYDRATE_OPTIONS'

export function isHydrate() {
  return !!globalThis[MIDWAY_HOOKS_HYDRATE_OPTIONS]
}

export function setHydrateOptions(options: HydrateOptions) {
  setProjectRoot('/')
  setConfig({})
  globalThis[MIDWAY_HOOKS_HYDRATE_OPTIONS] = options
}

export function getHydrateOptions(): HydrateOptions {
  return globalThis[MIDWAY_HOOKS_HYDRATE_OPTIONS]
}
