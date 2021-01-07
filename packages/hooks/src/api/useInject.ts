import { useContext } from './useContext'

export async function useInject<T = any>(identifier: (new () => T) | string) {
  const { requestContext } = useContext()
  return requestContext.getAsync<T>(identifier)
}
