import { ignorePattern } from '..'

test('ignorePattern test', () => {
  expect(ignorePattern({ url: '' })).toBeFalsy()
  expect(ignorePattern({ url: 'https://www.github.com' })).toBeFalsy()
})

test('should return true when url include frontend assets', () => {
  expect(ignorePattern({ url: 'https://a.com/a.js' })).toBeTruthy()
  expect(ignorePattern({ url: 'https://a.com/a.css' })).toBeTruthy()
  expect(ignorePattern({ url: 'https://a.com?type=a.js' })).toBeTruthy()
  expect(ignorePattern({ url: 'https://a.com/src/app.tsx' })).toBeTruthy()
  expect(ignorePattern({ url: '/@vite/client' })).toBeTruthy()
})
