import { als, useContext } from '../als'

test('AsyncLocalStorage', async () => {
  const ctx = { name: 'Jake' }

  await als.run({ ctx }, async () => {
    expect(als.getStore('ctx')).toStrictEqual(ctx)
    expect(useContext()).toStrictEqual(ctx)
  })
})
