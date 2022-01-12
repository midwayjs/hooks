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

export function getHydrateOptions(): HydateOptions {
  return globalThis[MIDWAY_HOOKS_HYDRATE_OPTIONS]
}
