import { withController, withMiddleware } from '../hoc'

const noop = async () => {}

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

test('validate arguments', () => {
  expect(withController).toThrowErrorMatchingSnapshot()
  expect(withMiddleware).toThrowErrorMatchingSnapshot()

  expect(() =>
    withController({ middleware: null }, noop)
  ).toThrowErrorMatchingSnapshot()
  expect(() => withController({}, null)).toThrowErrorMatchingSnapshot()

  expect(() => withMiddleware(null, null)).toThrowErrorMatchingSnapshot()
  expect(() => withMiddleware([], null)).toThrowErrorMatchingSnapshot()
})
