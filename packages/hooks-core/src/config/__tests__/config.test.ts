import { getConfig } from '../'
import { join } from 'path'

test('load user config', () => {
  const fixtures = ['js', 'ts', 'ts-export-default']
  fixtures.forEach((fixture) => {
    expect(loadConfig(fixture)).toMatchSnapshot()
  })
})

function loadConfig(fixture: string) {
  const config = getConfig(join(__dirname, 'fixtures', fixture))
  return config
}
