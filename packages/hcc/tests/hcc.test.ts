import execa from 'execa'
import { join } from 'path'
import { existsSync } from 'fs'
import { remove } from 'fs-extra'
import { buildEntry } from '../src/midway'
import fetch from 'isomorphic-unfetch'
import { setProjectRoot } from '@midwayjs/hooks/internal'

describe('hcc', () => {
  test('build api project', async () => {
    const fixture = join(__dirname, 'fixtures/api')

    process.env.NODE_ENV = 'production'
    setProjectRoot(fixture)

    await remove(join(fixture, 'dist'))
    await execa('npm', ['run', 'build'], { cwd: fixture })
    await buildEntry()

    expect(existsSync(join(fixture, 'dist/hcc.js'))).toBe(true)

    const cp = execa.node(join(fixture, 'scripts/bootstrap'))
    const promise = new Promise((resolve, reject) => {
      cp.stdout.once('data', async () => {
        try {
          {
            const response = await fetch('http://localhost:7001')
            const json: any = await response.json()
            expect(response.status).toBe(200)
            expect(json.message).toBe('Hello World!')
          }

          {
            const response = await fetch('http://localhost:7001/api/date')
            const json: any = await response.json()
            expect(response.status).toBe(200)
            expect(json.date).toBeTruthy()
          }

          cp.kill()

          resolve(null)
        } catch (error) {
          reject(error)
        }
      })
    })

    await promise
  })
})
