import { useContext, useInject, useConfig, useLogger } from '@midwayjs/hooks'

export function useBuiltinHooks() {
  useConfig()
  useLogger()
  useContext()
  useInject('')
}
