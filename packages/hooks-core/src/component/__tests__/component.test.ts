import { hooks } from '..'

test('component should validate arguments', () => {
  expect(() => hooks({ middleware: null })).toThrowErrorMatchingSnapshot()
})
