import { DevServer } from '../server'
import { resolve } from 'path'
import fetch from 'isomorphic-unfetch'
import detectPort from 'detect-port'
import { useRandomPort } from './util'

beforeEach(async () => {
  await useRandomPort()
})

test('dev server', async () => {
  const server = new DevServer({
    cwd: resolve(__dirname, 'fixtures/api'),
    sourceDir: resolve(__dirname, 'fixtures/api/src'),
    watch: false,
  })

  await server.run()
  expect(server.app).toBeTruthy()

  // get functions
  const { index } = await server.getFunctions()
  expect(index.handler).toBe('index.handler')
  expect(index.events[0].http.path).toBe('/')

  // test api endpoint
  const res = await fetch(`http://localhost:${server.port}`).then((res) =>
    res.json()
  )
  expect(res.message).toEqual('Hello World!')

  // isMatch
  expect(await server.isMatch('/')).toBeTruthy()

  await server.close()
  const port = await detectPort(server.port)
  // port should be free
  expect(port).toBe(server.port)
  expect(server.app).toBe(null)
})
