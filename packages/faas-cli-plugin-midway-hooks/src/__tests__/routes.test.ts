import { resolve } from 'path'
import execa from 'execa'

const f = resolve(__dirname, '../../node_modules/.bin/f')
const fixture = resolve(__dirname, './fixtures/package')

test('routes', async () => {
  const { stdout } = await execa(f, ['routes'], {
    cwd: fixture,
  })
  expect(stdout.includes('Found 2 api in 1 lambda files')).toBeTruthy()
})
