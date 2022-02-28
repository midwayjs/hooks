import { join } from 'upath'
import { getConfig, setConfig } from '../'
import { PRE_DEFINE_PROJECT_CONFIG } from '../../const'

beforeEach(() => {
  delete process.env[PRE_DEFINE_PROJECT_CONFIG]
})

test('load pre defined config', async () => {
  setConfig({
    source: '/',
    routes: [{ baseDir: 'lambda', basePath: '/api' }],
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
