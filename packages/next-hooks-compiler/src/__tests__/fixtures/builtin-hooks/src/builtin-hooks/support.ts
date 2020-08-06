import { usePlugin } from '@midwayjs/hooks'

export function useSimpleConfig() {
  return usePlugin()
}

declare module '@midwayjs/hooks' {
  export function usePlugin(): any
}
