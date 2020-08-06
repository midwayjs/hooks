import * as hooks from './import-hook'

export function useNamespace() {
  const n = new hooks.ThisNotHooks()
  console.log(hooks.useFakeHooks)
  return hooks.useQuery(n)
}
