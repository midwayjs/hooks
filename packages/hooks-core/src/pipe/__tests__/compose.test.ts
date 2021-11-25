// Ref: https://github.com/koajs/compose/blob/master/test/test.js
import assert from 'assert'

import { compose } from '../compose'

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms || 1))
}

function isPromise(x: any) {
  return x && typeof x.then === 'function'
}

it('should work', async () => {
  const arr = []
  const stack = []

  stack.push(async (next) => {
    arr.push(1)
    await wait(1)
    await next()
    await wait(1)
    arr.push(6)
  })

  stack.push(async (next) => {
    arr.push(2)
    await wait(1)
    await next()
    await wait(1)
    arr.push(5)
  })

  stack.push(async (next) => {
    arr.push(3)
    await wait(1)
    await next()
    await wait(1)
    arr.push(4)
  })

  await compose(stack)()
  expect(arr).toEqual(expect.arrayContaining([1, 2, 3, 4, 5, 6]))
})

it('should only accept an array', () => {
  expect(() => compose()).toThrow(TypeError)
})

it('should create next functions that return a Promise', function () {
  const stack = []
  const arr = []
  for (let i = 0; i < 5; i++) {
    stack.push((next) => {
      arr.push(next())
    })
  }

  compose(stack)()

  for (const next of arr) {
    assert(isPromise(next), 'one of the functions next is not a Promise')
  }
})
