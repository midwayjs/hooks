import { useContext } from '@midwayjs/hooks/web'
import { Context } from 'koa'

export default async () => {
  return 'Hello World'
}

export async function getPath() {
  const ctx: Context = useContext()
  return ctx.path
}

export async function get() {
  const ctx: Context = useContext()
  return ctx.method
}

export async function post(name: string) {
  const ctx: Context = useContext()

  return {
    method: ctx.method,
    name,
  }
}
