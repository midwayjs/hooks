import { withController } from '@midwayjs/hooks'

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
})
