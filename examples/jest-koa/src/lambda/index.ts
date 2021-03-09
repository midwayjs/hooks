import { useContext } from '@midwayjs/hooks'
import { Context } from 'koa'

export default async () => {
  return 'Hello World'
}

const useKoaContext = () => {
  return useContext<Context>()
}

export async function getPath() {
  const ctx = useKoaContext()
  return ctx.path
}

export async function get() {
  const ctx = useKoaContext()
  return ctx.method
}

export async function post(name: string) {
  const ctx = useKoaContext()

  return {
    method: ctx.method,
    name,
  }
}
