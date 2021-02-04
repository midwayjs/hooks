import { useContext } from './useContext'

export function usePlugin(key: string): any {
  const ctx = useContext()
  return ctx.hooks.usePlugin(key)
}
