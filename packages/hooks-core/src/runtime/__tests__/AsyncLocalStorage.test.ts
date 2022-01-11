import { useContext } from '..'
import { ContextManager } from '..'

test('AsyncLocalStorage', async () => {
  const ctx = { name: 'Jake' }

  await ContextManager.run({ ctx }, async () => {
    expect(ContextManager.getValue('ctx')).toStrictEqual(ctx)
    expect(useContext()).toStrictEqual(ctx)
  })
})
