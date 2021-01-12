import path from 'path'
import { createInvoker } from './util'
import { clearRoutes } from '../routes'
import fse from 'fs-extra'

const fixture = path.resolve(__dirname, './fixtures/async_hooks')
const invoke = createInvoker(fixture)

beforeAll(async () => {
  await fse.remove(path.join(fixture, '.faas_debug_tmp'))
})

describe('runtime', () => {
  it('invoke index', async () => {
    const result = await invoke('index')
    expect(result.body).toStrictEqual('/test')
  })
})

afterAll(() => {
  clearRoutes()
})
