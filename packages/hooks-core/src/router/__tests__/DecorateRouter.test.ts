import { DECORATE_BASE_PATH } from '../../common/const'
import { Decorate, Get, Post } from '../../decorate'
import { DecorateRouter } from '../decorate'
import { resolve } from 'upath'

test('DecorateRouter', async () => {
  const router = new DecorateRouter({ source: '/' })
  expect(router).toBeInstanceOf(DecorateRouter)
  expect(router.config.basePath).toEqual(DECORATE_BASE_PATH)
})

test('DecorateRouter isApiFile', async () => {
  const root = resolve(__dirname, 'fixtures')
  const router = new DecorateRouter({ source: root })
  expect(router.isApiFile(resolve(root, 'invalid.ts'))).toBeFalsy()
  expect(router.isApiFile(resolve(root, 'valid.ts'))).toBeTruthy()
})

test('DecorateRouter hasExportApiRoutes', () => {
  const router = new DecorateRouter({ source: '/' })

  expect(router.hasExportApiRoutes(null)).toBeFalsy()
  expect(router.hasExportApiRoutes(undefined)).toBeFalsy()
  expect(router.hasExportApiRoutes({})).toBeFalsy()
  expect(
    router.hasExportApiRoutes({
      foo: async () => {},
    })
  ).toBeFalsy()

  expect(
    router.hasExportApiRoutes({
      get: createDecorateApi([Get()]),
      post: createDecorateApi([Post()]),
      foo: async () => {},
    })
  ).toBeTruthy()
})

test('DecorateRouter functionToHttpPath', () => {
  const router = new DecorateRouter({ source: '/' })

  const cases: [string, string, boolean, string][] = [
    ['/index.ts', 'foo', false, '/rpc/foo'],
    ['/index.ts', 'foo', true, '/rpc/index'],
    ['/api/[slot].ts', 'foo', false, '/rpc/foo'],
    ['/api/[slot].ts', 'foo', true, '/rpc/[slot]'],
  ]

  for (const [file, functionName, exportDefault, expected] of cases) {
    const url = router.functionToHttpPath(file, functionName, exportDefault)
    expect(url).toEqual(expected)
  }
})

function createDecorateApi(decorators: any[]) {
  return Decorate(...decorators, async () => {})
}
