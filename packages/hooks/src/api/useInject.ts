import { useContext } from './useContext'
export function useInject<T>(identifier: new () => T): Promise<T>
export function useInject<T>(identifier: string): Promise<T>

export async function useInject<T = any>(identifier: (new () => T) | string) {
  const { requestContext } = useContext()
  return requestContext.getAsync<T>(identifier)
}
