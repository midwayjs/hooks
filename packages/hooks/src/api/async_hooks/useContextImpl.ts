import { als } from './als'

export function useContext() {
  const { ctx } = als.getStore()
  return ctx
}
