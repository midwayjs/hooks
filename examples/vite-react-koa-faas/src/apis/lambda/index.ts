import { useContext } from '@midwayjs/hooks'
import { Context } from '@midwayjs/koa'

function useKoaContext() {
  return useContext<Context>()
}

export default async () => {
  const ctx = useKoaContext()
  return {
    message: 'Hello World',
    method: ctx.method,
  }
}

export const post = async (message: string) => {
  const ctx = useKoaContext()

  return {
    message: 'Your message: ' + message,
    method: ctx.method,
  }
}
