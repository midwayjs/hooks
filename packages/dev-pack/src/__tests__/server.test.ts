import { DevServer } from '../server'
import { resolve } from 'path'
import fetch from 'isomorphic-unfetch'
import detectPort from 'detect-port'
import { useRandomPort } from './util'

beforeEach(async () => {
  await useRandomPort()
})

test('dev server', async () => {
  const options = [
    {
      cwd: resolve(__dirname, 'fixtures/api'),
      sourceDir: resolve(__dirname, 'fixtures/api/src'),
      watch: false,
    },
    {
      cwd: resolve(__dirname, 'fixtures/api-server'),
      sourceDir: resolve(__dirname, 'fixtures/api-server/src'),
      watch: false,
    },
  ]

  for (const option of options) {
    const server = new DevServer(option)

    await server.run()
    expect(server.app).toBeTruthy()

    // // test api endpoint
    const res = await fetch(`http://localhost:${server.port}`).then((res) =>
      res.json()
    )
    expect(res.message).toEqual('Hello World!')

    // isMatch
    expect(await server.isMatch('/', 'get')).toBeTruthy()
    expect(await server.isMatch('/api/foo', 'get')).toBeTruthy()

    await server.close('server test')
    const port = await detectPort(server.port)
    // port should be free
    expect(port).toBe(server.port)
    expect(server.app).toBe(null)
  }
})
