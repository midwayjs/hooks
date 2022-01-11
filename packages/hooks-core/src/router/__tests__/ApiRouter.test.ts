import { API_BASE_PATH } from '../../common/const'
import { Api, Get, Post } from '../../api'
import { ApiRouter } from '../api'
import { resolve } from 'upath'

test('ApiRouter', async () => {
  const router = new ApiRouter()
  expect(router).toBeInstanceOf(ApiRouter)
  expect(router.config.basePath).toEqual(API_BASE_PATH)
})

test('ApiRouter isApiFile', async () => {
  const source = resolve(__dirname, 'fixtures')
  const router = new ApiRouter()
  expect(
    router.isApiFile({
      mod: require(resolve(source, 'invalid.ts')),
    })
  ).toBeFalsy()
  expect(
    router.isApiFile({
      mod: require(resolve(source, 'valid.ts')),
    })
  ).toBeTruthy()
})

test('ApiRouter hasExportApiRoutes', () => {
  const router = new ApiRouter()

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
      get: createApi([Get()]),
      post: createApi([Post()]),
      foo: async () => {},
    })
  ).toBeTruthy()
})

test('ApiRouter functionToHttpPath', () => {
  const router = new ApiRouter()

  const cases: [string, string, boolean, string][] = [
    ['/index.ts', 'foo', false, '/api/foo'],
    ['/index.ts', 'foo', true, '/api/index'],
    ['/api/[slot].ts', 'foo', false, '/api/foo'],
    ['/api/[slot].ts', 'foo', true, '/api/[slot]'],
  ]

  for (const [file, functionName, exportDefault, expected] of cases) {
    const url = router.functionToHttpPath(file, functionName, exportDefault)
    expect(url).toEqual(expected)
  }
})

function createApi(operators: any[]) {
  return Api(...operators, async () => {})
}
