import { useContext } from '@midwayjs/hooks'

export function useRecursion(name: string) {
  const ctx = useContext()

  if (Math.random() <= 0.5) {
    return name
  }

  return useRecursion(name)
}
