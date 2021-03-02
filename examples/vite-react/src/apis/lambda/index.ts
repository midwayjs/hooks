import { useContext } from '@midwayjs/hooks'
import { Context } from '@midwayjs/koa'

function useKoaContext(): Context {
  return useContext()
}

export default async () => {
  return {
    message: 'Hello World',
    method: useKoaContext().method,
  }
}

export const get = () => {
  return 'get'
}

export const post = (name: string) => {
  return 'post' + name
}

export async function bar() {}
