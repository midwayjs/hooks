import { ServerRouter } from '..'
import { duplicateLogger } from '../logger'

jest.mock('../logger', () => ({
  duplicateLogger: jest.fn(),
}))

describe('ServerRouter', () => {
  let router: ServerRouter

  beforeEach(() => {
    router = new ServerRouter('/', {
      source: 'src',
      routes: [
        {
          baseDir: 'render',
          basePath: '/',
        },
        {
          baseDir: 'lambda',
          basePath: '/api',
        },
      ],
    })
  })

  test('should exist', () => {
    expect(ServerRouter).toBeTruthy()
    expect(router).toBeInstanceOf(ServerRouter)
  })

  test('test functions', () => {
    expect(router.source.endsWith('/src')).toBeTruthy()

    const api = '/src/lambda/index.ts'
    expect(router.isApiFile(api)).toBeTruthy()
    expect(router.isApiFile(__dirname)).toBeFalsy()

    const rule = router.getRouteConfig(api)
    expect(rule).toMatchInlineSnapshot(`
      Object {
        "baseDir": "lambda",
        "basePath": "/api",
      }
    `)
    expect(
      router.getApiDirectory(rule.baseDir).endsWith('src/lambda')
    ).toBeTruthy()
  })

  test('getHTTPPath', () => {
    const api = '/src/lambda/index.ts'

    expect(router.getHTTPPath(api, '', true)).toMatchInlineSnapshot(`"/api"`)
    expect(router.getHTTPPath(api, 'foo', true)).toMatchInlineSnapshot(`"/api"`)
    expect(router.getHTTPPath(api, 'bar', false)).toMatchInlineSnapshot(
      `"/api/bar"`
    )

    const catchAll = '/src/render/[...index].ts'
    expect(router.getHTTPPath(catchAll, '', true)).toMatchInlineSnapshot(`"/*"`)
    expect(router.getHTTPPath(catchAll, 'foo', true)).toMatchInlineSnapshot(
      `"/*"`
    )
    expect(router.getHTTPPath(catchAll, 'bar', false)).toMatchInlineSnapshot(
      `"/bar/*"`
    )
  })

  test('getBaseUrl', () => {
    const cases = [
      ['/src/render/index.ts', '/'],
      ['/src/lambda/index.ts', '/api'],
      ['/src/render/[...index].ts', '/'],
      ['/src/lambda/[...index].ts', '/api'],
    ]

    for (const [file, expected] of cases) {
      expect(router.getBaseUrl(file)).toEqual(expected)
    }
  })

  test('duplicate warning', () => {
    const api = '/src/lambda/index.ts'
    const api2 = '/src/render/api.ts'

    router.getHTTPPath(api, '', true)
    router.getHTTPPath(api2, '', true)

    expect(duplicateLogger).toBeCalled()
  })
})
