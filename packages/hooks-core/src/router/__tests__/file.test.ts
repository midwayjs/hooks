import { FileRouter } from '../file'

describe('FileRouter', () => {
  let router: FileRouter

  beforeEach(() => {
    router = new FileRouter({
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

  test('should exist', () => {
    expect(FileRouter).toBeTruthy()
    expect(router).toBeInstanceOf(FileRouter)
  })

  test('test functions', () => {
    expect(router.source.endsWith('/src')).toBeTruthy()

    const api = '/src/lambda/index.ts'
    expect(router.isApiFile(api)).toBeTruthy()
    expect(router.isApiFile(__dirname)).toBeFalsy()

    const rule = router.getRoute(api)
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
})
