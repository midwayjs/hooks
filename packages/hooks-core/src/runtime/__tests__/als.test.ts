import { als, useContext } from '../'

test('useContext', async () => {
  const ctx = { name: 'Jake' }
  await als.run({ ctx }, async () => {
    expect(als.getStore('ctx')).toStrictEqual(ctx)
    expect(useContext()).toStrictEqual(ctx)
  })
})

test('als throw error', async () => {
  try {
    await als.run({ ctx: {} }, async () => {
      throw new Error('foo')
    })
  } catch (error) {
    expect(error.message).toEqual('foo')
  }
})
