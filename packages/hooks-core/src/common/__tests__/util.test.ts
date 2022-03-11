import { isHooksMiddleware } from '../util'

test('isHooksMiddleware', () => {
  expect(isHooksMiddleware(() => {})).toBeFalsy()
  expect(isHooksMiddleware((next) => {})).toBeTruthy()
  expect(isHooksMiddleware((ctx, next) => {})).toBeFalsy()
  expect(isHooksMiddleware(class {} as any)).toBeFalsy()
  expect(
    isHooksMiddleware(
      class {
        constructor(next) {}
      } as any
    )
  ).toBeFalsy()
})
