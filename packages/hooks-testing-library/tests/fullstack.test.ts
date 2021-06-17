import axios from 'axios'
import execa from 'execa'
import { join } from 'path'

const fixture = join(__dirname, './fixtures/fullstack')

let cp: execa.ExecaChildProcess<string> = null

const bootstrap = () =>
  new Promise((resolve) => {
    cp = execa('node', [join(fixture, 'bootstrap.js')], {
      cwd: fixture,
      env: {
        NODE_ENV: 'production',
      },
    })
    cp.stdout.on('data', (data) => {
      if (data.toString().includes('7001')) {
        resolve('')
      }
    })
  })

beforeAll(async () => {
  await bootstrap()
})

afterAll(() => cp.kill())

const client = axios.create({
  baseURL: 'http://localhost:7001',
})

test('get html', async () => {
  const { data } = await client.get('/')
  expect(data.includes('Midway Hooks Fullstack Demo'))
})

test('get api', async () => {
  const { data } = await client.get('/api')
  expect(data).toMatchInlineSnapshot(`
    Object {
      "message": "Hello World",
      "method": "GET",
    }
  `)
})
