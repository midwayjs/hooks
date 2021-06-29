import { hooks } from '..'

test('component should validate arguments', () => {
  expect(() => hooks({ gatewayAdapter: null })).toThrowErrorMatchingSnapshot()
  expect(() => hooks({ middleware: null })).toThrowErrorMatchingSnapshot()
})
