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

export async function mixedValue() {
  return {
    string: '',
    number: 1,
    boolean: true,
    null: null,
    array: [1],
    object: {
      a: 1,
    },
    undefined: undefined,
    date: new Date('2021-02-21'),
    regexp: /regexp/,
    set: new Set([1, 2, 3, 1]),
    map: new Map([['key', 'value']]),
    error: new Error('from api'),
  }
}
