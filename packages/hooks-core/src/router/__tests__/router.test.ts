import { FileRouter } from '../router'

describe('NewFileRouter', () => {
  let router: FileRouter

  beforeEach(() => {
    router = new FileRouter({
      root: '/',
      source: 'src',
      routes: [
        {
          baseDir: 'lambda',
        },
      ],
    })
  })

  test('should exist', () => {
    expect(FileRouter).toBeTruthy()
    expect(router).toBeInstanceOf(FileRouter)
  })

  test('test file router', () => {
    expect(router.source.endsWith('/src')).toBeTruthy()

    const api = '/src/lambda/index.ts'
    expect(router.isApiFile(api)).toBeTruthy()
    expect(router.isApiFile('/dist')).toBeFalsy()

    const rule = router.getRoute(api)
    expect(rule).toMatchSnapshot()
    expect(
      router.getApiDirectory(rule.baseDir).endsWith('src/lambda')
    ).toBeTruthy()
  })

  test('file to http path', () => {
    const cases = [
      {
        file: '/src/lambda/index.ts',
        functionName: '',
        exportDefault: true,
        expected: '/',
      },
      {
        file: '/src/lambda/index.ts',
        functionName: 'index',
        exportDefault: true,
        expected: '/',
      },
      {
        file: '/src/lambda/index.ts',
        functionName: '',
        exportDefault: true,
        expected: '/',
      },
      {
        file: '/src/lambda/index.ts',
        functionName: 'index',
        exportDefault: false,
        expected: '/index',
      },
      {
        file: '/src/lambda/foo.ts',
        functionName: '',
        exportDefault: true,
        expected: '/foo',
      },
      {
        file: '/src/lambda/foo.ts',
        functionName: 'bar',
        exportDefault: false,
        expected: '/foo/bar',
      },
      {
        file: '/src/lambda/foo/bar/baz/qux.ts',
        functionName: 'getArticle',
        exportDefault: false,
        expected: '/foo/bar/baz/qux/getArticle',
      },
      {
        file: '/src/lambda/foo/baz.ts',
        functionName: 'bar',
        exportDefault: false,
        expected: '/foo/baz/bar',
      },
      {
        file: '/src/lambda/foo/[...baz].ts',
        functionName: 'bar',
        exportDefault: false,
        expected: '/foo/baz/bar/*',
      },
    ]

    for (const cse of cases) {
      expect(
        router.functionToHttpPath(cse.file, cse.functionName, cse.exportDefault)
      ).toEqual(cse.expected)
    }
  })

  it('file system route', () => {
    const cases = [
      // normal
      ['/', '/'],
      ['/api', '/api'],
      ['/api/foo', '/api/foo'],
      ['/api/foo/bar', '/api/foo/bar'],

      // index routes
      ['/index', '/'],
      ['/api/index', '/api'],
      ['/api/foo/index', '/api/foo'],

      // not index routes
      ['/index/index', '/index'],
      ['/api/index/foo', '/api/index/foo'],

      // dynamic params
      ['/[api]', '/:api'],
      ['/[api]/foo', '/:api/foo'],
      ['/api/[foo]/[bar]', '/api/:foo/:bar'],
      ['/api/foo/[bar]', '/api/foo/:bar'],

      // dynamic params + index routes
      ['/[index]', '/:index'],
      ['/[api]/index', '/:api'],
      ['/[api]/[index]/foo', '/:api/:index/foo'],
      ['/[api]/[index]/foo/index', '/:api/:index/foo'],

      // catchAll params
      ['/[...index]', '/*'],
      ['/[...api]', '/api/*'],
      ['/api/[...index]', '/api/*'],
      ['/api/foo/[bar]/[...baz]', '/api/foo/:bar/baz/*'],

      // + function name
      ['/', '/getArticle', 'getArticle'],
      ['/api', '/api/getArticle', 'getArticle'],

      ['/[api]', '/:api/getArticle', 'getArticle'],
      ['/[api]/foo', '/:api/foo/getArticle', 'getArticle'],

      ['/index', '/getArticle', 'getArticle'],
      ['/api/index', '/api/getArticle', 'getArticle'],
      ['/[index]', '/:index/getArticle', 'getArticle'],

      ['/[...index]', '/getArticle/*', 'getArticle'],
      ['/[...api]', '/api/getArticle/*', 'getArticle'],
      ['/api/[...index]', '/api/getArticle/*', 'getArticle'],
      [
        '/api/foo/[bar]/[...baz]',
        '/api/foo/:bar/baz/getArticle/*',
        'getArticle',
      ],
    ]

    for (const [input, expected, functionName] of cases) {
      expect(router.buildUrl(input, functionName)).toEqual(expected)
    }
  })
})
