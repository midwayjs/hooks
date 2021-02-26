import { proxy } from '../proxy'
import { createRequestProxy } from '../http'
import { request } from '../../request'

jest.mock('../../request')

describe('hooks function proxy', () => {
  test('should proxy function call', () => {
    const fn = jest.fn()
    const mod = proxy(fn)
    mod()
    mod.abc()
    expect(fn).toHaveBeenCalledTimes(2)
  })

  test('should proxy request', () => {
    const { foo, bar } = createRequestProxy('')
    foo()
    expect(request).toHaveBeenLastCalledWith({
      data: { args: [] },
      meta: {},
      method: 'GET',
      url: 'foo',
    })
    bar('666')
    expect(request).toHaveBeenLastCalledWith({
      data: { args: ['666'] },
      meta: {},
      method: 'POST',
      url: 'bar',
    })
  })
})
