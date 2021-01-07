import { useContext } from './useContext'

export function useLogger() {
  const ctx = useContext()
  return ctx.logger
}
