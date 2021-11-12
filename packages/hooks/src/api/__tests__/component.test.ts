import { HooksComponent } from '../component'

test('component should validate arguments', () => {
  expect(() =>
    HooksComponent({ middleware: null })
  ).toThrowErrorMatchingSnapshot()
})
