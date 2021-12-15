import { Decorate } from '../'
import { extractMetadata } from '../../common/util'
import { Get, Header, Param, Post, Query } from '../operator/http'
import { Middleware } from '../operator/middleware'
import { Operator } from '../type'

it('Decorate should work', async () => {
  const hello = Decorate(async () => {
    return 'Hello Decorate!'
  })
  expect(await hello()).toEqual('Hello Decorate!')

  const withArgs = Decorate(async (name: string) => {
    return name
  })
  expect(await withArgs('hooks')).toEqual('hooks')

  const withOperator = Decorate(Post(), async (name: string) => {
    return name
  })
  expect(await withOperator('hooks')).toEqual('hooks')
})

it('compose with meta operator', async () => {
  const withQuery = Decorate(Get(), Query<{ name: string }>(), async () => {
    return 'Hello World'
  })
  expect(await withQuery({ query: { name: 'hooks' } })).toEqual('Hello World')
})

it('defineMeta', async () => {
  const logger = () => {}
  const fn = Decorate(
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

  const fn = Decorate(CustomExecutor(), async (...numbers: number[]) => {
    stack.push(...numbers)
    return numbers
  })

  const result = await fn(2, 3)
  expect(stack).toEqual([1, 2, 3, 4])
  expect(result).toEqual([2, 3])
})
