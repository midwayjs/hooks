import { useConfig, useContext, useInject, useLogger, usePlugin, useApp } from '@midwayjs/hooks'

export function useBuiltinHooks() {
  useConfig()
  useLogger()
  useContext()
  useInject('')
  usePlugin('')
  useApp()
}
