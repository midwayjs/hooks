import { join } from 'upath'

import { getConfig } from '../'

test('load user config', () => {
  const fixtures = ['js', 'ts', 'ts-export-default', 'presets', 'multi-presets']
  fixtures.forEach((fixture) => {
    expect(loadConfig(fixture)).toMatchSnapshot()
  })
})

function loadConfig(fixture: string) {
  return getConfig(join(__dirname, 'fixtures', fixture))
}
