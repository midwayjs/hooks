import { als, SINGLE_CONCURRENCY_MODE, useContext } from '../als'

test('AsyncLocalStorage', async () => {
  const ctx = { name: 'Jake' }

  await als.run({ ctx }, async () => {
    expect(als.getStore('ctx')).toStrictEqual(ctx)
    expect(useContext()).toStrictEqual(ctx)
  })
})

test('GlobalLocalStorage', async () => {
  globalThis[SINGLE_CONCURRENCY_MODE] = true
  const ctx = { name: 'Jake' }

  await als.run({ ctx }, async () => {
    expect(als.getStore('ctx')).toStrictEqual(ctx)
    expect(useContext()).toStrictEqual(ctx)
  })

  delete globalThis[SINGLE_CONCURRENCY_MODE]
})
