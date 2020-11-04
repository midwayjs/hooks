import { useFakePlugin } from '@midwayjs/hooks'

export function useSimpleConfig() {
  return useFakePlugin()
}

declare module '@midwayjs/hooks' {
  export function useFakePlugin(): any
}
