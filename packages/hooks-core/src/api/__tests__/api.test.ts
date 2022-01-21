import { Api } from '..'
import { extractMetadata } from '../../common/util'
import { Get, Headers, Params, Post, Query } from '../operator/http'
import { Middleware } from '../operator/middleware'
import { Operator } from '../type'

it('Api should work', async () => {
  const hello = Api(async () => {
    return 'Hello Api!'
  })
  expect(await hello()).toEqual('Hello Api!')

  const withArgs = Api(async (name: string) => {
    return name
  })
  expect(await withArgs('hooks')).toEqual('hooks')

  const withOperator = Api(Post(), async (name: string) => {
    return name
  })
  expect(await withOperator('hooks')).toEqual('hooks')
})

it('compose with meta operator', async () => {
  const withQuery = Api(Get(), Query<{ name: string }>(), async () => {
    return 'Hello World'
  })
  expect(await withQuery({ query: { name: 'hooks' } })).toEqual('Hello World')
})

it('defineMeta', async () => {
  const logger = () => {}
  const fn = Api(
    Get(),
    Query(),
    Params(),
    Headers(),
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
      async execute(helper, next) {
        stack.push(1)
        await next()
        stack.push(4)
      },
    }
  }

  const fn = Api(CustomExecutor(), async (...numbers: number[]) => {
    stack.push(...numbers)
    return numbers
  })

  const result = await fn(2, 3)
  expect(stack).toEqual([1, 2, 3, 4])
  expect(result).toEqual([2, 3])
})
