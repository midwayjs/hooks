import { useContext } from './useContext'

export function useConfig(key?: string) {
  const ctx = useContext()
  return ctx.requestContext.configService.getConfiguration(key)
}
