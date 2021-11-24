import { NewFileRouter } from '../new-router'

describe('NewFileRouter', () => {
  let router: NewFileRouter

  beforeEach(() => {
    router = new NewFileRouter({
      root: '/',
      source: 'src',
      routes: [
        {
          baseDir: 'lambda',
          basePath: '/api',
        },
      ],
    })
  })

  test('should exist', () => {
    expect(NewFileRouter).toBeTruthy()
    expect(router).toBeInstanceOf(NewFileRouter)
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
})
