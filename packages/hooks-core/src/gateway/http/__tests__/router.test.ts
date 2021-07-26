import { duplicateLogger } from '../logger'
import { HTTPRouter } from '../router'

jest.mock('../logger', () => ({
  duplicateLogger: jest.fn(),
}))

let router: HTTPRouter

beforeEach(() => {
  router = new HTTPRouter({
    root: '/',
    projectConfig: {
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
    },
    useSourceFile: true,
  })
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
