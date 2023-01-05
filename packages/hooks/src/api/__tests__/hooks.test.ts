import { useConfig, useInject, usePlugin } from '../hooks'

const cases = [null, 1, true, Symbol('test')]

test('usePlugin validate arguments', async () => {
  for (const cse of cases) {
    expect(() => (usePlugin as any)(cse)).toThrowErrorMatchingSnapshot()
  }
})

test('useConfig validate arguments', async () => {
  for (const cse of cases) {
    expect(() => (useConfig as any)(cse)).toThrowErrorMatchingSnapshot()
  }
})

test('useInject validate arguments', async () => {
  for (const cse of cases) {
    expect(() => (useInject as any)(cse)).rejects.toMatchSnapshot()
  }
})
