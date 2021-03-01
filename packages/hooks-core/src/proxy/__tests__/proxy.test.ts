import { proxy } from '../proxy'

describe('hooks function proxy', () => {
  test('should proxy function call', () => {
    const fn = jest.fn()
    const mod = proxy(fn)
    mod()
    mod.abc()
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
