import { Pipe } from '../'
import { Get, Post, Query } from '../operator/http'

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
