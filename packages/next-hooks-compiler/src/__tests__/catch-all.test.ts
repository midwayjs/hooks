import path from 'path'
import { createInvoker } from './util'
import { clearRoutes } from '../routes'
import fse from 'fs-extra'

const fixture = path.resolve(__dirname, './fixtures/catch-all')
const invoke = createInvoker(fixture)

beforeAll(async () => {
  await fse.remove(path.join(fixture, '.faas_debug_tmp'))
})

describe('catch all routes', () => {
  it('invoke lambda-index', async () => {
    const result = await invoke('lambda-index')
    expect(result.body).toEqual('lambda')
  })

  it('invoke render-index', async () => {
    const result = await invoke('render-index')
    expect(result.body).toEqual('hello world')
  })
})

afterAll(() => {
  clearRoutes()
})
