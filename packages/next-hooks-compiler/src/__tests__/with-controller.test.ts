import path from 'path'
import { createInvoker } from './util'
import fse from 'fs-extra'

const fixture = path.resolve(__dirname, './fixtures/with-controller')
const invoke = createInvoker(fixture)

beforeAll(async () => {
  await fse.remove(path.join(fixture, '.faas_debug_tmp'))
})

describe('withController', () => {
  it('function middleware support', async () => {
    const result = await invoke('index')
    expect(result.body).toEqual('functionMiddleware')
  })
  it('class middleware support', async () => {
    const result = await invoke('index-controller')
    expect(result.body).toEqual('classMiddleware')
  })
})
