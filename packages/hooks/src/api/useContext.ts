import { FaaSContext } from '@midwayjs/faas'

export function useContext(): FaaSContext {
  throw new Error('当前仅支持在编译模式下使用')
}
