import { IMidwayFaaSApplication } from '@midwayjs/faas'
import { useContext } from './useContext'

export function useApp(): IMidwayFaaSApplication {
  const ctx = useContext()
  return ctx.hooks.useApp()
}
