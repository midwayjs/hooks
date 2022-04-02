import {
  createIgnorePattern,
  PROCESS_BY_BUNDLER,
  PROCESS_BY_MIDWAY,
} from '../ignorePattern'

describe('default ignorePattern', () => {
  const ignorePattern = createIgnorePattern()

  test('ignorePattern test', () => {
    expect(ignorePattern({ url: '' })).toBeFalsy()
    expect(ignorePattern({ url: 'https://www.github.com' })).toBeFalsy()
  })

  test('should return true when url include frontend assets', () => {
    expect(ignorePattern({ url: '/@vite/client' })).toBeTruthy()
    expect(ignorePattern({ url: '/@react-refresh' })).toBeTruthy()
    expect(ignorePattern({ url: 'https://a.com/a.js' })).toBeTruthy()
    expect(ignorePattern({ url: 'https://a.com/a.css' })).toBeTruthy()
    expect(ignorePattern({ url: 'https://a.com?type=a.js' })).toBeTruthy()
    expect(ignorePattern({ url: 'https://a.com/src/app.tsx' })).toBeTruthy()
  })
})

describe('include & exclude', () => {
  test('include', () => {
    const ignorePattern = createIgnorePattern(['@vite'])
    expect(ignorePattern({ url: '/@vite/client' })).toEqual(PROCESS_BY_MIDWAY)
  })

  test('exclude', () => {
    const ignorePattern = createIgnorePattern(undefined, ['demo'])
    expect(ignorePattern({ url: 'www.a.com/demo' })).toEqual(PROCESS_BY_BUNDLER)
  })

  test('include & exclude', () => {
    const ignorePattern = createIgnorePattern(['@vite'], ['demo'])
    expect(ignorePattern({ url: '/@vite/client' })).toEqual(PROCESS_BY_MIDWAY)
    expect(ignorePattern({ url: 'www.a.com/demo' })).toEqual(PROCESS_BY_BUNDLER)
  })
})
