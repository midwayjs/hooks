import { getJSCode, getTSCode } from '../src/midway'

test('getJSCode', async () => {
  expect(getJSCode([], [])).toMatchSnapshot()
  expect(getJSCode(['entry.js'], ['api.js'])).toMatchSnapshot()
})

test('getTSCode', async () => {
  expect(getTSCode([], [])).toMatchSnapshot()
  expect(getTSCode(['entry.ts'], ['api.ts'])).toMatchSnapshot()
})
