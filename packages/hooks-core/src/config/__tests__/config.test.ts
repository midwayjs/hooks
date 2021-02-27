import { getConfig } from '../'
import { join } from 'path'

describe('user config', () => {
  test('load js config', () => {
    const config = loadConfig('js')
    expect(config).toMatchInlineSnapshot(`
      Object {
        "routes": Array [
          Object {
            "baseDir": "lambda",
            "basePath": "/api",
          },
        ],
        "source": "/src",
      }
    `)
  })

  test('load ts config', () => {
    const config = loadConfig('ts')
    expect(config).toMatchInlineSnapshot(`
      Object {
        "routes": Array [
          Object {
            "baseDir": "lambda",
            "basePath": "/api",
          },
        ],
        "source": "/src",
      }
    `)
  })
})

function loadConfig(fixture: string) {
  const config = getConfig(join(__dirname, 'fixtures', fixture))
  return config
}
