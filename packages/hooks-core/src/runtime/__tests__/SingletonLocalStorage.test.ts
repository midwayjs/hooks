import { ContextManager, useContext } from '..'
import { enableSingleLocalStorage } from '../SingletonLocalStorage'

test('SingletonLocalStorage', async () => {
  enableSingleLocalStorage()

  const ctx = { name: 'Jake' }

  await ContextManager.run({ ctx }, async () => {
    expect(ContextManager.getValue('ctx')).toStrictEqual(ctx)
    expect(useContext()).toStrictEqual(ctx)
  })
})
