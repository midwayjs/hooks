import { Context } from 'koa'

import { useContext } from '@midwayjs/hooks'

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

const useKoaContext = () => {
  return useContext<Context>()
}
