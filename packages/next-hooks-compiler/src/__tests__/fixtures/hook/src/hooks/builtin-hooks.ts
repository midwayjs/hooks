import { useContext, useInject, useConfig, useLogger, usePlugin } from '@midwayjs/hooks'

export function useBuiltinHooks() {
  useConfig()
  useLogger()
  useContext()
  useInject('')
  usePlugin('')
}
