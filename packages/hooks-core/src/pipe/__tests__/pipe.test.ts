import { Middleware, extractMetadata } from '@midwayjs/hooks-core'

import { Pipe } from '../'
import { Get, Header, Param, Post, Query } from '../operator/http'
import { Operator } from '../type'

it('pipe should work', async () => {
  const hello = Pipe(async () => {
    return 'Hello Pipe!'
  })
  expect(await hello()).toEqual('Hello Pipe!')

  const withArgs = Pipe(async (name: string) => {
    return name
  })
  expect(await withArgs('hooks')).toEqual('hooks')

  const withOperator = Pipe(Post(), async (name: string) => {
    return name
  })
  expect(await withOperator('hooks')).toEqual('hooks')
})

it('compose with meta operator', async () => {
  const withQuery = Pipe(Get(), Query<{ name: string }>(), async () => {
    return 'Hello World'
  })
  expect(await withQuery({ query: { name: 'hooks' } })).toEqual('Hello World')
})

it('defineMeta', async () => {
  const logger = () => {}
  const fn = Pipe(
    Get(),
    Query(),
    Param(),
    Header(),
    Middleware(logger),
    async () => {}
  )

  expect(extractMetadata(fn)).toMatchSnapshot()
})

it('execute', async () => {
  const stack = []
  const CustomExecutor = (): Operator<void> => {
    return {
      name: 'CustomExecutor',
      async execute({ next }) {
        stack.push(1)
        await next()
        stack.push(4)
      },
    }
  }

  const fn = Pipe(CustomExecutor(), async (...numbers: number[]) => {
    stack.push(...numbers)
    return numbers
  })

  const result = await fn(2, 3)
  expect(stack).toEqual([1, 2, 3, 4])
  expect(result).toEqual([2, 3])
})
