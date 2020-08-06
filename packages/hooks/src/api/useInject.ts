import { useContext } from './useContext'

export async function useInject<T = any>(identifier: any) {
  const { requestContext } = useContext()
  return requestContext.getAsync<T>(identifier)
}
