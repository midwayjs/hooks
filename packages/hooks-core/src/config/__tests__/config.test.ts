import { getConfig } from '../'
import { join } from 'path'

const userConfig = {
  build: {
    outDir: './dist/apis',
  },
  source: '/src',
  routes: [
    {
      baseDir: 'lambda',
      basePath: '/api',
    },
  ],
}

test('load user config', () => {
  const fixtures = ['js', 'ts', 'ts-export-default']
  fixtures.forEach((fixture) => {
    expect(loadConfig(fixture)).toEqual(userConfig)
  })
})

function loadConfig(fixture: string) {
  const config = getConfig(join(__dirname, 'fixtures', fixture))
  return config
}
