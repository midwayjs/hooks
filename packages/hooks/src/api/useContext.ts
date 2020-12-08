import { FaaSContext } from '@midwayjs/faas'

export function useContext(): FaaSContext {
  throw new Error('Please use in compiled mode')
}
