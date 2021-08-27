import { join } from 'upath'

import { getConfig, PRE_DEFINE_PROJECT_CONFIG, setConfig } from '../'

beforeEach(() => {
  globalThis[PRE_DEFINE_PROJECT_CONFIG] = undefined
})

test('load pre defined config', async () => {
  setConfig({
    source: '/',
    routes: [{ baseDir: 'lambda', baseRoute: '/api' }],
  })

  expect(getConfig().source).toEqual('/')
})

test('load user config', () => {
  const fixtures = ['js', 'ts', 'ts-export-default']
  fixtures.forEach((fixture) => {
    expect(loadConfig(fixture)).toMatchSnapshot()
  })
})

function loadConfig(fixture: string) {
  return getConfig(join(__dirname, 'fixtures', fixture))
}
