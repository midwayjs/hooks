import { useConfig, useContext, useInject, useLogger, usePlugin } from '@midwayjs/hooks'

export function useBuiltinHooks() {
  useConfig()
  useLogger()
  useContext()
  useInject('')
  usePlugin('')
}
