import { useDemo } from './useDemo'
import { useContext } from '@midwayjs/hooks'

export function useQuery(name: any) {
  useContext()
  useDemo(name)
  console.log(useFakeHooks)
}

export class ThisNotHooks {}

export const useFakeHooks = ''
