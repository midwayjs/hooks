import { withController } from '@midwayjs/hooks'

import { withMiddleware } from '../hoc'

test('expect wrapped fn to be called', () => {
  const fn = jest.fn()
  const target = withController(
    {
      middleware: [],
    },
    fn
  )
  target()
  expect(fn).toHaveBeenCalledTimes(1)

  const target2 = withMiddleware([], fn)
  target2()
  expect(fn).toHaveBeenCalledTimes(2)
})
